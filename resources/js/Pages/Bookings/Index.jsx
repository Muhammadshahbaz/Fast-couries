import SellerLayout from '@/Layouts/SellerLayout';
import { Head, Link } from '@inertiajs/react';
import { PackagePlus, Printer, Search, Share2 } from 'lucide-react';

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

export default function Index({ shipments }) {
    return (
        <SellerLayout
            header={
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-semibold leading-tight text-gray-950">My Bookings</h2>
                    <p className="text-sm text-gray-500">Track shipments, compare courier outcomes, and share buyer tracking links.</p>
                </div>
            }
        >
            <Head title="My Bookings" />

            <div className="bg-gray-50 py-8">
                <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                        <label className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 lg:w-96">
                            <Search className="h-4 w-4 text-gray-400" />
                            <input className="w-full border-0 p-0 text-sm focus:ring-0" placeholder="Search tracking, receiver, phone" />
                        </label>
                        <Link href={route('bookings.create')} className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-950 px-4 py-2 text-sm font-semibold text-white">
                            <PackagePlus className="h-4 w-4" />
                            New booking
                        </Link>
                    </div>

                    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                    <tr>
                                        <th className="px-5 py-3">Tracking</th>
                                        <th className="px-5 py-3">Receiver</th>
                                        <th className="px-5 py-3">Courier</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3">COD</th>
                                        <th className="px-5 py-3">Shipping</th>
                                        <th className="px-5 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {shipments.data.map((shipment) => (
                                        <tr key={shipment.trackingNumber}>
                                            <td className="px-5 py-4">
                                                <Link href={route('shipments.show', shipment.id)} className="block font-semibold text-gray-950 hover:text-cyan-700">{shipment.trackingNumber}</Link>
                                                <span className="text-xs text-gray-500">{shipment.bookedAt}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="block font-medium text-gray-900">{shipment.receiver}</span>
                                                <span className="text-xs text-gray-500">{shipment.phone} | {shipment.city}</span>
                                            </td>
                                            <td className="px-5 py-4 text-gray-700">{shipment.courier}</td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClasses[shipment.status] ?? 'bg-gray-50 text-gray-700 ring-gray-200'}`}>
                                                    {statusLabel(shipment.status)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 font-medium text-gray-900">{money(shipment.codAmount)}</td>
                                            <td className="px-5 py-4 text-gray-700">{money(shipment.shippingCharge)}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Link href={route('track', { tracking: shipment.trackingNumber })} className="rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-50" title="Share tracking">
                                                        <Share2 className="h-4 w-4" />
                                                    </Link>
                                                    <Link href={route('shipments.show', shipment.id)} className="rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                                                        View
                                                    </Link>
                                                    {shipment.labelUrl && <a href={shipment.labelUrl} target="_blank" className="rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-50" title="Print label">
                                                        <Printer className="h-4 w-4" />
                                                    </a>}
                                                </div>
                                            </td>
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
