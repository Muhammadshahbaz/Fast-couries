import SellerLayout from '@/Layouts/SellerLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Camera, CheckCircle2, ExternalLink, PackageCheck, PhoneCall, Printer, RefreshCw, RotateCcw, ShieldCheck, Truck } from 'lucide-react';

const statusClasses = {
    booked: 'bg-sky-50 text-sky-700 ring-sky-200',
    picked: 'bg-orange-50 text-orange-700 ring-orange-200',
    transit: 'bg-amber-50 text-amber-700 ring-amber-200',
    out_for_delivery: 'bg-teal-50 text-teal-700 ring-teal-200',
    delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    returned: 'bg-rose-50 text-rose-700 ring-rose-200',
    cancelled: 'bg-gray-100 text-gray-700 ring-gray-200',
};

function money(paisa) {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        maximumFractionDigits: 0,
    }).format((paisa ?? 0) / 100);
}

function statusLabel(status) {
    return status.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Detail({ label, value }) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
            <p className="mt-1 text-sm font-medium text-gray-950">{value || 'Not provided'}</p>
        </div>
    );
}

export default function Show({ shipment }) {
    const canCancel = ['booked', 'picked'].includes(shipment.status);

    const sync = () => {
        router.post(route('shipments.sync', shipment.id), {}, { preserveScroll: true });
    };

    const cancel = () => {
        router.post(route('shipments.cancel', shipment.id), {}, { preserveScroll: true });
    };

    return (
        <SellerLayout
            header={
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <Link href={route('bookings.index')} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900">
                            <ArrowLeft className="h-4 w-4" />
                            Back to bookings
                        </Link>
                        <h2 className="mt-2 text-xl font-semibold leading-tight text-gray-950">{shipment.trackingNumber}</h2>
                    </div>
                    <span className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${statusClasses[shipment.status] ?? 'bg-gray-50 text-gray-700 ring-gray-200'}`}>
                        {statusLabel(shipment.status)}
                    </span>
                </div>
            }
        >
            <Head title={`Shipment ${shipment.trackingNumber}`} />

            <div className="bg-gray-50 py-8">
                <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
                    <main className="space-y-5">
                        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-500">Courier booking</p>
                                    <h1 className="mt-1 text-2xl font-bold text-gray-950">{shipment.courier}</h1>
                                    <p className="mt-1 text-sm text-gray-500">{shipment.courierCode} AWB: {shipment.externalAwb || 'Pending'}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={sync} className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                                        <RefreshCw className="h-4 w-4" />
                                        Sync
                                    </button>
                                    {shipment.labelUrl && (
                                        <a href={shipment.labelUrl} target="_blank" className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                                            <Printer className="h-4 w-4" />
                                            Label
                                        </a>
                                    )}
                                    <Link href={shipment.publicTrackingUrl} className="inline-flex items-center gap-2 rounded-md bg-gray-950 px-3 py-2 text-sm font-semibold text-white">
                                        <ExternalLink className="h-4 w-4" />
                                        Buyer link
                                    </Link>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
                                <Detail label="Booked" value={shipment.bookedAt} />
                                <Detail label="Last synced" value={shipment.apiSyncedAt} />
                                <Detail label="Weight" value={`${shipment.weightGrams} g`} />
                                <Detail label="Parcel" value={shipment.parcelType} />
                            </div>
                        </section>

                        {shipment.status === 'returned' && (
                            <section className="rounded-lg border border-emerald-200 bg-white p-5 shadow-sm">
                                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex items-start gap-2">
                                        <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-700" />
                                        <div>
                                            <h3 className="font-semibold text-gray-950">Return proof</h3>
                                            <p className="mt-1 text-sm text-gray-500">Courier evidence that delivery was attempted before the parcel was returned.</p>
                                        </div>
                                    </div>
                                    <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ${shipment.returnProof.status === 'verified' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-amber-200'}`}>
                                        {shipment.returnProof.status}
                                    </span>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <Detail label="Attempts" value={shipment.returnProof.attempts} />
                                    <Detail label="Proof strength" value={`${shipment.returnProof.proofScore}%`} />
                                    <Detail label="Last attempt" value={shipment.returnProof.lastAttemptAt} />
                                    <Detail label="Verified" value={shipment.returnProof.verifiedAt} />
                                    <Detail label="Courier ref" value={shipment.returnProof.courierReference} />
                                </div>

                                <div className="mt-5 rounded-md bg-emerald-50 p-4 text-sm leading-6 text-emerald-900 ring-1 ring-emerald-100">
                                    <span className="font-semibold">Evidence summary: </span>{shipment.returnProof.summary}
                                </div>

                                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                                    <Detail label="Buyer response" value={shipment.returnProof.buyerResponse || shipment.returnReason} />
                                    <Detail label="Rider statement" value={shipment.returnProof.riderStatement} />
                                    <Detail label="Rider" value={[shipment.returnProof.riderName, shipment.returnProof.riderPhone].filter(Boolean).join(' | ')} />
                                    <Detail label="Attempt location" value={shipment.returnProof.geoLocation} />
                                </div>

                                <div className="mt-5 flex flex-wrap gap-2">
                                    {shipment.returnProof.callRecordingUrl && (
                                        <a href={shipment.returnProof.callRecordingUrl} target="_blank" className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                                            <PhoneCall className="h-4 w-4" />
                                            Call recording
                                        </a>
                                    )}
                                    {shipment.returnProof.photoUrl && (
                                        <a href={shipment.returnProof.photoUrl} target="_blank" className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                                            <Camera className="h-4 w-4" />
                                            Attempt photo
                                        </a>
                                    )}
                                </div>
                            </section>
                        )}

                        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="mb-5 flex items-center gap-2">
                                <PackageCheck className="h-5 w-5 text-cyan-700" />
                                <h3 className="font-semibold text-gray-950">Tracking timeline</h3>
                            </div>
                            <div className="space-y-1">
                                {shipment.events.map((event, index) => (
                                    <div key={`${event.status}-${event.occurredAt}`} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <span className="grid h-8 w-8 place-items-center rounded-full bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200">
                                                <CheckCircle2 className="h-4 w-4" />
                                            </span>
                                            {index < shipment.events.length - 1 && <span className="h-full w-px bg-gray-200" />}
                                        </div>
                                        <div className="pb-6">
                                            <p className="font-semibold text-gray-950">{statusLabel(event.status)}</p>
                                            <p className="mt-1 text-sm text-gray-500">{event.location || 'Courier network'} | {event.occurredAt}</p>
                                            <p className="mt-2 text-sm text-gray-700">{event.remarks}</p>
                                            {event.riderName && <p className="mt-1 text-xs text-gray-500">{event.riderName} | {event.riderPhone}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </main>

                    <aside className="space-y-5">
                        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <Truck className="h-5 w-5 text-cyan-700" />
                                <h3 className="font-semibold text-gray-950">Receiver</h3>
                            </div>
                            <div className="space-y-4">
                                <Detail label="Name" value={shipment.receiver} />
                                <Detail label="Phone" value={shipment.phone} />
                                <Detail label="City" value={`${shipment.city}${shipment.area ? `, ${shipment.area}` : ''}`} />
                                <Detail label="Address" value={shipment.address} />
                                <Detail label="Instructions" value={shipment.specialInstructions} />
                            </div>
                        </section>

                        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <h3 className="font-semibold text-gray-950">Financials</h3>
                            <div className="mt-4 space-y-3 text-sm">
                                <div className="flex justify-between"><span className="text-gray-500">COD amount</span><span className="font-semibold text-gray-950">{money(shipment.codAmount)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className="font-semibold text-gray-950">{money(shipment.shippingCharge)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Platform fee</span><span className="font-semibold text-gray-950">{money(shipment.ourFee)}</span></div>
                            </div>
                        </section>

                        {canCancel && (
                            <section className="rounded-lg border border-rose-200 bg-rose-50 p-5">
                                <h3 className="font-semibold text-rose-950">Cancel booking</h3>
                                <p className="mt-2 text-sm text-rose-700">Cancellation is available before the shipment moves deep into transit.</p>
                                <button onClick={cancel} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-rose-700 px-3 py-2 text-sm font-semibold text-white">
                                    <RotateCcw className="h-4 w-4" />
                                    Cancel shipment
                                </button>
                            </section>
                        )}
                    </aside>
                </div>
            </div>
        </SellerLayout>
    );
}
