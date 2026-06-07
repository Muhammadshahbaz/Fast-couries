import InputError from '@/Components/InputError';
import SellerLayout from '@/Layouts/SellerLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { BadgeCheck, Brain, CheckCircle2, CircleDollarSign, Clock3, MapPinned, MessageSquareText, PackagePlus, Search, ShieldAlert, Sparkles, Truck, Wifi } from 'lucide-react';
import { useEffect, useMemo } from 'react';

function money(paisa) {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        maximumFractionDigits: 0,
    }).format((paisa ?? 0) / 100);
}

function chargeForRate(rate, weightGrams) {
    if (rate.rateSlabs?.length) {
        return chargeFromSlabs(rate.rateSlabs, Number(weightGrams || 0));
    }

    const extraGrams = Math.max(Number(weightGrams || 0) - rate.baseWeightGrams, 0);
    const extraKgUnits = Math.ceil(extraGrams / 1000);

    return rate.baseRatePaisa + extraKgUnits * rate.additionalKgRatePaisa;
}

function chargeFromSlabs(slabs, weightGrams) {
    const fixedSlab = slabs.find((slab) => slab.upto_grams && weightGrams <= slab.upto_grams);

    if (fixedSlab) {
        return fixedSlab.rate_paisa;
    }

    const fixedSlabs = slabs
        .filter((slab) => slab.upto_grams && slab.rate_paisa)
        .sort((a, b) => a.upto_grams - b.upto_grams);
    const lastFixedSlab = fixedSlabs[fixedSlabs.length - 1];
    const extraKgRate = slabs.find((slab) => slab.extra_kg_rate_paisa)?.extra_kg_rate_paisa ?? 0;

    if (!lastFixedSlab || !extraKgRate) {
        return 0;
    }

    const extraGrams = Math.max(weightGrams - lastFixedSlab.upto_grams, 0);
    const extraKgUnits = Math.ceil(extraGrams / 1000);

    return lastFixedSlab.rate_paisa + extraKgUnits * extraKgRate;
}

function slabLabel(rate) {
    if (!rate.rateSlabs?.length) {
        return `Base ${rate.baseWeightGrams}g`;
    }

    const fixed = rate.rateSlabs
        .filter((slab) => slab.upto_grams && slab.rate_paisa)
        .map((slab) => `${slab.upto_grams / 1000}kg ${money(slab.rate_paisa)}`)
        .join(' | ');
    const extra = rate.rateSlabs.find((slab) => slab.extra_kg_rate_paisa);

    return extra ? `${fixed} | Extra kg ${money(extra.extra_kg_rate_paisa)}` : fixed;
}

function apiTone(status) {
    if (status === 'connected') {
        return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
    }

    if (status === 'down' || status === 'disabled') {
        return 'bg-rose-50 text-rose-700 ring-rose-200';
    }

    return 'bg-amber-50 text-amber-700 ring-amber-200';
}

function analyzeAddress(data, selectedCity) {
    const address = `${data.receiver_address ?? ''} ${data.receiver_area ?? ''}`.trim();
    const words = address.split(/\s+/).filter(Boolean);
    const issues = [];
    let score = 35;

    if (words.length >= 6) score += 20; else issues.push('Address is too short.');
    if (/\b(house|flat|shop|office|building|block|street|road|near|main|floor|sector|phase|mohalla)\b/i.test(address)) score += 20; else issues.push('Add house/shop, street, road, block, or nearby landmark.');
    if (/\d/.test(address)) score += 10; else issues.push('Add house, shop, plot, or street number.');
    if (data.receiver_area) score += 10; else issues.push('Area/tehsil improves courier routing.');
    if (selectedCity?.name && address.toLowerCase().includes(selectedCity.name.toLowerCase())) score += 5;
    if ((data.receiver_phone ?? '').replace(/\D/g, '').length >= 10) score += 10; else issues.push('Phone number looks incomplete.');

    const finalScore = Math.min(score, 100);

    return {
        score: finalScore,
        level: finalScore >= 80 ? 'Strong' : finalScore >= 60 ? 'Needs review' : 'High risk',
        issues: issues.slice(0, 3),
    };
}

