import AdminLayout from '@/Layouts/AdminLayout';
import SellerLayout from '@/Layouts/SellerLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { AlertTriangle, Banknote, Bot, Brain, ClipboardCheck, Copy, MapPinCheck, MessageSquareText, PackageSearch, Radar, Route, ShieldCheck, Sparkles, Truck, Warehouse, Zap } from 'lucide-react';

const levelClasses = {
    Action: 'bg-rose-50 text-rose-700 ring-rose-200',
    Blocked: 'bg-rose-50 text-rose-700 ring-rose-200',
    Recommended: 'bg-amber-50 text-amber-700 ring-amber-200',
    Review: 'bg-amber-50 text-amber-700 ring-amber-200',
    Active: 'bg-blue-50 text-blue-700 ring-blue-200',
    Ready: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    Healthy: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    Clear: 'bg-gray-50 text-gray-700 ring-gray-200',
};

function Shell({ mode, children }) {
    const header = (
        <div>
            <h2 className="text-xl font-semibold text-gray-950">AI Command Center</h2>
            <p className="text-sm text-gray-500">Predict, recommend, and automate the work that usually creates returns and support tickets.</p>
        </div>
    );

    return mode === 'admin' ? (
        <AdminLayout header={header}>{children}</AdminLayout>
    ) : (
        <SellerLayout header={header}>{children}</SellerLayout>
    );
}

function StatCard({ item, icon: Icon }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-gray-500">{item.label}</p>
                    <p className="mt-2 text-2xl font-bold text-gray-950">{item.value}</p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">{item.caption}</p>
                </div>
                <div className="rounded-md bg-gray-950 p-2 text-white">
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}

