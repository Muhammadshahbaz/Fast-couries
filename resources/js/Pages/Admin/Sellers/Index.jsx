import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Clock3, FileText, ShieldCheck, UserCheck, XCircle } from 'lucide-react';

const statusTone = {
    verified: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    pending: 'bg-amber-50 text-amber-800 ring-amber-200',
    rejected: 'bg-rose-50 text-rose-800 ring-rose-200',
    missing: 'bg-gray-100 text-gray-700 ring-gray-200',
};

function StatusBadge({ status }) {
    return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ring-inset ${statusTone[status] ?? statusTone.missing}`}>{status}</span>;
}

function ReviewForm({ seller }) {
    const { data, setData, patch, processing, errors } = useForm({
        verification_status: seller.verificationStatus === 'verified' ? 'verified' : 'pending',
        review_notes: seller.reviewNotes ?? '',
        rejection_reason: seller.rejectionReason ?? '',
    });

    const submit = (status) => {
        patch(route('admin.sellers.update', seller.id), {
            data: {
                ...data,
                verification_status: status,
            },
            preserveScroll: true,
        });
    };

    const patchStatus = (status) => {
        router.patch(route('admin.sellers.update', seller.id), {
            ...data,
            verification_status: status,
        }, { preserveScroll: true });
    };

    return (
        <div className="space-y-3">
            <textarea
                rows="2"
                value={data.review_notes}
                onChange={(event) => setData('review_notes', event.target.value)}
                className="w-full rounded-md border-gray-300 text-sm"
                placeholder="Internal review note"
            />
            {errors.review_notes && <p className="text-xs text-rose-600">{errors.review_notes}</p>}
            <textarea
                rows="2"
                value={data.rejection_reason}
                onChange={(event) => setData('rejection_reason', event.target.value)}
                className="w-full rounded-md border-gray-300 text-sm"
                placeholder="Reason shown to seller if rejected"
            />
            {errors.rejection_reason && <p className="text-xs text-rose-600">{errors.rejection_reason}</p>}
            <div className="flex flex-wrap gap-2">
                <button disabled={processing} onClick={() => patchStatus('verified')} className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
                    <UserCheck className="h-3.5 w-3.5" />
                    Verify
                </button>
                <button disabled={processing} onClick={() => patchStatus('pending')} className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 disabled:opacity-50">
                    <Clock3 className="h-3.5 w-3.5" />
                    Pending
                </button>
                <button disabled={processing} onClick={() => patchStatus('rejected')} className="inline-flex items-center gap-1 rounded-md bg-rose-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
                    <XCircle className="h-3.5 w-3.5" />
                    Reject
                </button>
            </div>
        </div>
    );
}

function SummaryCard({ icon: Icon, label, value, tone }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    <p className="mt-2 text-2xl font-bold text-gray-950">{value}</p>
                </div>
                <span className={`grid h-10 w-10 place-items-center rounded-md ${tone}`}>
                    <Icon className="h-5 w-5" />
                </span>
            </div>
        </div>
    );
}

export default function Index({ sellers }) {
    const counts = sellers.reduce((carry, seller) => {
        carry[seller.verificationStatus] = (carry[seller.verificationStatus] ?? 0) + 1;
        return carry;
    }, {});

    return (
        <AdminLayout header={<div><h2 className="text-xl font-semibold text-gray-950">Seller KYC</h2><p className="text-sm text-gray-500">Review seller documents, payout details, and approval status before live booking.</p></div>}>
            <Head title="Seller KYC" />
            <div className="bg-gray-50 py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <section className="grid gap-4 md:grid-cols-4">
                        <SummaryCard icon={ShieldCheck} label="Total sellers" value={sellers.length} tone="bg-gray-950 text-white" />
                        <SummaryCard icon={Clock3} label="Pending review" value={counts.pending ?? 0} tone="bg-amber-500 text-white" />
                        <SummaryCard icon={CheckCircle2} label="Verified" value={counts.verified ?? 0} tone="bg-emerald-600 text-white" />
                        <SummaryCard icon={AlertTriangle} label="Rejected" value={counts.rejected ?? 0} tone="bg-rose-600 text-white" />
                    </section>

                    <section className="space-y-4">
                        {sellers.map((seller) => (
                            <article key={seller.id} className="rounded-lg border border-gray-200 bg-white shadow-sm">
                                <div className="grid gap-6 p-5 lg:grid-cols-[1.1fr_1fr_0.95fr]">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h3 className="text-lg font-bold text-gray-950">{seller.businessName || seller.name}</h3>
                                            <StatusBadge status={seller.verificationStatus} />
                                        </div>
                                        <p className="mt-2 text-sm text-gray-500">{seller.name} | {seller.email} | {seller.phone || 'No phone'}</p>
                                        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                                            <div className="rounded-md bg-gray-50 p-3">
                                                <p className="text-xs font-semibold uppercase text-gray-400">CNIC</p>
                                                <p className="mt-1 font-semibold text-gray-800">{seller.cnicNumber || 'Missing'}</p>
                                            </div>
                                            <div className="rounded-md bg-gray-50 p-3">
                                                <p className="text-xs font-semibold uppercase text-gray-400">Pickup city</p>
                                                <p className="mt-1 font-semibold text-gray-800">{seller.city || 'Missing'}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {seller.cnicFrontUrl ? <a href={seller.cnicFrontUrl} target="_blank" className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-2 text-xs font-bold text-gray-700"><FileText className="h-3.5 w-3.5" />CNIC front</a> : <span className="rounded-md bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">Front missing</span>}
                                            {seller.cnicBackUrl ? <a href={seller.cnicBackUrl} target="_blank" className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-2 text-xs font-bold text-gray-700"><FileText className="h-3.5 w-3.5" />CNIC back</a> : <span className="rounded-md bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">Back missing</span>}
                                        </div>
                                    </div>

                                    <div className="rounded-lg bg-gray-50 p-4">
                                        <h4 className="font-bold text-gray-950">Payout readiness</h4>
                                        <div className="mt-4 space-y-3 text-sm">
                                            <p><span className="font-semibold text-gray-500">Bank:</span> {seller.bankName || 'Not provided'}</p>
                                            <p><span className="font-semibold text-gray-500">Account title:</span> {seller.bankAccountTitle || 'Not provided'}</p>
                                            <p><span className="font-semibold text-gray-500">IBAN/account:</span> {seller.bankAccountNumber || 'Not provided'}</p>
                                            <p><span className="font-semibold text-gray-500">Wallet:</span> {seller.walletProvider ? `${seller.walletProvider} ${seller.walletNumber || ''}` : 'Not provided'}</p>
                                        </div>
                                        {(seller.reviewedAt || seller.reviewNotes || seller.rejectionReason) && (
                                            <div className="mt-4 rounded-md bg-white p-3 text-xs leading-5 text-gray-600">
                                                {seller.reviewedAt && <p><span className="font-bold">Reviewed:</span> {seller.reviewedAt}</p>}
                                                {seller.reviewNotes && <p><span className="font-bold">Note:</span> {seller.reviewNotes}</p>}
                                                {seller.rejectionReason && <p className="text-rose-700"><span className="font-bold">Reason:</span> {seller.rejectionReason}</p>}
                                            </div>
                                        )}
                                    </div>

                                    <ReviewForm seller={seller} />
                                </div>
                            </article>
                        ))}
                    </section>
                </div>
            </div>
        </AdminLayout>
    );
}
