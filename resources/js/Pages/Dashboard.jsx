import SellerLayout from '@/Layouts/SellerLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowDownToLine,
    ArrowRight,
    BarChart3,
    Boxes,
    Brain,
    CheckCircle2,
    CircleDollarSign,
    ClipboardList,
    Clock3,
    FileSpreadsheet,
    PackagePlus,
    RotateCcw,
    Search,
    Sparkles,
    Truck,
} from 'lucide-react';

const statusClasses = {
    booked: 'bg-sky-50 text-sky-700 ring-sky-200',
    picked: 'bg-orange-50 text-orange-700 ring-orange-200',
    transit: 'bg-amber-50 text-amber-700 ring-amber-200',
    out_for_delivery: 'bg-teal-50 text-teal-700 ring-teal-200',
    delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    returned: 'bg-rose-50 text-rose-700 ring-rose-200',
    cancelled: 'bg-gray-100 text-gray-700 ring-gray-200',
};

function money(paisa) {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        maximumFractionDigits: 0,
    }).format((paisa ?? 0) / 100);
}

function compactNumber(value) {
    return new Intl.NumberFormat('en-PK', { notation: 'compact', maximumFractionDigits: 1 }).format(value ?? 0);
}

function statusLabel(status) {
    return status.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function StatCard({ icon: Icon, label, value, tone }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-950">{value}</p>
                </div>
                <div className={`rounded-md p-2 ${tone}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}

function OnboardingChecklist({ items }) {
    const completed = items.filter((item) => item.done).length;
    const percent = Math.round((completed / Math.max(items.length, 1)) * 100);

    return (
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h3 className="font-semibold text-gray-950">Seller setup</h3>
                    <p className="mt-1 text-sm text-gray-500">{completed} of {items.length} steps complete</p>
                </div>
                <span className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700">{percent}%</span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-gray-100">
                <div className="h-2 rounded-full bg-cyan-600" style={{ width: `${percent}%` }} />
            </div>
            <div className="mt-5 space-y-3">
                {items.map((item) => (
                    <div key={item.label} className={`rounded-md border p-3 ${item.done ? 'border-emerald-100 bg-emerald-50/60' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex items-start justify-between gap-3">
                            <span className="flex items-start gap-2 text-sm font-semibold text-gray-800">
                                <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${item.done ? 'text-emerald-500' : 'text-gray-300'}`} />
                                <span>
                                    <span className="block">{item.label}</span>
                                    <span className="mt-1 block text-xs font-normal leading-5 text-gray-500">{item.description}</span>
                                </span>
                            </span>
                            <span className="shrink-0 text-xs font-semibold uppercase text-gray-400">{item.done ? 'Done' : item.status ?? 'Pending'}</span>
                        </div>
                        {!item.done && item.href && (
                            <Link href={item.href} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-cyan-800">
                                {item.action}
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}

function MetricBarChart({ rows, series }) {
    const max = Math.max(1, ...rows.flatMap((row) => series.map((item) => Number(row[item.key] || 0))));
    const grid = [100, 75, 50, 25];

    return (
        <div>
            <div className="mb-3 flex items-center justify-between text-xs font-semibold text-gray-400">
                <span>Volume</span>
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
                        <div key={row.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                            <div className="flex h-44 w-full items-end justify-center gap-1.5">
                                {series.map((item) => {
                                    const value = Number(row[item.key] || 0);

                                    return (
                                        <span
                                            key={item.key}
                                            title={`${row.label}: ${value} ${item.label.toLowerCase()}`}
                                            className={`w-full max-w-5 rounded-t-md ${item.className} shadow-sm transition hover:opacity-80`}
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
            <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-gray-600">
                {series.map((item) => (
                    <span key={item.key} className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${item.dotClassName}`} />
                        {item.label}
                    </span>
                ))}
            </div>
        </div>
    );
}

