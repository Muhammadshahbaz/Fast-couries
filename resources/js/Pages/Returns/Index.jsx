import SellerLayout from '@/Layouts/SellerLayout';
import { Head, Link } from '@inertiajs/react';
import { Camera, PhoneCall, RotateCcw, ShieldCheck } from 'lucide-react';

function money(paisa) {
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format((paisa ?? 0) / 100);
}

export default function Index({ returns }) {
    return (
        <SellerLayout header={<div><h2 className="text-xl font-semibold text-gray-950">Returns Management</h2><p className="text-sm text-gray-500">Returned parcels, reasons, and follow-up actions.</p></div>}>
            <Head title="Returns" />
            <div className="bg-gray-50 py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <section className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-5">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-700" />
                                <div>
                                    <h3 className="font-semibold text-emerald-950">Verified return proof</h3>
                                    <p className="mt-1 text-sm text-emerald-800">
                                        Returned parcels can include rider statement, delivery attempts, call recording, proof photo, courier reference, and verification time.
                                    </p>
                                </div>
                            </div>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                                {returns.filter((item) => item.proof.status === 'verified').length} verified
                            </span>
                        </div>
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="flex items-center gap-2 border-b border-gray-100 p-5"><RotateCcw className="h-5 w-5 text-rose-600" /><h3 className="font-semibold text-gray-950">Return queue</h3></div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-5 py-3">Tracking</th><th className="px-5 py-3">Receiver</th><th className="px-5 py-3">Courier</th><th className="px-5 py-3">Reason</th><th className="px-5 py-3">Proof</th><th className="px-5 py-3">COD</th><th className="px-5 py-3">Action</th></tr></thead>
                                <tbody className="divide-y divide-gray-100">
                                    {returns.map((item) => (
                                        <tr key={item.trackingNumber} className="align-top">
                                            <td className="px-5 py-4 font-semibold">
                                                <Link href={route('shipments.show', item.id)} className="text-gray-950 hover:text-blue-700">{item.trackingNumber}</Link>
                                                <span className="block text-xs font-normal text-gray-500">{item.returnedAt}</span>
                                            </td>
                                            <td className="px-5 py-4">{item.receiver}<span className="block text-xs text-gray-500">{item.phone} | {item.city}</span></td>
                                            <td className="px-5 py-4">{item.courier}</td>
                                            <td className="max-w-xs px-5 py-4">
                                                <p>{item.reason}</p>
                                                {item.proof.buyerResponse && <p className="mt-1 text-xs text-gray-500">{item.proof.buyerResponse}</p>}
                                            </td>
                                            <td className="min-w-64 px-5 py-4">
                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold capitalize ${item.proof.status === 'verified' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'}`}>
                                                    {item.proof.status}
                                                </span>
                                                <span className="ml-2 inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-bold text-gray-700">
                                                    {item.proof.proofScore}% proof
                                                </span>
                                                <p className="mt-2 text-xs text-gray-600">{item.proof.attempts} attempts{item.proof.lastAttemptAt ? ` | ${item.proof.lastAttemptAt}` : ''}</p>
                                                {item.proof.summary && <p className="mt-2 rounded-md bg-gray-50 p-2 text-xs leading-5 text-gray-600">{item.proof.summary}</p>}
                                                {item.proof.riderStatement && <p className="mt-1 text-xs text-gray-500">{item.proof.riderStatement}</p>}
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {item.proof.callRecordingUrl && (
                                                        <a href={item.proof.callRecordingUrl} target="_blank" className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-700">
                                                            <PhoneCall className="h-3.5 w-3.5" />
                                                            Call proof
                                                        </a>
                                                    )}
                                                    {item.proof.photoUrl && (
                                                        <a href={item.proof.photoUrl} target="_blank" className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-700">
                                                            <Camera className="h-3.5 w-3.5" />
                                                            Photo proof
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 font-semibold">{money(item.codAmount)}</td>
                                            <td className="px-5 py-4"><Link href={route('support.index')} className="rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700">Open ticket</Link></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </SellerLayout>
    );
}