function calculateReturnRisk(data, selectedRate, addressScore) {
    const reasons = [];
    let score = 18;
    const codRupees = Number(data.cod_amount_paisa || 0) / 100;

    if (codRupees >= 15000) {
        score += 25;
        reasons.push('High COD amount should be confirmed before dispatch.');
    } else if (codRupees >= 7000) {
        score += 12;
        reasons.push('Medium COD amount: confirmation message recommended.');
    }

    if (addressScore.score < 60) {
        score += 25;
        reasons.push('Address needs more detail before booking.');
    }

    if (selectedRate?.reliabilityScore < 80) {
        score += 12;
        reasons.push('Selected courier has lower reliability in this lane.');
    }

    if (!data.special_instructions && Number(data.cod_amount_paisa) > 0) {
        score += 8;
        reasons.push('Add instruction like call before delivery.');
    }

    const finalScore = Math.min(score, 100);

    return {
        score: finalScore,
        level: finalScore >= 65 ? 'High' : finalScore >= 40 ? 'Medium' : 'Low',
        reasons: reasons.length ? reasons : ['No major delivery risk detected.'],
    };
}

function buyerMessage(data, selectedCity, selectedRate) {
    const amount = money(data.cod_amount_paisa);
    const courier = selectedRate?.courier ?? 'our courier partner';
    const city = selectedCity?.name ?? 'your city';

    return `Assalam o Alaikum ${data.receiver_name || 'Dear Customer'}, your parcel for ${amount} is ready for dispatch via ${courier} to ${city}. Please confirm your complete address and keep your phone available for the rider.`;
}

