import MarketingPageHeader from '@/Components/MarketingPageHeader';
import PublicShell from '@/Components/PublicShell';
import { Head } from '@inertiajs/react';
import { BadgeCheck, Banknote, CircleDollarSign, Clock3, FileCheck2, ShieldCheck, TrendingUp } from 'lucide-react';

const steps = [
    [FileCheck2, 'Clean COD invoices', 'Delivered COD shipments are grouped into payout invoices with deductions and net payable visible.'],
    [BadgeCheck, 'Verified seller profile', 'KYC, payout method, shipment history, delivery rate, and support history support eligibility review.'],
    [Clock3, 'Faster settlement review', 'Eligible sellers can request faster settlement once finance rules and bank/payment partner limits are approved.'],
    [CircleDollarSign, 'Transparent deductions', 'Collected, deducted, pending, and paid amounts remain visible to the seller.'],
];

export default function AdvanceCod() {
    return (
        <PublicShell>
            <Head title="Advance COD | Fast Couriers">
                <meta name="description" content="Advance COD readiness for verified ecommerce sellers with clear payout invoices, eligibility checks, and transparent settlement deductions." />
            </Head>

            <MarketingPageHeader
                eyebrow="Advance COD"
                title="Faster COD options for verified ecommerce sellers."
                description="Fast Couriers is designed to prepare sellers for cleaner and faster COD settlement through KYC, delivery history, invoice records, and transparent payout rules."
                primaryAction={{ label: 'Join early access list', href: route('contact') }}
            >
                <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-6">
                    <ShieldCheck className="h-6 w-6 text-emerald-700" />
                    <h2 className="mt-4 text-2xl font-bold text-gray-950">Eligibility should be earned, visible, and fair.</h2>
                    <p className="mt-3 leading-7 text-emerald-950">Advance settlement depends on verification, volume, courier performance, return rate, and payment partner rules. Sellers should always know why they qualify or what they need to improve.</p>
                </div>
            </MarketingPageHeader>

            <section className="border-y border-gray-200 bg-slate-50 py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-4 md:grid-cols-4">
                        {steps.map(([Icon, title, text]) => (
                            <article key={title} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                                <Icon className="h-6 w-6 text-cyan-700" />
                                <h2 className="mt-4 font-bold text-gray-950">{title}</h2>
                                <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-white py-16">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
                    {[
                        [Banknote, 'Bank-ready payout line', 'Exportable payout data is prepared while the final bank provider is undecided.'],
                        [TrendingUp, 'Seller growth signal', 'Reliable delivery and low returns can unlock better settlement conversations.'],
                        [ShieldCheck, 'Risk control', 'Weak addresses, high COD, and return patterns can pause advance eligibility.'],
                    ].map(([Icon, title, text]) => (
                        <div key={title} className="rounded-lg border border-gray-200 bg-slate-50 p-5">
                            <Icon className="h-5 w-5 text-cyan-700" />
                            <h3 className="mt-4 font-bold text-gray-950">{title}</h3>
                            <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
                        </div>
                    ))}
                </div>
            </section>
        </PublicShell>
    );
}
