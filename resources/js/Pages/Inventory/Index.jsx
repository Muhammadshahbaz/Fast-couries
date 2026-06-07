import InputError from '@/Components/InputError';
import SellerLayout from '@/Layouts/SellerLayout';
import { Head, useForm } from '@inertiajs/react';
import { AlertTriangle, Boxes, Brain, CheckCircle2, PackagePlus, Pencil, Save, TrendingUp, Warehouse } from 'lucide-react';
import { useState } from 'react';

function Stat({ label, value, icon: Icon, tone }) {
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

function Field({ label, error, children }) {
    return (
        <label className="block">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <div className="mt-1">{children}</div>
            <InputError message={error} className="mt-2" />
        </label>
    );
}

function ProductRow({ product }) {
    const [editing, setEditing] = useState(false);
    const { data, setData, patch, processing, errors } = useForm({
        name: product.name,
        sku: product.sku,
        description: product.description ?? '',
        weight_grams: product.weightGrams,
        stock_on_hand: product.stockOnHand,
        low_stock_alert: product.lowStockAlert,
        is_active: product.isActive,
    });

    const submit = (event) => {
        event.preventDefault();
        patch(route('inventory.update', product.id), {
            preserveScroll: true,
            onSuccess: () => setEditing(false),
        });
    };

    if (editing) {
        return (
            <tr className="bg-cyan-50/50 align-top">
                <td colSpan="7" className="px-5 py-4">
                    <form onSubmit={submit} className="grid gap-4 lg:grid-cols-6">
                        <Field label="Product name" error={errors.name}>
                            <input className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                        </Field>
                        <Field label="SKU" error={errors.sku}>
                            <input className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.sku} onChange={(e) => setData('sku', e.target.value)} required />
                        </Field>
                        <Field label="Weight grams" error={errors.weight_grams}>
                            <input type="number" min="1" className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.weight_grams} onChange={(e) => setData('weight_grams', Number(e.target.value))} required />
                        </Field>
                        <Field label="Stock" error={errors.stock_on_hand}>
                            <input type="number" min="0" className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.stock_on_hand} onChange={(e) => setData('stock_on_hand', Number(e.target.value))} required />
                        </Field>
                        <Field label="Low stock alert" error={errors.low_stock_alert}>
                            <input type="number" min="0" className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.low_stock_alert} onChange={(e) => setData('low_stock_alert', Number(e.target.value))} required />
                        </Field>
                        <label className="flex items-end gap-2 pb-2 text-sm font-semibold text-gray-700">
                            <input type="checkbox" className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-600" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
                            Active
                        </label>
                        <div className="lg:col-span-5">
                            <Field label="Description" error={errors.description}>
                                <input className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.description} onChange={(e) => setData('description', e.target.value)} placeholder="Product notes for packing team" />
                            </Field>
                        </div>
                        <div className="flex items-end gap-2">
                            <button disabled={processing} className="inline-flex items-center gap-2 rounded-md bg-gray-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                                <Save className="h-4 w-4" />
                                Save
                            </button>
                            <button type="button" onClick={() => setEditing(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">
                                Cancel
                            </button>
                        </div>
                    </form>
                </td>
            </tr>
        );
    }

    return (
        <tr className="align-top">
            <td className="px-5 py-4">
                <p className="font-semibold text-gray-950">{product.name}</p>
                <p className="mt-1 text-xs text-gray-500">{product.description || 'No product notes'}</p>
            </td>
            <td className="px-5 py-4 text-gray-700">{product.sku}</td>
            <td className="px-5 py-4 text-gray-700">{product.weightGrams}g</td>
            <td className="px-5 py-4">
                <span className={`font-semibold ${product.isLowStock ? 'text-rose-700' : 'text-gray-950'}`}>{product.stockOnHand}</span>
                <span className="block text-xs text-gray-500">Alert at {product.lowStockAlert}</span>
            </td>
            <td className="px-5 py-4">
                {product.isLowStock ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-200">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Low stock
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Healthy
                    </span>
                )}
                {!product.isActive && <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">Inactive</span>}
            </td>
            <td className="px-5 py-4 text-gray-700">{product.shipmentsCount}</td>
            <td className="px-5 py-4 text-right">
                <button onClick={() => setEditing(true)} className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                </button>
            </td>
        </tr>
    );
}

