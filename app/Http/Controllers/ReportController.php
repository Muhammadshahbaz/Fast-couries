<?php

namespace App\Http\Controllers;

use App\Models\Courier;
use App\Models\PayoutInvoice;
use App\Models\Shipment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function seller(Request $request): Response
    {
        $shipments = Shipment::query()->where('seller_id', $request->user()->id);

        return Inertia::render('Reports/Seller', [
            'summary' => [
                'booked' => (clone $shipments)->count(),
                'delivered' => (clone $shipments)->where('status', 'delivered')->count(),
                'returned' => (clone $shipments)->where('status', 'returned')->count(),
                'grossCod' => (clone $shipments)->where('status', 'delivered')->sum('cod_amount_paisa'),
                'paidCod' => PayoutInvoice::where('seller_id', $request->user()->id)->where('status', 'paid')->sum('net_payable_paisa'),
            ],
            'byCourier' => (clone $shipments)
                ->selectRaw('courier_id, count(*) as total, sum(case when status = ? then 1 else 0 end) as delivered, sum(case when status = ? then 1 else 0 end) as returned', ['delivered', 'returned'])
                ->with('courier:id,name')
                ->groupBy('courier_id')
                ->get()
                ->map(fn (Shipment $shipment) => [
                    'name' => $shipment->courier?->name ?? 'Unknown',
                    'total' => (int) $shipment->total,
                    'delivered' => (int) $shipment->delivered,
                    'returned' => (int) $shipment->returned,
                ]),
        ]);
    }

    public function admin(Request $request): Response
    {
        abort_unless(in_array($request->user()->role, ['super_admin', 'sub_admin'], true), 403);

        return Inertia::render('Reports/Admin', [
            'summary' => [
                'shipments' => Shipment::count(),
                'delivered' => Shipment::where('status', 'delivered')->count(),
                'returns' => Shipment::where('status', 'returned')->count(),
                'codCollected' => Shipment::where('status', 'delivered')->sum('cod_amount_paisa'),
                'payoutLiability' => PayoutInvoice::where('status', 'generated')->sum('net_payable_paisa'),
            ],
            'couriers' => Courier::query()
                ->withCount('rates')
                ->withCount(['rates as active_rates_count' => fn ($query) => $query->where('is_active', true)])
                ->orderBy('name')
                ->get()
                ->map(fn (Courier $courier) => [
                    'name' => $courier->name,
                    'code' => $courier->code,
                    'apiStatus' => $courier->api_status,
                    'rates' => $courier->rates_count,
                    'activeRates' => $courier->active_rates_count,
                    'successRate' => $courier->base_success_rate,
                ]),
        ]);
    }
}
