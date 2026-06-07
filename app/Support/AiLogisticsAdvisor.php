<?php

namespace App\Support;

use App\Models\Courier;
use App\Models\CourierRate;
use App\Models\InventoryProduct;
use App\Models\Order;
use App\Models\PayoutInvoice;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Support\Collection;

class AiLogisticsAdvisor
{
    public function seller(User $seller): array
    {
        $orders = Order::query()
            ->with(['city:id,name', 'inventoryProduct:id,name,sku,weight_grams,stock_on_hand,low_stock_alert'])
            ->where('seller_id', $seller->id)
            ->latest()
            ->get();
        $shipments = Shipment::query()
            ->with(['city:id,name', 'courier:id,name,code,base_success_rate'])
            ->where('seller_id', $seller->id)
            ->latest('booked_at')
            ->get();
        $products = InventoryProduct::query()
            ->where('seller_id', $seller->id)
            ->where('is_active', true)
            ->orderBy('stock_on_hand')
            ->get();
        $eligiblePayout = $shipments
            ->where('status', 'delivered')
            ->where('cod_amount_paisa', '>', 0)
            ->sum('cod_amount_paisa');

        return [
            'mode' => 'seller',
            'stats' => $this->sellerStats($orders, $shipments, $products, $eligiblePayout),
            'riskQueue' => $this->sellerRiskQueue($orders, $shipments),
            'courierRecommendations' => $this->courierRecommendations($orders, $shipments),
            'inventoryForecast' => $this->inventoryForecast($products, $orders),
            'cashflowSignals' => $this->sellerCashflowSignals($seller, $eligiblePayout),
            'messageStudio' => $this->messageStudio($orders, $shipments),
            'automations' => $this->sellerAutomations($orders, $shipments, $products, $eligiblePayout),
        ];
    }

    public function admin(): array
    {
        $shipments = Shipment::query()->with(['seller:id,name', 'city:id,name', 'courier:id,name,code'])->latest('booked_at')->get();
        $orders = Order::query()->with(['seller:id,name', 'city:id,name'])->latest()->get();
        $couriers = Courier::query()->orderBy('name')->get();
        $invoices = PayoutInvoice::query()->with('seller:id,name')->latest('generated_at')->get();

        return [
            'mode' => 'admin',
            'stats' => $this->adminStats($orders, $shipments, $couriers, $invoices),
            'riskQueue' => $this->adminRiskQueue($orders, $shipments),
            'courierRecommendations' => $this->adminCourierSignals($couriers),
            'inventoryForecast' => [],
            'cashflowSignals' => $this->adminCashflowSignals($invoices),
            'messageStudio' => $this->adminPlaybooks($shipments),
            'automations' => $this->adminAutomations($shipments, $couriers, $invoices),
        ];
    }

    private function sellerStats(Collection $orders, Collection $shipments, Collection $products, int $eligiblePayout): array
    {
        $addressProtected = $orders->whereNotNull('address_score')->count() + $shipments->whereNotNull('address_score')->count();
        $records = max($orders->count() + $shipments->count(), 1);
        $returns = $shipments->where('status', 'returned')->count();
        $delivered = $shipments->where('status', 'delivered')->count();

        return [
            ['label' => 'AI coverage', 'value' => round(($addressProtected / $records) * 100).'%', 'caption' => 'Orders and parcels with address intelligence'],
            ['label' => 'Risk items', 'value' => $this->sellerRiskQueue($orders, $shipments)->count(), 'caption' => 'Needs confirmation before dispatch'],
            ['label' => 'Return rate', 'value' => round(($returns / max($returns + $delivered, 1)) * 100).'%', 'caption' => 'Based on completed shipments'],
            ['label' => 'COD to protect', 'value' => $this->money($eligiblePayout), 'caption' => 'Delivered COD ready for invoice review'],
            ['label' => 'Low stock SKUs', 'value' => $products->filter(fn (InventoryProduct $product) => $product->stock_on_hand <= $product->low_stock_alert)->count(), 'caption' => 'Forecast needs reorder action'],
        ];
    }

