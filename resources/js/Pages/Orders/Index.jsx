import InputError from '@/Components/InputError';
import SellerLayout from '@/Layouts/SellerLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, BadgeCheck, BarChart3, Brain, ClipboardCheck, ClipboardList, FileDown, FileUp, MapPinCheck, PackagePlus, Pencil, Save, Search, Sparkles, Truck } from 'lucide-react';
import { useMemo, useState } from 'react';

const statusClasses = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-200',
    packed: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
    shipped: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    returned: 'bg-rose-50 text-rose-700 ring-rose-200',
};

function money(paisa) {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        maximumFractionDigits: 0,
    }).format((paisa ?? 0) / 100);
}

function statusLabel(status) {
    return status.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function analyzeAddress({ address = '', area = '', phone = '', city = '', codAmount = 0 }) {
    const cleanAddress = address.trim().replace(/\s+/g, ' ');
    const lowerAddress = cleanAddress.toLowerCase();
    const phoneDigits = String(phone).replace(/\D/g, '');
    const wordCount = cleanAddress.split(/\s+/).filter(Boolean).length;
    const landmarkWords = ['house', 'flat', 'shop', 'office', 'building', 'block', 'street', 'road', 'near', 'main', 'floor', 'sector', 'phase', 'mohalla', 'town', 'market'];
    const issues = [];
    const recommendations = [];
    let score = 35;

    if (wordCount >= 6) score += 20;
    else issues.push('Add full house/shop, street, block, and landmark.');

    if (landmarkWords.some((word) => lowerAddress.includes(word))) score += 20;
    else issues.push('Add a landmark or street clue.');

    if (/\d/.test(cleanAddress)) score += 10;
    else issues.push('Add house, shop, street, block, or floor number.');

    if (area) score += 10;
    else issues.push('Add area or tehsil.');

    if (city && lowerAddress.includes(city.toLowerCase())) score += 5;
    if (phoneDigits.length >= 10) score += 10;
    else issues.push('Phone number looks incomplete.');

    if (codAmount >= 2000000) recommendations.push('High COD: confirm by call or WhatsApp before dispatch.');
    recommendations.push(issues.length === 0 ? 'Ready for dispatch.' : 'Fix address before handing to courier.');

    const boundedScore = Math.min(100, Math.max(0, score));
    const level = boundedScore >= 80 ? 'strong' : boundedScore >= 60 ? 'needs_review' : 'high_risk';

    return { score: boundedScore, level, issues, recommendations };
}

const addressLevelClasses = {
    strong: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    needs_review: 'bg-amber-50 text-amber-700 ring-amber-200',
    high_risk: 'bg-rose-50 text-rose-700 ring-rose-200',
};

function AddressScoreBadge({ score, level }) {
    if (score === null || score === undefined) return null;

    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${addressLevelClasses[level] ?? 'bg-gray-50 text-gray-700 ring-gray-200'}`}>
            <MapPinCheck className="h-3 w-3" />
            Address {score}%
        </span>
    );
}

function AddressPreview({ data, cityName }) {
    const analysis = analyzeAddress({
        address: data.customer_address,
        area: data.customer_area,
        phone: data.customer_phone,
        city: cityName,
        codAmount: Number(data.cod_amount_paisa || 0),
    });

    return (
        <div className={`rounded-md p-3 text-xs leading-5 ring-1 ring-inset ${addressLevelClasses[analysis.level] ?? 'bg-gray-50 text-gray-700 ring-gray-200'}`}>
            <div className="flex items-center justify-between gap-3">
                <span className="font-bold uppercase">Address verification</span>
                <span className="font-bold">{analysis.score}%</span>
            </div>
            <p className="mt-1">{analysis.recommendations[0]}</p>
            {analysis.issues.length > 0 && (
                <div className="mt-2 flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <p>{analysis.issues.slice(0, 2).join(' ')}</p>
                </div>
            )}
        </div>
    );
}

function Stat({ label, value, icon: Icon }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-950">{value}</p>
                </div>
                <div className="rounded-md bg-cyan-50 p-2 text-cyan-700">
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}

function OrdersChart({ charts }) {
    const maxDaily = Math.max(...charts.lastSevenDays.map((row) => row.orders), 1);
    const maxStatus = Math.max(...charts.status.map((row) => row.value), 1);

    return (
        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-gray-950">Order volume</h3>
                        <p className="text-sm text-gray-500">Last 7 days</p>
                    </div>
                    <BarChart3 className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex h-44 items-end gap-3">
                    {charts.lastSevenDays.map((row) => (
                        <div key={row.label} className="flex flex-1 flex-col items-center gap-2">
                            <div className="flex h-32 w-full items-end justify-center rounded-md bg-gray-50 p-2">
                                <div className="w-5 rounded-t bg-cyan-600" style={{ height: `${Math.max((row.orders / maxDaily) * 100, 8)}%` }} />
                            </div>
                            <span className="text-xs font-medium text-gray-500">{row.label}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-gray-950">Status mix</h3>
                <div className="mt-5 space-y-3">
                    {charts.status.map((row) => (
                        <div key={row.label}>
                            <div className="mb-1 flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-700">{row.label}</span>
                                <span className="text-gray-500">{row.value}</span>
                            </div>
                            <div className="h-2 rounded-full bg-gray-100">
                                <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${(row.value / maxStatus) * 100}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function TopSkus({ rows }) {
    return (
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-gray-950">Top SKUs by units ordered</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
                {rows.map((row) => (
                    <div key={row.sku} className="rounded-md border border-gray-200 bg-gray-50 p-4">
                        <p className="text-sm font-semibold text-gray-950">{row.sku}</p>
                        <p className="mt-1 truncate text-xs text-gray-500">{row.name}</p>
                        <p className="mt-3 text-2xl font-bold text-gray-950">{row.units}</p>
                    </div>
                ))}
                {rows.length === 0 && <p className="text-sm text-gray-500">SKU analytics will appear after orders are linked to inventory products.</p>}
            </div>
        </section>
    );
}

function Filters({ cities, products, filters }) {
    const [values, setValues] = useState(filters);

    const update = (key, value) => {
        const next = { ...values, [key]: value };
        setValues(next);
        router.get(route('orders.index'), next, { preserveState: true, preserveScroll: true });
    };

    return (
        <section className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_180px_180px_180px]">
            <label className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                    className="w-full border-0 p-0 text-sm focus:ring-0"
                    placeholder="Search order, customer, phone"
                    value={values.search ?? ''}
                    onChange={(event) => setValues((current) => ({ ...current, search: event.target.value }))}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') update('search', event.currentTarget.value);
                    }}
                />
            </label>
            <select className="rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={values.status} onChange={(event) => update('status', event.target.value)}>
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="packed">Packed</option>
                <option value="shipped">Shipped</option>
            </select>
            <select className="rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={values.city_id} onChange={(event) => update('city_id', event.target.value)}>
                <option value="all">All cities</option>
                {cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
            </select>
            <select className="rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={values.product_id} onChange={(event) => update('product_id', event.target.value)}>
                <option value="all">All SKUs</option>
                {products.map((product) => <option key={product.id} value={product.id}>{product.sku}</option>)}
            </select>
        </section>
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

function OrderForm({ cities, products, onDone }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        inventory_product_id: '',
        city_id: cities[0]?.id ?? '',
        customer_name: '',
        customer_phone: '',
        customer_address: '',
        customer_area: '',
        quantity: 1,
        cod_amount_paisa: 0,
        notes: '',
    });

    const selectedProduct = products.find((product) => String(product.id) === String(data.inventory_product_id));
    const selectedCity = cities.find((city) => String(city.id) === String(data.city_id));

    const submit = (event) => {
        event.preventDefault();
        post(route('orders.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onDone?.();
            },
        });
    };

    return (
        <form onSubmit={submit} className="grid gap-4 lg:grid-cols-6">
            <Field label="Customer name" error={errors.customer_name}>
                <input className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.customer_name} onChange={(e) => setData('customer_name', e.target.value)} required />
            </Field>
            <Field label="Customer phone" error={errors.customer_phone}>
                <input className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.customer_phone} onChange={(e) => setData('customer_phone', e.target.value)} placeholder="03001234567" required />
            </Field>
            <Field label="City" error={errors.city_id}>
                <select className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.city_id} onChange={(e) => setData('city_id', e.target.value)} required>
                    {cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
                </select>
            </Field>
            <Field label="Product/SKU" error={errors.inventory_product_id}>
                <select className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.inventory_product_id} onChange={(e) => setData('inventory_product_id', e.target.value)}>
                    <option value="">No product selected</option>
                    {products.map((product) => <option key={product.id} value={product.id}>{product.name} | {product.sku} | {product.stock_on_hand} stock</option>)}
                </select>
            </Field>
            <Field label="Quantity" error={errors.quantity}>
                <input type="number" min="1" className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.quantity} onChange={(e) => setData('quantity', Number(e.target.value))} required />
            </Field>
            <Field label="COD amount" error={errors.cod_amount_paisa}>
                <input type="number" min="0" className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.cod_amount_paisa / 100} onChange={(e) => setData('cod_amount_paisa', Math.round(Number(e.target.value || 0) * 100))} />
            </Field>
            <div className="lg:col-span-3">
                <Field label="Customer address" error={errors.customer_address}>
                    <textarea className="min-h-24 w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.customer_address} onChange={(e) => setData('customer_address', e.target.value)} required />
                </Field>
            </div>
            <Field label="Area/tehsil" error={errors.customer_area}>
                <input className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.customer_area} onChange={(e) => setData('customer_area', e.target.value)} />
            </Field>
            <div className="lg:col-span-2">
                <Field label="Order notes" error={errors.notes}>
                    <input className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.notes} onChange={(e) => setData('notes', e.target.value)} placeholder="Packing or customer instructions" />
                </Field>
            </div>
            <div className="lg:col-span-5">
                {selectedProduct ? (
                    <p className="rounded-md bg-cyan-50 p-3 text-xs leading-5 text-cyan-800">
                        {selectedProduct.name} weighs {selectedProduct.weight_grams}g per unit. Available stock: <span className="font-bold">{selectedProduct.stock_on_hand}</span>.
                    </p>
                ) : (
                    <p className="rounded-md bg-gray-50 p-3 text-xs leading-5 text-gray-500">
                        Optional: link a product so stock can reduce automatically when this order is shipped.
                    </p>
                )}
            </div>
            <div className="lg:col-span-5">
                <AddressPreview data={data} cityName={selectedCity?.name ?? ''} />
            </div>
            <div className="flex items-end">
                <button disabled={processing} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gray-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                    <PackagePlus className="h-4 w-4" />
                    Add order
                </button>
            </div>
        </form>
    );
}

function ImportOrdersPanel() {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        orders_csv: null,
    });

    const submit = (event) => {
        event.preventDefault();
        post(route('orders.import'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 border-b border-gray-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h3 className="text-base font-semibold text-gray-950">Bulk order import</h3>
                    <p className="text-sm text-gray-500">Upload a CSV for Instagram, WhatsApp, marketplace, or spreadsheet orders.</p>
                </div>
                <a href={route('orders.import.template')} className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                    <FileDown className="h-4 w-4" />
                    Template
                </a>
            </div>

            <form onSubmit={submit} className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                <Field label="CSV file" error={errors.orders_csv}>
                    <input
                        type="file"
                        accept=".csv,text/csv"
                        className="block w-full rounded-md border border-gray-300 text-sm text-gray-700 file:mr-4 file:border-0 file:bg-gray-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white focus:border-cyan-600 focus:ring-cyan-600"
                        onChange={(e) => setData('orders_csv', e.target.files?.[0] ?? null)}
                    />
                </Field>
                <button disabled={processing || !data.orders_csv} className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                    <FileUp className="h-4 w-4" />
                    Import CSV
                </button>
            </form>

            <div className="mt-4 rounded-md bg-gray-50 p-3 text-xs leading-5 text-gray-600">
                Required columns: customer_name, customer_phone, customer_address, city, sku, quantity, cod_amount. Optional: notes.
            </div>

            <div className="mt-4 grid gap-3 rounded-lg border border-cyan-100 bg-cyan-50 p-4 md:grid-cols-3">
                <div className="flex items-start gap-2">
                    <Brain className="mt-0.5 h-4 w-4 text-cyan-700" />
                    <div>
                        <p className="text-xs font-bold uppercase text-cyan-900">Import cleaner</p>
                        <p className="mt-1 text-xs leading-5 text-cyan-800">Rows are checked for missing phones, weak addresses, city mismatch, SKU lookup, quantity, COD, and stock availability.</p>
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <ClipboardCheck className="mt-0.5 h-4 w-4 text-cyan-700" />
                    <div>
                        <p className="text-xs font-bold uppercase text-cyan-900">Before shipping</p>
                        <p className="mt-1 text-xs leading-5 text-cyan-800">Invalid rows are skipped with row numbers so the team can correct data without blocking clean orders.</p>
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-4 w-4 text-cyan-700" />
                    <div>
                        <p className="text-xs font-bold uppercase text-cyan-900">Next upgrade</p>
                        <p className="mt-1 text-xs leading-5 text-cyan-800">Connect marketplace files to auto-map columns from Shopify, WooCommerce, Daraz, Instagram, and WhatsApp exports.</p>
                    </div>
                </div>
            </div>

            {flash?.importResult && (
                <div className="mt-4 rounded-lg border border-cyan-100 bg-cyan-50 p-4">
                    <p className="text-sm font-semibold text-cyan-950">
                        Import complete: {flash.importResult.created} created, {flash.importResult.skipped} skipped.
                    </p>
                    {flash.importResult.errors?.length > 0 && (
                        <div className="mt-3 space-y-2">
                            <p className="text-xs font-semibold uppercase text-cyan-900">Rows to fix</p>
                            {flash.importResult.errors.map((error) => (
                                <p key={`${error.row}-${error.message}`} className="rounded-md bg-white px-3 py-2 text-xs text-rose-700">
                                    Row {error.row}: {error.message}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}

function EditableOrder({ order, cities, products, selected, onToggle }) {
    const [editing, setEditing] = useState(false);
    const { data, setData, patch, processing, errors } = useForm({
        inventory_product_id: order.product?.id ?? '',
        city_id: order.cityId ?? cities[0]?.id ?? '',
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
        customer_address: order.customerAddress,
        customer_area: order.customerArea ?? '',
        quantity: order.quantity,
        cod_amount_paisa: order.codAmount,
        notes: order.notes ?? '',
    });
    const selectedCity = cities.find((city) => String(city.id) === String(data.city_id));

    if (editing) {
        const submit = (event) => {
            event.preventDefault();
            patch(route('orders.update', order.id), {
                preserveScroll: true,
                onSuccess: () => setEditing(false),
            });
        };

        return (
            <tr className="bg-cyan-50/40">
                <td colSpan="9" className="px-5 py-4">
                    <form onSubmit={submit} className="rounded-md border border-cyan-100 bg-white p-4">
                        <p className="mb-4 text-sm font-semibold text-gray-950">Editing {order.orderNumber}</p>
                        <div className="grid gap-4 lg:grid-cols-6">
                            <Field label="Customer name" error={errors.customer_name}>
                                <input className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.customer_name} onChange={(e) => setData('customer_name', e.target.value)} required />
                            </Field>
                            <Field label="Customer phone" error={errors.customer_phone}>
                                <input className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.customer_phone} onChange={(e) => setData('customer_phone', e.target.value)} required />
                            </Field>
                            <Field label="City" error={errors.city_id}>
                                <select className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.city_id} onChange={(e) => setData('city_id', e.target.value)} required>
                                    {cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
                                </select>
                            </Field>
                            <Field label="Product/SKU" error={errors.inventory_product_id}>
                                <select className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.inventory_product_id} onChange={(e) => setData('inventory_product_id', e.target.value)}>
                                    <option value="">No product selected</option>
                                    {products.map((product) => <option key={product.id} value={product.id}>{product.name} | {product.sku}</option>)}
                                </select>
                            </Field>
                            <Field label="Quantity" error={errors.quantity}>
                                <input type="number" min="1" className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.quantity} onChange={(e) => setData('quantity', Number(e.target.value))} required />
                            </Field>
                            <Field label="COD amount" error={errors.cod_amount_paisa}>
                                <input type="number" min="0" className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.cod_amount_paisa / 100} onChange={(e) => setData('cod_amount_paisa', Math.round(Number(e.target.value || 0) * 100))} />
                            </Field>
                            <div className="lg:col-span-3">
                                <Field label="Customer address" error={errors.customer_address}>
                                    <textarea className="min-h-20 w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.customer_address} onChange={(e) => setData('customer_address', e.target.value)} required />
                                </Field>
                            </div>
                            <Field label="Area/tehsil" error={errors.customer_area}>
                                <input className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.customer_area} onChange={(e) => setData('customer_area', e.target.value)} />
                            </Field>
                            <div className="lg:col-span-2">
                                <Field label="Order notes" error={errors.notes}>
                                    <input className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
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
                            <div className="lg:col-span-6">
                                <AddressPreview data={data} cityName={selectedCity?.name ?? ''} />
                            </div>
                        </div>
                    </form>
                </td>
            </tr>
        );
    }

    const ship = () => router.post(route('orders.shipment.store', order.id), {}, { preserveScroll: true });

    return (
        <tr className="align-top">
            <td className="px-5 py-4">
                {!order.shipment && (
                    <input type="checkbox" className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-600" checked={selected} onChange={() => onToggle(order.id)} />
                )}
            </td>
            <td className="px-5 py-4">
                <p className="font-semibold text-gray-950">{order.orderNumber}</p>
                <p className="mt-1 text-xs text-gray-500">{order.createdAt}</p>
            </td>
            <td className="px-5 py-4">
                <p className="font-medium text-gray-900">{order.customerName}</p>
                <p className="mt-1 text-xs text-gray-500">{order.customerPhone} | {order.city}</p>
                <div className="mt-2">
                    <AddressScoreBadge score={order.addressScore} level={order.addressVerificationLevel} />
                </div>
            </td>
            <td className="px-5 py-4">
                <p className="font-medium text-gray-900">{order.product?.name ?? 'Manual order'}</p>
                <p className="mt-1 text-xs text-gray-500">{order.product?.sku ?? 'No SKU'} | Qty {order.quantity}</p>
            </td>
            <td className="px-5 py-4 font-semibold text-gray-900">{money(order.codAmount)}</td>
            <td className="px-5 py-4">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClasses[order.status] ?? 'bg-gray-50 text-gray-700 ring-gray-200'}`}>
                    {statusLabel(order.status)}
                </span>
            </td>
            <td className="px-5 py-4">
                {order.shipment ? (
                    <Link href={route('shipments.show', order.shipment.id)} className="font-semibold text-cyan-800 hover:text-cyan-950">{order.shipment.trackingNumber}</Link>
                ) : (
                    <span className="text-sm text-gray-500">Not shipped</span>
                )}
            </td>
            <td className="px-5 py-4 text-gray-600">{order.notes || '-'}</td>
            <td className="px-5 py-4">
                <div className="flex flex-wrap gap-2">
                    {!order.shipment && (
                        <button onClick={ship} className="inline-flex items-center gap-2 rounded-md bg-gray-950 px-3 py-2 text-xs font-semibold text-white">
                            <Truck className="h-3.5 w-3.5" />
                            Ship
                        </button>
                    )}
                    {!order.shipment && (
                        <button onClick={() => setEditing(true)} className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700">
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}

export default function Index({ stats, charts, filters, orders, cities, products }) {
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const selectableOrderIds = useMemo(() => orders.data.filter((order) => !order.shipment && ['pending', 'packed'].includes(order.status)).map((order) => order.id), [orders.data]);

    const toggleOrder = (orderId) => {
        setSelectedOrderIds((current) => current.includes(orderId) ? current.filter((id) => id !== orderId) : [...current, orderId]);
    };

    const toggleAll = () => {
        setSelectedOrderIds((current) => current.length === selectableOrderIds.length ? [] : selectableOrderIds);
    };

    const batchShip = () => {
        router.post(route('orders.batch-shipment.store'), { order_ids: selectedOrderIds }, { preserveScroll: true });
    };

    return (
        <SellerLayout header={<div><h2 className="text-xl font-semibold text-gray-950">Orders</h2><p className="text-sm text-gray-500">Create customer orders, link SKUs, then ship in one click.</p></div>}>
            <Head title="Orders" />

            <div className="bg-gray-50 py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <section className="rounded-lg bg-gray-950 p-6 text-white shadow-sm">
                        <p className="text-sm font-semibold uppercase text-cyan-300">Orders Lite</p>
                        <h3 className="mt-2 text-3xl font-bold">Turn customer orders into courier shipments.</h3>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">Create orders with customer, city, COD, and SKU details. When ready, ship the order and Fast Couriers chooses the best available courier rate.</p>
                    </section>

                    <section className="grid gap-4 md:grid-cols-5">
                        <Stat label="Pending" value={stats.pending} icon={ClipboardList} />
                        <Stat label="Packed" value={stats.packed} icon={PackagePlus} />
                        <Stat label="Shipped" value={stats.shipped} icon={Truck} />
                        <Stat label="COD pending" value={money(stats.codPending)} icon={BadgeCheck} />
                        <Stat label="Address risk" value={stats.addressRisk} icon={MapPinCheck} />
                    </section>

                    <OrdersChart charts={charts} />
                    <TopSkus rows={charts.topSkus} />
                    <Filters cities={cities} products={products} filters={filters} />

                    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
                            <div>
                                <h3 className="text-base font-semibold text-gray-950">Add order</h3>
                                <p className="text-sm text-gray-500">Capture customer and product details before courier booking.</p>
                            </div>
                            <ClipboardList className="h-5 w-5 text-gray-400" />
                        </div>
                        <OrderForm cities={cities} products={products} />
                    </section>

                    <ImportOrdersPanel />

                    <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-gray-200 p-5 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-gray-950">Order queue</h3>
                                <p className="mt-1 text-sm text-gray-500">Select pending orders, batch ship, print manifest, and open linked tracking pages.</p>
                            </div>
                            <button disabled={selectedOrderIds.length === 0} onClick={batchShip} className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                                <Truck className="h-4 w-4" />
                                Batch ship {selectedOrderIds.length > 0 ? `(${selectedOrderIds.length})` : ''}
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                    <tr>
                                        <th className="px-5 py-3">
                                            <input type="checkbox" className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-600" checked={selectableOrderIds.length > 0 && selectedOrderIds.length === selectableOrderIds.length} onChange={toggleAll} />
                                        </th>
                                        <th className="px-5 py-3">Order</th>
                                        <th className="px-5 py-3">Customer</th>
                                        <th className="px-5 py-3">Product</th>
                                        <th className="px-5 py-3">COD</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3">Shipment</th>
                                        <th className="px-5 py-3">Notes</th>
                                        <th className="px-5 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orders.data.map((order) => (
                                        <EditableOrder
                                            key={order.id}
                                            order={order}
                                            cities={cities}
                                            products={products}
                                            selected={selectedOrderIds.includes(order.id)}
                                            onToggle={toggleOrder}
                                        />
                                    ))}
                                    {orders.data.length === 0 && (
                                        <tr>
                                            <td colSpan="9" className="px-5 py-10 text-center text-sm text-gray-500">No orders yet. Add your first customer order above.</td>
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
