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
            ->with(['courier:id,name,code', 'city:id,name', 'payoutInvoices:id'])
            ->where('seller_id', $user->id)
            ->latest('booked_at')
            ->get();
        $recentBookings = $shipments->take(10);
        $inventoryProducts = InventoryProduct::query()
            ->where('seller_id', $user->id)
            ->get();
        $orders = Order::query()
            ->where('seller_id', $user->id)
            ->get();

        $today = today();
        $isSameDay = fn ($date, $day): bool => $date !== null && $date->isSameDay($day);

        $lastSevenDays = collect(range(6, 0))->map(function (int $daysAgo) use ($shipments, $isSameDay) {
            $date = now()->subDays($daysAgo);

            return [
                'label' => $date->format('D'),
                'booked' => $shipments->filter(fn (Shipment $shipment) => $isSameDay($shipment->booked_at, $date))->count(),
                'delivered' => $shipments->filter(fn (Shipment $shipment) => $isSameDay($shipment->delivered_at, $date))->count(),
            ];
        });

        $deliveredCount = $shipments->where('status', 'delivered')->count();
        $returnedCount = $shipments->where('status', 'returned')->count();
        $pendingDeliveries = $shipments->whereIn('status', ['booked', 'picked', 'transit', 'out_for_delivery'])->count();
        $lowStockProducts = $inventoryProducts
            ->filter(fn (InventoryProduct $product) => $product->stock_on_hand <= $product->low_stock_alert)
            ->count();

        return Inertia::render('Dashboard', [
            'stats' => [
                'bookingsToday' => $shipments->filter(fn (Shipment $shipment) => $isSameDay($shipment->booked_at, $today))->count(),
                'deliveredToday' => $shipments->filter(fn (Shipment $shipment) => $isSameDay($shipment->delivered_at, $today))->count(),
                'pendingDeliveries' => $pendingDeliveries,
                'returnsToday' => $shipments->filter(fn (Shipment $shipment) => $isSameDay($shipment->returned_at, $today))->count(),
                'codCollectedToday' => $shipments->filter(fn (Shipment $shipment) => $isSameDay($shipment->delivered_at, $today))->sum('cod_amount_paisa'),
                'codPaidToday' => (int) round($shipments->filter(fn (Shipment $shipment) => $isSameDay($shipment->delivered_at, $today))->sum('cod_amount_paisa') * 0.96),
                'codReadyForInvoice' => $shipments
                    ->filter(fn (Shipment $shipment) => $shipment->status === 'delivered'
                        && $shipment->cod_amount_paisa > 0
                        && $shipment->payoutInvoices->isEmpty())
                    ->sum('cod_amount_paisa'),
                'inventoryUnits' => $inventoryProducts->sum('stock_on_hand'),
                'lowStockProducts' => $lowStockProducts,
                'pendingOrders' => $orders->whereIn('status', ['pending', 'packed'])->count(),
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
                    'done' => $shipments->isNotEmpty(),
                    'href' => route('bookings.create'),
                    'action' => 'Book shipment',
                ],
                [
                    'label' => 'Inventory product added',
                    'description' => 'Add products and SKUs so weights and stock can connect to booking.',
                    'done' => $inventoryProducts->isNotEmpty(),
                    'href' => route('inventory.index'),
                    'action' => 'Add product',
                ],
                [
                    'label' => 'COD payout ready',
                    'description' => 'Review delivered COD parcels and generate a payout invoice.',
                    'done' => $shipments->contains(fn (Shipment $shipment) => $shipment->status === 'delivered' && $shipment->cod_amount_paisa > 0)
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
                        'revenue' => $shipments
                            ->filter(fn (Shipment $shipment) => $shipment->delivered_at !== null
                                && $shipment->delivered_at->betweenIncluded($start, $end))
                            ->sum('cod_amount_paisa'),
                    ];
                }),
                'topCities' => $shipments
                    ->groupBy('city_id')
                    ->map(fn ($cityShipments) => [
                        'city' => $cityShipments->first()->city?->name ?? 'Unknown',
                        'total' => $cityShipments->count(),
                        'successRate' => $cityShipments->count() > 0
                            ? round(($cityShipments->where('status', 'delivered')->count() / $cityShipments->count()) * 100)
                            : 0,
                    ])
                    ->sortByDesc('total')
                    ->take(5)
                    ->values(),
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
