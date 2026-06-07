<?php

namespace App\Http\Controllers;

use App\Models\CourierRate;
use App\Models\InventoryProduct;
use App\Models\Order;
use App\Models\Shipment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $profile = $user->sellerProfile;
        $shipments = Shipment::query()
            ->with(['courier:id,name,code', 'city:id,name'])
            ->where('seller_id', $user->id);

        $today = now()->startOfDay();
        $todayShipments = (clone $shipments)->where('booked_at', '>=', $today);
        $recentBookings = (clone $shipments)->latest('booked_at')->limit(10)->get();
        $inventoryProducts = InventoryProduct::query()->where('seller_id', $user->id);
        $orders = Order::query()->where('seller_id', $user->id);

        $lastSevenDays = collect(range(6, 0))->map(function (int $daysAgo) use ($shipments) {
            $date = now()->subDays($daysAgo);

            return [
                'label' => $date->format('D'),
                'booked' => (clone $shipments)->whereDate('booked_at', $date)->count(),
                'delivered' => (clone $shipments)->whereDate('delivered_at', $date)->count(),
            ];
        });

        $deliveredCount = (clone $shipments)->where('status', 'delivered')->count();
        $returnedCount = (clone $shipments)->where('status', 'returned')->count();
        $pendingDeliveries = (clone $shipments)->whereIn('status', ['booked', 'picked', 'transit', 'out_for_delivery'])->count();
        $lowStockProducts = (clone $inventoryProducts)
            ->whereColumn('stock_on_hand', '<=', 'low_stock_alert')
            ->count();

        return Inertia::render('Dashboard', [
            'stats' => [
                'bookingsToday' => (clone $todayShipments)->count(),
                'deliveredToday' => (clone $shipments)->whereDate('delivered_at', today())->count(),
                'pendingDeliveries' => $pendingDeliveries,
                'returnsToday' => (clone $shipments)->whereDate('returned_at', today())->count(),
                'codCollectedToday' => (clone $shipments)->whereDate('delivered_at', today())->sum('cod_amount_paisa'),
                'codPaidToday' => (int) round((clone $shipments)->whereDate('delivered_at', today())->sum('cod_amount_paisa') * 0.96),
                'codReadyForInvoice' => (clone $shipments)
                    ->where('status', 'delivered')
                    ->where('cod_amount_paisa', '>', 0)
                    ->whereDoesntHave('payoutInvoices')
                    ->sum('cod_amount_paisa'),
                'inventoryUnits' => (clone $inventoryProducts)->sum('stock_on_hand'),
                'lowStockProducts' => $lowStockProducts,
                'pendingOrders' => (clone $orders)->whereIn('status', ['pending', 'packed'])->count(),
            ],
            'onboarding' => [
                [
                    'label' => 'Business and pickup profile',
                    'description' => 'Add business name, CNIC, pickup city, and contact details.',
                    'done' => filled($profile?->business_name) && filled($profile?->city) && filled($profile?->cnic_number),
                    'href' => route('profile.edit'),
                    'action' => 'Complete profile',
                ],
                [
                    'label' => 'KYC verification',
                    'description' => 'Verification unlocks smoother support, COD review, and account trust.',
                    'done' => $profile?->verification_status === 'verified',
                    'status' => $profile?->verification_status ?? 'missing',
                    'href' => route('contact'),
                    'action' => 'Contact support',
                ],
                [
                    'label' => 'Bank or wallet details',
                    'description' => 'Add IBAN/account or wallet number so COD payouts can be processed.',
                    'done' => filled($profile?->bank_account_number) || filled($profile?->wallet_number),
                    'href' => route('profile.edit'),
                    'action' => 'Add payout details',
                ],
                [
                    'label' => 'First booking created',
                    'description' => 'Create a shipment and compare couriers by cost, speed, and success rate.',
                    'done' => (clone $shipments)->exists(),
                    'href' => route('bookings.create'),
                    'action' => 'Book shipment',
                ],
                [
                    'label' => 'Inventory product added',
                    'description' => 'Add products and SKUs so weights and stock can connect to booking.',
                    'done' => (clone $inventoryProducts)->exists(),
                    'href' => route('inventory.index'),
                    'action' => 'Add product',
                ],
                [
                    'label' => 'COD payout ready',
                    'description' => 'Review delivered COD parcels and generate a payout invoice.',
                    'done' => (clone $shipments)->where('status', 'delivered')->where('cod_amount_paisa', '>', 0)->exists()
                        && (filled($profile?->bank_account_number) || filled($profile?->wallet_number)),
                    'href' => route('payouts.index'),
                    'action' => 'Review payouts',
                ],
            ],
            'charts' => [
                'lastSevenDays' => $lastSevenDays,
                'successVsReturn' => [
                    'delivered' => $deliveredCount,
                    'returned' => $returnedCount,
                ],
                'weeklyRevenue' => collect(range(3, 0))->map(function (int $weeksAgo) use ($shipments) {
                    $start = now()->startOfWeek()->subWeeks($weeksAgo);
                    $end = (clone $start)->endOfWeek();

                    return [
                        'label' => $start->format('M d'),
                        'revenue' => (clone $shipments)
                            ->whereBetween('delivered_at', [$start, $end])
                            ->sum('cod_amount_paisa'),
                    ];
                }),
                'topCities' => (clone $shipments)
                    ->selectRaw('city_id, count(*) as total, sum(case when status = ? then 1 else 0 end) as delivered', ['delivered'])
                    ->with('city:id,name')
                    ->groupBy('city_id')
                    ->orderByDesc('total')
                    ->limit(5)
                    ->get()
                    ->map(fn (Shipment $shipment) => [
                        'city' => $shipment->city?->name ?? 'Unknown',
                        'total' => (int) $shipment->total,
                        'successRate' => $shipment->total > 0 ? round(($shipment->delivered / $shipment->total) * 100) : 0,
                    ]),
            ],
            'recentBookings' => $recentBookings->map(fn (Shipment $shipment) => [
                'trackingNumber' => $shipment->tracking_number,
                'receiver' => $shipment->receiver_name,
                'city' => $shipment->city?->name,
                'courier' => $shipment->courier?->name,
                'courierCode' => $shipment->courier?->code,
                'bookingDate' => $shipment->booked_at?->format('M d, Y'),
                'status' => $shipment->status,
                'codAmount' => $shipment->cod_amount_paisa,
            ]),
            'recommendations' => CourierRate::query()
                ->with(['courier:id,name,code', 'city:id,name'])
                ->where('is_active', true)
                ->orderBy('base_rate_paisa')
                ->limit(5)
                ->get()
                ->map(fn (CourierRate $rate) => [
                    'courier' => $rate->courier->name,
                    'city' => $rate->city->name,
                    'rate' => $rate->base_rate_paisa + $rate->our_fee_paisa,
                    'days' => "{$rate->delivery_days_min}-{$rate->delivery_days_max}",
                    'successRate' => $rate->success_rate,
                ]),
            'insights' => collect([
                [
                    'label' => 'Return control',
                    'level' => $returnedCount > 0 && ($returnedCount / max($deliveredCount + $returnedCount, 1)) > 0.18 ? 'Action needed' : 'Healthy',
                    'message' => $returnedCount > 0 && ($returnedCount / max($deliveredCount + $returnedCount, 1)) > 0.18
                        ? 'Return rate is above target. Use address checks and confirmation messages on high COD orders.'
                        : 'Return rate is under control. Keep using proof-ready couriers for COD parcels.',
                    'href' => route('returns.index'),
                ],
                [
                    'label' => 'Fulfillment queue',
                    'level' => $pendingDeliveries > 10 ? 'Watch' : 'Stable',
                    'message' => $pendingDeliveries > 10
                        ? 'Pending deliveries are building up. Review courier API health and stuck tracking events.'
                        : 'Pending delivery volume is manageable today.',
                    'href' => route('bookings.index'),
                ],
                [
                    'label' => 'Inventory planning',
                    'level' => $lowStockProducts > 0 ? 'Action needed' : 'Healthy',
                    'message' => $lowStockProducts > 0
                        ? "{$lowStockProducts} SKU(s) are at low stock. Check forecast before launching new campaigns."
                        : 'No low-stock SKU alert right now.',
                    'href' => route('inventory.index'),
                ],
            ]),
        ]);
    }
}
