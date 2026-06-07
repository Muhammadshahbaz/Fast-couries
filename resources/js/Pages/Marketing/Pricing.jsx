import MarketingPageHeader from '@/Components/MarketingPageHeader';
import PublicShell from '@/Components/PublicShell';
import { Head } from '@inertiajs/react';
import { Banknote, CheckCircle2, CircleDollarSign, FileText, Scale, Truck } from 'lucide-react';

const rows = [
    ['Leopards / Trax / M&P / BlueEx', '0-0.5 kg', 'Rs.248.99', '0-1 kg: Rs.281.88', 'Extra kg: Rs.156.60'],
    ['TCS', '0-0.5 kg', 'Rs.280', '0.6-1 kg: Rs.300', 'Extra kg: Rs.300'],
    ['Overland', '0-5 kg', 'Rs.450', 'Best for heavier parcels', 'Extra kg: Rs.100'],
];

const charges = [
    [Banknote, 'Bank charge', 'Rs.85 per payout invoice'],
    [CircleDollarSign, 'Cash handling', '1% deducted from invoice'],
    [FileText, 'COD deduction', '4% deducted from collected COD'],
];

export default function Pricing() {
    return (
        <PublicShell>
            <Head title="Pricing | Fast Couriers">
                <meta name="description" content="Fast Couriers pricing with courier rate slabs, COD deductions, bank charges, and payout invoice rules for ecommerce sellers." />
            </Head>

            <MarketingPageHeader
                eyebrow="Pricing"
                title="Transparent courier rates before dispatch."
                description="Sellers compare courier charges before booking. COD deductions are shown clearly at payout invoice level so the team knows gross COD, deductions, and net payable."
                primaryAction={{ label: 'Start booking', href: route('register') }}
                secondaryAction={{ label: 'View COD policy', href: route('cod-policy') }}
            >
                <div className="grid gap-3 sm:grid-cols-3">
                    {charges.map(([Icon, title, text]) => (
                        <div key={title} className="rounded-lg border border-cyan-100 bg-cyan-50 p-5">
                            <Icon className="h-5 w-5 text-cyan-700" />
                            <p className="mt-4 font-bold text-gray-950">{title}</p>
                            <p className="mt-2 text-sm leading-6 text-cyan-950">{text}</p>
                        </div>
                    ))}
                </div>
            </MarketingPageHeader>

            <section className="border-y border-gray-200 bg-slate-50 py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-sm font-bold uppercase text-cyan-700">Rate card</p>
                            <h2 className="mt-2 text-3xl font-bold text-gray-950">Courier slabs used for comparison.</h2>
                        </div>
                        <p className="max-w-xl text-sm leading-6 text-gray-600">Rates can change when final courier contracts are signed. The platform is built to manage city-wise and courier-wise rate updates.</p>
                    </div>
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-950 text-xs uppercase text-gray-200">
                                <tr><th className="px-5 py-4">Courier</th><th className="px-5 py-4">Base slab</th><th className="px-5 py-4">Base rate</th><th className="px-5 py-4">Next slab</th><th className="px-5 py-4">Extra weight</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {rows.map((row) => (
                                    <tr key={row[0]} className="hover:bg-gray-50">
                                        <td className="px-5 py-4 font-bold text-gray-950">{row[0]}</td>
                                        {row.slice(1).map((cell) => <td key={cell} className="px-5 py-4 text-gray-600">{cell}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section className="bg-white py-16">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
                    {[
                        [Truck, 'Compare before booking', 'Sellers can select courier by rate, delivery promise, city, and reliability.'],
                        [Scale, 'Weight-based logic', 'Rate slabs support 0.5kg, 1kg, 5kg, and extra-weight calculations.'],
                        [CheckCircle2, 'Invoice clarity', 'Bank charge and COD deductions are shown at invoice level instead of hidden in daily payments.'],
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
