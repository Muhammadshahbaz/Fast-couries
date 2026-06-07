import MarketingPageHeader from '@/Components/MarketingPageHeader';
import PublicShell from '@/Components/PublicShell';
import { Head } from '@inertiajs/react';
import { Camera, ClipboardCheck, FileWarning, PhoneCall, ShieldCheck, Truck } from 'lucide-react';

const items = [
    [ShieldCheck, 'Optional parcel protection', 'Define protection rules for eligible shipments, declared value, and courier-specific liability limits.'],
    [FileWarning, 'Damage and lost claims', 'Keep claim status, shipment history, courier AWB, proof files, and seller communication in one case.'],
    [ClipboardCheck, 'Proof review', 'Attach POD review, manual verification notes, and courier evidence to shipment timelines.'],
    [Truck, 'Courier accountability', 'Use courier-level issue history to guide recommendations and operational escalation.'],
];

const proof = [
    [PhoneCall, 'Call recording or transcript'],
    [Camera, 'Attempt photo or parcel photo'],
    [Truck, 'Courier AWB and status timeline'],
    [ClipboardCheck, 'Rider remarks and buyer response'],
];

export default function Claims() {
    return (
        <PublicShell>
            <Head title="Claims and Insurance | Fast Couriers" />
            <MarketingPageHeader
                eyebrow="Claims and insurance"
                title="Confidence when parcels are lost, damaged, or disputed."
                description="Fast Couriers makes claims visible instead of hiding them in calls and chat threads. Evidence, courier references, seller communication, and compensation status should stay attached to the shipment."
                primaryAction={{ label: 'Ask about claims setup', href: route('contact') }}
            >
                <div className="grid gap-3 sm:grid-cols-2">
                    {proof.map(([Icon, label]) => (
                        <div key={label} className="rounded-lg border border-cyan-100 bg-cyan-50 p-5">
                            <Icon className="h-5 w-5 text-cyan-700" />
                            <p className="mt-4 font-bold text-gray-950">{label}</p>
                        </div>
                    ))}
                </div>
            </MarketingPageHeader>

            <section className="border-y border-gray-200 bg-slate-50 py-16">
                <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
                    {items.map(([Icon, title, text]) => (
                        <article key={title} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <Icon className="h-6 w-6 text-cyan-700" />
                            <h2 className="mt-4 font-bold text-gray-950">{title}</h2>
                            <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
                        </article>
                    ))}
                </div>
            </section>
        </PublicShell>
    );
}
