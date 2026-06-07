import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Activity, Braces, CheckCircle2, ChevronDown, KeyRound, Save, ShieldCheck, Truck, Upload, Webhook, XCircle } from 'lucide-react';
import { useState } from 'react';

function money(paisa) {
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format((paisa ?? 0) / 100);
}

function rupeesToPaisa(value) {
    return Math.round(Number(value || 0) * 100);
}

function paisaToRupees(value) {
    return Number(value || 0) / 100;
}

function CourierSettingsForm({ courier }) {
    const { data, setData, patch, processing } = useForm({
        api_status: courier.apiStatus,
        api_mode: courier.apiMode,
        api_credentials_status: courier.apiCredentialsStatus,
        country_scope: courier.countryScope,
        api_capabilities: {
            book: Boolean(courier.capabilities?.book),
            track: Boolean(courier.capabilities?.track),
            cancel: Boolean(courier.capabilities?.cancel),
            label: Boolean(courier.capabilities?.label),
            webhook: Boolean(courier.capabilities?.webhook),
            return_proof: Boolean(courier.capabilities?.return_proof),
        },
        base_success_rate: Number(courier.successRate),
        is_active: courier.active,
    });

    const submit = (event) => {
        event.preventDefault();
        patch(route('admin.couriers.update', courier.id), { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className="rounded-lg bg-gray-50 p-4">
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
                <label>
                    <span className="text-xs font-semibold text-gray-500">Health</span>
                    <select className="mt-1 w-full rounded-md border-gray-300 text-sm" value={data.api_status} onChange={(e) => setData('api_status', e.target.value)}>
                        <option value="sandbox">Sandbox</option>
                        <option value="connected">Connected</option>
                        <option value="down">Down</option>
                        <option value="disabled">Disabled</option>
                    </select>
                </label>
                <label>
                    <span className="text-xs font-semibold text-gray-500">Mode</span>
                    <select className="mt-1 w-full rounded-md border-gray-300 text-sm" value={data.api_mode} onChange={(e) => setData('api_mode', e.target.value)}>
                        <option value="sandbox">Sandbox</option>
                        <option value="production">Production</option>
                    </select>
                </label>
                <label>
                    <span className="text-xs font-semibold text-gray-500">Credentials</span>
                    <select className="mt-1 w-full rounded-md border-gray-300 text-sm" value={data.api_credentials_status} onChange={(e) => setData('api_credentials_status', e.target.value)}>
                        <option value="missing">Missing</option>
                        <option value="configured">Configured</option>
                        <option value="verified">Verified</option>
                    </select>
                </label>
                <label>
                    <span className="text-xs font-semibold text-gray-500">Scope</span>
                    <select className="mt-1 w-full rounded-md border-gray-300 text-sm" value={data.country_scope} onChange={(e) => setData('country_scope', e.target.value)}>
                        <option value="pakistan">Pakistan</option>
                        <option value="international">International</option>
                    </select>
                </label>
                <label>
                    <span className="text-xs font-semibold text-gray-500">Reliability %</span>
                    <input className="mt-1 w-full rounded-md border-gray-300 text-sm" type="number" min="0" max="100" step="0.01" value={data.base_success_rate} onChange={(e) => setData('base_success_rate', e.target.value)} />
                </label>
                <label className="flex items-center gap-2 pt-6 text-sm font-medium text-gray-700">
                    <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} className="rounded border-gray-300 text-cyan-700" />
                    Active
                </label>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {[
                    ['book', 'Book'],
                    ['track', 'Track'],
                    ['cancel', 'Cancel'],
                    ['label', 'Label'],
                    ['webhook', 'Webhook'],
                    ['return_proof', 'Return proof'],
                ].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                        <input
                            type="checkbox"
                            checked={data.api_capabilities[key]}
                            onChange={(e) => setData('api_capabilities', { ...data.api_capabilities, [key]: e.target.checked })}
                            className="rounded border-gray-300 text-cyan-700"
                        />
                        {label}
                    </label>
                ))}
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button disabled={processing} className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-950 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
                    <Save className="h-4 w-4" />
                    Save settings
                </button>
                <button
                    type="button"
                    onClick={() => router.post(route('admin.couriers.health-check', courier.id), {}, { preserveScroll: true })}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-white"
                >
                    <Activity className="h-4 w-4" />
                    Run health check
                </button>
            </div>
        </form>
    );
}

