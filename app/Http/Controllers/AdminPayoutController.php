<?php

namespace App\Http\Controllers;

use App\Models\PayoutInvoice;
use App\Notifications\PayoutInvoicePaid;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminPayoutController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeAdmin($request);

        $invoices = PayoutInvoice::query()
            ->with(['seller.sellerProfile', 'shipments:id,tracking_number,status,delivered_at'])
            ->withCount('shipments')
            ->latest('generated_at')
            ->get()
            ->map(fn (PayoutInvoice $invoice) => [
                'id' => $invoice->id,
                'invoiceNumber' => $invoice->invoice_number,
                'seller' => $invoice->seller?->name,
                'sellerEmail' => $invoice->seller?->email,
                'sellerPhone' => $invoice->seller?->phone,
                'businessName' => $invoice->seller?->sellerProfile?->business_name,
                'bankName' => $invoice->seller?->sellerProfile?->bank_name,
                'bankAccountTitle' => $invoice->seller?->sellerProfile?->bank_account_title,
                'bankAccountNumber' => $invoice->seller?->sellerProfile?->bank_account_number,
                'walletProvider' => $invoice->seller?->sellerProfile?->wallet_provider,
                'walletNumber' => $invoice->seller?->sellerProfile?->wallet_number,
                'status' => $invoice->status,
                'bankTransferStatus' => $invoice->bank_transfer_status,
                'bankProvider' => $invoice->bank_provider ?: config('bank.provider'),
                'bankExportBatch' => $invoice->bank_export_batch,
                'bankPaymentReference' => $invoice->bank_payment_reference,
                'bankReadyAt' => $invoice->bank_ready_at?->format('M d, Y h:i A'),
                'bankExportedAt' => $invoice->bank_exported_at?->format('M d, Y h:i A'),
                'bankProcessingAt' => $invoice->bank_processing_at?->format('M d, Y h:i A'),
                'bankFailureReason' => $invoice->bank_failure_reason,
                'shipmentsCount' => $invoice->shipments_count,
                'grossCod' => $invoice->gross_cod_paisa,
                'bankCharge' => $invoice->bank_charge_paisa,
                'cashHandling' => $invoice->cash_handling_paisa,
                'codFee' => $invoice->cod_fee_paisa,
                'netPayable' => $invoice->net_payable_paisa,
                'generatedAt' => $invoice->generated_at?->format('M d, Y h:i A'),
                'paidAt' => $invoice->paid_at?->format('M d, Y h:i A'),
                'shipments' => $invoice->shipments->map(fn ($shipment) => [
                    'trackingNumber' => $shipment->tracking_number,
                    'status' => $shipment->status,
                    'deliveredAt' => $shipment->delivered_at?->format('M d, Y'),
                ]),
            ]);

        return Inertia::render('Admin/Payouts/Index', [
            'stats' => [
                'generated' => PayoutInvoice::where('status', 'generated')->count(),
                'paid' => PayoutInvoice::where('status', 'paid')->count(),
                'pendingAmount' => PayoutInvoice::where('status', 'generated')->sum('net_payable_paisa'),
                'paidAmount' => PayoutInvoice::where('status', 'paid')->sum('net_payable_paisa'),
                'bankReady' => PayoutInvoice::where('bank_transfer_status', 'ready')->count(),
                'bankProcessing' => PayoutInvoice::where('bank_transfer_status', 'processing')->count(),
            ],
            'bankConfig' => [
                'mode' => config('bank.mode'),
                'provider' => config('bank.provider'),
                'exportFormat' => config('bank.export_format'),
            ],
            'invoices' => $invoices,
        ]);
    }

    public function markBankReady(Request $request, PayoutInvoice $invoice): RedirectResponse
    {
        $this->authorizeAdmin($request);
        abort_if($invoice->status === 'paid', 422, 'Paid invoices cannot be moved back to bank ready.');

        $invoice->update([
            'bank_transfer_status' => 'ready',
            'bank_provider' => config('bank.provider'),
            'bank_ready_at' => now(),
            'bank_failure_reason' => null,
        ]);

        return back()->with('success', "{$invoice->invoice_number} is ready for bank transfer.");
    }

    public function markProcessing(Request $request, PayoutInvoice $invoice): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $invoice->update([
            'bank_transfer_status' => 'processing',
            'bank_provider' => config('bank.provider'),
            'bank_processing_at' => now(),
            'bank_failure_reason' => null,
        ]);

        return back()->with('success', "{$invoice->invoice_number} marked bank processing.");
    }

    public function markFailed(Request $request, PayoutInvoice $invoice): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'bank_failure_reason' => ['required', 'string', 'max:1000'],
        ]);

        $invoice->update([
            'bank_transfer_status' => 'failed',
            'bank_failed_at' => now(),
            'bank_failure_reason' => $validated['bank_failure_reason'],
        ]);

        return back()->with('success', "{$invoice->invoice_number} marked bank failed.");
    }

    public function exportBankFile(Request $request): StreamedResponse
    {
        $this->authorizeAdmin($request);

        $invoices = PayoutInvoice::query()
            ->with('seller.sellerProfile')
            ->where('status', 'generated')
            ->whereIn('bank_transfer_status', ['ready', 'failed'])
            ->orderBy('generated_at')
            ->get();

        $batch = 'BANK-'.now()->format('ymd-His').'-'.Str::upper(Str::random(4));

        PayoutInvoice::query()
            ->whereIn('id', $invoices->pluck('id'))
            ->update([
                'bank_transfer_status' => 'exported',
                'bank_provider' => config('bank.provider'),
                'bank_export_batch' => $batch,
                'bank_exported_at' => now(),
                'bank_failure_reason' => null,
            ]);

        return response()->streamDownload(function () use ($invoices, $batch) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['batch', 'invoice_number', 'seller', 'business', 'bank_name', 'account_title', 'account_number', 'wallet_provider', 'wallet_number', 'amount_pkr', 'remarks']);

            foreach ($invoices as $invoice) {
                $profile = $invoice->seller?->sellerProfile;
                fputcsv($handle, [
                    $batch,
                    $invoice->invoice_number,
                    $invoice->seller?->name,
                    $profile?->business_name,
                    $profile?->bank_name,
                    $profile?->bank_account_title,
                    $profile?->bank_account_number,
                    $profile?->wallet_provider,
                    $profile?->wallet_number,
                    number_format($invoice->net_payable_paisa / 100, 2, '.', ''),
                    'Fast Couriers COD payout',
                ]);
            }

            fclose($handle);
        }, strtolower($batch).'.csv', ['Content-Type' => 'text/csv']);
    }

    public function markPaid(Request $request, PayoutInvoice $invoice): RedirectResponse
    {
        $this->authorizeAdmin($request);

        if ($invoice->status === 'paid') {
            return back()->with('success', "{$invoice->invoice_number} is already marked paid.");
        }

        $validated = $request->validate([
            'bank_payment_reference' => ['nullable', 'string', 'max:120'],
        ]);

        $invoice->update([
            'status' => 'paid',
            'bank_transfer_status' => 'paid',
            'bank_provider' => config('bank.provider'),
            'bank_payment_reference' => $validated['bank_payment_reference'] ?? $invoice->bank_payment_reference,
            'paid_at' => now(),
        ]);

        $invoice->seller?->notify(new PayoutInvoicePaid($invoice));

        return back()->with('success', "{$invoice->invoice_number} marked paid.");
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless(in_array($request->user()->role, ['super_admin', 'sub_admin'], true), 403);
    }
}
