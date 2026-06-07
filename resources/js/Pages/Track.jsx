import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, PackageSearch, Search } from 'lucide-react';
import { useState } from 'react';

function statusLabel(status) {
    return status.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function Track({ query, shipment }) {
    const [tracking, setTracking] = useState(query ?? '');

    const submit = (event) => {
        event.preventDefault();
        router.get(route('track'), { tracking }, { preserveState: true });
    };

    return (
        <>
            <Head title="Track Shipment" />

            <main className="min-h-screen bg-slate-50 text-gray-950">
                <nav className="border-b border-gray-200 bg-white">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                        <Link href="/" className="flex items-center gap-2">
                            <ApplicationLogo />
                        </Link>
                        <div className="flex gap-2">
                            <Link href={route('login')} className="rounded-md px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100">Login</Link>
                            <Link href={route('register')} className="rounded-md bg-gray-950 px-4 py-2 text-sm font-semibold text-white">Register</Link>
                        </div>
                    </div>
                </nav>

                <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 text-center">
                            <PackageSearch className="mx-auto h-10 w-10 text-cyan-700" />
                            <h1 className="mt-3 text-3xl font-bold">Track your shipment</h1>
                            <p className="mt-2 text-gray-500">Enter a Fast Couriers tracking number or courier AWB.</p>
                        </div>

                        <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
                            <label className="flex flex-1 items-center gap-2 rounded-md border border-gray-300 px-4 py-3">
                                <Search className="h-4 w-4 text-gray-400" />
                                <input className="w-full border-0 p-0 text-sm focus:ring-0" value={tracking} onChange={(event) => setTracking(event.target.value)} placeholder="FC260605ABC123" />
                            </label>
                            <button className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-950 px-5 py-3 text-sm font-semibold text-white">
                                Track
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </form>
                    </div>

                    {query && !shipment && (
                        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm font-medium text-amber-800">
                            No shipment found for {query}.
                        </div>
                    )}

                    {shipment && (
                        <section className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-500">Tracking number</p>
                                    <h2 className="mt-1 text-2xl font-bold">{shipment.trackingNumber}</h2>
                                    <p className="mt-1 text-sm text-gray-500">{shipment.courier} | {shipment.city}</p>
                                </div>
                                <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
                                    {statusLabel(shipment.status)}
                                </span>
                            </div>

                            <div className="mt-6 space-y-5">
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
                                            <p className="mt-1 text-sm text-gray-500">{event.location} | {event.occurredAt}</p>
                                            <p className="mt-2 text-sm text-gray-700">{event.remarks}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </section>
            </main>
        </>
    );
}