    private function adminStats(Collection $orders, Collection $shipments, Collection $couriers, Collection $invoices): array
    {
        $proofReady = $couriers->filter(fn (Courier $courier) => (bool) ($courier->api_capabilities['return_proof'] ?? false))->count();
        $readyApis = $couriers->filter(fn (Courier $courier) => in_array($courier->api_status, ['sandbox', 'connected'], true) && $courier->is_active)->count();
        $addressProtected = $orders->whereNotNull('address_score')->count() + $shipments->whereNotNull('address_score')->count();
        $records = max($orders->count() + $shipments->count(), 1);

        return [
            ['label' => 'AI coverage', 'value' => round(($addressProtected / $records) * 100).'%', 'caption' => 'Platform records with risk scoring'],
            ['label' => 'Courier API readiness', 'value' => $readyApis.'/'.$couriers->count(), 'caption' => 'Active booking/tracking integrations'],
            ['label' => 'Proof-ready couriers', 'value' => $proofReady.'/'.$couriers->count(), 'caption' => 'Return evidence capability'],
            ['label' => 'Risk queue', 'value' => $this->adminRiskQueue($orders, $shipments)->count(), 'caption' => 'Orders and parcels that need ops attention'],
            ['label' => 'Finance exceptions', 'value' => $invoices->whereIn('bank_transfer_status', ['failed', 'not_ready'])->count(), 'caption' => 'Bank line items needing review'],
        ];
    }

    private function sellerRiskQueue(Collection $orders, Collection $shipments): Collection
    {
        $orderItems = $orders
            ->whereNull('shipment_id')
            ->map(fn (Order $order) => [
                'type' => 'Order',
                'reference' => $order->order_number,
                'customer' => $order->customer_name,
                'city' => $order->city?->name,
                'score' => $this->riskScore($order->address_score, $order->cod_amount_paisa),
                'reason' => $this->riskReason($order->address_score, $order->cod_amount_paisa, $order->address_verification['issues'] ?? []),
                'action' => 'Send confirmation message before shipping',
                'href' => route('orders.index'),
            ]);

        $shipmentItems = $shipments
            ->whereIn('status', ['booked', 'picked', 'transit', 'out_for_delivery', 'returned'])
            ->map(fn (Shipment $shipment) => [
                'type' => 'Shipment',
                'reference' => $shipment->tracking_number,
                'customer' => $shipment->receiver_name,
                'city' => $shipment->city?->name,
                'score' => $this->riskScore($shipment->address_score, $shipment->cod_amount_paisa, $shipment->status === 'returned' ? 35 : 0),
                'reason' => $shipment->status === 'returned'
                    ? 'Returned parcel needs proof review and customer follow-up.'
                    : $this->riskReason($shipment->address_score, $shipment->cod_amount_paisa, $shipment->address_verification['issues'] ?? []),
                'action' => $shipment->status === 'returned' ? 'Review call/photo proof' : 'Monitor tracking and keep buyer reachable',
                'href' => route('shipments.show', $shipment),
            ]);

        return $orderItems
            ->merge($shipmentItems)
            ->filter(fn (array $item) => $item['score'] >= 45)
            ->sortByDesc('score')
            ->take(8)
            ->values();
    }

    private function adminRiskQueue(Collection $orders, Collection $shipments): Collection
    {
        $items = $this->sellerRiskQueue($orders, $shipments)
            ->map(function (array $item) use ($orders, $shipments) {
                $seller = $item['type'] === 'Order'
                    ? $orders->firstWhere('order_number', $item['reference'])?->seller?->name
                    : $shipments->firstWhere('tracking_number', $item['reference'])?->seller?->name;

                return $item + ['seller' => $seller ?? 'Seller'];
            });

        return $items
            ->take(10)
            ->values()
            ->map(fn (array $item) => [...$item, 'href' => route('admin.shipments.index')]);
    }

    private function courierRecommendations(Collection $orders, Collection $shipments): Collection
    {
        $cityIds = $orders->pluck('city_id')
            ->merge($shipments->pluck('city_id'))
            ->filter()
            ->countBy()
            ->sortDesc()
            ->keys()
            ->take(4);

        if ($cityIds->isEmpty()) {
            $cityIds = CourierRate::query()->select('city_id')->distinct()->limit(4)->pluck('city_id');
        }

        return CourierRate::query()
            ->with(['courier:id,name,code,base_success_rate', 'city:id,name'])
            ->whereIn('city_id', $cityIds)
            ->where('is_active', true)
            ->whereHas('courier', fn ($query) => $query->where('is_active', true))
            ->get()
            ->groupBy('city_id')
            ->map(function (Collection $rates) {
                $best = $rates
                    ->sortByDesc(fn (CourierRate $rate) => (($rate->success_rate * 1.4) - (($rate->base_rate_paisa + $rate->our_fee_paisa) / 10000)))
                    ->first();

                return [
                    'city' => $best->city?->name,
                    'courier' => $best->courier?->name,
                    'score' => min(99, round(($best->success_rate * 0.8) + 18)),
                    'reason' => 'Best mix of delivery success, cost, and available API capabilities for this city.',
                    'rate' => $this->money($best->base_rate_paisa + $best->our_fee_paisa),
                ];
            })
            ->values()
            ->take(4);
    }