function MoneyBarChart({ rows }) {
    const max = Math.max(1, ...rows.map((row) => Number(row.revenue || 0)));

    return (
        <div className="mt-5 space-y-3">
            {rows.map((row) => (
                <div key={row.label} className="grid grid-cols-[58px_1fr_auto] items-center gap-3 text-sm">
                    <span className="font-semibold text-gray-500">{row.label}</span>
                    <span className="h-3 overflow-hidden rounded-full bg-gray-100">
                        <span
                            className="block h-full rounded-full bg-indigo-600"
                            style={{ width: `${Number(row.revenue || 0) > 0 ? Math.max(4, (Number(row.revenue || 0) / max) * 100) : 2}%` }}
                        />
                    </span>
                    <span className="font-semibold text-gray-950">{money(row.revenue)}</span>
                </div>
            ))}
        </div>
    );
}

function DonutMetric({ percent, delivered, returned }) {
    return (
        <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="relative grid h-36 w-36 place-items-center rounded-full shadow-inner ring-1 ring-gray-100" style={{ background: `conic-gradient(#10b981 0 ${percent}%, #f43f5e ${percent}% 100%)` }}>
                <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center shadow-sm">
                    <span className="block text-2xl font-bold text-gray-950">{percent}%</span>
                    <span className="-mt-2 block text-xs font-semibold text-gray-400">success</span>
                </div>
            </div>
            <div className="space-y-3">
                <div className="rounded-lg bg-emerald-50 p-3">
                    <p className="flex items-center justify-between text-sm font-semibold text-emerald-900">
                        <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Delivered</span>
                        <span>{delivered}</span>
                    </p>
                </div>
                <div className="rounded-lg bg-rose-50 p-3">
                    <p className="flex items-center justify-between text-sm font-semibold text-rose-900">
                        <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" />Returned</span>
                        <span>{returned}</span>
                    </p>
                </div>
                <p className="text-sm leading-6 text-gray-500">Use proof-ready couriers and address checks when this percentage drops.</p>
            </div>
        </div>
    );
}

function ChartCard({ title, subtitle, icon: Icon, children }) {
    return (
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-base font-semibold text-gray-950">{title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
                </div>
                {Icon && (
                    <span className="grid h-9 w-9 place-items-center rounded-md bg-gray-50 text-gray-500 ring-1 ring-gray-100">
                        <Icon className="h-5 w-5" />
                    </span>
                )}
            </div>
            {children}
        </section>
    );
}

function ProgressRow({ city, total, successRate }) {
    const tone = successRate >= 85 ? 'bg-emerald-500' : successRate >= 70 ? 'bg-amber-500' : 'bg-rose-500';

    return (
        <div className="rounded-lg bg-gray-50 p-3">
            <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{city}</span>
                <span className="text-gray-500">{total} parcels | {successRate}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100">
                <div className={`h-2 rounded-full ${tone}`} style={{ width: `${successRate}%` }} />
            </div>
        </div>
    );
}

