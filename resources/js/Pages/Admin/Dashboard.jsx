import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    Banknote,
    BarChart3,
    Boxes,
    CheckCircle2,
    Clock3,
    LineChart,
    ReceiptText,
    ShieldAlert,
    Store,
    Truck,
    TrendingUp,
    Users,
    Wifi,
} from 'lucide-react';

function money(paisa) {
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format((paisa ?? 0) / 100);
}

function compactNumber(value) {
    return new Intl.NumberFormat('en-PK', { notation: 'compact', maximumFractionDigits: 1 }).format(value ?? 0);
}

function label(status) {
    return String(status || '').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Stat({ label: statLabel, value, icon: Icon, tone = 'gray' }) {
    const tones = {
        gray: 'bg-gray-950 text-white',
        blue: 'bg-blue-600 text-white',
        emerald: 'bg-emerald-600 text-white',
        amber: 'bg-amber-500 text-white',
        rose: 'bg-rose-600 text-white',
        cyan: 'bg-cyan-700 text-white',
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-gray-500">{statLabel}</p>
                    <p className="mt-2 text-2xl font-bold text-gray-950">{value}</p>
                </div>
                <span className={`grid h-10 w-10 place-items-center rounded-md ${tones[tone]}`}>
                    <Icon className="h-5 w-5" />
                </span>
            </div>
        </div>
    );
}

function MiniBarChart({ rows, keys, colors }) {
    const max = Math.max(1, ...rows.flatMap((row) => keys.map((key) => Number(row[key] || 0))));
    const grid = [100, 75, 50, 25];

    return (
        <div>
            <div className="mb-3 flex items-center justify-between text-xs font-semibold text-gray-400">
                <span>Daily movement</span>
                <span>Peak {compactNumber(max)}</span>
            </div>
            <div className="relative h-60 overflow-hidden rounded-lg border border-gray-100 bg-gradient-to-b from-gray-50 to-white px-3 pt-4">
                <div className="pointer-events-none absolute inset-x-3 top-4 h-44">
                    {grid.map((line) => (
                        <div key={line} className="absolute left-0 right-0 border-t border-dashed border-gray-200" style={{ top: `${100 - line}%` }} />
                    ))}
                </div>
                <div className="relative flex h-48 items-end gap-3">
                    {rows.map((row) => (
                        <div key={row.date ?? row.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                            <div className="flex h-44 w-full items-end justify-center gap-1.5">
                                {keys.map((key, index) => {
                                    const value = Number(row[key] || 0);

                                    return (
                                        <span
                                            key={key}
                                            title={`${row.date}: ${value} ${label(key).toLowerCase()}`}
                                            className={`w-full max-w-5 rounded-t-md ${colors[index]} shadow-sm transition hover:opacity-80`}
                                            style={{ height: `${value > 0 ? Math.max(8, (value / max) * 100) : 2}%` }}
                                        />
                                    );
                                })}
                            </div>
                            <span className="truncate text-xs font-semibold text-gray-500">{row.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function MoneyTrend({ rows }) {
    const max = Math.max(1, ...rows.map((row) => Number(row.amount || 0)));
    const total = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);

    return (
        <div>
            <div className="mb-4 rounded-lg bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase text-emerald-700">7-day delivered COD</p>
                <p className="mt-1 text-2xl font-bold text-emerald-950">{money(total)}</p>
            </div>
            <div className="space-y-3">
            {rows.map((row) => (
                <div key={row.date} className="grid grid-cols-[52px_1fr_auto] items-center gap-3 text-sm">
                    <span className="font-semibold text-gray-500">{row.label}</span>
                    <span className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <span className="block h-full rounded-full bg-emerald-600" style={{ width: `${Number(row.amount || 0) > 0 ? Math.max(4, (Number(row.amount || 0) / max) * 100) : 2}%` }} />
                    </span>
                    <span className="font-semibold text-gray-950">{money(row.amount)}</span>
                </div>
            ))}
            </div>
        </div>
    );
}

function ProfitTrend({ rows }) {
    const max = Math.max(1, ...rows.flatMap((row) => [Number(row.serviceFees || 0), Number(row.codFees || 0)]));
    const total = rows.reduce((sum, row) => sum + Number(row.serviceFees || 0) + Number(row.codFees || 0), 0);

    return (
        <div>
            <div className="mb-4 rounded-lg bg-gray-950 p-4 text-white">
                <p className="text-xs font-semibold uppercase text-cyan-200">7-day estimated profit</p>
                <p className="mt-1 text-2xl font-bold">{money(total)}</p>
                <p className="mt-1 text-xs text-gray-300">Service fees plus COD fee deductions.</p>
            </div>
            <div className="space-y-3">
                {rows.map((row) => {
                    const service = Number(row.serviceFees || 0);
                    const cod = Number(row.codFees || 0);

                    return (
                        <div key={row.date} className="grid grid-cols-[52px_1fr_auto] items-center gap-3 text-sm">
                            <span className="font-semibold text-gray-500">{row.label}</span>
                            <span className="flex h-3 overflow-hidden rounded-full bg-gray-100">
                                <span className="block h-full bg-cyan-600" style={{ width: `${service > 0 ? Math.max(4, (service / max) * 100) : 2}%` }} />
                                <span className="block h-full bg-emerald-500" style={{ width: `${cod > 0 ? Math.max(4, (cod / max) * 100) : 2}%` }} />
                            </span>
                            <span className="font-semibold text-gray-950">{money(service + cod)}</span>
                        </div>
                    );
                })}
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-gray-600">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-cyan-600" />Service fee</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />COD fee</span>
            </div>
        </div>
    );
}

function ProfitBreakdown({ rows }) {
    const max = Math.max(1, ...rows.map((row) => Number(row.amount || 0)));
    const tones = {
        cyan: 'bg-cyan-600',
        emerald: 'bg-emerald-500',
        amber: 'bg-amber-500',
        gray: 'bg-gray-500',
    };

    return (
        <div className="space-y-3">
            {rows.map((row) => (
                <div key={row.label} className="rounded-lg bg-gray-50 p-3">
                    <div className="mb-1 flex justify-between gap-3 text-sm">
                        <span className="font-semibold text-gray-700">{row.label}</span>
                        <span className="font-semibold text-gray-950">{money(row.amount)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                        <div className={`h-2 rounded-full ${tones[row.tone] ?? 'bg-gray-950'}`} style={{ width: `${Number(row.amount || 0) > 0 ? Math.max(4, (Number(row.amount || 0) / max) * 100) : 2}%` }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

function QueueCard({ title, icon: Icon, action, children }) {
    return (
        <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 p-4">
                <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-gray-500" />
                    <h3 className="font-bold text-gray-950">{title}</h3>
                </div>
                {action}
            </div>
            <div className="divide-y divide-gray-100">{children}</div>
        </section>
    );
}

function EmptyRow({ text = 'Nothing waiting right now.' }) {
    return <p className="p-4 text-sm text-gray-500">{text}</p>;
}

function HorizontalBars({ rows, valueKey = 'count', labelKey = 'label', suffix = '' }) {
    const max = Math.max(1, ...rows.map((row) => Number(row[valueKey] || 0)));
    const tones = {
        emerald: 'bg-emerald-500',
        blue: 'bg-blue-500',
        amber: 'bg-amber-500',
        rose: 'bg-rose-500',
    };

    return (
        <div className="space-y-3">
            {rows.map((row) => (
                <div key={row[labelKey]} className="rounded-lg bg-gray-50 p-3">
                    <div className="mb-1 flex justify-between text-sm">
                        <span className="font-semibold text-gray-700">{row[labelKey]}</span>
                        <span className="text-gray-500">{row[valueKey]}{suffix}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                        <div className={`h-2 rounded-full ${tones[row.tone] ?? 'bg-gray-950'}`} style={{ width: `${Number(row[valueKey] || 0) > 0 ? Math.max(4, (Number(row[valueKey] || 0) / max) * 100) : 2}%` }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

function ReadinessGauge({ insight }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="font-bold text-gray-950">API readiness score</h3>
                    <p className="mt-1 text-sm text-gray-500">Active couriers with credentials, booking, tracking, webhook, and proof readiness.</p>
                </div>
                <div className="grid h-28 w-28 shrink-0 place-items-center rounded-full shadow-inner ring-1 ring-gray-100" style={{ background: `conic-gradient(#0891b2 0 ${insight.score}%, #e5e7eb ${insight.score}% 100%)` }}>
                    <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-xl font-bold text-gray-950">{insight.score}%</div>
                </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm">
                <div className="rounded-md bg-gray-50 p-3">
                    <p className="font-bold text-gray-950">{insight.ready}/{insight.total}</p>
                    <p className="text-xs text-gray-500">Book/track</p>
                </div>
                <div className="rounded-md bg-gray-50 p-3">
                    <p className="font-bold text-gray-950">{insight.webhookReady}</p>
                    <p className="text-xs text-gray-500">Webhooks</p>
                </div>
                <div className="rounded-md bg-gray-50 p-3">
                    <p className="font-bold text-gray-950">{insight.proofReady}</p>
                    <p className="text-xs text-gray-500">Proof</p>
                </div>
            </div>
        </div>
    );
}

function StatusBreakdownChart({ rows, total }) {
    const colors = {
        booked: '#0ea5e9',
        picked: '#f59e0b',
        transit: '#f97316',
        out_for_delivery: '#14b8a6',
        delivered: '#10b981',
        returned: '#f43f5e',
        cancelled: '#6b7280',
    };
    let cursor = 0;
    const gradient = rows.map((row) => {
        const start = cursor;
        const size = (Number(row.count || 0) / Math.max(total, 1)) * 100;
        cursor += size;

        return `${colors[row.status] ?? '#111827'} ${start}% ${cursor}%`;
    }).join(', ');

    return (
        <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="grid h-36 w-36 place-items-center rounded-full shadow-inner ring-1 ring-gray-100" style={{ background: `conic-gradient(${gradient || '#e5e7eb 0 100%'})` }}>
                <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center shadow-sm">
                    <span className="block text-2xl font-bold text-gray-950">{total}</span>
                    <span className="-mt-2 block text-xs font-semibold text-gray-400">parcels</span>
                </div>
            </div>
            <div className="space-y-3">
                {rows.map((row) => (
                    <div key={row.status} className="rounded-lg bg-gray-50 p-3">
                        <div className="mb-1 flex justify-between text-sm">
                            <span className="flex items-center gap-2 font-semibold text-gray-700">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[row.status] ?? '#111827' }} />
                                {label(row.status)}
                            </span>
                            <span className="text-gray-500">{row.count}</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100">
                            <div className="h-2 rounded-full" style={{ width: `${(row.count / Math.max(total, 1)) * 100}%`, backgroundColor: colors[row.status] ?? '#111827' }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Dashboard({ stats, alerts, charts, insights, couriers, courierPerformance, queues, topSellers, recentActivity, recentShipments }) {
    const totalStatuses = Math.max(1, charts.statusBreakdown.reduce((sum, row) => sum + row.count, 0));

    return (
        <AdminLayout header={<div><h2 className="text-xl font-semibold text-gray-950">Admin Command Center</h2><p className="text-sm text-gray-500">Live operations, courier APIs, seller risk, finance queues, and support exceptions.</p></div>}>
            <Head title="Admin Command Center" />
            <main className="bg-gray-50 py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <section className="rounded-lg bg-gray-950 p-6 text-white">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase text-emerald-300">Operations cockpit</p>
                                <h1 className="mt-2 text-3xl font-bold">Everything that needs admin attention.</h1>
                                <p className="mt-2 max-w-3xl text-sm text-gray-300">Track courier health, seller verification, payout approvals, delayed parcels, claims, returns, and COD movement from one screen.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Link href={route('admin.shipments.index')} className="rounded-md bg-white px-4 py-2 text-sm font-bold text-gray-950">Open shipments</Link>
                                <Link href={route('admin.couriers.index')} className="rounded-md border border-white/30 px-4 py-2 text-sm font-bold text-white">Courier APIs</Link>
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {alerts.length ? alerts.map((alert) => (
                            <Link key={alert.title} href={alert.route} className="rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm hover:bg-amber-100">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />
                                    <div>
                                        <p className="font-bold text-amber-950">{alert.title}</p>
                                        <p className="mt-1 text-sm text-amber-800">{alert.message}</p>
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 md:col-span-2 xl:col-span-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                                    <p className="font-bold text-emerald-950">No urgent admin alerts right now.</p>
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
                        <Stat label="Sellers" value={stats.sellers} icon={Users} tone="blue" />
                        <Stat label="Shipments" value={stats.shipments} icon={Boxes} tone="gray" />
                        <Stat label="Pending" value={stats.pending} icon={Truck} tone="amber" />
                        <Stat label="Returns" value={stats.returns} icon={ShieldAlert} tone="rose" />
                        <Stat label="COD collected" value={money(stats.codCollected)} icon={Banknote} tone="emerald" />
                        <Stat label="Payout pending" value={money(stats.payoutPending)} icon={ReceiptText} tone="cyan" />
                        <Stat label="Est. profit" value={money(stats.estimatedProfit)} icon={TrendingUp} tone="emerald" />
                        <Stat label="Profit today" value={money(stats.todayProfit)} icon={TrendingUp} tone="cyan" />
                    </section>

                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                        <Stat label="Bookings today" value={stats.bookingsToday} icon={Truck} tone="blue" />
                        <Stat label="Deliveries today" value={stats.deliveriesToday} icon={CheckCircle2} tone="emerald" />
                        <Stat label="Returns today" value={stats.returnsToday} icon={ShieldAlert} tone="rose" />
                        <Stat label="Delayed parcels" value={stats.delayedShipments} icon={Clock3} tone="amber" />
                        <Stat label="API issues" value={stats.apiIssues} icon={Wifi} tone="rose" />
                        <Stat label="Seller reviews" value={stats.pendingSellerReviews} icon={Store} tone="cyan" />
                        <Stat label="Profit margin" value={`${stats.profitMargin}%`} icon={TrendingUp} tone="emerald" />
                    </section>

                    <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-950">Estimated profit</h3>
                                    <p className="text-sm text-gray-500">Current estimate from service fees and COD fee deductions.</p>
                                </div>
                                <TrendingUp className="h-5 w-5 text-gray-400" />
                            </div>
                            <ProfitBreakdown rows={charts.profitBreakdown} />
                            <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
                                This is an operational estimate. True net profit needs actual courier invoices, bank costs, refunds, and operating expenses.
                            </p>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-950">Profit trend</h3>
                                    <p className="text-sm text-gray-500">Daily platform margin movement for the last 7 days.</p>
                                </div>
                                <LineChart className="h-5 w-5 text-gray-400" />
                            </div>
                            <ProfitTrend rows={charts.profitTrend} />
                        </div>
                    </section>

                    <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-950">7-day shipment movement</h3>
                                    <p className="text-sm text-gray-500">Booked, delivered, and returned parcels.</p>
                                </div>
                                <LineChart className="h-5 w-5 text-gray-400" />
                            </div>
                            <MiniBarChart rows={charts.shipmentTrend} keys={['booked', 'delivered', 'returned']} colors={['bg-blue-500', 'bg-emerald-500', 'bg-rose-500']} />
                            <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-gray-600">
                                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" />Booked</span>
                                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Delivered</span>
                                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" />Returned</span>
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-950">COD delivered trend</h3>
                                    <p className="text-sm text-gray-500">Delivered COD by day.</p>
                                </div>
                                <BarChart3 className="h-5 w-5 text-gray-400" />
                            </div>
                            <MoneyTrend rows={charts.codTrend} />
                        </div>
                    </section>

                    <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                        <ReadinessGauge insight={insights.apiReadiness} />

                        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-950">SLA aging</h3>
                                    <p className="text-sm text-gray-500">Active parcels by time since booking.</p>
                                </div>
                                <Clock3 className="h-5 w-5 text-gray-400" />
                            </div>
                            <HorizontalBars rows={insights.slaAging} />
                        </div>
                    </section>

                    <section className="grid gap-6 xl:grid-cols-3">
                        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <h3 className="font-bold text-gray-950">City return hotspots</h3>
                            <p className="mt-1 text-sm text-gray-500">Cities ranked by return percentage.</p>
                            <div className="mt-5 space-y-3">
                                {insights.cityHotspots.map((city) => (
                                    <div key={city.city}>
                                        <div className="mb-1 flex justify-between text-sm">
                                            <span className="font-semibold text-gray-700">{city.city}</span>
                                            <span className="text-gray-500">{city.returnRate}%</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-gray-100">
                                            <div className="h-2 rounded-full bg-rose-600" style={{ width: `${Math.max(3, city.returnRate)}%` }} />
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">{city.returned} returned from {city.total}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <h3 className="font-bold text-gray-950">Finance aging</h3>
                            <p className="mt-1 text-sm text-gray-500">Generated invoices waiting for payout action.</p>
                            <div className="mt-5">
                                <HorizontalBars rows={insights.financeAging} />
                            </div>
                            <Link href={route('admin.payouts.index')} className="mt-5 inline-flex rounded-md bg-gray-950 px-3 py-2 text-xs font-bold text-white">Open payout queue</Link>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <h3 className="font-bold text-gray-950">Support aging</h3>
                            <p className="mt-1 text-sm text-gray-500">Open support pressure by urgency and type.</p>
                            <div className="mt-5">
                                <HorizontalBars rows={insights.supportAging} />
                            </div>
                            <Link href={route('admin.shipments.index', { status: 'returned' })} className="mt-5 inline-flex rounded-md bg-gray-950 px-3 py-2 text-xs font-bold text-white">Review disputes</Link>
                        </div>
                    </section>

                    <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <h3 className="font-bold text-gray-950">Status breakdown</h3>
                            <p className="mt-1 text-sm text-gray-500">Current parcel distribution across the full lifecycle.</p>
                            <div className="mt-5">
                                <StatusBreakdownChart rows={charts.statusBreakdown} total={totalStatuses} />
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                            <div className="flex items-center justify-between border-b border-gray-100 p-5">
                                <div>
                                    <h3 className="font-bold text-gray-950">Courier API and delivery monitor</h3>
                                    <p className="text-sm text-gray-500">Health, credential state, return rate, and delivery count.</p>
                                </div>
                                <Link href={route('admin.couriers.index')} className="rounded-md bg-gray-950 px-3 py-2 text-xs font-bold text-white">Manage</Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-5 py-3">Courier</th><th className="px-5 py-3">API</th><th className="px-5 py-3">Reliability</th><th className="px-5 py-3">Delivered</th><th className="px-5 py-3">Return rate</th></tr></thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {courierPerformance.map((courier) => (
                                            <tr key={courier.code}>
                                                <td className="px-5 py-4 font-semibold text-gray-950">{courier.name}<span className="block text-xs font-normal text-gray-500">{courier.code}</span></td>
                                                <td className="px-5 py-4"><span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-bold text-gray-700">{courier.apiStatus}</span></td>
                                                <td className="px-5 py-4">{courier.successRate}%</td>
                                                <td className="px-5 py-4">{courier.delivered}/{courier.total}</td>
                                                <td className="px-5 py-4 font-semibold">{courier.returnRate}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-6 xl:grid-cols-2">
                        <QueueCard title="Action queues" icon={Activity} action={<Link href={route('admin.shipments.index')} className="text-xs font-bold text-gray-600">Open operations</Link>}>
                            {queues.delayedShipments.map((shipment) => (
                                <Link key={shipment.id} href={route('admin.shipments.index', { q: shipment.trackingNumber })} className="grid gap-1 p-4 hover:bg-gray-50 sm:grid-cols-[1fr_auto]">
                                    <div>
                                        <p className="font-semibold text-gray-950">{shipment.trackingNumber}</p>
                                        <p className="text-sm text-gray-500">{shipment.seller} | {shipment.courier} | {shipment.city}</p>
                                    </div>
                                    <p className="text-sm font-bold text-amber-700">{shipment.ageDays} days old</p>
                                </Link>
                            ))}
                            {!queues.delayedShipments.length && <EmptyRow text="No delayed shipments." />}
                        </QueueCard>

                        <QueueCard title="Finance approvals" icon={ReceiptText} action={<Link href={route('admin.payouts.index')} className="text-xs font-bold text-gray-600">Open payouts</Link>}>
                            {queues.payouts.map((invoice) => (
                                <Link key={invoice.id} href={route('admin.payouts.index')} className="grid gap-1 p-4 hover:bg-gray-50 sm:grid-cols-[1fr_auto]">
                                    <div>
                                        <p className="font-semibold text-gray-950">{invoice.invoiceNumber}</p>
                                        <p className="text-sm text-gray-500">{invoice.seller} | {invoice.generatedAt}</p>
                                    </div>
                                    <p className="text-sm font-bold text-emerald-700">{money(invoice.amount)}</p>
                                </Link>
                            ))}
                            {!queues.payouts.length && <EmptyRow text="No payout approvals waiting." />}
                        </QueueCard>

                        <QueueCard title="Seller verification" icon={Store} action={<Link href={route('admin.sellers.index')} className="text-xs font-bold text-gray-600">Open sellers</Link>}>
                            {queues.sellers.map((seller) => (
                                <Link key={seller.id} href={route('admin.sellers.index')} className="p-4 hover:bg-gray-50">
                                    <p className="font-semibold text-gray-950">{seller.business}</p>
                                    <p className="text-sm text-gray-500">{seller.seller} | {seller.email} | {seller.city}</p>
                                </Link>
                            ))}
                            {!queues.sellers.length && <EmptyRow text="No pending seller reviews." />}
                        </QueueCard>

                        <QueueCard title="Claims and return disputes" icon={ShieldAlert} action={<Link href={route('admin.shipments.index', { status: 'returned' })} className="text-xs font-bold text-gray-600">Open returns</Link>}>
                            {queues.claims.map((ticket) => (
                                <div key={ticket.ticketNumber} className="p-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-semibold text-gray-950">{ticket.ticketNumber}</p>
                                        <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700">{ticket.priority}</span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">{ticket.seller} | {ticket.shipment} | {ticket.subject}</p>
                                </div>
                            ))}
                            {!queues.claims.length && <EmptyRow text="No open return claims." />}
                        </QueueCard>
                    </section>

                    <section className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
                        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-100 p-5">
                                <h3 className="font-bold text-gray-950">Seller performance and risk</h3>
                                <p className="text-sm text-gray-500">High volume sellers and return ratio.</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-5 py-3">Seller</th><th className="px-5 py-3">Shipments</th><th className="px-5 py-3">Delivered</th><th className="px-5 py-3">Returns</th><th className="px-5 py-3">COD</th></tr></thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {topSellers.map((seller) => (
                                            <tr key={seller.email}>
                                                <td className="px-5 py-4 font-semibold text-gray-950">{seller.name}<span className="block text-xs font-normal text-gray-500">{seller.email}</span></td>
                                                <td className="px-5 py-4">{seller.shipments}</td>
                                                <td className="px-5 py-4">{seller.delivered}</td>
                                                <td className="px-5 py-4">{seller.returned} <span className="text-xs text-gray-500">({seller.returnRate}%)</span></td>
                                                <td className="px-5 py-4 font-semibold">{money(seller.cod)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <QueueCard title="Recent activity" icon={Clock3}>
                            {recentActivity.map((item) => (
                                <div key={`${item.type}-${item.title}-${item.time}`} className="p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="font-semibold text-gray-950">{item.title}</p>
                                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600">{item.type}</span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">{item.detail} | {item.time}</p>
                                </div>
                            ))}
                            {!recentActivity.length && <EmptyRow />}
                        </QueueCard>
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 p-5"><h3 className="font-bold text-gray-950">Recent shipments</h3></div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-5 py-3">Tracking</th><th className="px-5 py-3">Seller</th><th className="px-5 py-3">Courier</th><th className="px-5 py-3">City</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">COD</th></tr></thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentShipments.map((shipment) => (
                                        <tr key={shipment.trackingNumber}>
                                            <td className="px-5 py-4 font-semibold">{shipment.trackingNumber}</td>
                                            <td className="px-5 py-4">{shipment.seller}</td>
                                            <td className="px-5 py-4">{shipment.courier}</td>
                                            <td className="px-5 py-4">{shipment.city}</td>
                                            <td className="px-5 py-4">{label(shipment.status)}</td>
                                            <td className="px-5 py-4">{money(shipment.codAmount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </main>
        </AdminLayout>
    );
}
