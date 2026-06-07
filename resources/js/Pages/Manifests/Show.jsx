import SellerLayout from '@/Layouts/SellerLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText, Printer, Tags, Truck } from 'lucide-react';

function money(paisa) {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        maximumFractionDigits: 0,
    }).format((paisa ?? 0) / 100);
}

export default function Show({ manifest, shipments }) {
    const printPage = () => window.print();

    return (
        <SellerLayout
            header={
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <Link href={route('orders.index')} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900">
                            <ArrowLeft className="h-4 w-4" />
                            Back to orders
                        </Link>
                        <h2 className="mt-2 text-xl font-semibold text-gray-950">{manifest.manifestNumber}</h2>
                    </div>
                    <button onClick={printPage} className="inline-flex items-center gap-2 rounded-md bg-gray-950 px-4 py-2 text-sm font-semibold text-white print:hidden">
                        <Printer className="h-4 w-4" />
                        Print manifest
                    </button>
                </div>
            }
        >
            <Head title={`Manifest ${manifest.manifestNumber}`} />

            <div className="bg-gray-50 py-8 print:bg-white print:py-0">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 print:px-0">
                    <section className="rounded-lg bg-gray-950 p-6 text-white shadow-sm print:border print:border-gray-300 print:bg-white print:text-gray-950">
                        <p className="text-sm font-semibold uppercase text-cyan-300 print:text-gray-500">Shipping manifest</p>
                        <h1 className="mt-2 text-3xl font-bold">{manifest.manifestNumber}</h1>
                        <p className="mt-2 text-sm text-gray-300 print:text-gray-600">Created {manifest.createdAt}</p>
                        <div className="mt-6 grid gap-4 sm:grid-cols-3">
                            <div><p className="text-sm text-gray-300 print:text-gray-500">Shipments</p><p className="text-2xl font-bold">{manifest.totalShipments}</p></div>
                            <div><p className="text-sm text-gray-300 print:text-gray-500">COD total</p><p className="text-2xl font-bold">{money(manifest.totalCod)}</p></div>
                            <div><p className="text-sm text-gray-300 print:text-gray-500">Status</p><p className="text-2xl font-bold capitalize">{manifest.status}</p></div>
                        </div>
                    </section>

                    <section className="grid gap-4 md:grid-cols-3 print:hidden">
                        <button onClick={printPage} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm">
                            <FileText className="h-4 w-4" />
                            Print handover sheet
                        </button>
                        <button onClick={printPage} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm">
                            <Tags className="h-4 w-4" />
                            Print all label links
                        </button>
                        <Link href={route('bookings.index')} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm">
                            <Truck className="h-4 w-4" />
                            View shipments
                        </Link>
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 p-5">
                            <h3 className="text-base font-semibold text-gray-950">Courier handover list</h3>
                            <p className="mt-1 text-sm text-gray-500">Use this sheet for rider pickup and internal dispatch control.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                    <tr>
                                        <th className="px-5 py-3">Tracking</th>
                                        <th className="px-5 py-3">Courier</th>
                                        <th className="px-5 py-3">Receiver</th>
                                        <th className="px-5 py-3">City</th>
                                        <th className="px-5 py-3">Weight</th>
                                        <th className="px-5 py-3">COD</th>
                                        <th className="px-5 py-3 print:hidden">Label</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {shipments.map((shipment) => (
                                        <tr key={shipment.id}>
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-gray-950">{shipment.trackingNumber}</p>
                                                <p className="text-xs text-gray-500">{shipment.externalAwb}</p>
                                            </td>
                                            <td className="px-5 py-4 text-gray-700">{shipment.courier}</td>
                                            <td className="px-5 py-4">
                                                <p className="font-medium text-gray-900">{shipment.receiver}</p>
                                                <p className="text-xs text-gray-500">{shipment.phone}</p>
                                            </td>
                                            <td className="px-5 py-4 text-gray-700">{shipment.city}</td>
                                            <td className="px-5 py-4 text-gray-700">{shipment.weightGrams}g</td>
                                            <td className="px-5 py-4 font-semibold text-gray-950">{money(shipment.codAmount)}</td>
                                            <td className="px-5 py-4 print:hidden">
                                                {shipment.labelUrl ? (
                                                    <a href={shipment.labelUrl} target="_blank" className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700">
                                                        <Printer className="h-3.5 w-3.5" />
                                                        Label
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-gray-500">Pending</span>
                                                )}
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
