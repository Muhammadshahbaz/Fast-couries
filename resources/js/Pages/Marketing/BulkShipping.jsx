import MarketingPageHeader from '@/Components/MarketingPageHeader';
import PublicShell from '@/Components/PublicShell';
import { Head } from '@inertiajs/react';
import { Barcode, Boxes, CheckCircle2, ClipboardList, FileSpreadsheet, PackageCheck, Printer, Truck, Warehouse } from 'lucide-react';

const modules = [
    [FileSpreadsheet, 'Bulk order import', 'Upload order sheets, validate customer, city, address, SKU, weight, COD, and stock before dispatch.'],
    [PackageCheck, 'Batch labels and manifests', 'Create shipments, print labels, and generate courier manifests without opening every order one by one.'],
    [Barcode, 'Scan-ready dispatch', 'Prepare barcode handover, pickup proof, warehouse scans, and missed-parcel controls as volume grows.'],
    [Warehouse, 'Fulfillment workflow', 'Support pick, pack, dispatch, return receiving, inventory movement, and team roles from one portal.'],
];

const flow = ['Import orders', 'Validate addresses and stock', 'Select courier rules', 'Print labels', 'Generate manifest', 'Track pickup and delivery'];

export default function BulkShipping() {
    return (
        <PublicShell>
            <Head title="Bulk Shipping | Fast Couriers" />
            <MarketingPageHeader
                eyebrow="Bulk shipping"
                title="High-volume sellers need batch operations, not repetitive booking forms."
                description="Fast Couriers supports simple daily booking first, then batch shipping, manifests, inventory workflows, dispatch proof, and reporting as seller volume scales."
                primaryAction={{ label: 'Start shipping', href: route('register') }}
            >
                <div className="rounded-lg border border-cyan-100 bg-cyan-50 p-6">
                    <Printer className="h-6 w-6 text-cyan-700" />
                    <h2 className="mt-4 text-2xl font-bold text-gray-950">Built for warehouse speed.</h2>
                    <p className="mt-3 leading-7 text-cyan-950">The goal is to let teams move from spreadsheet orders to courier-ready labels and manifests with fewer manual mistakes.</p>
                </div>
            </MarketingPageHeader>

            <section className="border-y border-gray-200 bg-slate-50 py-16">
                <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
                    {modules.map(([Icon, title, text]) => (
                        <article key={title} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <Icon className="h-6 w-6 text-cyan-700" />
                            <h2 className="mt-4 font-bold text-gray-950">{title}</h2>
                            <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="bg-white py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <p className="text-sm font-bold uppercase text-cyan-700">Batch workflow</p>
                    <h2 className="mt-2 text-3xl font-bold text-gray-950">A clean path from spreadsheet to courier pickup.</h2>
                    <div className="mt-8 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                        {flow.map((step, index) => (
                            <div key={step} className="rounded-lg border border-gray-200 bg-slate-50 p-4">
                                <span className="grid h-9 w-9 place-items-center rounded-full bg-gray-950 text-sm font-bold text-white">{index + 1}</span>
                                <p className="mt-4 text-sm font-bold text-gray-950">{step}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        {[
                            [ClipboardList, 'Order control', 'Skip bad rows while clean orders continue.'],
                            [Boxes, 'Inventory safety', 'Reduce stock only when parcels are shipped.'],
                            [Truck, 'Courier handover', 'Manifest-ready records support pickup proof and disputes.'],
                        ].map(([Icon, title, text]) => (
                            <article key={title} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                                <Icon className="h-5 w-5 text-cyan-700" />
                                <h3 className="mt-4 font-bold text-gray-950">{title}</h3>
                                <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </PublicShell>
    );
}
