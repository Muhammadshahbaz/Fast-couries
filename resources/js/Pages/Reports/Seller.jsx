import SellerLayout from '@/Layouts/SellerLayout';
import { Head } from '@inertiajs/react';
import { BarChart3, CircleDollarSign, PackageCheck, RotateCcw, Truck } from 'lucide-react';

function money(paisa) {
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format((paisa ?? 0) / 100);
}

function Stat({ label, value, icon: Icon }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-gray-500">{label}</p>
                    <p className="mt-2 text-2xl font-bold text-gray-950">{value}</p>
                </div>
                <span className="rounded-md bg-cyan-50 p-2 text-cyan-700"><Icon className="h-5 w-5" /></span>
            </div>
        </div>
    );
}

export default function Seller({ summary, byCourier }) {
    return (
        <SellerLayout header={<div><h2 className="text-xl font-semibold text-gray-950">Reports</h2><p className="text-sm text-gray-500">Delivery, return, COD, and courier performance.</p></div>}>
            <Head title="Seller Reports" />
            <div className="bg-gray-50 py-8"><div className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
                <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-bold uppercase text-cyan-700">Performance snapshot</p>
                    <h1 className="mt-2 text-2xl font-bold text-gray-950">Delivery, returns, and COD health</h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">Use this report to compare courier results and understand whether COD and returns are moving in the right direction.</p>
                </section>
                <div className="grid gap-4 md:grid-cols-5"><Stat icon={Truck} label="Booked" value={summary.booked} /><Stat icon={PackageCheck} label="Delivered" value={summary.delivered} /><Stat icon={RotateCcw} label="Returned" value={summary.returned} /><Stat icon={CircleDollarSign} label="Gross COD" value={money(summary.grossCod)} /><Stat icon={CircleDollarSign} label="Paid COD" value={money(summary.paidCod)} /></div>
                <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-100 p-5"><div><h3 className="font-semibold text-gray-950">Courier performance</h3><p className="text-sm text-gray-500">Booked, delivered, and returned parcel counts by courier.</p></div><BarChart3 className="h-5 w-5 text-gray-400" /></div>
                    <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-5 py-3">Courier</th><th className="px-5 py-3">Total</th><th className="px-5 py-3">Delivered</th><th className="px-5 py-3">Returned</th></tr></thead><tbody className="divide-y divide-gray-100">{byCourier.map((row) => <tr key={row.name}><td className="px-5 py-4 font-semibold">{row.name}</td><td className="px-5 py-4">{row.total}</td><td className="px-5 py-4">{row.delivered}</td><td className="px-5 py-4">{row.returned}</td></tr>)}</tbody></table></div>
                </section>
            </div></div>
        </SellerLayout>
    );
}