function ForecastPanel({ forecast }) {
    const urgent = forecast.filter((item) => item.suggestedReorder > 0 || (item.daysOfStock !== null && item.daysOfStock <= 7));

    return (
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="rounded-md bg-cyan-50 p-2 text-cyan-700">
                        <Brain className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-950">Smart inventory forecast</h3>
                        <p className="text-sm text-gray-500">Demand, days of stock, and reorder suggestions from recent order history.</p>
                    </div>
                </div>
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {urgent.length} need attention
                </span>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
                {forecast.slice(0, 6).map((item) => (
                    <div key={item.id} className="rounded-md border border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-gray-950">{item.name}</p>
                                <p className="mt-1 text-xs font-medium text-gray-500">{item.sku}</p>
                            </div>
                            <span className={`rounded-full px-2 py-1 text-xs font-bold ${item.suggestedReorder > 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                {item.daysOfStock === null ? 'No demand' : `${item.daysOfStock} days`}
                            </span>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                            <div>
                                <p className="text-gray-500">30 days</p>
                                <p className="mt-1 font-bold text-gray-950">{item.unitsLast30Days}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Avg/day</p>
                                <p className="mt-1 font-bold text-gray-950">{item.dailyAverage}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Reorder</p>
                                <p className="mt-1 font-bold text-gray-950">{item.suggestedReorder}</p>
                            </div>
                        </div>
                        <p className="mt-3 text-xs leading-5 text-gray-600">{item.recommendation}</p>
                    </div>
                ))}
                {forecast.length === 0 && <p className="text-sm text-gray-500">Forecast will appear after products are added.</p>}
            </div>
        </section>
    );
}

export default function Index({ stats, products, forecast = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        sku: '',
        description: '',
        weight_grams: 500,
        stock_on_hand: 0,
        low_stock_alert: 5,
        is_active: true,
    });

    const submit = (event) => {
        event.preventDefault();
        post(route('inventory.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <SellerLayout
            header={<div><h2 className="text-xl font-semibold text-gray-950">Inventory</h2><p className="text-sm text-gray-500">Products, SKUs, stock levels, and low-stock alerts.</p></div>}
        >
            <Head title="Inventory" />

            <div className="bg-gray-50 py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <section className="rounded-lg bg-gray-950 p-6 text-white shadow-sm">
                        <p className="text-sm font-semibold uppercase text-cyan-300">Inventory Lite</p>
                        <h3 className="mt-2 text-3xl font-bold">Keep product stock connected to shipping.</h3>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">Add products once, use product weight during booking, reduce stock when a shipment is created, and see low-stock items before they become fulfillment problems.</p>
                    </section>

                    <section className="grid gap-4 md:grid-cols-4">
                        <Stat label="Products" value={stats.totalProducts} icon={Boxes} tone="bg-cyan-50 text-cyan-700" />
                        <Stat label="Active" value={stats.activeProducts} icon={CheckCircle2} tone="bg-emerald-50 text-emerald-700" />
                        <Stat label="Units in stock" value={stats.stockUnits} icon={Warehouse} tone="bg-indigo-50 text-indigo-700" />
                        <Stat label="Low stock" value={stats.lowStock} icon={AlertTriangle} tone="bg-rose-50 text-rose-700" />
                    </section>

                    <ForecastPanel forecast={forecast} />

                    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="mb-5 flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
                            <div>
                                <h3 className="text-base font-semibold text-gray-950">Add product</h3>
                                <p className="text-sm text-gray-500">Create SKU records for products you regularly ship.</p>
                            </div>
                            <PackagePlus className="h-5 w-5 text-gray-400" />
                        </div>
                        <form onSubmit={submit} className="grid gap-4 lg:grid-cols-6">
                            <Field label="Product name" error={errors.name}>
                                <input className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                            </Field>
                            <Field label="SKU" error={errors.sku}>
                                <input className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.sku} onChange={(e) => setData('sku', e.target.value)} placeholder="TSHIRT-BLK-M" required />
                            </Field>
                            <Field label="Weight grams" error={errors.weight_grams}>
                                <input type="number" min="1" className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.weight_grams} onChange={(e) => setData('weight_grams', Number(e.target.value))} required />
                            </Field>
                            <Field label="Stock" error={errors.stock_on_hand}>
                                <input type="number" min="0" className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.stock_on_hand} onChange={(e) => setData('stock_on_hand', Number(e.target.value))} required />
                            </Field>
                            <Field label="Low stock alert" error={errors.low_stock_alert}>
                                <input type="number" min="0" className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.low_stock_alert} onChange={(e) => setData('low_stock_alert', Number(e.target.value))} required />
                            </Field>
                            <label className="flex items-end gap-2 pb-2 text-sm font-semibold text-gray-700">
                                <input type="checkbox" className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-600" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
                                Active
                            </label>
                            <div className="lg:col-span-5">
                                <Field label="Description" error={errors.description}>
                                    <input className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.description} onChange={(e) => setData('description', e.target.value)} placeholder="Clothing, accessories, fragile item..." />
                                </Field>
                            </div>
                            <div className="flex items-end">
                                <button disabled={processing} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gray-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                                    <PackagePlus className="h-4 w-4" />
                                    Add product
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 p-5">
                            <h3 className="text-base font-semibold text-gray-950">Product inventory</h3>
                            <p className="mt-1 text-sm text-gray-500">Edit stock levels, weights, alerts, and active product status.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                    <tr>
                                        <th className="px-5 py-3">Product</th>
                                        <th className="px-5 py-3">SKU</th>
                                        <th className="px-5 py-3">Weight</th>
                                        <th className="px-5 py-3">Stock</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3">Shipments</th>
                                        <th className="px-5 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {products.map((product) => <ProductRow key={product.id} product={product} />)}
                                    {products.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="px-5 py-10 text-center text-sm text-gray-500">
                                                No products yet. Add your first SKU to start using inventory during booking.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </SellerLayout>
    );
}
