import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { AlertTriangle, Banknote, CheckCircle2, ChevronDown, Download, ReceiptText, Send } from 'lucide-react';
import { useState } from 'react';

function money(paisa) {
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format((paisa ?? 0) / 100);
}

function Stat({ label, value }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-950">{value}</p>
        </div>
    );
}

function Detail({ label, value }) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
            <p className="mt-1 text-sm font-medium text-gray-950">{value || 'Not provided'}</p>
        </div>
    );
}

function TransferBadge({ status }) {
    const tones = {
        not_ready: 'bg-gray-100 text-gray-700 ring-gray-200',
        ready: 'bg-cyan-50 text-cyan-800 ring-cyan-200',
        exported: 'bg-indigo-50 text-indigo-800 ring-indigo-200',
        processing: 'bg-amber-50 text-amber-800 ring-amber-200',
        paid: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
        failed: 'bg-rose-50 text-rose-800 ring-rose-200',
    };

    return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${tones[status] ?? tones.not_ready}`}>{String(status).replaceAll('_', ' ')}</span>;
}

function InvoiceCard({ invoice }) {
    const [open, setOpen] = useState(invoice.status === 'generated');
    const deductions = invoice.bankCharge + invoice.cashHandling + invoice.codFee;
    const { data, setData, post, processing, errors } = useForm({
        bank_payment_reference: invoice.bankPaymentReference ?? '',
        bank_failure_reason: invoice.bankFailureReason ?? '',
    });

    const markPaid = () => post(route('admin.payouts.mark-paid', invoice.id), { preserveScroll: true });
    const markReady = () => router.post(route('admin.payouts.bank-ready', invoice.id), {}, { preserveScroll: true });
    const markProcessing = () => router.post(route('admin.payouts.bank-processing', invoice.id), {}, { preserveScroll: true });
    const markFailed = () => post(route('admin.payouts.bank-failed', invoice.id), { preserveScroll: true });

    return (
        <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full flex-col gap-4 p-5 text-left lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-md bg-emerald-50 text-emerald-700">
                        <ReceiptText className="h-5 w-5" />
                    </span>
                    <div>
                        <h3 className="font-semibold text-gray-950">{invoice.invoiceNumber}</h3>
                        <p className="text-sm text-gray-500">{invoice.businessName || invoice.seller} | {invoice.shipmentsCount} shipments | {invoice.generatedAt}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${invoice.status === 'paid' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-sky-50 text-sky-700 ring-sky-200'}`}>{invoice.status}</span>
                    <TransferBadge status={invoice.bankTransferStatus} />
                    <span className="text-sm font-bold text-gray-950">{money(invoice.netPayable)}</span>
                    <ChevronDown className={`h-5 w-5 text-gray-400 transition ${open ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {open && (
                <div className="border-t border-gray-100 p-5">
                    <div className="grid gap-4 lg:grid-cols-4">
                        <Detail label="Gross COD" value={money(invoice.grossCod)} />
                        <Detail label="Deductions" value={money(deductions)} />
                        <Detail label="Net payable" value={money(invoice.netPayable)} />
                        <Detail label="Paid at" value={invoice.paidAt} />
                    </div>

                    <div className="mt-6 grid gap-5 lg:grid-cols-3">
                        <section className="rounded-lg border border-gray-200 p-4">
                            <div className="mb-4 flex items-center gap-2">
                                <Banknote className="h-5 w-5 text-gray-500" />
                                <h4 className="font-semibold text-gray-950">Seller payment details</h4>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Detail label="Seller" value={invoice.seller} />
                                <Detail label="Phone" value={invoice.sellerPhone} />
                                <Detail label="Bank" value={invoice.bankName} />
                                <Detail label="Account title" value={invoice.bankAccountTitle} />
                                <Detail label="Account number" value={invoice.bankAccountNumber} />
                                <Detail label="Wallet" value={invoice.walletProvider ? `${invoice.walletProvider} ${invoice.walletNumber || ''}` : null} />
                            </div>
                        </section>

                        <section className="rounded-lg border border-gray-200 p-4">
                            <h4 className="font-semibold text-gray-950">Deductions</h4>
                            <div className="mt-4 space-y-3 text-sm">
                                <div className="flex justify-between"><span className="text-gray-500">Bank charge</span><span className="font-semibold text-gray-950">{money(invoice.bankCharge)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Cash handling 1%</span><span className="font-semibold text-gray-950">{money(invoice.cashHandling)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">COD 4%</span><span className="font-semibold text-gray-950">{money(invoice.codFee)}</span></div>
                            </div>
                            {invoice.status !== 'paid' && (
                                <button onClick={markPaid} disabled={processing} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Mark paid
                                </button>
                            )}
                        </section>

                        <section className="rounded-lg border border-cyan-100 bg-cyan-50 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <h4 className="font-semibold text-gray-950">Bank transfer readiness</h4>
                                <TransferBadge status={invoice.bankTransferStatus} />
                            </div>
                            <div className="mt-4 grid gap-3 text-sm">
                                <Detail label="Provider" value={invoice.bankProvider === 'undecided' ? 'Bank not selected yet' : invoice.bankProvider} />
                                <Detail label="Export batch" value={invoice.bankExportBatch} />
                                <Detail label="Ready at" value={invoice.bankReadyAt} />
                                <Detail label="Exported at" value={invoice.bankExportedAt} />
                                <Detail label="Processing at" value={invoice.bankProcessingAt} />
                            </div>
                            <input
                                value={data.bank_payment_reference}
                                onChange={(event) => setData('bank_payment_reference', event.target.value)}
                                className="mt-4 w-full rounded-md border-cyan-200 text-sm"
                                placeholder="Bank/payment reference"
                            />
                            {errors.bank_payment_reference && <p className="mt-1 text-xs text-rose-600">{errors.bank_payment_reference}</p>}
                            <textarea
                                value={data.bank_failure_reason}
                                onChange={(event) => setData('bank_failure_reason', event.target.value)}
                                className="mt-3 w-full rounded-md border-cyan-200 text-sm"
                                rows="2"
                                placeholder="Failure reason if transfer fails"
                            />
                            {errors.bank_failure_reason && <p className="mt-1 text-xs text-rose-600">{errors.bank_failure_reason}</p>}
                            {invoice.bankFailureReason && <p className="mt-2 rounded-md bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{invoice.bankFailureReason}</p>}
                            {invoice.status !== 'paid' && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <button onClick={markReady} className="inline-flex items-center gap-1 rounded-md bg-cyan-700 px-3 py-2 text-xs font-bold text-white">Ready</button>
                                    <button onClick={markProcessing} className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900"><Send className="h-3.5 w-3.5" />Processing</button>
                                    <button onClick={markFailed} disabled={processing} className="inline-flex items-center gap-1 rounded-md bg-rose-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"><AlertTriangle className="h-3.5 w-3.5" />Failed</button>
                                </div>
                            )}
                        </section>
                    </div>

                    <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
                        <div className="bg-gray-50 px-4 py-3 text-xs font-semibold uppercase text-gray-500">Invoice shipments</div>
                        <div className="grid gap-0 divide-y divide-gray-100">
                            {invoice.shipments.map((shipment) => (
                                <div key={shipment.trackingNumber} className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-3">
                                    <span className="font-semibold text-gray-950">{shipment.trackingNumber}</span>
                                    <span className="text-gray-500">{shipment.status}</span>
                                    <span className="text-gray-500">{shipment.deliveredAt}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default function Index({ stats, bankConfig, invoices }) {
    return (
        <AdminLayout header={<div><h2 className="text-xl font-semibold text-gray-950">Payout Approvals</h2><p className="text-sm text-gray-500">Review generated seller COD invoices and mark payments completed.</p></div>}>
            <Head title="Payout Approvals" />
            <div className="bg-gray-50 py-8">
                <div className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-5 shadow-sm">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="text-sm font-bold uppercase text-cyan-800">Bank-neutral transfer system</p>
                                <h3 className="mt-1 text-xl font-bold text-gray-950">Provider can stay undecided until the bank is selected.</h3>
                                <p className="mt-2 text-sm leading-6 text-cyan-900">Current mode: {bankConfig.mode}. Provider: {bankConfig.provider}. Export format: {bankConfig.exportFormat}. Finance can still prepare CSV batches and references today.</p>
                            </div>
                            <Link href={route('admin.payouts.bank-file.export')} className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-950 px-4 py-2 text-sm font-bold text-white">
                                <Download className="h-4 w-4" />
                                Export bank CSV
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-6">
                        <Stat label="Generated invoices" value={stats.generated} />
                        <Stat label="Paid invoices" value={stats.paid} />
                        <Stat label="Pending payout" value={money(stats.pendingAmount)} />
                        <Stat label="Paid amount" value={money(stats.paidAmount)} />
                        <Stat label="Bank ready" value={stats.bankReady} />
                        <Stat label="Processing" value={stats.bankProcessing} />
                    </div>
                    <div className="space-y-4">
                        {invoices.map((invoice) => <InvoiceCard key={invoice.id} invoice={invoice} />)}
                        {!invoices.length && (
                            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
                                No payout invoices generated yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
