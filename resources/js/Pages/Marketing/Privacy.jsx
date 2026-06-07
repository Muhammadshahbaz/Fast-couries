import MarketingPageHeader from '@/Components/MarketingPageHeader';
import PublicShell from '@/Components/PublicShell';
import { Head } from '@inertiajs/react';
import { Database, Lock, ShieldCheck, UserCheck } from 'lucide-react';

const sections = [
    [Database, 'Data we collect', 'Seller profile, KYC status, shipment addresses, receiver phone numbers, courier AWBs, tracking events, return proof, support tickets, and payout details.'],
    [UserCheck, 'How we use data', 'We use data to operate bookings, tracking, courier integrations, COD settlement, seller support, fraud/risk checks, and admin operations.'],
    [Lock, 'Security', 'Access is role based. Admin and seller screens are separated, and sensitive operational data is available only to authorized users.'],
    [ShieldCheck, 'Data responsibility', 'Shipment and payout records should remain accurate, auditable, and available for dispute resolution and operational support.'],
];

export default function Privacy() {
    return (
        <PublicShell>
            <Head title="Privacy Policy | Fast Couriers" />
            <MarketingPageHeader
                eyebrow="Privacy Policy"
                title="How Fast Couriers handles seller, shipment, and payout data."
                description="Fast Couriers collects information only to operate logistics, tracking, support, COD settlement, risk checks, and courier workflows."
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
