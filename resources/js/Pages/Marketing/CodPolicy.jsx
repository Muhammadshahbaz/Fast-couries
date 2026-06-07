import MarketingPageHeader from '@/Components/MarketingPageHeader';
import PublicShell from '@/Components/PublicShell';
import { Head } from '@inertiajs/react';
import { Banknote, CircleDollarSign, FileCheck2, ReceiptText, ShieldCheck, WalletCards } from 'lucide-react';

const items = [
    [CircleDollarSign, 'Invoice-level deductions', 'Bank charges, cash handling, and COD deductions are shown on payout invoices instead of being hidden parcel by parcel.'],
    [FileCheck2, 'Settlement records', 'Delivered COD parcels move into invoice-ready batches with gross COD, deductions, net payable, and payment status.'],
    [Banknote, 'Payout method review', 'Bank or wallet details are reviewed with seller KYC before COD settlement is processed.'],
    [ShieldCheck, 'Dispute support', 'Return proof, delivery events, and support tickets stay linked to shipments for COD dispute handling.'],
];

export default function CodPolicy() {
    return (
        <PublicShell>
            <Head title="COD Policy | Fast Couriers">
                <meta name="description" content="Fast Couriers COD policy for seller payout invoices, deductions, bank charges, settlement status, and dispute records." />
            </Head>

            <MarketingPageHeader
                eyebrow="COD policy"
                title="Clear COD settlement rules for sellers."
                description="Fast Couriers keeps COD collection, deductions, payout invoices, and payment status visible so sellers understand exactly what is collected and payable."
                primaryAction={{ label: 'View rate card', href: route('pricing') }}
            >
                <div className="rounded-lg border border-amber-100 bg-amber-50 p-6">
                    <ReceiptText className="h-6 w-6 text-amber-700" />
                    <h2 className="mt-4 text-2xl font-bold text-gray-950">Current sample deduction model</h2>
                    <div className="mt-5 grid gap-3">
                        {['Bank charge: Rs.85 per payout invoice', 'Cash handling: 1% of invoice COD', 'COD deduction: 4% of collected COD'].map((row) => (
                            <p key={row} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-amber-950 ring-1 ring-amber-100">{row}</p>
                        ))}
                    </div>
                    <p className="mt-4 text-sm leading-6 text-amber-900">Final production deductions may change when courier and banking contracts are finalized.</p>
                </div>
            </MarketingPageHeader>

            <section className="border-y border-gray-200 bg-slate-50 py-16">
                <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
                    {items.map(([Icon, title, text]) => (
                        <div key={title} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <Icon className="h-5 w-5 text-cyan-700" />
                            <h2 className="mt-4 text-lg font-bold text-gray-950">{title}</h2>
                            <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-white py-16">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
                    {[
                        [WalletCards, 'Generated', 'Invoice created from delivered COD shipments and waiting for review.'],
                        [Banknote, 'Bank ready', 'Invoice approved for bank-line export or payment processing.'],
                        [ShieldCheck, 'Paid or disputed', 'Payment reference, failure reason, or dispute support stays visible.'],
                    ].map(([Icon, title, text]) => (
                        <article key={title} className="rounded-lg border border-gray-200 bg-slate-50 p-5">
                            <Icon className="h-5 w-5 text-cyan-700" />
                            <h3 className="mt-4 font-bold text-gray-950">{title}</h3>
                            <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
                        </article>
                    ))}
                </div>
            </section>
        </PublicShell>
    );
}