    private function adminCourierSignals(Collection $couriers): Collection
    {
        return $couriers->map(fn (Courier $courier) => [
            'city' => $courier->country_scope === 'international' ? 'International' : 'Pakistan',
            'courier' => $courier->name,
            'score' => $this->courierAiScore($courier),
            'reason' => $this->courierAiScore($courier) >= 80
                ? 'Ready for AI-assisted allocation and proof workflows.'
                : 'Complete credentials, webhook secret, and return-proof mapping before live scaling.',
            'rate' => strtoupper($courier->api_status),
        ])->sortByDesc('score')->values();
    }

    private function inventoryForecast(Collection $products, Collection $orders): Collection
    {
        return $products->map(function (InventoryProduct $product) use ($orders) {
            $units14Days = $orders
                ->where('inventory_product_id', $product->id)
                ->where('created_at', '>=', now()->subDays(14))
                ->sum('quantity');
            $dailyVelocity = max(round($units14Days / 14, 1), 0.2);
            $daysLeft = (int) floor($product->stock_on_hand / $dailyVelocity);

            return [
                'sku' => $product->sku,
                'name' => $product->name,
                'stock' => $product->stock_on_hand,
                'dailyVelocity' => $dailyVelocity,
                'daysLeft' => $daysLeft,
                'signal' => $daysLeft <= 7 ? 'Reorder now' : ($daysLeft <= 14 ? 'Watch closely' : 'Healthy'),
            ];
        })->sortBy('daysLeft')->take(6)->values();
    }

    private function sellerCashflowSignals(User $seller, int $eligiblePayout): array
    {
        $profile = $seller->sellerProfile;

        return [
            [
                'label' => 'Payout readiness',
                'level' => filled($profile?->bank_account_number) || filled($profile?->wallet_number) ? 'Ready' : 'Blocked',
                'message' => filled($profile?->bank_account_number) || filled($profile?->wallet_number)
                    ? 'Bank or wallet details are available for COD settlement.'
                    : 'Add bank or wallet details before requesting payout invoices.',
            ],
            [
                'label' => 'COD invoice opportunity',
                'level' => $eligiblePayout > 0 ? 'Action' : 'Clear',
                'message' => $eligiblePayout > 0
                    ? 'AI recommends generating a payout invoice for '.$this->money($eligiblePayout).'.'
                    : 'No delivered COD is waiting for invoice right now.',
            ],
        ];
    }

    private function adminCashflowSignals(Collection $invoices): array
    {
        return [
            [
                'label' => 'Bank line exceptions',
                'level' => $invoices->where('bank_transfer_status', 'failed')->count() > 0 ? 'Action' : 'Clear',
                'message' => $invoices->where('bank_transfer_status', 'failed')->count().' payout invoice(s) have failed bank transfer status.',
            ],
            [
                'label' => 'Approval queue',
                'level' => $invoices->where('status', 'generated')->count() > 0 ? 'Review' : 'Clear',
                'message' => $this->money($invoices->where('status', 'generated')->sum('net_payable_paisa')).' is waiting in generated payout invoices.',
            ],
        ];
    }

    private function messageStudio(Collection $orders, Collection $shipments): array
    {
        $order = $orders->whereNull('shipment_id')->sortByDesc('cod_amount_paisa')->first();
        $shipment = $shipments->where('status', 'returned')->first();

        return [
            [
                'title' => 'Pre-dispatch confirmation',
                'text' => $order
                    ? "Assalam o Alaikum {$order->customer_name}, your parcel of ".$this->money($order->cod_amount_paisa)." is ready for dispatch to {$order->city?->name}. Please confirm your complete address and keep your phone active for the rider."
                    : 'Assalam o Alaikum, your parcel is ready for dispatch. Please confirm your complete address and keep your phone active for the rider.',
            ],
            [
                'title' => 'Return rescue',
                'text' => $shipment
                    ? "Assalam o Alaikum {$shipment->receiver_name}, courier marked your parcel {$shipment->tracking_number} as returned. Please confirm if you want a reattempt and share an updated address or delivery time."
                    : 'Assalam o Alaikum, courier could not deliver your parcel. Please confirm if you want a reattempt and share an updated address or delivery time.',
            ],
        ];
    }

