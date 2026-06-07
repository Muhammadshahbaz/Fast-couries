import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { Banknote, BarChart3, PackageCheck, RotateCcw, Truck } from 'lucide-react';

function money(paisa) {
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format((paisa ?? 0) / 100);
}

function Stat({ label, value, icon: Icon }) {
    return <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-gray-500">{label}</p><p className="mt-2 text-2xl font-bold text-gray-950">{value}</p></div><span className="rounded-md bg-gray-950 p-2 text-white"><Icon className="h-5 w-5" /></span></div></div>;
}

export default function Admin({ summary, couriers }) {
    return (
        <AdminLayout header={<div><h2 className="text-xl font-semibold text-gray-950">Admin Reports</h2><p className="text-sm text-gray-500">System-wide operations, COD liability, and courier setup health.</p></div>}>
            <Head title="Admin Reports" />
            <div className="bg-gray-50 py-8"><div className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
                <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"><p className="text-sm font-bold uppercase text-cyan-700">Platform report</p><h1 className="mt-2 text-2xl font-bold text-gray-950">Courier health and COD exposure</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">A compact admin view for total operations, returns, payout liability, and courier setup readiness.</p></section>
                <div className="grid gap-4 md:grid-cols-5"><Stat icon={Truck} label="Shipments" value={summary.shipments} /><Stat icon={PackageCheck} label="Delivered" value={summary.delivered} /><Stat icon={RotateCcw} label="Returns" value={summary.returns} /><Stat icon={Banknote} label="COD collected" value={money(summary.codCollected)} /><Stat icon={Banknote} label="Payout liability" value={money(summary.payoutLiability)} /></div>
                <section className="rounded-lg border border-gray-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-gray-100 p-5"><div><h3 className="font-semibold text-gray-950">Courier setup health</h3><p className="text-sm text-gray-500">API status, rate coverage, and courier success score.</p></div><BarChart3 className="h-5 w-5 text-gray-400" /></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-5 py-3">Courier</th><th className="px-5 py-3">API</th><th className="px-5 py-3">Rates</th><th className="px-5 py-3">Active rates</th><th className="px-5 py-3">Success</th></tr></thead><tbody className="divide-y divide-gray-100">{couriers.map((row) => <tr key={row.code}><td className="px-5 py-4 font-semibold">{row.name}</td><td className="px-5 py-4">{row.apiStatus}</td><td className="px-5 py-4">{row.rates}</td><td className="px-5 py-4">{row.activeRates}</td><td className="px-5 py-4">{row.successRate}%</td></tr>)}</tbody></table></div></section>
            </div></div>
        </AdminLayout>
    );
}