function AiBookingAssistant({ data, selectedCity, selectedRate, recommendedRate }) {
    const address = analyzeAddress(data, selectedCity);
    const risk = calculateReturnRisk(data, selectedRate, address);
    const recommendationReason = recommendedRate
        ? `${recommendedRate.courier} is suggested on this lane because it balances ${money(recommendedRate.totalCharge)} total charge with ${recommendedRate.reliabilityScore}% reliability.`
        : 'Courier recommendation will appear after rates are available.';

    return (
        <div className="rounded-lg border border-cyan-100 bg-cyan-50/60 p-5 shadow-sm">
            <div className="mb-4 flex items-start gap-3">
                <div className="rounded-md bg-white p-2 text-cyan-700 ring-1 ring-cyan-100">
                    <Brain className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-gray-950">Smart booking assistant</h3>
                    <p className="text-sm text-gray-600">Address quality, return risk, courier fit, and customer confirmation text.</p>
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md bg-white p-4 ring-1 ring-cyan-100">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-950">
                        <MapPinned className="h-4 w-4 text-cyan-700" />
                        Address score
                    </div>
                    <p className="mt-2 text-2xl font-bold text-gray-950">{address.score}%</p>
                    <p className="text-xs font-semibold text-gray-500">{address.level}</p>
                </div>
                <div className="rounded-md bg-white p-4 ring-1 ring-cyan-100">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-950">
                        <ShieldAlert className="h-4 w-4 text-amber-600" />
                        Return risk
                    </div>
                    <p className="mt-2 text-2xl font-bold text-gray-950">{risk.level}</p>
                    <p className="text-xs font-semibold text-gray-500">{risk.score}/100 risk score</p>
                </div>
            </div>

            <div className="mt-4 space-y-3 text-xs leading-5 text-gray-700">
                <p className="rounded-md bg-white p-3 ring-1 ring-cyan-100"><Sparkles className="mr-1 inline h-3.5 w-3.5 text-cyan-700" />{recommendationReason}</p>
                {[...address.issues, ...risk.reasons].slice(0, 5).map((issue) => (
                    <p key={issue} className="rounded-md bg-white px-3 py-2 ring-1 ring-cyan-100">{issue}</p>
                ))}
            </div>

            <div className="mt-4 rounded-md bg-white p-3 ring-1 ring-cyan-100">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-gray-500">
                    <MessageSquareText className="h-4 w-4 text-cyan-700" />
                    Confirmation message
                </div>
                <p className="text-xs leading-5 text-gray-700">{buyerMessage(data, selectedCity, selectedRate)}</p>
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

export default function Create({ cities, rates, products = [] }) {
    const defaultCityId = cities[0]?.id ?? '';
    const { data, setData, post, processing, errors } = useForm({
        receiver_name: '',
        receiver_phone: '',
        receiver_address: '',
        receiver_area: '',
        city_id: defaultCityId,
        inventory_product_id: '',
        product_quantity: 1,
        courier_rate_id: '',
        weight_grams: 500,
        parcel_type: 'Small Parcel',
        cod_amount_paisa: 0,
        description: '',
        special_instructions: '',
    });

    const cityRates = useMemo(() => {
        return rates
            .filter((rate) => String(rate.cityId) === String(data.city_id))
            .map((rate) => {
                const shippingCharge = chargeForRate(rate, data.weight_grams);
                const totalCharge = shippingCharge + rate.ourFeePaisa;

                return {
                    ...rate,
                    shippingCharge,
                    totalCharge,
                };
            })
            .sort((a, b) => a.totalCharge - b.totalCharge || b.successRate - a.successRate);
    }, [data.city_id, data.weight_grams, rates]);

    const recommendedRate = cityRates[0];
    const selectedRate = cityRates.find((rate) => String(rate.id) === String(data.courier_rate_id)) ?? recommendedRate;
    const selectedCity = cities.find((city) => String(city.id) === String(data.city_id));
    const selectedProduct = products.find((product) => String(product.id) === String(data.inventory_product_id));

    const selectRate = (rateId) => setData('courier_rate_id', rateId);

    const selectProduct = (productId) => {
        const product = products.find((item) => String(item.id) === String(productId));

        setData('inventory_product_id', productId);
        setData('product_quantity', productId ? Math.max(data.product_quantity || 1, 1) : 1);

        if (product) {
            setData('weight_grams', product.weightGrams);
            setData('description', `${product.name} (${product.sku})`);
        }
    };

    useEffect(() => {
        if (!recommendedRate) {
            return;
        }

        const currentRateIsAvailable = cityRates.some((rate) => String(rate.id) === String(data.courier_rate_id));

        if (!data.courier_rate_id || !currentRateIsAvailable) {
            setData('courier_rate_id', recommendedRate.id);
        }
    }, [cityRates, data.courier_rate_id, recommendedRate]);

    const submit = (event) => {
        event.preventDefault();

        post(route('bookings.store'), {
            preserveScroll: true,
        });
    };

    return (
        <SellerLayout
            header={
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-semibold leading-tight text-gray-950">
                        New Booking
                    </h2>
                    <p className="text-sm text-gray-500">Enter parcel details, compare slab rates, and book with the best shipping charge.</p>
                </div>
            }
        >
            <Head title="New Booking" />

            <div className="bg-gray-50 py-8">
                <form onSubmit={submit} className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
                    <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <div>
                                <h3 className="text-base font-semibold text-gray-950">Shipment details</h3>
                                <p className="text-sm text-gray-500">Receiver, city, parcel, and COD amount.</p>
                            </div>
                            <PackagePlus className="h-5 w-5 text-gray-400" />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Receiver name" error={errors.receiver_name}>
                                <input className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.receiver_name} onChange={(e) => setData('receiver_name', e.target.value)} required />
                            </Field>
                            <Field label="Receiver phone" error={errors.receiver_phone}>
                                <input className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.receiver_phone} onChange={(e) => setData('receiver_phone', e.target.value)} placeholder="03001234567" required />
                            </Field>
                        </div>

                        <Field label="Complete address" error={errors.receiver_address}>
                            <textarea className="min-h-24 w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.receiver_address} onChange={(e) => setData('receiver_address', e.target.value)} required />
                        </Field>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="City" error={errors.city_id}>
                                <select className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.city_id} onChange={(e) => {
                                    setData('city_id', e.target.value);
                                    setData('courier_rate_id', '');
                                }} required>
                                    {cities.map((city) => (
                                        <option key={city.id} value={city.id}>{city.name}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Area/Tehsil" error={errors.receiver_area}>
                                <input className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.receiver_area} onChange={(e) => setData('receiver_area', e.target.value)} />
                            </Field>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <div className="grid gap-4 md:grid-cols-[1fr_160px]">
                                <Field label="Inventory product" error={errors.inventory_product_id}>
                                    <select className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.inventory_product_id} onChange={(e) => selectProduct(e.target.value)}>
                                        <option value="">No product selected</option>
                                        {products.map((product) => (
                                            <option key={product.id} value={product.id}>
                                                {product.name} | {product.sku} | {product.stockOnHand} in stock
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Quantity" error={errors.product_quantity}>
                                    <input type="number" min="1" max="1000" disabled={!data.inventory_product_id} className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600 disabled:bg-gray-100" value={data.product_quantity} onChange={(e) => setData('product_quantity', Number(e.target.value))} />
                                </Field>
                            </div>
                            {selectedProduct ? (
                                <p className="mt-3 text-xs leading-5 text-gray-600">
                                    Using {selectedProduct.weightGrams}g product weight. Stock available: <span className="font-semibold text-gray-950">{selectedProduct.stockOnHand}</span>. Stock will reduce after booking.
                                </p>
                            ) : (
                                <p className="mt-3 text-xs leading-5 text-gray-500">
                                    Optional: choose a product to auto-fill weight and reduce stock when this shipment is booked.
                                </p>
                            )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <Field label="Weight grams" error={errors.weight_grams}>
                                <input type="number" min="1" max="50000" className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.weight_grams} onChange={(e) => setData('weight_grams', Number(e.target.value))} required />
                            </Field>
                            <Field label="Parcel type" error={errors.parcel_type}>
                                <select className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.parcel_type} onChange={(e) => setData('parcel_type', e.target.value)} required>
                                    <option>Document</option>
                                    <option>Small Parcel</option>
                                    <option>Large Parcel</option>
                                    <option>Fragile</option>
                                </select>
                            </Field>
                            <Field label="COD amount" error={errors.cod_amount_paisa}>
                                <input type="number" min="0" className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.cod_amount_paisa / 100} onChange={(e) => setData('cod_amount_paisa', Math.round(Number(e.target.value || 0) * 100))} />
                            </Field>
                        </div>

                        <Field label="Parcel description" error={errors.description}>
                            <input className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.description} onChange={(e) => setData('description', e.target.value)} placeholder="Clothing, documents, accessories..." />
                        </Field>

                        <Field label="Special instructions" error={errors.special_instructions}>
                            <input className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600" value={data.special_instructions} onChange={(e) => setData('special_instructions', e.target.value)} placeholder="Call before delivery" />
                        </Field>
                    </section>

                    <section className="space-y-4">
                        <AiBookingAssistant data={data} selectedCity={selectedCity} selectedRate={selectedRate} recommendedRate={recommendedRate} />

                        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-base font-semibold text-gray-950">Choose your courier</h3>
                                    <p className="text-sm text-gray-500">Compare total charge, delivery promise, COD fit, success rate, and API status before booking.</p>
                                </div>
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>

                            <InputError message={errors.courier_rate_id} className="mb-3" />

                            <div className="grid gap-3">
                                {cityRates.map((rate) => {
                                    const selected = String(selectedRate?.id) === String(rate.id);
                                    const recommended = String(recommendedRate?.id) === String(rate.id);
                                    const codFit = Number(data.cod_amount_paisa) > 0 ? 'COD supported' : 'Prepaid ready';
                                    const proofReady = rate.capabilities?.return_proof ? 'Proof ready' : 'Basic returns';

                                    return (
                                        <button
                                            key={rate.id}
                                            type="button"
                                            onClick={() => selectRate(rate.id)}
                                            className={`rounded-lg border p-4 text-left shadow-sm transition ${selected ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-100' : 'border-gray-200 bg-white hover:border-cyan-200 hover:bg-gray-50'}`}
                                        >
                                            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className={`grid h-5 w-5 place-items-center rounded-full border ${selected ? 'border-cyan-600 bg-cyan-600 text-white' : 'border-gray-300 bg-white'}`}>
                                                            {selected && <CheckCircle2 className="h-4 w-4" />}
                                                        </span>
                                                        <h4 className="font-bold text-gray-950">{rate.courier}</h4>
                                                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">{rate.courierCode}</span>
                                                        {recommended && (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">
                                                                <BadgeCheck className="h-3.5 w-3.5" />
                                                                Best match
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="mt-2 text-xs leading-5 text-gray-500">{slabLabel(rate)}</p>
                                                </div>

                                                <div className="text-left xl:text-right">
                                                    <p className="text-xs font-semibold uppercase text-gray-500">Total charge</p>
                                                    <p className="mt-1 text-2xl font-bold text-gray-950">{money(rate.totalCharge)}</p>
                                                    <p className="mt-1 text-xs text-gray-500">{money(rate.shippingCharge)} shipping + {money(rate.ourFeePaisa)} platform</p>
                                                </div>
                                            </div>

                                            <div className="mt-4 grid gap-2 sm:grid-cols-4">
                                                <span className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                                                    <Clock3 className="h-4 w-4 text-cyan-700" />
                                                    {rate.deliveryDaysMin}-{rate.deliveryDaysMax} days
                                                </span>
                                                <span className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                                                    <BadgeCheck className="h-4 w-4 text-emerald-600" />
                                                    {rate.reliabilityScore}% reliability
                                                </span>
                                                <span className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                                                    <CircleDollarSign className="h-4 w-4 text-indigo-600" />
                                                    {codFit}
                                                </span>
                                                <span className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold ring-1 ${apiTone(rate.apiStatus)}`}>
                                                    <Wifi className="h-4 w-4" />
                                                    API {rate.apiStatus}
                                                </span>
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                                <span className="rounded-full bg-white px-2 py-1 font-semibold text-gray-600 ring-1 ring-gray-200">
                                                    {proofReady}
                                                </span>
                                                <span className="rounded-full bg-white px-2 py-1 font-semibold text-gray-600 ring-1 ring-gray-200">
                                                    {rate.apiCredentialsStatus} credentials
                                                </span>
                                                <span className="rounded-full bg-white px-2 py-1 font-semibold text-gray-600 ring-1 ring-gray-200">
                                                    Last API check {rate.lastApiHealthCheckAt ?? 'pending'}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                                {cityRates.length === 0 && (
                                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500">
                                        No active courier rates are available for {selectedCity?.name ?? 'this city'} yet.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <Truck className="h-5 w-5 text-gray-500" />
                                <h3 className="text-base font-semibold text-gray-950">Booking summary</h3>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="rounded-md bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                                    Bank charges Rs.85 and COD/cash handling deductions are applied at invoice settlement, not per parcel.
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Selected courier</span>
                                    <span className="font-semibold text-gray-950">{selectedRate?.courier ?? 'Select courier'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Shipping charge</span>
                                    <span className="font-semibold text-gray-950">{money(selectedRate?.shippingCharge ?? 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Platform fee</span>
                                    <span className="font-semibold text-gray-950">{money(selectedRate?.ourFeePaisa ?? 0)}</span>
                                </div>
                                <div className="flex justify-between border-t border-gray-100 pt-3 text-base">
                                    <span className="font-semibold text-gray-950">Total charges</span>
                                    <span className="font-bold text-gray-950">{money(selectedRate?.totalCharge ?? 0)}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing || !selectedRate}
                                className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-gray-950 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <PackagePlus className="h-4 w-4" />
                                Confirm and book
                            </button>

                            <Link href={route('dashboard')} className="mt-3 block text-center text-sm font-semibold text-gray-500 hover:text-gray-800">
                                Back to dashboard
                            </Link>
                        </div>
                    </section>
                </form>
            </div>
        </SellerLayout>
    );
}