function InsightPanel({ insights }) {
    return (
        <section className="rounded-lg border border-cyan-100 bg-cyan-50 p-5 shadow-sm">
            <div className="mb-4 flex items-start gap-3">
                <div className="rounded-md bg-white p-2 text-cyan-700 ring-1 ring-cyan-100">
                    <Brain className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-gray-950">Business insights</h3>
                    <p className="text-sm text-cyan-900">Recommended actions from returns, delivery queue, and inventory health.</p>
                </div>
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
                {insights.map((insight) => (
                    <Link key={insight.label} href={insight.href} className="rounded-md bg-white p-4 ring-1 ring-cyan-100 transition hover:bg-cyan-50">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-gray-950">{insight.label}</p>
                            <span className={`rounded-full px-2 py-1 text-xs font-bold ${insight.level === 'Action needed' ? 'bg-rose-50 text-rose-700' : insight.level === 'Watch' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                {insight.level}
                            </span>
                        </div>
                        <p className="mt-3 text-xs leading-5 text-gray-600"><Sparkles className="mr-1 inline h-3.5 w-3.5 text-cyan-700" />{insight.message}</p>
                    </Link>
                ))}
            </div>
        </section>
    );
}

export default function Dashboard({ stats, charts, recentBookings, recommendations, onboarding, insights = [] }) {
    const returnTotal = charts.successVsReturn.delivered + charts.successVsReturn.returned || 1;
    const successPercent = Math.round((charts.successVsReturn.delivered / returnTotal) * 100);

    return (
        <SellerLayout
            header={
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-semibold leading-tight text-gray-950">
                        Seller Dashboard
                    </h2>
                    <p className="text-sm text-gray-500">Bookings, COD, courier quality, and city performance.</p>
                </div>
            }
        >
            <Head title="Seller Dashboard" />

            <div className="bg-gray-50 py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
                        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold uppercase text-cyan-800 ring-1 ring-cyan-100">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Seller operations
                                    </div>
                                    <h3 className="mt-3 max-w-3xl text-2xl font-bold text-gray-950">Today’s shipping workspace</h3>
                                    <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
                                        Create bookings, review pending orders, protect COD payouts, and watch returns from one clean view.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Link href={route('bookings.create')} className="inline-flex items-center gap-2 rounded-md bg-gray-950 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-gray-800">
                                        <PackagePlus className="h-4 w-4" />
                                        New booking
                                    </Link>
                                    <Link href={route('orders.index')} className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50">
                                        <ClipboardList className="h-4 w-4" />
                                        Orders
                                    </Link>
                                    <Link href={route('payouts.index')} className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50">
                                        <CircleDollarSign className="h-4 w-4" />
                                        Payouts
                                    </Link>
                                </div>
                            </div>
                            <div className="mt-5 grid gap-3 md:grid-cols-3">
                                <div className="rounded-md border border-cyan-100 bg-cyan-50 p-4">
                                    <p className="text-xs font-bold uppercase text-cyan-800">Active delivery load</p>
                                    <p className="mt-2 text-2xl font-bold text-gray-950">{stats.pendingDeliveries}</p>
                                    <p className="mt-1 text-xs text-cyan-900">Parcels currently moving</p>
                                </div>
                                <div className="rounded-md border border-emerald-100 bg-emerald-50 p-4">
                                    <p className="text-xs font-bold uppercase text-emerald-800">COD ready</p>
                                    <p className="mt-2 text-2xl font-bold text-gray-950">{money(stats.codReadyForInvoice)}</p>
                                    <p className="mt-1 text-xs text-emerald-900">Available for invoice</p>
                                </div>
                                <div className="rounded-md border border-amber-100 bg-amber-50 p-4">
                                    <p className="text-xs font-bold uppercase text-amber-800">Stock alerts</p>
                                    <p className="mt-2 text-2xl font-bold text-gray-950">{stats.lowStockProducts}</p>
                                    <p className="mt-1 text-xs text-amber-900">SKUs need attention</p>
                                </div>
                            </div>
                            <div className="mt-6 grid gap-6 border-t border-gray-100 pt-5 xl:grid-cols-[0.95fr_1.05fr]">
                                <div>
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <h4 className="text-sm font-bold uppercase text-gray-500">Today’s focus</h4>
                                            <p className="mt-1 text-sm text-gray-500">What the team should handle first.</p>
                                        </div>
                                        <Brain className="h-5 w-5 text-cyan-700" />
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        <Link href={route('orders.index')} className="flex items-center justify-between gap-3 rounded-md border border-gray-200 px-3 py-2.5 text-sm hover:bg-gray-50">
                                            <span>
                                                <span className="block font-semibold text-gray-950">Prepare pending orders</span>
                                                <span className="text-xs text-gray-500">{stats.pendingOrders} order(s) need packing or shipping</span>
                                            </span>
                                            <ArrowRight className="h-4 w-4 text-gray-400" />
                                        </Link>
                                        <Link href={route('payouts.index')} className="flex items-center justify-between gap-3 rounded-md border border-gray-200 px-3 py-2.5 text-sm hover:bg-gray-50">
                                            <span>
                                                <span className="block font-semibold text-gray-950">Protect COD cashflow</span>
                                                <span className="text-xs text-gray-500">{money(stats.codReadyForInvoice)} ready for payout invoice</span>
                                            </span>
                                            <ArrowRight className="h-4 w-4 text-gray-400" />
                                        </Link>
                                        <Link href={route('ai.index')} className="flex items-center justify-between gap-3 rounded-md border border-cyan-100 bg-cyan-50 px-3 py-2.5 text-sm hover:bg-cyan-100">
                                            <span>
                                                <span className="block font-semibold text-gray-950">Open AI recommendations</span>
                                                <span className="text-xs text-cyan-800">Address risk, courier choice, returns, and stock forecast</span>
                                            </span>
                                            <ArrowRight className="h-4 w-4 text-cyan-700" />
                                        </Link>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <h4 className="text-sm font-bold uppercase text-gray-500">Live parcel activity</h4>
                                            <p className="mt-1 text-sm text-gray-500">Recent shipments your team may need to watch.</p>
                                        </div>
                                        <Truck className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div className="mt-4 divide-y divide-gray-100 rounded-md border border-gray-200">
                                        {recentBookings.slice(0, 5).map((booking) => (
                                            <div key={booking.trackingNumber} className="grid gap-2 px-3 py-3 text-sm sm:grid-cols-[1fr_auto] sm:items-center">
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold text-gray-950">{booking.trackingNumber} | {booking.receiver}</p>
                                                    <p className="mt-1 text-xs text-gray-500">{booking.courier} to {booking.city}</p>
                                                </div>
                                                <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClasses[booking.status] ?? statusClasses.cancelled}`}>
                                                    {statusLabel(booking.status)}
                                                </span>
                                            </div>
                                        ))}
                                        {recentBookings.length === 0 && (
                                            <p className="px-3 py-6 text-center text-sm text-gray-500">No bookings yet. Create your first shipment to start live monitoring.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <OnboardingChecklist items={onboarding} />
                    </section>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                        <StatCard icon={PackagePlus} label="Bookings today" value={stats.bookingsToday} tone="bg-cyan-50 text-cyan-700" />
                        <StatCard icon={Clock3} label="Pending deliveries" value={stats.pendingDeliveries} tone="bg-amber-50 text-amber-700" />
                        <StatCard icon={CheckCircle2} label="Delivered today" value={stats.deliveredToday} tone="bg-emerald-50 text-emerald-700" />
                        <StatCard icon={RotateCcw} label="Returns today" value={stats.returnsToday} tone="bg-rose-50 text-rose-700" />
                        <StatCard icon={CircleDollarSign} label="COD collected" value={money(stats.codCollectedToday)} tone="bg-indigo-50 text-indigo-700" />
                        <StatCard icon={ArrowDownToLine} label="Ready to invoice" value={money(stats.codReadyForInvoice)} tone="bg-lime-50 text-lime-700" />
                        <StatCard icon={ClipboardList} label="Pending orders" value={stats.pendingOrders} tone="bg-cyan-50 text-cyan-700" />
                        <StatCard icon={Boxes} label="Inventory units" value={stats.inventoryUnits} tone="bg-violet-50 text-violet-700" />
                        <StatCard icon={Boxes} label="Low stock SKUs" value={stats.lowStockProducts} tone="bg-red-50 text-red-700" />
                    </div>

                    <InsightPanel insights={insights} />

                    <div className="grid gap-4 lg:grid-cols-[1.35fr_0.95fr]">
                        <ChartCard title="Last 7 days" subtitle="Booked vs delivered parcels by day." icon={BarChart3}>
                            <MetricBarChart
                                rows={charts.lastSevenDays}
                                series={[
                                    { key: 'booked', label: 'Booked', className: 'bg-cyan-600', dotClassName: 'bg-cyan-600' },
                                    { key: 'delivered', label: 'Delivered', className: 'bg-emerald-500', dotClassName: 'bg-emerald-500' },
                                ]}
                            />
                        </ChartCard>

                        <ChartCard title="Success vs return" subtitle="Delivered parcels compared with returned parcels.">
                            <DonutMetric percent={successPercent} delivered={charts.successVsReturn.delivered} returned={charts.successVsReturn.returned} />
                        </ChartCard>
                    </div>

                    <section className="grid gap-4 lg:grid-cols-4 xl:grid-cols-5">
                        <Link href={route('bookings.create')} className="flex items-center justify-center gap-2 rounded-lg bg-gray-950 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800">
                            <PackagePlus className="h-4 w-4" /> New booking
                        </Link>
                        <Link href={route('payouts.index')} className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50">
                            <FileSpreadsheet className="h-4 w-4" /> Generate payout
                        </Link>
                        <Link href={route('inventory.index')} className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50">
                            <Boxes className="h-4 w-4" /> Manage inventory
                        </Link>
                        <form onSubmit={(event) => { event.preventDefault(); router.get(route('track'), { tracking: event.currentTarget.tracking.value }); }} className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm">
                            <Search className="h-4 w-4 text-gray-400" />
                            <input name="tracking" className="w-full border-0 p-0 text-sm focus:ring-0" placeholder="Track a parcel" />
                        </form>
                        <Link href={route('reports.seller')} className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50">
                            <ArrowDownToLine className="h-4 w-4" /> Download report
                        </Link>
                    </section>

                    <div className="grid gap-4 lg:grid-cols-[0.8fr_0.8fr_1.1fr]">
                        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <h3 className="text-base font-semibold text-gray-950">Top cities</h3>
                            <div className="mt-5 space-y-4">
                                {charts.topCities.map((row) => <ProgressRow key={row.city} {...row} />)}
                            </div>
                        </section>

                        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-base font-semibold text-gray-950">Weekly COD trend</h3>
                                    <p className="mt-1 text-sm text-gray-500">Delivered COD by week.</p>
                                </div>
                                <CircleDollarSign className="h-5 w-5 text-gray-400" />
                            </div>
                            <MoneyBarChart rows={charts.weeklyRevenue} />
                        </section>

                        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-base font-semibold text-gray-950">Recommended courier rates</h3>
                                <Truck className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="text-xs uppercase text-gray-500">
                                        <tr>
                                            <th className="py-2">Courier</th>
                                            <th className="py-2">City</th>
                                            <th className="py-2">Rate</th>
                                            <th className="py-2">Days</th>
                                            <th className="py-2">Success</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {recommendations.map((rate) => (
                                            <tr key={`${rate.courier}-${rate.city}`}>
                                                <td className="py-3 font-medium text-gray-900">{rate.courier}</td>
                                                <td className="py-3 text-gray-600">{rate.city}</td>
                                                <td className="py-3 text-gray-600">{money(rate.rate)}</td>
                                                <td className="py-3 text-gray-600">{rate.days}</td>
                                                <td className="py-3 text-gray-600">{rate.successRate}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 p-5">
                            <h3 className="text-base font-semibold text-gray-950">Recent bookings</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                    <tr>
                                        <th className="px-5 py-3">Tracking ID</th>
                                        <th className="px-5 py-3">Receiver</th>
                                        <th className="px-5 py-3">Courier</th>
                                        <th className="px-5 py-3">Date</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3">COD</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentBookings.map((booking) => (
                                        <tr key={booking.trackingNumber}>
                                            <td className="px-5 py-4 font-semibold text-gray-950">{booking.trackingNumber}</td>
                                            <td className="px-5 py-4 text-gray-700">
                                                <span className="block font-medium">{booking.receiver}</span>
                                                <span className="text-xs text-gray-500">{booking.city}</span>
                                            </td>
                                            <td className="px-5 py-4 text-gray-700">{booking.courier}</td>
                                            <td className="px-5 py-4 text-gray-600">{booking.bookingDate}</td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClasses[booking.status] ?? statusClasses.cancelled}`}>
                                                    {statusLabel(booking.status)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 font-medium text-gray-900">{money(booking.codAmount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </SellerLayout>
    );
}