    private function adminPlaybooks(Collection $shipments): array
    {
        $returned = $shipments->where('status', 'returned')->first();

        return [
            [
                'title' => 'Seller return proof reply',
                'text' => $returned
                    ? "Parcel {$returned->tracking_number} has return proof available. Review call/photo/location evidence before approving a claim or charging seller."
                    : 'When a return arrives, review call/photo/location evidence before approving a claim or charging seller.',
            ],
            [
                'title' => 'Courier API escalation',
                'text' => 'If tracking sync fails twice, check credentials, webhook secret, and latest courier error before moving orders to manual tracking.',
            ],
        ];
    }

    private function sellerAutomations(Collection $orders, Collection $shipments, Collection $products, int $eligiblePayout): array
    {
        return collect([
            ['title' => 'Auto-confirm risky COD orders', 'description' => 'Send WhatsApp confirmation when COD is high or address score drops below 60.', 'status' => $orders->where('cod_amount_paisa', '>=', 500000)->count() > 0 ? 'Recommended' : 'Ready'],
            ['title' => 'Courier auto-selection', 'description' => 'Choose courier by city success rate, price, delivery promise, and proof availability.', 'status' => 'Ready'],
            ['title' => 'Low-stock reorder alerts', 'description' => 'Warn before a campaign oversells SKUs based on sales velocity.', 'status' => $products->filter(fn (InventoryProduct $product) => $product->stock_on_hand <= $product->low_stock_alert)->count() > 0 ? 'Action' : 'Healthy'],
            ['title' => 'Return rescue messages', 'description' => 'Trigger reattempt message when return proof says buyer unavailable or address issue.', 'status' => $shipments->where('status', 'returned')->count() > 0 ? 'Recommended' : 'Ready'],
            ['title' => 'Payout invoice reminder', 'description' => 'Remind finance/user when delivered COD is ready for invoice.', 'status' => $eligiblePayout > 0 ? 'Action' : 'Clear'],
        ])->all();
    }

    private function adminAutomations(Collection $shipments, Collection $couriers, Collection $invoices): array
    {
        return collect([
            ['title' => 'API health auto-watch', 'description' => 'Flag couriers with failed syncs, stale health checks, missing credentials, or disabled webhooks.', 'status' => $couriers->whereIn('api_status', ['down', 'disabled'])->count() > 0 ? 'Action' : 'Ready'],
            ['title' => 'Proof completeness scoring', 'description' => 'Score return proof using attempts, buyer response, call recording, photo, and location evidence.', 'status' => $shipments->where('status', 'returned')->count() > 0 ? 'Active' : 'Ready'],
            ['title' => 'Seller risk ranking', 'description' => 'Prioritize sellers by returns, weak addresses, payout holds, and support claim rate.', 'status' => 'Ready'],
            ['title' => 'Bank transfer anomaly checks', 'description' => 'Catch failed, duplicate, old, or unusually large payout invoices before export.', 'status' => $invoices->where('bank_transfer_status', 'failed')->count() > 0 ? 'Action' : 'Ready'],
            ['title' => 'City hotspot detection', 'description' => 'Detect cities where delivery delay or returns spike by courier.', 'status' => 'Ready'],
        ])->all();
    }

    private function riskScore(?int $addressScore, int $codAmountPaisa, int $extra = 0): int
    {
        $risk = max(0, 100 - ($addressScore ?? 55));
        $risk += $codAmountPaisa >= 500000 ? 18 : 0;
        $risk += $codAmountPaisa >= 1000000 ? 12 : 0;

        return min(100, $risk + $extra);
    }

    private function riskReason(?int $addressScore, int $codAmountPaisa, array $issues): string
    {
        if ($issues !== []) {
            return implode(' ', array_slice($issues, 0, 2));
        }

        if (($addressScore ?? 0) < 60) {
            return 'Address needs better house, street, area, or landmark details.';
        }

        if ($codAmountPaisa >= 500000) {
            return 'High COD order should be confirmed before dispatch.';
        }

        return 'Moderate delivery risk. Keep buyer phone reachable.';
    }

    private function courierAiScore(Courier $courier): int
    {
        $score = (int) round($courier->base_success_rate * 0.65);
        $score += in_array($courier->api_status, ['sandbox', 'connected'], true) ? 12 : 0;
        $score += in_array($courier->api_credentials_status, ['configured', 'verified'], true) ? 8 : 0;
        $score += ($courier->api_capabilities['webhook'] ?? false) ? 6 : 0;
        $score += ($courier->api_capabilities['return_proof'] ?? false) ? 8 : 0;
        $score += filled($courier->webhook_secret) ? 4 : 0;

        return min(100, $score);
    }

    private function money(int $paisa): string
    {
        return 'Rs. '.number_format($paisa / 100, 0);
    }
}
