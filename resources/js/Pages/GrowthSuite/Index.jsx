import SellerLayout from '@/Layouts/SellerLayout';
import { Head } from '@inertiajs/react';
import { Banknote, Barcode, CheckCircle2, Copy, CreditCard, FileCheck2, Link2, MessageSquareText, Plug, Rocket, ShieldCheck, Sparkles, Store, TrendingUp, Zap } from 'lucide-react';

function money(paisa) {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        maximumFractionDigits: 0,
    }).format((paisa ?? 0) / 100);
}

const statusClass = {
    Ready: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    Active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    Eligible: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    'Sandbox ready': 'bg-blue-50 text-blue-700 ring-blue-200',
    'Ready to configure': 'bg-cyan-50 text-cyan-700 ring-cyan-200',
    Planned: 'bg-amber-50 text-amber-700 ring-amber-200',
    'Setup needed': 'bg-rose-50 text-rose-700 ring-rose-200',
};

function Metric({ label, value, icon: Icon }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-gray-500">{label}</p>
                    <p className="mt-2 text-2xl font-bold text-gray-950">{value}</p>
                </div>
                <div className="rounded-md bg-gray-950 p-2 text-white">
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}

function ModuleCard({ module, icon: Icon }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="rounded-md bg-gray-50 p-2 text-gray-700 ring-1 ring-gray-100">
                    <Icon className="h-5 w-5" />
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${statusClass[module.status] ?? 'bg-gray-50 text-gray-700 ring-gray-200'}`}>
                    {module.status}
                </span>
            </div>
            <h3 className="mt-4 text-base font-semibold text-gray-950">{module.name}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">{module.description}</p>
            <p className="mt-4 text-xs font-bold uppercase text-cyan-700">{module.impact}</p>
        </div>
    );
}

function Section({ title, caption, icon: Icon, children }) {
    return (
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                    <h2 className="text-base font-semibold text-gray-950">{title}</h2>
                    <p className="mt-1 text-sm text-gray-500">{caption}</p>
                </div>
                <Icon className="h-5 w-5 text-gray-400" />
            </div>
            {children}
        </section>
    );
}

function Readiness({ readiness }) {
    const rows = [
        ['KYC verified', readiness.kyc],
        ['Bank or wallet ready', readiness.bank],
        ['Inventory added', readiness.inventory],
        ['Orders created', readiness.orders],
        ['Shipments active', readiness.shipments],
    ];

    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {rows.map(([label, done]) => (
                <div key={label} className={`rounded-md border p-3 ${done ? 'border-emerald-100 bg-emerald-50' : 'border-amber-100 bg-amber-50'}`}>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className={`h-4 w-4 ${done ? 'text-emerald-600' : 'text-amber-600'}`} />
                        <p className="text-sm font-semibold text-gray-950">{label}</p>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{done ? 'Complete' : 'Needs setup'}</p>
                </div>
            ))}
        </div>
    );
}

function IntegrationGrid({ rows }) {
    return (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((row) => (
                <div key={row.name} className="rounded-md border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-gray-950">{row.name}</p>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${statusClass[row.status] ?? 'bg-gray-50 text-gray-700 ring-gray-200'}`}>{row.status}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-gray-600">{row.description}</p>
                </div>
            ))}
        </div>
    );
}

function MessageTemplates({ rows }) {
    const copy = (text) => navigator.clipboard?.writeText(text);

    return (
        <div className="grid gap-3 lg:grid-cols-3">
            {rows.map((row) => (
                <div key={row.title} className="rounded-md border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-gray-950">{row.title}</p>
                        <button type="button" onClick={() => copy(row.text)} className="rounded-md border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-100" title="Copy">
                            <Copy className="h-4 w-4" />
                        </button>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-gray-700">{row.text}</p>
                </div>
            ))}
        </div>
    );
}

export default function Index({ readiness, metrics, modules, integrations, automations, templates }) {
    const moduleIcons = [Banknote, CreditCard, MessageSquareText, ShieldCheck, FileCheck2, Barcode];

    return (
        <SellerLayout header={<div><h2 className="text-xl font-semibold text-gray-950">Growth Suite</h2><p className="text-sm text-gray-500">Advanced seller features that make Fast Couriers harder to copy.</p></div>}>
            <Head title="Growth Suite" />

            <div className="bg-slate-50 py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="grid gap-5 lg:grid-cols-[1fr_320px] lg:items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold uppercase text-cyan-800 ring-1 ring-cyan-100">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Competitive edge
                                </div>
                                <h1 className="mt-4 max-w-3xl text-3xl font-bold text-gray-950">Cashflow, automation, proof, and integrations in one seller stack.</h1>
                                <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
                                    Competitors sell courier booking. Fast Couriers should sell lower returns, faster COD, verified proof, marketplace sync, and smarter operations.
                                </p>
                            </div>
                            <div className="rounded-lg bg-gray-950 p-5 text-white">
                                <div className="flex items-center gap-3">
                                    <Rocket className="h-6 w-6 text-cyan-300" />
                                    <div>
                                        <p className="font-semibold">Market position</p>
                                        <p className="text-xs text-gray-300">Courier aggregator + seller operating system</p>
                                    </div>
                                </div>
                                <p className="mt-4 text-sm leading-6 text-gray-300">Use this page as the product roadmap and sales story for serious ecommerce sellers.</p>
                            </div>
                        </div>
                    </section>

                    <Readiness readiness={readiness} />

                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        <Metric label="Delivered COD" value={money(metrics.deliveredCod)} icon={Banknote} />
                        <Metric label="Return rate" value={`${metrics.returnRate}%`} icon={ShieldCheck} />
                        <Metric label="Pending orders" value={metrics.pendingOrders} icon={Store} />
                        <Metric label="Low stock SKUs" value={metrics.lowStockSkus} icon={TrendingUp} />
                        <Metric label="Unpaid invoices" value={money(metrics.unpaidInvoices)} icon={FileCheck2} />
                    </section>

                    <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                        {modules.map((module, index) => (
                            <ModuleCard key={module.name} module={module} icon={moduleIcons[index] ?? Rocket} />
                        ))}
                    </section>

                    <Section title="Platform Integrations" caption="The external connections sellers expect before switching from manual operations." icon={Plug}>
                        <IntegrationGrid rows={integrations} />
                    </Section>

                    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                        <Section title="Automation Engine" caption="Rules and AI workflows that reduce daily manual work." icon={Zap}>
                            <div className="space-y-3">
                                {automations.map((automation) => (
                                    <div key={automation} className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                        <p className="text-sm leading-6 text-gray-700">{automation}</p>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        <Section title="WhatsApp Templates" caption="Ready customer messages for confirmation, tracking, and reattempt recovery." icon={MessageSquareText}>
                            <MessageTemplates rows={templates} />
                        </Section>
                    </div>

                    <section className="rounded-lg border border-cyan-100 bg-cyan-50 p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                            <Link2 className="mt-1 h-5 w-5 text-cyan-700" />
                            <div>
                                <h2 className="font-semibold text-gray-950">Next implementation order</h2>
                                <p className="mt-2 text-sm leading-6 text-cyan-900">
                                    First connect WhatsApp Business and marketplace imports, then add courier allocation rules, then bank reconciliation and proof intelligence. That order gives the biggest seller-visible value fastest.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </SellerLayout>
    );
}
