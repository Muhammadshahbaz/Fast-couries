import MarketingPageHeader from '@/Components/MarketingPageHeader';
import PublicShell from '@/Components/PublicShell';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, HelpCircle, MessageSquareText } from 'lucide-react';

const groups = [
    ['Platform', [
        ['Are you one courier company?', 'No. Fast Couriers is a courier aggregation platform. Sellers can compare and use multiple courier partners from one dashboard.'],
        ['Can sellers choose any courier?', 'Yes. The platform recommends a courier, but sellers can choose from available courier rates before booking.'],
        ['Do you support real courier APIs?', 'The platform has a provider adapter layer. TCS has a production-mode scaffold and other courier adapters can be connected as credentials are approved.'],
    ]],
    ['COD and payouts', [
        ['How are COD deductions handled?', 'Bank charge, cash handling, and COD deduction are calculated at payout invoice level, not per parcel.'],
        ['Can we use a bank-ready line system?', 'Yes. The platform already supports bank-neutral payout status, export batches, references, and failure reasons while the final bank partner is undecided.'],
    ]],
    ['Tracking and returns', [
        ['Is tracking public?', 'Yes. Buyers can track by Fast Couriers tracking number or courier AWB from the public tracking page.'],
        ['Can return proof be shown?', 'Yes. Return proof can include rider statement, attempts, buyer response, call recording, photo URL, location proof, and verification time.'],
    ]],
];

export default function Faq() {
    return (
        <PublicShell>
            <Head title="FAQ | Fast Couriers" />
            <MarketingPageHeader
                eyebrow="FAQ"
                title="Questions sellers ask before switching."
                description="A clear answer is better than a sales pitch. Here are the most common questions about courier choice, COD, APIs, and proof."
            >
                <div className="rounded-lg border border-cyan-100 bg-cyan-50 p-6">
                    <MessageSquareText className="h-6 w-6 text-cyan-700" />
                    <h2 className="mt-4 text-2xl font-bold text-gray-950">Need a direct answer?</h2>
                    <p className="mt-3 leading-7 text-cyan-950">Send your courier, COD, integration, or seller onboarding question and the Lahore team will respond with next steps.</p>
                    <Link href={route('contact')} className="mt-5 inline-flex items-center gap-2 rounded-md bg-gray-950 px-5 py-3 text-sm font-bold text-white">
                        Contact us
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </MarketingPageHeader>

            <section className="bg-white py-16">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="space-y-6">
                        {groups.map(([group, faqs]) => (
                            <section key={group} className="rounded-lg border border-gray-200 bg-white shadow-sm">
                                <div className="flex items-center gap-2 border-b border-gray-100 p-5">
                                    <HelpCircle className="h-5 w-5 text-cyan-700" />
                                    <h2 className="font-bold text-gray-950">{group}</h2>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {faqs.map(([question, answer]) => (
                                        <article key={question} className="p-5">
                                            <h3 className="font-bold text-gray-950">{question}</h3>
                                            <p className="mt-2 text-sm leading-6 text-gray-600">{answer}</p>
                                        </article>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </section>
        </PublicShell>
    );
}
