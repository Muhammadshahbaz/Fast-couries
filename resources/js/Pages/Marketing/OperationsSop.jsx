import MarketingPageHeader from '@/Components/MarketingPageHeader';
import PublicShell from '@/Components/PublicShell';
import { Head } from '@inertiajs/react';
import { AlertTriangle, BadgeCheck, FileText, Headphones, RefreshCcw, WalletCards } from 'lucide-react';

const playbooks = [
    [
        BadgeCheck,
        'Seller approval',
        'Review KYC, business category, pickup city, expected monthly parcels, COD risk, and support history before enabling live booking.',
        ['Approve verified sellers within business hours', 'Keep unverified accounts in review mode', 'Escalate high-risk COD categories to admin'],
    ],
    [
        AlertTriangle,
        'Courier API failure',
        'If live booking, tracking, or label generation fails, keep the shipment visible and move the provider into degraded mode until health checks recover.',
        ['Retry through the adapter health check', 'Offer another courier where rates allow', 'Log provider response and AWB state'],
    ],
    [
        RefreshCcw,
        'Returned parcel proof',
        'Every return should show attempt count, rider remarks, buyer response, timestamp, location proof, and any available call recording or photo proof.',
        ['Mark proof as verified only after evidence is stored', 'Flag weak proof for support review', 'Let sellers open a claim from the shipment record'],
    ],
    [
        WalletCards,
        'Payout dispute',
        'Finance should compare delivered shipments, invoice deductions, bank charge, COD handling, and payment reference before closing a dispute.',
        ['Keep each dispute linked to the payout invoice', 'Record adjustment amount and reason', 'Notify the seller when payment is marked paid'],
    ],
    [
        FileText,
        'Damage or loss claim',
        'Claims need shipment value, parcel photos, courier remarks, seller invoice, delivery status, and escalation owner before submission.',
        ['Do not submit incomplete claims', 'Track courier reference number', 'Keep compensation status visible to seller and admin'],
    ],
    [
        Headphones,
        'Support escalation',
        'Support tickets should be linked to shipment, seller, buyer city, courier, and payout record so the team does not resolve issues from chat history alone.',
        ['Prioritize stuck COD and return proof tickets', 'Use saved response templates', 'Escalate repeated courier delays to operations'],
    ],
];

export default function OperationsSop() {
    return (
        <PublicShell>
            <Head title="Operations SOP | Fast Couriers">
                <meta name="description" content="Fast Couriers operations SOP for seller approval, courier API failures, returned parcel proof, payout disputes, claims, and support escalation." />
            </Head>

            <MarketingPageHeader
                eyebrow="Operations SOP"
                title="The workflows behind a reliable courier platform."
                description="Multi-courier shipping needs clear rules for approvals, failed APIs, returned parcels, payout disputes, and claims. These playbooks keep seller support consistent as order volume grows."
            />

            <article className="bg-slate-50 py-16">
                <section className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
                    {playbooks.map(([Icon, title, summary, steps]) => (
                        <div key={title} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <span className="grid h-10 w-10 place-items-center rounded-lg bg-cyan-50 text-cyan-700">
                                    <Icon className="h-5 w-5" />
                                </span>
                                <h2 className="text-lg font-bold text-gray-950">{title}</h2>
                            </div>
                            <p className="mt-4 text-sm leading-6 text-gray-600">{summary}</p>
                            <div className="mt-5 space-y-3">
                                {steps.map((step) => (
                                    <p key={step} className="rounded-md bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">{step}</p>
                                ))}
                            </div>
                        </div>
                    ))}
                </section>
            </article>
        </PublicShell>
    );
}
