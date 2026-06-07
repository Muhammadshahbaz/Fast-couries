import MarketingPageHeader from '@/Components/MarketingPageHeader';
import PublicShell from '@/Components/PublicShell';
import { Head } from '@inertiajs/react';
import { Braces, FileSpreadsheet, Plug, RotateCcw, ShieldCheck, ShoppingCart, Webhook } from 'lucide-react';

const channels = [
    [ShoppingCart, 'Shopify and WooCommerce', 'Pull orders from online stores, compare couriers, print labels, and keep tracking references attached to the order.'],
    [FileSpreadsheet, 'Bulk CSV booking', 'Upload many parcels at once for Instagram, WhatsApp, and marketplace sellers who still work from spreadsheets.'],
    [Braces, 'Merchant API', 'Connect custom stores, ERPs, or seller portals to rate lookup, shipment booking, cancellation, and tracking endpoints.'],
    [Plug, 'Courier API layer', 'Route bookings through TCS, Leopards, Trax, M&P, BlueEx, Overland, Call Courier, FedEx, and future partners.'],
];

const apiSteps = [
    [Plug, 'Courier adapters', 'Each courier gets its own adapter for booking, tracking, cancellation, label, return proof, and webhook parsing.'],
    [Braces, 'Common Fast Couriers format', 'Different API fields are normalized into one shipment model, so sellers see the same workflow for every courier.'],
    [Webhook, 'Webhook updates', 'Courier callbacks update status, rider attempts, delivery events, return reasons, and proof evidence automatically.'],
    [ShieldCheck, 'Verified proof', 'Return proof can include call recording, attempt photo, rider statement, courier reference, and verification time.'],
];

export default function Integrations() {
    return (
        <PublicShell>
            <Head title="Integrations" />
            <MarketingPageHeader
                eyebrow="Integrations"
                title="Connect sales channels, bulk orders, and courier APIs in one workflow."
                description="The market already expects store integrations and API access. Fast Couriers is shaping this into a practical seller workflow: import orders, compare courier rates, book labels, and sync tracking without manual re-entry."
                primaryAction={{ label: 'Discuss integration access', href: route('contact') }}
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    {channels.map(([Icon, title, text]) => (
                        <article key={title} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <Icon className="h-6 w-6 text-cyan-700" />
                            <h2 className="mt-4 font-bold">{title}</h2>
                            <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
                        </article>
                    ))}
                </div>
            </MarketingPageHeader>

            <section className="border-y border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                    <div className="max-w-3xl">
                        <p className="text-sm font-semibold uppercase text-cyan-700">How courier APIs connect</p>
                        <h2 className="mt-2 text-3xl font-bold text-gray-950">One internal API, many courier platforms.</h2>
                        <p className="mt-4 text-base leading-7 text-gray-600">
                            TCS, FedEx, Leopards, Trax, M&P, BlueEx, Overland, and Call Courier all expose different API fields. Fast Couriers keeps sellers away from that complexity by converting every provider response into one standard booking, tracking, return, and proof format.
                        </p>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {apiSteps.map(([Icon, title, text]) => (
                            <article key={title} className="rounded-lg border border-gray-200 p-5">
                                <Icon className="h-5 w-5 text-cyan-700" />
                                <h3 className="mt-4 font-bold text-gray-950">{title}</h3>
                                <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
                            </article>
                        ))}
                    </div>

                    <div className="mt-8 rounded-lg bg-gray-950 p-5 text-white">
                        <div className="flex items-start gap-3">
                            <RotateCcw className="mt-0.5 h-5 w-5 text-emerald-300" />
                            <div>
                                <h3 className="font-bold">Return-proof integration</h3>
                                <p className="mt-2 text-sm leading-6 text-gray-300">
                                    When a parcel is returned, the courier API or webhook should send delivery attempt count, rider remarks, buyer response, call recording URL, photo URL, geo/location proof, and courier reference. Fast Couriers stores that as verified proof and shows it to the seller on Returns and Shipment Detail.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </PublicShell>
    );
}