function IntegrationPanel({ courier }) {
    const integration = courier.integration ?? {};

    return (
        <div className="mt-5 space-y-4">
            <div className="grid gap-3 rounded-lg border border-cyan-100 bg-cyan-50 p-4 lg:grid-cols-4">
                {(integration.readiness ?? []).map((item) => (
                    <div key={item.label} className="rounded-md bg-white p-3 ring-1 ring-cyan-100">
                        <div className="flex items-center gap-2">
                            {item.done ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-amber-600" />}
                            <p className="text-xs font-bold uppercase text-gray-700">{item.label}</p>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-gray-600">{item.detail}</p>
                    </div>
                ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center gap-2">
                    <Webhook className="h-4 w-4 text-cyan-700" />
                    <h4 className="text-sm font-bold text-gray-950">Webhook endpoint</h4>
                </div>
                <p className="break-all rounded-md bg-gray-50 p-3 text-xs font-semibold text-gray-700">{courier.webhookUrl}</p>
                <p className="mt-2 text-xs text-gray-500">Courier partners should send status, rider attempts, return reason, and proof data here.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${courier.webhookSecretConfigured ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'}`}>
                        {courier.webhookSecretConfigured ? 'Secret configured' : 'Secret missing'}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-bold text-gray-700">
                        Last check {courier.lastApiHealthCheckAt ?? 'Not run'}
                    </span>
                </div>
                {courier.lastApiError && <p className="mt-3 rounded-md bg-rose-50 p-2 text-xs text-rose-700">{courier.lastApiError}</p>}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-cyan-700" />
                    <h4 className="text-sm font-bold text-gray-950">Required env keys</h4>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                    {courier.envKeys.map((key) => (
                        <span key={key} className="rounded-md bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">{key}</span>
                    ))}
                </div>
                <p className="mt-3 text-xs text-gray-500">Set these in `.env`, switch mode to production, then run health check before enabling sellers.</p>
            </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="mb-3 flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-cyan-700" />
                        <h4 className="text-sm font-bold text-gray-950">Credential status</h4>
                    </div>
                    <div className="space-y-2">
                        {(integration.requiredCredentials ?? []).map((key) => {
                            const missing = (integration.missingCredentials ?? []).includes(key);

                            return (
                                <div key={key} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-xs ring-1 ring-gray-200">
                                    <span className="font-semibold text-gray-700">{key}</span>
                                    <span className={`font-bold ${missing ? 'text-amber-700' : 'text-emerald-700'}`}>{missing ? 'Missing' : 'Set'}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="mb-3 flex items-center gap-2">
                        <Braces className="h-4 w-4 text-cyan-700" />
                        <h4 className="text-sm font-bold text-gray-950">Standard booking fields</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {(integration.standardFields ?? []).map((field) => (
                            <span key={field} className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">{field}</span>
                        ))}
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="mb-3 flex items-center gap-2">
                        <Webhook className="h-4 w-4 text-cyan-700" />
                        <h4 className="text-sm font-bold text-gray-950">Webhook events</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {(integration.webhookEvents ?? []).map((event) => (
                            <span key={event} className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">{event}</span>
                        ))}
                    </div>
                    <p className="mt-3 text-xs text-gray-500">
                        Adapter: {integration.productionAdapterReady ? 'production-ready' : 'sandbox-backed until courier API docs are mapped'}
                    </p>
                </div>
            </div>
        </div>
    );
}

function RateRow({ rate }) {
    const firstSlab = rate.rateSlabs?.[0] ?? {};
    const secondSlab = rate.rateSlabs?.[1] ?? {};
    const extraSlab = rate.rateSlabs?.find((slab) => slab.extra_kg_rate_paisa) ?? {};

    const { data, setData } = useForm({
        base_weight_grams: rate.baseWeightGrams,
        base_rate_paisa: rate.baseRatePaisa,
        additional_kg_rate_paisa: rate.additionalKgRatePaisa,
        our_fee_paisa: rate.ourFeePaisa,
        delivery_days_min: rate.deliveryDaysMin,
        delivery_days_max: rate.deliveryDaysMax,
        success_rate: Number(rate.successRate),
        is_active: rate.active,
        slab_one_upto_grams: firstSlab.upto_grams ?? rate.baseWeightGrams,
        slab_one_rate_rupees: paisaToRupees(firstSlab.rate_paisa ?? rate.baseRatePaisa),
        slab_two_upto_grams: secondSlab.upto_grams ?? 1000,
        slab_two_rate_rupees: paisaToRupees(secondSlab.rate_paisa ?? rate.baseRatePaisa),
        extra_kg_rate_rupees: paisaToRupees(extraSlab.extra_kg_rate_paisa ?? rate.additionalKgRatePaisa),
    });

    const submit = (event) => {
        event.preventDefault();
        router.patch(route('admin.rates.update', rate.id), {
            base_weight_grams: Number(data.base_weight_grams),
            base_rate_paisa: rupeesToPaisa(data.slab_one_rate_rupees),
            additional_kg_rate_paisa: rupeesToPaisa(data.extra_kg_rate_rupees),
            our_fee_paisa: Number(data.our_fee_paisa),
            delivery_days_min: Number(data.delivery_days_min),
            delivery_days_max: Number(data.delivery_days_max),
            success_rate: Number(data.success_rate),
            is_active: Boolean(data.is_active),
            rate_slabs: [
                { upto_grams: Number(data.slab_one_upto_grams), rate_paisa: rupeesToPaisa(data.slab_one_rate_rupees) },
                { upto_grams: Number(data.slab_two_upto_grams), rate_paisa: rupeesToPaisa(data.slab_two_rate_rupees) },
                { extra_kg_rate_paisa: rupeesToPaisa(data.extra_kg_rate_rupees) },
            ],
        }, { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className="grid gap-3 border-t border-gray-100 p-4 text-sm lg:grid-cols-[1fr_0.85fr_0.85fr_0.8fr_0.75fr_0.6fr_0.6fr_auto] lg:items-end">
            <div>
                <p className="font-semibold text-gray-950">{rate.city}</p>
                <p className="text-xs text-gray-500">{rate.province}</p>
            </div>
            <label>
                <span className="text-xs font-semibold text-gray-500">Slab 1 grams/rate</span>
                <div className="mt-1 grid grid-cols-2 gap-1">
                    <input className="rounded-md border-gray-300 text-sm" type="number" value={data.slab_one_upto_grams} onChange={(e) => setData('slab_one_upto_grams', e.target.value)} />
                    <input className="rounded-md border-gray-300 text-sm" type="number" step="0.01" value={data.slab_one_rate_rupees} onChange={(e) => setData('slab_one_rate_rupees', e.target.value)} />
                </div>
            </label>
            <label>
                <span className="text-xs font-semibold text-gray-500">Slab 2 grams/rate</span>
                <div className="mt-1 grid grid-cols-2 gap-1">
                    <input className="rounded-md border-gray-300 text-sm" type="number" value={data.slab_two_upto_grams} onChange={(e) => setData('slab_two_upto_grams', e.target.value)} />
                    <input className="rounded-md border-gray-300 text-sm" type="number" step="0.01" value={data.slab_two_rate_rupees} onChange={(e) => setData('slab_two_rate_rupees', e.target.value)} />
                </div>
            </label>
            <label>
                <span className="text-xs font-semibold text-gray-500">Extra kg Rs.</span>
                <input className="mt-1 w-full rounded-md border-gray-300 text-sm" type="number" step="0.01" value={data.extra_kg_rate_rupees} onChange={(e) => setData('extra_kg_rate_rupees', e.target.value)} />
            </label>
            <label>
                <span className="text-xs font-semibold text-gray-500">Days</span>
                <div className="mt-1 grid grid-cols-2 gap-1">
                    <input className="rounded-md border-gray-300 text-sm" type="number" value={data.delivery_days_min} onChange={(e) => setData('delivery_days_min', e.target.value)} />
                    <input className="rounded-md border-gray-300 text-sm" type="number" value={data.delivery_days_max} onChange={(e) => setData('delivery_days_max', e.target.value)} />
                </div>
            </label>
            <label>
                <span className="text-xs font-semibold text-gray-500">Success</span>
                <input className="mt-1 w-full rounded-md border-gray-300 text-sm" type="number" step="0.01" value={data.success_rate} onChange={(e) => setData('success_rate', e.target.value)} />
            </label>
            <label className="flex items-center gap-2 pb-2 text-xs font-semibold text-gray-600">
                <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} className="rounded border-gray-300 text-cyan-700" />
                Active
            </label>
            <button className="rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">Save rate</button>
        </form>
    );
}

function CourierCard({ courier }) {
    const [open, setOpen] = useState(false);

    return (
        <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between p-5 text-left">
                <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-md bg-cyan-50 text-cyan-700">
                        <Truck className="h-5 w-5" />
                    </span>
                    <div>
                        <h3 className="font-semibold text-gray-950">{courier.name}</h3>
                        <p className="text-sm text-gray-500">{courier.code} | {courier.apiMode} | {courier.apiStatus} | {courier.ratesCount} city rates | {courier.successRate}%</p>
                    </div>
                </div>
                <ChevronDown className={`h-5 w-5 text-gray-400 transition ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="border-t border-gray-100 p-5">
                    <CourierSettingsForm courier={courier} />
                    <IntegrationPanel courier={courier} />
                    <div className="mt-5 overflow-hidden rounded-lg border border-gray-200">
                        <div className="bg-gray-50 px-4 py-3 text-xs font-semibold uppercase text-gray-500">City rate slabs</div>
                        {courier.rates.map((rate) => <RateRow key={rate.id} rate={rate} />)}
                    </div>
                </div>
            )}
        </section>
    );
}

export default function Index({ couriers }) {
    const importForm = useForm({ rate_file: null });

    const importRates = (event) => {
        event.preventDefault();
        importForm.post(route('admin.rates.import'), { preserveScroll: true, forceFormData: true });
    };

    return (
        <AdminLayout header={<div><h2 className="text-xl font-semibold text-gray-950">Courier & Rate Management</h2><p className="text-sm text-gray-500">Manage courier health, active status, success rates, delivery days, and city-wise slabs.</p></div>}>
            <Head title="Courier Management" />
            <div className="bg-gray-50 py-8">
                <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-950">Bulk rate tools</p>
                            <p className="text-sm text-gray-500">Export current city rates or import updated courier slabs from CSV.</p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Link href={route('admin.rates.export')} className="inline-flex items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700">Export CSV</Link>
                            <form onSubmit={importRates} className="flex gap-2">
                                <input type="file" accept=".csv,text/csv" onChange={(event) => importForm.setData('rate_file', event.target.files[0])} className="max-w-52 rounded-md border border-gray-300 text-sm" />
                                <button disabled={importForm.processing || !importForm.data.rate_file} className="inline-flex items-center gap-2 rounded-md bg-gray-950 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
                                    <Upload className="h-4 w-4" />
                                    Import
                                </button>
                            </form>
                        </div>
                    </div>
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                        Rates are stored in paisa internally. Enter slab rates in rupees here, for example 248.99.
                    </div>
                    <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-900">
                        <div className="flex items-start gap-2">
                            <ShieldCheck className="mt-0.5 h-4 w-4" />
                            <p>Production setup: add courier credentials in `.env`, confirm capabilities, share the webhook URL with the courier, then run health check. Sellers will see reliability and API health while choosing couriers.</p>
                        </div>
                    </div>
                    {couriers.map((courier) => <CourierCard key={courier.id} courier={courier} />)}
                </div>
            </div>
        </AdminLayout>
    );
}
