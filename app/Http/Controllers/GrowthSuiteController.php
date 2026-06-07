<?php

namespace App\Http\Controllers;

use App\Models\InventoryProduct;
use App\Models\Order;
use App\Models\PayoutInvoice;
use App\Models\Shipment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GrowthSuiteController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $seller = $request->user();
        $profile = $seller->sellerProfile;
        $shipments = Shipment::query()->where('seller_id', $seller->id);
        $orders = Order::query()->where('seller_id', $seller->id);
        $products = InventoryProduct::query()->where('seller_id', $seller->id);
        $deliveredCod = (clone $shipments)->where('status', 'delivered')->where('cod_amount_paisa', '>', 0)->sum('cod_amount_paisa');
        $returned = (clone $shipments)->where('status', 'returned')->count();
        $delivered = (clone $shipments)->where('status', 'delivered')->count();
        $returnRate = round(($returned / max($returned + $delivered, 1)) * 100, 1);

        return Inertia::render('GrowthSuite/Index', [
            'readiness' => [
                'kyc' => $profile?->verification_status === 'verified',
                'bank' => filled($profile?->bank_account_number) || filled($profile?->wallet_number),
                'inventory' => (clone $products)->exists(),
                'orders' => (clone $orders)->exists(),
                'shipments' => (clone $shipments)->exists(),
            ],
            'metrics' => [
                'deliveredCod' => $deliveredCod,
                'returnRate' => $returnRate,
                'pendingOrders' => (clone $orders)->whereIn('status', ['pending', 'packed'])->count(),
                'lowStockSkus' => (clone $products)->whereColumn('stock_on_hand', '<=', 'low_stock_alert')->count(),
                'unpaidInvoices' => PayoutInvoice::query()->where('seller_id', $seller->id)->where('status', 'generated')->sum('net_payable_paisa'),
            ],
            'modules' => $this->modules($profile, $deliveredCod, $returnRate),
            'integrations' => $this->integrations(),
            'automations' => $this->automations(),
            'templates' => $this->templates(),
        ]);
    }

    private function modules($profile, int $deliveredCod, float $returnRate): array
    {
        return [
            [
                'name' => 'Advance COD / Same-day payout',
                'status' => $profile?->verification_status === 'verified' && $deliveredCod > 0 ? 'Eligible' : 'Setup needed',
                'description' => 'Offer early settlement on delivered COD, then later add approved upfront COD limits for trusted sellers.',
                'impact' => 'Cashflow advantage',
            ],
            [
                'name' => 'Digital payment on delivery',
                'status' => 'Planned',
                'description' => 'Let buyers pay by QR/card/wallet at doorstep while keeping COD flexibility.',
                'impact' => 'Lower failed deliveries',
            ],
            [
                'name' => 'WhatsApp order confirmation',
                'status' => 'Ready to configure',
                'description' => 'Confirm COD orders before dispatch, reduce fake orders, and send tracking updates automatically.',
                'impact' => 'Return reduction',
            ],
            [
                'name' => 'Return proof intelligence',
                'status' => $returnRate > 0 ? 'Active' : 'Ready',
                'description' => 'Score call recording, rider notes, attempt photo, and location proof before charging seller or approving claims.',
                'impact' => 'Fair claims',
            ],
            [
                'name' => 'Auto reconciliation',
                'status' => 'Ready to configure',
                'description' => 'Match courier reports, bank files, invoices, COD deductions, and missing payouts.',
                'impact' => 'Finance control',
            ],
            [
                'name' => 'Barcode dispatch and manifests',
                'status' => 'Ready',
                'description' => 'Scan parcels at pickup, prevent missed handovers, and keep manifest proof for courier disputes.',
                'impact' => 'Ops accuracy',
            ],
        ];
    }

    private function integrations(): array
    {
        return [
            ['name' => 'Shopify', 'status' => 'Planned', 'description' => 'Auto-import paid/COD orders and push tracking numbers back.'],
            ['name' => 'WooCommerce', 'status' => 'Planned', 'description' => 'Sync orders, inventory SKUs, shipment status, and COD amounts.'],
            ['name' => 'Daraz', 'status' => 'Planned', 'description' => 'Import marketplace orders and centralize courier tracking.'],
            ['name' => 'WhatsApp Business', 'status' => 'Ready to configure', 'description' => 'Order confirmation, tracking, failed-attempt rescue, and return reattempt flows.'],
            ['name' => 'Public API', 'status' => 'Sandbox ready', 'description' => 'Let stores create bookings and receive webhook updates from Fast Couriers.'],
            ['name' => 'Bank file export', 'status' => 'Ready', 'description' => 'Export payout batches while bank provider is still undecided.'],
        ];
    }

    private function automations(): array
    {
        return [
            'Auto-select courier using city success rate, price, speed, proof readiness, and API health.',
            'Block dispatch when address score is weak and COD is high until customer confirms.',
            'Send WhatsApp tracking updates after booking, pickup, out-for-delivery, and failed attempt.',
            'Flag duplicate orders by phone, address, COD amount, and product before shipping.',
            'Recommend reorder quantity when stock velocity predicts a shortage.',
            'Detect payout anomalies: missing COD, duplicate bank references, old invoices, or unusual deductions.',
            'Create claim packets automatically with AWB, rider remarks, call proof, photos, and timeline.',
            'Show ad-profit analytics by campaign once Shopify/Meta/Google data is connected.',
        ];
    }

    private function templates(): array
    {
        return [
            [
                'title' => 'COD confirmation',
                'text' => 'Assalam o Alaikum, your order is ready for dispatch. Please reply YES to confirm your address and COD amount before courier pickup.',
            ],
            [
                'title' => 'Out for delivery',
                'text' => 'Your parcel is out for delivery today. Please keep your phone active and arrange COD payment or digital payment at doorstep.',
            ],
            [
                'title' => 'Failed attempt rescue',
                'text' => 'Courier could not deliver your parcel. Please share a suitable time or updated address so we can request a reattempt.',
            ],
        ];
    }
}
