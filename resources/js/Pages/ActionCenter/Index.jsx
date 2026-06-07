import SellerLayout from '@/Layouts/SellerLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Bell, ClipboardList, PackageCheck, RotateCcw, ShieldAlert, Truck, Zap } from 'lucide-react';

function Stat({ label, value }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-950">{value}</p>
        </div>
    );
}

export default function Index({ stats, pickList, manifests, pickups, notifications, returnedShipments }) {
    const pickup = useForm({
        shipping_manifest_id: '',
        pickup_address: '',
        pickup_date: '',
        time_window: '12:00-18:00',
        notes: '',
    });

    const claim = useForm({
        shipment_id: returnedShipments[0]?.id ?? '',
        subject: '',
        message: '',
    });

    const submitPickup = (event) => {
        event.preventDefault();
        pickup.post(route('action-center.pickups.store'), {
            preserveScroll: true,
            onSuccess: () => pickup.reset('shipping_manifest_id', 'pickup_address', 'pickup_date', 'notes'),
        });
    };

    const submitClaim = (event) => {
        event.preventDefault();
        claim.post(route('action-center.claims.store'), {
            preserveScroll: true,
            onSuccess: () => claim.reset('subject', 'message'),
        });
    };

    const notifyBuyer = (shipment, eventType = 'returned') => {
        router.post(route('action-center.notifications.store', shipment.id), { event_type: eventType }, { preserveScroll: true });
    };

    const recoverStock = (shipment) => {
        router.post(route('action-center.returns.recover-stock', shipment.id), {}, { preserveScroll: true });
    };

    return (
        <SellerLayout>
            <Head title="Action Center" />

            <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                <section className="rounded-lg bg-gray-950 p-6 text-white">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase text-emerald-300">Seller operations</p>
                            <h1 className="mt-2 text-3xl font-bold">Action Center</h1>
                            <p className="mt-2 max-w-3xl text-sm text-gray-300">
                                Manage today&apos;s shipping work from one place: pickup requests, warehouse pick lists, return stock recovery, buyer updates, and claims.
                            </p>
                        </div>
                        <Link
                            href={route('orders.index')}
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-bold text-gray-950"
                        >
                            <ClipboardList className="h-4 w-4" />
                            Open orders
                        </Link>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Stat label="Pending orders" value={stats.pendingOrders} />
                    <Stat label="Ready to dispatch" value={stats.readyShipments} />
                    <Stat label="Returns to receive" value={stats.returnsToReceive} />
                    <Stat label="Open claims" value={stats.openClaims} />
                </section>

                <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-lg border border-gray-200 bg-white">
                        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                            <div>
                                <h2 className="font-bold text-gray-950">Warehouse pick list</h2>
                                <p className="text-sm text-gray-500">Products to pack from pending orders.</p>
                            </div>
                            <PackageCheck className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="divide-y divide-gray-100">
                            {pickList.length === 0 ? (
                                <p className="px-5 py-6 text-sm text-gray-500">No pending product picks right now.</p>
                            ) : (
                                pickList.map((item) => (
                                    <div key={item.sku} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                                        <div>
                                            <p className="font-semibold text-gray-950">{item.name}</p>
                                            <p className="text-sm text-gray-500">SKU {item.sku}</p>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <p className="text-lg font-bold text-gray-950">{item.quantity} pcs</p>
                                            <p className="text-sm text-gray-500">{item.orders} orders</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <form onSubmit={submitPickup} className="rounded-lg border border-gray-200 bg-white p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <Truck className="h-5 w-5 text-blue-600" />
                            <div>
                                <h2 className="font-bold text-gray-950">Request pickup</h2>
                                <p className="text-sm text-gray-500">Assign a courier pickup to a manifest.</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <select
                                value={pickup.data.shipping_manifest_id}
                                onChange={(event) => pickup.setData('shipping_manifest_id', event.target.value)}
                                className="w-full rounded-md border-gray-300 text-sm"
                                required
                            >
                                <option value="">Select manifest</option>
                                {manifests.map((manifest) => (
                                    <option key={manifest.id} value={manifest.id}>
                                        {manifest.manifest_number} · {manifest.shipments_count} shipments
                                    </option>
                                ))}
                            </select>
                            <input
                                type="date"
                                value={pickup.data.pickup_date}
                                onChange={(event) => pickup.setData('pickup_date', event.target.value)}
                                className="w-full rounded-md border-gray-300 text-sm"
                                required
                            />
                            <input
                                value={pickup.data.time_window}
                                onChange={(event) => pickup.setData('time_window', event.target.value)}
                                className="w-full rounded-md border-gray-300 text-sm"
                                placeholder="12:00-18:00"
                                required
                            />
                            <textarea
                                value={pickup.data.pickup_address}
                                onChange={(event) => pickup.setData('pickup_address', event.target.value)}
                                className="min-h-24 w-full rounded-md border-gray-300 text-sm"
                                placeholder="Pickup address"
                                required
                            />
                            <textarea
                                value={pickup.data.notes}
                                onChange={(event) => pickup.setData('notes', event.target.value)}
                                className="min-h-20 w-full rounded-md border-gray-300 text-sm"
                                placeholder="Optional notes"
                            />
                            <button
                                type="submit"
                                disabled={pickup.processing}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gray-950 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                            >
                                <Zap className="h-4 w-4" />
                                Create pickup request
                            </button>
                        </div>
                    </form>
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-lg border border-gray-200 bg-white">
                        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                            <div>
                                <h2 className="font-bold text-gray-950">Return stock recovery</h2>
                                <p className="text-sm text-gray-500">Receive returned stock back into inventory.</p>
                            </div>
                            <RotateCcw className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="divide-y divide-gray-100">
                            {returnedShipments.length === 0 ? (
                                <p className="px-5 py-6 text-sm text-gray-500">No unrecovered returned shipments.</p>
                            ) : (
                                returnedShipments.map((shipment) => (
                                    <div key={shipment.id} className="space-y-3 px-5 py-4">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <p className="font-semibold text-gray-950">{shipment.tracking_number}</p>
                                                <p className="text-sm text-gray-500">
                                                    {shipment.receiver_name} · {shipment.inventory_product?.sku ?? 'No SKU'} · {shipment.product_quantity} pcs
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => notifyBuyer(shipment)}
                                                    className="rounded-md border border-gray-300 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
                                                >
                                                    Notify
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => recoverStock(shipment)}
                                                    className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                                                >
                                                    Recover stock
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <form onSubmit={submitClaim} className="rounded-lg border border-gray-200 bg-white p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-red-600" />
                            <div>
                                <h2 className="font-bold text-gray-950">Courier claim</h2>
                                <p className="text-sm text-gray-500">Open a claim for damage, loss, or delay.</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <select
                                value={claim.data.shipment_id}
                                onChange={(event) => claim.setData('shipment_id', event.target.value)}
                                className="w-full rounded-md border-gray-300 text-sm"
                                required
                            >
                                <option value="">Select shipment</option>
                                {returnedShipments.map((shipment) => (
                                    <option key={shipment.id} value={shipment.id}>
                                        {shipment.tracking_number} · {shipment.receiver_name}
                                    </option>
                                ))}
                            </select>
                            <input
                                value={claim.data.subject}
                                onChange={(event) => claim.setData('subject', event.target.value)}
                                className="w-full rounded-md border-gray-300 text-sm"
                                placeholder="Claim subject"
                                required
                            />
                            <textarea
                                value={claim.data.message}
                                onChange={(event) => claim.setData('message', event.target.value)}
                                className="min-h-32 w-full rounded-md border-gray-300 text-sm"
                                placeholder="Explain the issue and expected resolution"
                                required
                            />
                            <button
                                type="submit"
                                disabled={claim.processing}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gray-950 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                            >
                                <ShieldAlert className="h-4 w-4" />
                                Open claim
                            </button>
                        </div>
                    </form>
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-lg border border-gray-200 bg-white">
                        <div className="border-b border-gray-200 px-5 py-4">
                            <h2 className="font-bold text-gray-950">Pickup requests</h2>
                            <p className="text-sm text-gray-500">Latest courier pickup activity.</p>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {pickups.length === 0 ? (
                                <p className="px-5 py-6 text-sm text-gray-500">No pickup requests yet.</p>
                            ) : (
                                pickups.map((item) => (
                                    <div key={item.id} className="px-5 py-4">
                                        <p className="font-semibold text-gray-950">{item.pickup_number}</p>
                                        <p className="text-sm text-gray-500">
                                            {item.manifest_number} · {item.pickup_date} · {item.time_window}
                                        </p>
                                        <p className="mt-1 inline-flex rounded-full bg-blue-50 px-2 py-1 text-xs font-bold capitalize text-blue-700">{item.status}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white">
                        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                            <div>
                                <h2 className="font-bold text-gray-950">Buyer notification log</h2>
                                <p className="text-sm text-gray-500">WhatsApp and SMS events queued from the portal.</p>
                            </div>
                            <Bell className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="divide-y divide-gray-100">
                            {notifications.length === 0 ? (
                                <p className="px-5 py-6 text-sm text-gray-500">No buyer notifications yet.</p>
                            ) : (
                                notifications.map((item) => (
                                    <div key={item.id} className="px-5 py-4">
                                        <p className="font-semibold text-gray-950">{item.event_type.replaceAll('_', ' ')}</p>
                                        <p className="text-sm text-gray-500">
                                            {item.channel.toUpperCase()} · {item.recipient_phone} · {item.tracking_number}
                                        </p>
                                        <p className="mt-1 inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-bold capitalize text-gray-700">{item.status}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </SellerLayout>
    );
}
