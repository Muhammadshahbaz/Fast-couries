import SellerLayout from '@/Layouts/SellerLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Banknote, CheckCircle2, CircleDollarSign, FilePlus2, ReceiptText } from 'lucide-react';

function money(paisa) {
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format((paisa ?? 0) / 100);
}

function SummaryCard({ label, value, tone = 'bg-white' }) {
    return (
        <div className={`rounded-lg border border-gray-200 p-5 shadow-sm ${tone}`}>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-950">{value}</p>
        </div>
    );
}

export default function Index({ summary, shipments, invoices, bankReadiness }) {
    const generateInvoice = () => {
        router.post(route('payouts.invoices.store'), {}, { preserveScroll: true });
    };

    return (
        <SellerLayout header={<div><h2 className="text-xl font-semibold text-gray-950">COD Payouts</h2><p className="text-sm text-gray-500">Invoice-level deductions and delivered COD settlement.</p></div>}>
            <Head title="COD Payouts" />
            <div className="bg-gray-50 py-8">
                <div className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-500">Ready for invoice</p>
                            <h3 className="mt-1 text-2xl font-bold text-gray-950">{shipments.length} delivered COD shipments</h3>
                        </div>
                        <button onClick={generateInvoice} disabled={!shipments.length} className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                            <FilePlus2 className="h-4 w-4" />
                            Generate payout invoice
                        </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-5">
                        <SummaryCard label="Gross COD" value={money(summary.grossCod)} />
                        <SummaryCard label="Bank charge" value={money(summary.bankCharge)} />
                        <SummaryCard label="Cash handling 1%" value={money(summary.cashHandling)} />
                        <SummaryCard label="COD 4%" value={money(summary.codFee)} />
                        <SummaryCard label="Net payable" value={money(summary.netPayable)} tone="bg-emerald-50" />
                    </div>
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                        Rs.85 bank charge, 1% cash handling, and 4% COD deduction are settlement-level invoice deductions.
                    </div>

                    <section className="rounded-lg border border-cyan-200 bg-cyan-50 p-5 shadow-sm">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="text-sm font-bold uppercase text-cyan-800">Bank payout readiness</p>
                                <h3 className="mt-1 text-xl font-bold text-gray-950">Bank partner is not selected yet, but your payout profile can be ready.</h3>
                                <p className="mt-2 text-sm leading-6 text-cyan-900">Current transfer mode: {bankReadiness.mode}. Provider: {bankReadiness.provider === 'undecided' ? 'to be decided' : bankReadiness.provider}.</p>
                            </div>
                            <Link href={route('profile.edit')} className="inline-flex items-center justify-center rounded-md bg-gray-950 px-4 py-2 text-sm font-bold text-white">Update payout profile</Link>
                        </div>
                        <div className="mt-5 grid gap-3 md:grid-cols-3">
                            <div className="rounded-md bg-white p-3 text-sm">
                                <p className="flex items-center gap-2 font-semibold text-gray-950"><CheckCircle2 className={`h-4 w-4 ${bankReadiness.verificationStatus === 'verified' ? 'text-emerald-600' : 'text-gray-300'}`} />Seller KYC</p>
                                <p className="mt-1 text-gray-500 capitalize">{bankReadiness.verificationStatus}</p>
                            </div>
                            <div className="rounded-md bg-white p-3 text-sm">
                                <p className="flex items-center gap-2 font-semibold text-gray-950"><CheckCircle2 className={`h-4 w-4 ${bankReadiness.hasBankAccount ? 'text-emerald-600' : 'text-gray-300'}`} />Bank account</p>
                                <p className="mt-1 text-gray-500">{bankReadiness.hasBankAccount ? 'Added' : 'Not added yet'}</p>
                            </div>
                            <div className="rounded-md bg-white p-3 text-sm">
                                <p className="flex items-center gap-2 font-semibold text-gray-950"><CheckCircle2 className={`h-4 w-4 ${bankReadiness.hasWallet ? 'text-emerald-600' : 'text-gray-300'}`} />Wallet fallback</p>
                                <p className="mt-1 text-gray-500">{bankReadiness.hasWallet ? 'Added' : 'Optional'}</p>
                            </div>
                        </div>
                    </section>
                    <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="flex items-center gap-2 border-b border-gray-100 p-5">
                            <ReceiptText className="h-5 w-5 text-gray-500" />
                            <h3 className="font-semibold text-gray-950">Uninvoiced delivered COD shipments</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-5 py-3">Tracking</th><th className="px-5 py-3">Courier</th><th className="px-5 py-3">City</th><th className="px-5 py-3">Delivered</th><th className="px-5 py-3">COD</th></tr></thead>
                                <tbody className="divide-y divide-gray-100">
                                    {shipments.map((shipment) => <tr key={shipment.trackingNumber}><td className="px-5 py-4"><Link href={route('shipments.show', shipment.id)} className="font-semibold text-gray-950 hover:text-cyan-700">{shipment.trackingNumber}</Link></td><td className="px-5 py-4">{shipment.courier}</td><td className="px-5 py-4">{shipment.city}</td><td className="px-5 py-4">{shipment.deliveredAt}</td><td className="px-5 py-4 font-semibold">{money(shipment.codAmount)}</td></tr>)}
                                    {!shipments.length && <tr><td colSpan="5" className="px-5 py-8 text-center text-sm text-gray-500">No uninvoiced delivered COD shipments.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="flex items-center gap-2 border-b border-gray-100 p-5">
                            <Banknote className="h-5 w-5 text-gray-500" />
                            <h3 className="font-semibold text-gray-950">Payout invoice history</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-5 py-3">Invoice</th><th className="px-5 py-3">Generated</th><th className="px-5 py-3">Shipments</th><th className="px-5 py-3">Gross</th><th className="px-5 py-3">Deductions</th><th className="px-5 py-3">Net</th><th className="px-5 py-3">Transfer</th><th className="px-5 py-3">Status</th></tr></thead>
                                <tbody className="divide-y divide-gray-100">
                                    {invoices.map((invoice) => {
                                        const deductions = invoice.bankCharge + invoice.cashHandling + invoice.codFee;

                                        return (
                                            <tr key={invoice.invoiceNumber}>
                                                <td className="px-5 py-4 font-semibold text-gray-950">{invoice.invoiceNumber}</td>
                                                <td className="px-5 py-4">{invoice.generatedAt}</td>
                                                <td className="px-5 py-4">{invoice.shipmentsCount}</td>
                                                <td className="px-5 py-4">{money(invoice.grossCod)}</td>
                                                <td className="px-5 py-4">{money(deductions)}</td>
                                                <td className="px-5 py-4 font-semibold text-emerald-700">{money(invoice.netPayable)}</td>
                                                <td className="px-5 py-4">
                                                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold capitalize text-gray-700">{String(invoice.bankTransferStatus).replaceAll('_', ' ')}</span>
                                                    {invoice.bankPaymentReference && <p className="mt-1 text-xs text-gray-500">Ref: {invoice.bankPaymentReference}</p>}
                                                    {invoice.bankFailureReason && <p className="mt-1 text-xs font-semibold text-rose-600">{invoice.bankFailureReason}</p>}
                                                </td>
                                                <td className="px-5 py-4"><span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-200">{invoice.status}</span></td>
                                            </tr>
                                        );
                                    })}
                                    {!invoices.length && <tr><td colSpan="8" className="px-5 py-8 text-center text-sm text-gray-500">No payout invoices generated yet.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </SellerLayout>
    );
}
