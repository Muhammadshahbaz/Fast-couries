<?php

namespace App\Http\Controllers;

use App\Models\PayoutInvoice;
use App\Models\Shipment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PayoutController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $eligible = $this->eligibleShipments($request);

        $summary = $this->settlementSummary($eligible->sum('cod_amount_paisa'));

        $invoices = PayoutInvoice::query()
            ->withCount('shipments')
            ->where('seller_id', $request->user()->id)
            ->latest('generated_at')
            ->get()
            ->map(fn (PayoutInvoice $invoice) => [
                'invoiceNumber' => $invoice->invoice_number,
                'status' => $invoice->status,
                'bankTransferStatus' => $invoice->bank_transfer_status,
                'bankProvider' => $invoice->bank_provider ?: config('bank.provider'),
                'bankPaymentReference' => $invoice->bank_payment_reference,
                'bankFailureReason' => $invoice->bank_failure_reason,
                'shipmentsCount' => $invoice->shipments_count,
                'grossCod' => $invoice->gross_cod_paisa,
                'bankCharge' => $invoice->bank_charge_paisa,
                'cashHandling' => $invoice->cash_handling_paisa,
                'codFee' => $invoice->cod_fee_paisa,
                'netPayable' => $invoice->net_payable_paisa,
                'generatedAt' => $invoice->generated_at?->format('M d, Y h:i A'),
                'paidAt' => $invoice->paid_at?->format('M d, Y h:i A'),
            ]);

        return Inertia::render('Payouts/Index', [
            'summary' => $summary,
            'shipments' => $eligible->map(fn (Shipment $shipment) => [
                'id' => $shipment->id,
                'trackingNumber' => $shipment->tracking_number,
                'courier' => $shipment->courier?->name,
                'city' => $shipment->city?->name,
                'codAmount' => $shipment->cod_amount_paisa,
                'deliveredAt' => $shipment->delivered_at?->format('M d, Y h:i A'),
            ]),
            'invoices' => $invoices,
            'bankReadiness' => [
                'provider' => config('bank.provider'),
                'mode' => config('bank.mode'),
                'hasBankAccount' => filled($request->user()->sellerProfile?->bank_account_number),
                'hasWallet' => filled($request->user()->sellerProfile?->wallet_number),
                'verificationStatus' => $request->user()->sellerProfile?->verification_status ?? 'missing',
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $eligible = $this->eligibleShipments($request);
        $summary = $this->settlementSummary($eligible->sum('cod_amount_paisa'));

        if ($eligible->isEmpty() || $summary['grossCod'] <= 0) {
            return back()->with('error', 'No delivered COD shipments are ready for payout invoice.');
        }

        DB::transaction(function () use ($request, $eligible, $summary) {
            $invoice = PayoutInvoice::create([
                'seller_id' => $request->user()->id,
                'invoice_number' => $this->invoiceNumber(),
                'gross_cod_paisa' => $summary['grossCod'],
                'bank_charge_paisa' => $summary['bankCharge'],
                'cash_handling_paisa' => $summary['cashHandling'],
                'cod_fee_paisa' => $summary['codFee'],
                'net_payable_paisa' => $summary['netPayable'],
                'status' => 'generated',
                'generated_at' => now(),
            ]);

            $invoice->shipments()->attach($eligible->mapWithKeys(fn (Shipment $shipment) => [
                $shipment->id => ['cod_amount_paisa' => $shipment->cod_amount_paisa],
            ]));
        });

        return back()->with('success', 'Payout invoice generated.');
    }

    private function eligibleShipments(Request $request)
    {
        return Shipment::query()
            ->with(['courier:id,name', 'city:id,name'])
            ->where('seller_id', $request->user()->id)
            ->where('status', 'delivered')
            ->where('cod_amount_paisa', '>', 0)
            ->whereDoesntHave('payoutInvoices')
            ->latest('delivered_at')
            ->get();
    }

    private function settlementSummary(int $grossCod): array
    {
        $bankCharge = $grossCod > 0 ? 8500 : 0;
        $cashHandling = (int) round($grossCod * 0.01);
        $codFee = (int) round($grossCod * 0.04);
        $netPayable = max($grossCod - $bankCharge - $cashHandling - $codFee, 0);

        return compact('grossCod', 'bankCharge', 'cashHandling', 'codFee', 'netPayable');
    }

    private function invoiceNumber(): string
    {
        do {
            $invoiceNumber = 'PINV-'.now()->format('ymd').'-'.Str::upper(Str::random(5));
        } while (PayoutInvoice::where('invoice_number', $invoiceNumber)->exists());

        return $invoiceNumber;
    }
}
