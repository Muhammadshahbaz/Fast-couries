<?php

namespace App\Http\Controllers;

use App\Models\Courier;
use App\Models\PayoutInvoice;
use App\Models\SellerProfile;
use App\Models\Shipment;
use App\Models\SupportTicket;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        abort_unless(in_array($request->user()->role, ['super_admin', 'sub_admin'], true), 403);

        $activeStatuses = ['booked', 'picked', 'transit', 'out_for_delivery'];
        $delayedShipments = Shipment::query()
            ->whereIn('status', $activeStatuses)
            ->where('booked_at', '<=', now()->subDays(3))
            ->count();
        $openClaims = SupportTicket::where('status', 'open')->where('category', 'claim')->count();
        $urgentTickets = SupportTicket::where('status', 'open')->where('priority', 'urgent')->count();
        $pendingPayout = PayoutInvoice::where('status', 'generated')->sum('net_payable_paisa');
        $returnsToday = Shipment::whereDate('returned_at', today())->count();
        $apiIssues = Courier::whereIn('api_status', ['down', 'disabled'])->orWhereNotNull('last_api_error')->count();
        $profit = $this->profitSummary();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'sellers' => User::where('role', 'seller')->count(),
                'shipments' => Shipment::count(),
                'pending' => Shipment::whereIn('status', $activeStatuses)->count(),
                'returns' => Shipment::where('status', 'returned')->count(),
                'codCollected' => Shipment::where('status', 'delivered')->sum('cod_amount_paisa'),
                'payoutPending' => $pendingPayout,
                'openTickets' => SupportTicket::where('status', 'open')->count(),
                'bookingsToday' => Shipment::whereDate('booked_at', today())->count(),
                'deliveriesToday' => Shipment::whereDate('delivered_at', today())->count(),
                'returnsToday' => $returnsToday,
                'delayedShipments' => $delayedShipments,
                'apiIssues' => $apiIssues,
                'openClaims' => $openClaims,
                'pendingSellerReviews' => SellerProfile::where('verification_status', 'pending')->count(),
                'estimatedProfit' => $profit['estimatedProfit'],
                'todayProfit' => $profit['todayProfit'],
                'profitMargin' => $profit['profitMargin'],
            ],
            'alerts' => $this->alerts($pendingPayout, $urgentTickets, $openClaims, $delayedShipments, $returnsToday, $apiIssues),
            'charts' => [
                'shipmentTrend' => $this->shipmentTrend(),
                'codTrend' => $this->codTrend(),
                'profitTrend' => $this->profitTrend(),
                'statusBreakdown' => $this->statusBreakdown(),
                'profitBreakdown' => $profit['breakdown'],
            ],
            'insights' => [
                'apiReadiness' => $this->apiReadiness(),
                'slaAging' => $this->slaAging($activeStatuses),
                'financeAging' => $this->financeAging(),
                'supportAging' => $this->supportAging(),
                'cityHotspots' => $this->cityHotspots(),
            ],
            'couriers' => Courier::query()
                ->withCount('rates')
                ->orderBy('name')
                ->get()
                ->map(fn (Courier $courier) => [
                    'id' => $courier->id,
                    'name' => $courier->name,
                    'code' => $courier->code,
                    'apiStatus' => $courier->api_status,
                    'apiMode' => $courier->api_mode,
                    'credentials' => $courier->api_credentials_status,
                    'countryScope' => $courier->country_scope,
                    'capabilities' => $courier->api_capabilities ?? [],
                    'lastApiHealthCheckAt' => $courier->last_api_health_check_at?->format('M d, h:i A'),
                    'lastApiError' => $courier->last_api_error,
                    'successRate' => $courier->base_success_rate,
                    'ratesCount' => $courier->rates_count,
                    'active' => $courier->is_active,
                ]),
            'courierPerformance' => $this->courierPerformance(),
            'queues' => [
                'payouts' => $this->payoutQueue(),
                'sellers' => $this->sellerReviewQueue(),
                'claims' => $this->claimsQueue(),
                'delayedShipments' => $this->delayedShipmentQueue($activeStatuses),
                'apiIssues' => $this->apiIssueQueue(),
            ],
            'topSellers' => $this->topSellers(),
            'recentActivity' => $this->recentActivity(),
            'recentShipments' => Shipment::query()
                ->with(['seller:id,name', 'courier:id,name', 'city:id,name'])
                ->latest('booked_at')
                ->limit(10)
                ->get()
                ->map(fn (Shipment $shipment) => [
                    'trackingNumber' => $shipment->tracking_number,
                    'seller' => $shipment->seller?->name,
                    'courier' => $shipment->courier?->name,
                    'city' => $shipment->city?->name,
                    'status' => $shipment->status,
                    'codAmount' => $shipment->cod_amount_paisa,
                ]),
        ]);
    }

    private function alerts(int $pendingPayout, int $urgentTickets, int $openClaims, int $delayedShipments, int $returnsToday, int $apiIssues): array
    {
        return collect([
            ['level' => 'critical', 'title' => 'Courier API attention needed', 'message' => "{$apiIssues} courier integrations need review.", 'show' => $apiIssues > 0, 'route' => route('admin.couriers.index')],
            ['level' => 'warning', 'title' => 'Delayed shipments', 'message' => "{$delayedShipments} active shipments are older than 3 days.", 'show' => $delayedShipments > 0, 'route' => route('admin.shipments.index', ['status' => 'transit'])],
            ['level' => 'warning', 'title' => 'Urgent support queue', 'message' => "{$urgentTickets} urgent tickets and {$openClaims} open claims need action.", 'show' => ($urgentTickets + $openClaims) > 0, 'route' => route('admin.shipments.index')],
            ['level' => 'finance', 'title' => 'Pending payout approvals', 'message' => 'Generated invoices are waiting for finance approval: '.$this->money($pendingPayout).'.', 'show' => $pendingPayout > 0, 'route' => route('admin.payouts.index')],
            ['level' => 'info', 'title' => 'Returns today', 'message' => "{$returnsToday} parcels returned today. Review proof and seller claims.", 'show' => $returnsToday > 0, 'route' => route('admin.shipments.index', ['status' => 'returned'])],
        ])->filter(fn (array $alert) => $alert['show'])->values()->map(fn (array $alert) => [
            'level' => $alert['level'],
            'title' => $alert['title'],
            'message' => $alert['message'],
            'route' => $alert['route'],
        ])->all();
    }

    private function shipmentTrend(): array
    {
        return collect(range(6, 0))->map(function (int $daysAgo) {
            $date = CarbonImmutable::today()->subDays($daysAgo);

            return [
                'label' => $date->format('D'),
                'date' => $date->format('M d'),
                'booked' => Shipment::whereDate('booked_at', $date)->count(),
                'delivered' => Shipment::whereDate('delivered_at', $date)->count(),
                'returned' => Shipment::whereDate('returned_at', $date)->count(),
            ];
        })->all();
    }

    private function codTrend(): array
    {
        return collect(range(6, 0))->map(function (int $daysAgo) {
            $date = CarbonImmutable::today()->subDays($daysAgo);

            return [
                'label' => $date->format('D'),
                'date' => $date->format('M d'),
                'amount' => Shipment::where('status', 'delivered')->whereDate('delivered_at', $date)->sum('cod_amount_paisa'),
            ];
        })->all();
    }

    private function profitSummary(): array
    {
        $serviceFees = Shipment::sum('our_fee_paisa');
        $codFees = PayoutInvoice::sum('cod_fee_paisa');
        $cashHandling = PayoutInvoice::sum('cash_handling_paisa');
        $bankCharges = PayoutInvoice::sum('bank_charge_paisa');
        $estimatedProfit = $serviceFees + $codFees;
        $grossCod = max(PayoutInvoice::sum('gross_cod_paisa'), 1);
        $todayProfit = Shipment::whereDate('booked_at', today())->sum('our_fee_paisa')
            + PayoutInvoice::whereDate('generated_at', today())->sum('cod_fee_paisa');

        return [
            'serviceFees' => (int) $serviceFees,
            'codFees' => (int) $codFees,
            'cashHandling' => (int) $cashHandling,
            'bankCharges' => (int) $bankCharges,
            'estimatedProfit' => (int) $estimatedProfit,
            'todayProfit' => (int) $todayProfit,
            'profitMargin' => round(($estimatedProfit / $grossCod) * 100, 1),
            'breakdown' => [
                ['label' => 'Courier service fee', 'amount' => (int) $serviceFees, 'tone' => 'cyan'],
                ['label' => 'COD fee deduction', 'amount' => (int) $codFees, 'tone' => 'emerald'],
                ['label' => 'Cash handling deducted', 'amount' => (int) $cashHandling, 'tone' => 'amber'],
                ['label' => 'Bank charges deducted', 'amount' => (int) $bankCharges, 'tone' => 'gray'],
            ],
        ];
    }

    private function profitTrend(): array
    {
        return collect(range(6, 0))->map(function (int $daysAgo) {
            $date = CarbonImmutable::today()->subDays($daysAgo);

            return [
                'label' => $date->format('D'),
                'date' => $date->format('M d'),
                'serviceFees' => Shipment::whereDate('booked_at', $date)->sum('our_fee_paisa'),
                'codFees' => PayoutInvoice::whereDate('generated_at', $date)->sum('cod_fee_paisa'),
            ];
        })->all();
    }

    private function statusBreakdown(): array
    {
        return collect(['booked', 'picked', 'transit', 'out_for_delivery', 'delivered', 'returned', 'cancelled'])
            ->map(fn (string $status) => [
                'status' => $status,
                'count' => Shipment::where('status', $status)->count(),
            ])
            ->all();
    }

    private function apiReadiness(): array
    {
        $couriers = Courier::all();
        $total = max(1, $couriers->count());
        $ready = $couriers->filter(fn (Courier $courier) => $courier->is_active
            && in_array($courier->api_status, ['sandbox', 'connected'], true)
            && in_array($courier->api_credentials_status, ['configured', 'verified'], true)
            && ($courier->api_capabilities['book'] ?? false)
            && ($courier->api_capabilities['track'] ?? false)
        )->count();
        $proofReady = $couriers->filter(fn (Courier $courier) => (bool) ($courier->api_capabilities['return_proof'] ?? false))->count();
        $webhookReady = $couriers->filter(fn (Courier $courier) => (bool) ($courier->api_capabilities['webhook'] ?? false) && filled($courier->webhook_secret))->count();

        return [
            'score' => round(($ready / $total) * 100),
            'ready' => $ready,
            'total' => $couriers->count(),
            'proofReady' => $proofReady,
            'webhookReady' => $webhookReady,
        ];
    }

    private function slaAging(array $activeStatuses): array
    {
        $shipments = Shipment::whereIn('status', $activeStatuses)->whereNotNull('booked_at')->get();

        return [
            ['label' => 'Under 24h', 'count' => $shipments->filter(fn (Shipment $shipment) => $shipment->booked_at->gt(now()->subDay()))->count(), 'tone' => 'emerald'],
            ['label' => '1-2 days', 'count' => $shipments->filter(fn (Shipment $shipment) => $shipment->booked_at->lte(now()->subDay()) && $shipment->booked_at->gt(now()->subDays(3)))->count(), 'tone' => 'blue'],
            ['label' => '3-5 days', 'count' => $shipments->filter(fn (Shipment $shipment) => $shipment->booked_at->lte(now()->subDays(3)) && $shipment->booked_at->gt(now()->subDays(6)))->count(), 'tone' => 'amber'],
            ['label' => '6+ days', 'count' => $shipments->filter(fn (Shipment $shipment) => $shipment->booked_at->lte(now()->subDays(6)))->count(), 'tone' => 'rose'],
        ];
    }

    private function financeAging(): array
    {
        $invoices = PayoutInvoice::where('status', 'generated')->whereNotNull('generated_at')->get();

        return [
            ['label' => 'Today', 'count' => $invoices->filter(fn (PayoutInvoice $invoice) => $invoice->generated_at->isToday())->count()],
            ['label' => '1-2 days', 'count' => $invoices->filter(fn (PayoutInvoice $invoice) => $invoice->generated_at->lte(now()->subDay()) && $invoice->generated_at->gt(now()->subDays(3)))->count()],
            ['label' => '3-5 days', 'count' => $invoices->filter(fn (PayoutInvoice $invoice) => $invoice->generated_at->lte(now()->subDays(3)) && $invoice->generated_at->gt(now()->subDays(6)))->count()],
            ['label' => '6+ days', 'count' => $invoices->filter(fn (PayoutInvoice $invoice) => $invoice->generated_at->lte(now()->subDays(6)))->count()],
        ];
    }

    private function supportAging(): array
    {
        $tickets = SupportTicket::where('status', 'open')->get();

        return [
            ['label' => 'Urgent', 'count' => $tickets->where('priority', 'urgent')->count()],
            ['label' => 'Normal', 'count' => $tickets->where('priority', 'normal')->count()],
            ['label' => 'Older than 2 days', 'count' => $tickets->filter(fn (SupportTicket $ticket) => $ticket->created_at?->lte(now()->subDays(2)))->count()],
            ['label' => 'Claims', 'count' => $tickets->where('category', 'claim')->count()],
        ];
    }

    private function cityHotspots(): array
    {
        return Shipment::query()
            ->with('city:id,name')
            ->get()
            ->groupBy('city_id')
            ->map(function ($shipments) {
                $total = $shipments->count();
                $returned = $shipments->where('status', 'returned')->count();

                return [
                    'city' => $shipments->first()->city?->name ?? 'Unknown',
                    'total' => $total,
                    'returned' => $returned,
                    'returnRate' => $total > 0 ? round(($returned / $total) * 100, 1) : 0,
                ];
            })
            ->sortByDesc('returnRate')
            ->take(6)
            ->values()
            ->all();
    }

    private function courierPerformance(): array
    {
        return Courier::query()
            ->withCount([
                'rates',
                'shipments as total_shipments_count',
                'shipments as delivered_shipments_count' => fn ($query) => $query->where('status', 'delivered'),
                'shipments as returned_shipments_count' => fn ($query) => $query->where('status', 'returned'),
            ])
            ->orderByDesc('base_success_rate')
            ->get()
            ->map(function (Courier $courier) {
                $total = (int) $courier->total_shipments_count;
                $returned = (int) $courier->returned_shipments_count;

                return [
                    'name' => $courier->name,
                    'code' => $courier->code,
                    'apiStatus' => $courier->api_status,
                    'successRate' => (float) $courier->base_success_rate,
                    'total' => $total,
                    'delivered' => (int) $courier->delivered_shipments_count,
                    'returned' => $returned,
                    'returnRate' => $total > 0 ? round(($returned / $total) * 100, 1) : 0,
                ];
            })
            ->all();
    }

    private function payoutQueue(): array
    {
        return PayoutInvoice::query()
            ->with('seller:id,name,email')
            ->where('status', 'generated')
            ->latest('generated_at')
            ->limit(5)
            ->get()
            ->map(fn (PayoutInvoice $invoice) => [
                'id' => $invoice->id,
                'invoiceNumber' => $invoice->invoice_number,
                'seller' => $invoice->seller?->name,
                'amount' => $invoice->net_payable_paisa,
                'generatedAt' => $invoice->generated_at?->format('M d, h:i A'),
            ])
            ->all();
    }

    private function sellerReviewQueue(): array
    {
        return SellerProfile::query()
            ->with('user:id,name,email,phone')
            ->where('verification_status', 'pending')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (SellerProfile $profile) => [
                'id' => $profile->user_id,
                'seller' => $profile->user?->name,
                'email' => $profile->user?->email,
                'business' => $profile->business_name,
                'city' => $profile->city,
            ])
            ->all();
    }

    private function claimsQueue(): array
    {
        return SupportTicket::query()
            ->with(['seller:id,name', 'shipment:id,tracking_number'])
            ->where('status', 'open')
            ->whereIn('category', ['claim', 'return'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (SupportTicket $ticket) => [
                'ticketNumber' => $ticket->ticket_number,
                'seller' => $ticket->seller?->name,
                'shipment' => $ticket->shipment?->tracking_number,
                'category' => $ticket->category,
                'priority' => $ticket->priority,
                'subject' => $ticket->subject,
            ])
            ->all();
    }

    private function delayedShipmentQueue(array $activeStatuses): array
    {
        return Shipment::query()
            ->with(['seller:id,name', 'courier:id,name', 'city:id,name'])
            ->whereIn('status', $activeStatuses)
            ->where('booked_at', '<=', now()->subDays(3))
            ->oldest('booked_at')
            ->limit(5)
            ->get()
            ->map(fn (Shipment $shipment) => [
                'id' => $shipment->id,
                'trackingNumber' => $shipment->tracking_number,
                'seller' => $shipment->seller?->name,
                'courier' => $shipment->courier?->name,
                'city' => $shipment->city?->name,
                'status' => $shipment->status,
                'ageDays' => $shipment->booked_at ? (int) $shipment->booked_at->diffInDays(now()) : null,
            ])
            ->all();
    }

    private function apiIssueQueue(): array
    {
        return Courier::query()
            ->whereIn('api_status', ['down', 'disabled'])
            ->orWhereNotNull('last_api_error')
            ->orderBy('name')
            ->limit(5)
            ->get()
            ->map(fn (Courier $courier) => [
                'id' => $courier->id,
                'name' => $courier->name,
                'code' => $courier->code,
                'status' => $courier->api_status,
                'lastError' => $courier->last_api_error,
                'lastCheck' => $courier->last_api_health_check_at?->format('M d, h:i A'),
            ])
            ->all();
    }

    private function topSellers(): array
    {
        return User::query()
            ->where('role', 'seller')
            ->withCount([
                'shipments',
                'shipments as delivered_shipments_count' => fn ($query) => $query->where('status', 'delivered'),
                'shipments as returned_shipments_count' => fn ($query) => $query->where('status', 'returned'),
            ])
            ->withSum(['shipments as delivered_cod_sum' => fn ($query) => $query->where('status', 'delivered')], 'cod_amount_paisa')
            ->orderByDesc('shipments_count')
            ->limit(5)
            ->get()
            ->map(function (User $seller) {
                $total = (int) $seller->shipments_count;
                $returned = (int) $seller->returned_shipments_count;

                return [
                    'name' => $seller->name,
                    'email' => $seller->email,
                    'shipments' => $total,
                    'delivered' => (int) $seller->delivered_shipments_count,
                    'returned' => $returned,
                    'returnRate' => $total > 0 ? round(($returned / $total) * 100, 1) : 0,
                    'cod' => (int) ($seller->delivered_cod_sum ?? 0),
                ];
            })
            ->all();
    }

    private function recentActivity(): array
    {
        $shipments = Shipment::query()
            ->latest('updated_at')
            ->limit(4)
            ->get()
            ->map(fn (Shipment $shipment) => [
                'type' => 'Shipment',
                'title' => $shipment->tracking_number,
                'detail' => str_replace('_', ' ', $shipment->status),
                'time' => $shipment->updated_at?->format('M d, h:i A'),
            ]);

        $tickets = SupportTicket::query()
            ->latest()
            ->limit(4)
            ->get()
            ->map(fn (SupportTicket $ticket) => [
                'type' => 'Ticket',
                'title' => $ticket->ticket_number,
                'detail' => $ticket->subject,
                'time' => $ticket->created_at?->format('M d, h:i A'),
            ]);

        $payouts = PayoutInvoice::query()
            ->latest()
            ->limit(4)
            ->get()
            ->map(fn (PayoutInvoice $invoice) => [
                'type' => 'Payout',
                'title' => $invoice->invoice_number,
                'detail' => $invoice->status,
                'time' => $invoice->updated_at?->format('M d, h:i A'),
            ]);

        return $shipments->merge($tickets)->merge($payouts)->sortByDesc('time')->take(8)->values()->all();
    }

    private function money(int $paisa): string
    {
        return 'Rs. '.number_format($paisa / 100, 0);
    }
}