function Section({ title, caption, icon: Icon, children }) {
    return (
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                    <h3 className="text-base font-semibold text-gray-950">{title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{caption}</p>
                </div>
                <Icon className="h-5 w-5 text-gray-400" />
            </div>
            {children}
        </section>
    );
}

function RiskQueue({ rows }) {
    return (
        <div className="space-y-3">
            {rows.map((row) => (
                <div key={`${row.type}-${row.reference}`} className="rounded-md border border-gray-200 bg-gray-50 p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-gray-700 ring-1 ring-gray-200">{row.type}</span>
                                <p className="font-semibold text-gray-950">{row.reference}</p>
                                {row.seller && <span className="text-xs text-gray-500">{row.seller}</span>}
                            </div>
                            <p className="mt-2 text-sm text-gray-600">{row.customer} | {row.city || 'Unknown city'}</p>
                            <p className="mt-2 text-sm leading-6 text-gray-700">{row.reason}</p>
                        </div>
                        <div className="min-w-44 rounded-md bg-white p-3 text-sm ring-1 ring-gray-200">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-600">Risk</span>
                                <span className="font-bold text-rose-700">{row.score}%</span>
                            </div>
                            <p className="mt-2 text-xs leading-5 text-gray-500">{row.action}</p>
                            {row.href && (
                                <Link href={row.href} className="mt-3 inline-flex text-xs font-bold text-gray-950 hover:text-cyan-800">
                                    Open record
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            {rows.length === 0 && <p className="rounded-md bg-gray-50 p-4 text-sm text-gray-500">No AI risk items right now.</p>}
        </div>
    );
}

function CourierCards({ rows }) {
    return (
        <div className="grid gap-3 md:grid-cols-2">
            {rows.map((row) => (
                <div key={`${row.city}-${row.courier}`} className="rounded-md border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm font-bold text-gray-950">{row.courier}</p>
                            <p className="mt-1 text-xs font-semibold uppercase text-gray-500">{row.city}</p>
                        </div>
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">{row.score}%</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-gray-600">{row.reason}</p>
                    <p className="mt-3 text-xs font-bold text-gray-500">{row.rate}</p>
                </div>
            ))}
        </div>
    );
}

function InventoryForecast({ rows }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-gray-500">
                    <tr>
                        <th className="py-2">SKU</th>
                        <th className="py-2">Stock</th>
                        <th className="py-2">Velocity</th>
                        <th className="py-2">Days left</th>
                        <th className="py-2">Signal</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {rows.map((row) => (
                        <tr key={row.sku}>
                            <td className="py-3">
                                <p className="font-semibold text-gray-950">{row.sku}</p>
                                <p className="text-xs text-gray-500">{row.name}</p>
                            </td>
                            <td className="py-3 font-semibold text-gray-800">{row.stock}</td>
                            <td className="py-3 text-gray-600">{row.dailyVelocity}/day</td>
                            <td className="py-3 text-gray-600">{row.daysLeft}</td>
                            <td className="py-3">
                                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${levelClasses[row.signal] ?? levelClasses.Clear}`}>{row.signal}</span>
                            </td>
                        </tr>
                    ))}
                    {rows.length === 0 && (
                        <tr>
                            <td colSpan="5" className="py-6 text-center text-sm text-gray-500">Inventory forecast appears after products and orders are available.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

function SignalList({ rows }) {
    return (
        <div className="space-y-3">
            {rows.map((row) => (
                <div key={row.label || row.title} className="rounded-md border border-gray-200 bg-gray-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-gray-950">{row.label || row.title}</p>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${levelClasses[row.level || row.status] ?? levelClasses.Clear}`}>{row.level || row.status}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-gray-600">{row.message || row.description}</p>
                </div>
            ))}
        </div>
    );
}

function MessageStudio({ rows }) {
    const copyText = (text) => navigator.clipboard?.writeText(text);

    return (
        <div className="grid gap-3 lg:grid-cols-2">
            {rows.map((row) => (
                <div key={row.title} className="rounded-md border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-gray-950">{row.title}</p>
                        <button type="button" onClick={() => copyText(row.text)} className="rounded-md border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-100" title="Copy message">
                            <Copy className="h-4 w-4" />
                        </button>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-gray-700">{row.text}</p>
                </div>
            ))}
        </div>
    );
}

export default function CommandCenter({ ai }) {
    const { auth } = usePage().props;
    const statIcons = [Brain, AlertTriangle, ShieldCheck, Banknote, Warehouse];

    return (
        <Shell mode={ai.mode}>
            <Head title="AI Command Center" />

            <div className="bg-slate-50 py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <section className="overflow-hidden rounded-lg bg-gray-950 text-white shadow-sm">
                        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_360px] lg:p-8">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase text-cyan-200 ring-1 ring-white/15">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Fast Couriers intelligence layer
                                </div>
                                <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight lg:text-4xl">
                                    Make shipping decisions before returns happen.
                                </h1>
                                <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-300">
                                    AI scoring connects address quality, COD risk, courier reliability, stock velocity, payout readiness, and return proof into one operating view.
                                </p>
                            </div>
                            <div className="rounded-lg border border-white/10 bg-white/5 p-5">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-md bg-cyan-400 p-2 text-gray-950">
                                        <Bot className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">Active for {auth.user.name}</p>
                                        <p className="text-xs text-gray-300">{ai.mode === 'admin' ? 'Platform admin model' : 'Seller growth model'}</p>
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-300">
                                    <span className="rounded-md bg-white/10 p-3">Address verification</span>
                                    <span className="rounded-md bg-white/10 p-3">Courier selection</span>
                                    <span className="rounded-md bg-white/10 p-3">Return proof scoring</span>
                                    <span className="rounded-md bg-white/10 p-3">Cashflow alerts</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        {ai.stats.map((item, index) => (
                            <StatCard key={item.label} item={item} icon={statIcons[index] ?? Radar} />
                        ))}
                    </section>

                    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                        <Section title="Risk Prediction Queue" caption="AI ranks weak addresses, high COD orders, active parcel risk, and returns needing proof." icon={Radar}>
                            <RiskQueue rows={ai.riskQueue} />
                        </Section>

                        <div className="space-y-6">
                            <Section title="Courier Recommendations" caption="Suggested allocation logic by city, reliability, API readiness, and cost." icon={Route}>
                                <CourierCards rows={ai.courierRecommendations} />
                            </Section>

                            <Section title="Cashflow Signals" caption="Payout readiness, bank-line exceptions, and COD invoice opportunities." icon={Banknote}>
                                <SignalList rows={ai.cashflowSignals} />
                            </Section>
                        </div>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-2">
                        <Section title="Inventory Forecast" caption="Predict low-stock pressure before campaigns create fulfillment problems." icon={PackageSearch}>
                            <InventoryForecast rows={ai.inventoryForecast} />
                        </Section>

                        <Section title="Automation Playbook" caption="The workflows Fast Couriers can automate to feel meaningfully different in market." icon={Zap}>
                            <SignalList rows={ai.automations} />
                        </Section>
                    </div>

                    <Section title="Message Studio" caption="Ready-to-send customer and operations messages generated from current order context." icon={MessageSquareText}>
                        <MessageStudio rows={ai.messageStudio} />
                    </Section>

                    <section className="grid gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:grid-cols-3">
                        <div className="flex items-start gap-3">
                            <MapPinCheck className="mt-1 h-5 w-5 text-emerald-600" />
                            <div>
                                <p className="font-semibold text-gray-950">Next API upgrade</p>
                                <p className="mt-1 text-sm leading-6 text-gray-600">Connect geocoding and courier serviceability APIs to verify city, area, and delivery zones.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Truck className="mt-1 h-5 w-5 text-blue-600" />
                            <div>
                                <p className="font-semibold text-gray-950">Allocation engine</p>
                                <p className="mt-1 text-sm leading-6 text-gray-600">Auto-pick courier by success rate, price, SLA, proof availability, and seller preference.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <ClipboardCheck className="mt-1 h-5 w-5 text-amber-600" />
                            <div>
                                <p className="font-semibold text-gray-950">Proof intelligence</p>
                                <p className="mt-1 text-sm leading-6 text-gray-600">Summarize call transcripts, rider notes, photos, and location proof for valid return decisions.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </Shell>
    );
}
