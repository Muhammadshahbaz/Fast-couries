import MarketingPageHeader from '@/Components/MarketingPageHeader';
import PublicShell from '@/Components/PublicShell';
import { Head } from '@inertiajs/react';
import { Banknote, FileText, Scale, Truck } from 'lucide-react';

const sections = [
    [Truck, 'Courier services', 'Delivery timelines, serviceability, claims, AWB updates, return reasons, and proof availability depend on courier partners and destination coverage.'],
    [Banknote, 'COD settlement', 'Bank charges, cash handling, and COD deductions are applied at payout invoice level. Payout status depends on verification, invoice approval, and bank/payment processing.'],
    [FileText, 'Seller responsibility', 'Sellers must provide accurate customer details, product information, parcel weight, COD amount, pickup details, and required documents.'],
    [Scale, 'Claims and disputes', 'Claims require courier evidence, shipment history, proof files, seller invoice details, and review by operations or finance where applicable.'],
];

export default function Terms() {
    return (
        <PublicShell>
            <Head title="Terms of Service | Fast Couriers" />
            <MarketingPageHeader
                eyebrow="Terms of Service"
                title="Terms for using Fast Couriers."
                description="Fast Couriers provides courier aggregation, shipment booking, tracking, returns support, COD payout management, and seller operations tools for registered sellers."
            />

            <article className="bg-slate-50 py-16">
                <section className="mx-auto grid max-w-6xl gap-4 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
                    {sections.map(([Icon, title, text]) => (
                        <div key={title} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <Icon className="h-5 w-5 text-cyan-700" />
                            <h2 className="mt-4 text-lg font-bold text-gray-950">{title}</h2>
                            <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
                        </div>
                    ))}
                </section>
            </article>
        </PublicShell>
    );
}
