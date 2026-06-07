import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { RefreshCw, Search } from 'lucide-react';

function money(paisa) {
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format((paisa ?? 0) / 100);
}

function StatusForm({ shipment, statuses }) {
    const { data, setData, patch, processing } = useForm({ status: shipment.status, remarks: '' });

    return (
        <form onSubmit={(event) => { event.preventDefault(); patch(route('admin.shipments.status', shipment.id), { preserveScroll: true }); }} className="flex flex-col gap-2 sm:flex-row">
            <select value={data.status} onChange={(event) => setData('status', event.target.value)} className="rounded-md border-gray-300 text-xs">
                {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <input value={data.remarks} onChange={(event) => setData('remarks', event.target.value)} placeholder="Remarks" className="rounded-md border-gray-300 text-xs" />
            <button disabled={processing} className="rounded-md bg-gray-950 px-3 py-2 text-xs font-semibold text-white">Update</button>
        </form>
    );
}

export default function Index({ filters, couriers, statuses, shipments }) {
    const search = (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        router.get(route('admin.shipments.index'), Object.fromEntries(form.entries()), { preserveState: true });
    };

    const sync = (shipment) => router.post(route('admin.shipments.sync', shipment.id), {}, { preserveScroll: true });

    return (
        <AdminLayout header={<div><h2 className="text-xl font-semibold text-gray-950">Admin Shipment Operations</h2><p className="text-sm text-gray-500">Search, sync tracking, update statuses, and inspect courier/API state.</p></div>}>
            <Head title="Admin Shipments" />
            <div className="bg-gray-50 py-8">
                <div className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
                    <form onSubmit={search} className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_180px_180px_auto]">
                        <label className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2">
                            <Search className="h-4 w-4 text-gray-400" />
                            <input name="q" defaultValue={filters.q} placeholder="Tracking, AWB, receiver, phone" className="w-full border-0 p-0 text-sm focus:ring-0" />
                        </label>
                        <select name="status" defaultValue={filters.status} className="rounded-md border-gray-300 text-sm"><option value="">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select>
                        <select name="courier_id" defaultValue={filters.courier_id} className="rounded-md border-gray-300 text-sm"><option value="">All couriers</option>{couriers.map((courier) => <option key={courier.id} value={courier.id}>{courier.name}</option>)}</select>
                        <button className="rounded-md bg-gray-950 px-4 py-2 text-sm font-semibold text-white">Filter</button>
                    </form>

                    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-5 py-3">Shipment</th><th className="px-5 py-3">Seller</th><th className="px-5 py-3">Courier</th><th className="px-5 py-3">COD</th><th className="px-5 py-3">Status action</th><th className="px-5 py-3">Sync</th></tr></thead>
                                <tbody className="divide-y divide-gray-100">
                                    {shipments.data.map((shipment) => (
                                        <tr key={shipment.id}>
                                            <td className="px-5 py-4"><p className="font-semibold text-gray-950">{shipment.trackingNumber}</p><p className="text-xs text-gray-500">{shipment.receiver} | {shipment.phone} | {shipment.city}</p></td>
                                            <td className="px-5 py-4"><p>{shipment.seller}</p><p className="text-xs text-gray-500">{shipment.sellerEmail}</p></td>
                                            <td className="px-5 py-4"><p>{shipment.courier}</p><p className="text-xs text-gray-500">{shipment.externalAwb || 'No AWB'} | synced {shipment.apiSyncedAt || 'never'}</p></td>
                                            <td className="px-5 py-4 font-semibold">{money(shipment.codAmount)}</td>
                                            <td className="px-5 py-4"><StatusForm shipment={shipment} statuses={statuses} /></td>
                                            <td className="px-5 py-4"><button onClick={() => sync(shipment)} className="rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-50" title="Sync tracking"><RefreshCw className="h-4 w-4" /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </AdminLayout>
    );
}
