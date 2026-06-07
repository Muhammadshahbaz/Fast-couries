import SellerLayout from '@/Layouts/SellerLayout';
import { Head, useForm } from '@inertiajs/react';
import { MapPin, Phone, Plus, Users } from 'lucide-react';

export default function Index({ customers, cities }) {
    const form = useForm({
        name: '',
        phone: '',
        city_id: cities[0]?.id ?? '',
        area: '',
        address: '',
    });

    const submit = (event) => {
        event.preventDefault();
        form.post(route('customers.store'), {
            preserveScroll: true,
            onSuccess: () => form.reset('name', 'phone', 'area', 'address'),
        });
    };

    return (
        <SellerLayout header={<div><h2 className="text-xl font-semibold text-gray-950">Customers</h2><p className="text-sm text-gray-500">Reusable buyer addresses for faster, cleaner bookings.</p></div>}>
            <Head title="Customers" />

            <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase text-blue-600">Customer address book</p>
                            <h1 className="mt-2 text-3xl font-bold text-gray-950">Repeat buyers, faster bookings</h1>
                            <p className="mt-2 max-w-3xl text-sm text-gray-600">
                                Save customer details once and reuse the correct phone, city, area, and delivery address during order creation.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg bg-gray-950 px-4 py-3 text-white">
                            <Users className="h-5 w-5" />
                            <div>
                                <p className="text-xs text-gray-300">Saved customers</p>
                                <p className="text-xl font-bold">{customers.length}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                    <form onSubmit={submit} className="rounded-lg border border-gray-200 bg-white p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <Plus className="h-5 w-5 text-emerald-600" />
                            <h2 className="font-bold text-gray-950">Add customer</h2>
                        </div>
                        <div className="space-y-3">
                            <input
                                value={form.data.name}
                                onChange={(event) => form.setData('name', event.target.value)}
                                className="w-full rounded-md border-gray-300 text-sm"
                                placeholder="Customer name"
                                required
                            />
                            <input
                                value={form.data.phone}
                                onChange={(event) => form.setData('phone', event.target.value)}
                                className="w-full rounded-md border-gray-300 text-sm"
                                placeholder="Phone number"
                                required
                            />
                            <select
                                value={form.data.city_id}
                                onChange={(event) => form.setData('city_id', event.target.value)}
                                className="w-full rounded-md border-gray-300 text-sm"
                                required
                            >
                                {cities.map((city) => (
                                    <option key={city.id} value={city.id}>
                                        {city.name}
                                    </option>
                                ))}
                            </select>
                            <input
                                value={form.data.area}
                                onChange={(event) => form.setData('area', event.target.value)}
                                className="w-full rounded-md border-gray-300 text-sm"
                                placeholder="Area or landmark"
                            />
                            <textarea
                                value={form.data.address}
                                onChange={(event) => form.setData('address', event.target.value)}
                                className="min-h-28 w-full rounded-md border-gray-300 text-sm"
                                placeholder="Full delivery address"
                                required
                            />
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gray-950 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                            >
                                <Plus className="h-4 w-4" />
                                Save customer
                            </button>
                        </div>
                    </form>

                    <div className="rounded-lg border border-gray-200 bg-white">
                        <div className="border-b border-gray-200 px-5 py-4">
                            <h2 className="font-bold text-gray-950">Address book</h2>
                            <p className="text-sm text-gray-500">Customers with city, delivery area, and order history.</p>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {customers.length === 0 ? (
                                <p className="px-5 py-6 text-sm text-gray-500">No saved customers yet.</p>
                            ) : (
                                customers.map((customer) => (
                                    <div key={customer.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto]">
                                        <div>
                                            <p className="font-semibold text-gray-950">{customer.name}</p>
                                            <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                                                <Phone className="h-4 w-4" />
                                                {customer.phone}
                                            </p>
                                            <p className="mt-1 flex items-start gap-2 text-sm text-gray-500">
                                                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                                                <span>
                                                    {customer.address}
                                                    {customer.area ? `, ${customer.area}` : ''}, {customer.city}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="text-left md:text-right">
                                            <p className="text-sm font-bold text-gray-950">{customer.orders_count} orders</p>
                                            <p className="text-xs text-gray-500">{customer.last_order_at ?? 'No order yet'}</p>
                                        </div>
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
