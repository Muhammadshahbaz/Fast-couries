import MarketingPageHeader from '@/Components/MarketingPageHeader';
import PublicShell from '@/Components/PublicShell';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, Banknote, Brain, Building2, CheckCircle2, ClipboardCheck, MapPin, PackageCheck, Plug, ShieldCheck, Truck, Warehouse } from 'lucide-react';

const imageUrl = (id, width, quality = 92) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=${quality}`;
const imageSet = (id) => [1280, 1920, 2560, 3840].map((width) => `${imageUrl(id, width)} ${width}w`).join(', ');

const heroImageId = 'photo-1586528116311-ad8dd3c8310d';
const warehouseImageId = 'photo-1553413077-190dd305871c';
const deliveryImageId = 'photo-1566576721346-d4a3b4eaeb55';

const stats = [
    ['8+', 'courier options planned'],
    ['AI', 'address and return risk checks'],
    ['COD', 'invoice and payout visibility'],
    ['Lahore', 'based operations team'],
];

const principles = [
    [Truck, 'Choice over dependency', 'Sellers should not be locked into one courier. Fast Couriers helps teams compare courier rates, speed, API health, and city performance before dispatch.'],
    [Banknote, 'Clear COD money', 'COD settlement should be visible at invoice level, including bank charges, cash handling, COD deductions, net payable, and payout status.'],
    [ShieldCheck, 'Proof before disputes', 'Returns should carry rider remarks, attempt history, call/photo/location proof, and a clear claim trail so sellers are not left guessing.'],
    [Brain, 'AI where it helps', 'Address checks, return-risk signals, courier recommendations, stock forecasts, and payout anomaly alerts help sellers act before problems grow.'],
];

const platform = [
    ['Multi-courier booking', 'TCS, FedEx, Leopards, Trax, M&P, BlueEx, Overland, and more can be managed through one standard shipment workflow.'],
    ['Seller operating system', 'Orders, inventory, batch shipping, manifests, customers, support, team roles, payouts, returns, and reports stay connected.'],
    ['Admin command center', 'Admins can manage rates, courier API health, sellers, KYC, payout approvals, return proof, and profit visibility.'],
    ['Growth suite', 'WhatsApp confirmations, marketplace integrations, digital payment-on-delivery, barcode dispatch, and reconciliation are part of the roadmap.'],
];

const roadmap = [
    [ClipboardCheck, 'Verified seller onboarding', 'KYC, payout details, business profile, and dispatch readiness before live shipping.'],
    [Plug, 'Courier and store integrations', 'Courier APIs, Shopify, WooCommerce, Daraz, WhatsApp Business, public API, and webhooks.'],
    [PackageCheck, 'Proof-ready operations', 'Address verification, return evidence, claim packets, manifest controls, and tracking timelines.'],
    [Warehouse, 'Warehouse and inventory depth', 'SKU weights, low-stock alerts, batch dispatch, barcode handover, and future multi-warehouse routing.'],
];

export default function About() {
    const { company } = usePage().props;

    return (
        <PublicShell>
            <Head title="About Fast Couriers">
                <meta name="description" content="Fast Couriers is a Lahore-based courier aggregation and seller operations platform for ecommerce shipping, COD payouts, returns proof, and AI-assisted logistics." />
            </Head>

            <MarketingPageHeader
                eyebrow="About Fast Couriers"
                title="Built to give ecommerce sellers more control over shipping."
                description="Fast Couriers is a Lahore-based courier aggregation and seller operations platform for Pakistan. We connect courier booking, rate comparison, tracking, returns proof, COD settlement, inventory, support, and AI-assisted decision making in one workflow."
                primaryAction={{ label: 'Join as seller', href: route('register') }}
                secondaryAction={{ label: 'Talk to our team', href: route('contact') }}
            >
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <img
                        src={imageUrl(heroImageId, 2560, 95)}
                        srcSet={imageSet(heroImageId)}
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        alt="Modern ecommerce logistics warehouse"
                        className="h-72 w-full object-cover sm:h-80"
                    />
                    <div className="p-5">
                        <div className="flex items-center gap-2 text-sm font-bold uppercase text-cyan-700">
                            <MapPin className="h-4 w-4" />
                            Lahore-based logistics platform
                        </div>
                        <div className="mt-5 grid grid-cols-2 gap-3">
                            {stats.map(([value, label]) => (
                                <div key={label} className="rounded-md border border-gray-200 bg-slate-50 p-3">
                                    <p className="text-2xl font-bold text-gray-950">{value}</p>
                                    <p className="mt-1 text-xs leading-5 text-gray-600">{label}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-5 rounded-md border border-cyan-100 bg-cyan-50 p-4">
                            <Building2 className="h-5 w-5 text-cyan-700" />
                            <p className="mt-3 text-sm leading-6 text-cyan-950">
                                A practical command center for sellers who need courier choice, reliable COD visibility, cleaner returns, and fewer manual follow-ups.
                            </p>
                        </div>
                    </div>
                </div>
            </MarketingPageHeader>

            <section className="border-b border-gray-200 bg-white py-16">
                <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
                    <div>
                        <p className="text-sm font-bold uppercase text-cyan-700">Our purpose</p>
                        <h2 className="mt-2 text-3xl font-bold text-gray-950 sm:text-4xl">Make courier operations easier to trust, compare, and scale.</h2>
                        <p className="mt-4 leading-7 text-gray-600">
                            Online sellers lose time when courier booking, return proof, COD settlement, inventory, and support are handled in different places. Fast Couriers brings those moving parts into one organized system.
                        </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {principles.map(([Icon, title, text]) => (
                            <article key={title} className="rounded-lg border border-gray-200 bg-slate-50 p-5">
                                <Icon className="h-5 w-5 text-cyan-700" />
                                <h3 className="mt-4 font-bold text-gray-950">{title}</h3>
                                <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-slate-50 py-16">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                        <img
                            src={imageUrl(warehouseImageId, 2560, 94)}
                            srcSet={imageSet(warehouseImageId)}
                            sizes="(min-width: 1024px) 52vw, 100vw"
                            alt="Organized warehouse shelves for ecommerce fulfillment"
                            className="h-80 w-full object-cover"
                        />
                        <div className="p-6">
                            <p className="text-sm font-bold uppercase text-cyan-700">Lahore operations mindset</p>
                            <h2 className="mt-2 text-2xl font-bold text-gray-950">Local understanding, national courier reach.</h2>
                            <p className="mt-3 text-sm leading-7 text-gray-600">
                                We are Lahore based, but the product is designed for sellers shipping across Pakistan. The goal is simple: help sellers make better courier, COD, return, and inventory decisions from one dashboard.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-bold uppercase text-cyan-700">Platform scope</p>
                        <h2 className="mt-2 text-3xl font-bold text-gray-950">More than a booking page.</h2>
                        <div className="mt-6 space-y-5">
                            {platform.map(([title, text]) => (
                                <div key={title} className="flex gap-3">
                                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-600" />
                                    <div>
                                        <h3 className="font-semibold text-gray-950">{title}</h3>
                                        <p className="mt-1 text-sm leading-6 text-gray-600">{text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                        <div>
                            <p className="text-sm font-bold uppercase text-cyan-700">How we are different</p>
                            <h2 className="mt-2 text-3xl font-bold text-gray-950 sm:text-4xl">A smarter seller stack for courier-heavy businesses.</h2>
                        </div>
                        <p className="leading-7 text-gray-600">
                            Competitors usually focus on delivery booking or COD. Fast Couriers is being built around the full seller workflow: order quality, courier allocation, proof, reconciliation, support, and growth tools.
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {roadmap.map(([Icon, title, text]) => (
                            <article key={title} className="rounded-lg border border-gray-200 bg-slate-50 p-5">
                                <Icon className="h-5 w-5 text-cyan-700" />
                                <h3 className="mt-4 font-bold text-gray-950">{title}</h3>
                                <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-gray-950 py-16 text-white">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
                    <div>
                        <p className="text-sm font-bold uppercase text-cyan-300">Trust and contact</p>
                        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Built for sellers who want evidence, not guesswork.</h2>
                        <p className="mt-4 leading-7 text-gray-300">
                            From booking to payout, the platform is designed to keep records visible: courier selected, rate used, AWB, delivery status, proof, invoice deductions, and support history.
                        </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {[
                            ['Office', company.office],
                            ['Support', company.supportEmail],
                            ['WhatsApp', company.whatsapp],
                            ['Hours', company.hours],
                        ].map(([label, value]) => (
                            <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-4">
                                <p className="text-xs font-bold uppercase text-cyan-300">{label}</p>
                                <p className="mt-2 text-sm leading-6 text-gray-100">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-white py-16">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-8">
                    <div>
                        <p className="text-sm font-bold uppercase text-cyan-700">Next step</p>
                        <h2 className="mt-2 text-3xl font-bold text-gray-950 sm:text-4xl">Start with courier choice. Grow into full operations control.</h2>
                        <p className="mt-4 leading-7 text-gray-600">
                            Sellers can begin with simple bookings and tracking, then adopt inventory, batch dispatch, payout invoices, AI checks, proof management, and integrations as order volume grows.
                        </p>
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <Link href={route('register')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-gray-950 px-5 py-3 text-sm font-bold text-white">
                                Create seller account
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link href={route('services')} className="inline-flex min-h-12 items-center justify-center rounded-md border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50">
                                View services
                            </Link>
                        </div>
                    </div>
                    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                        <img
                            src={imageUrl(deliveryImageId, 2560, 94)}
                            srcSet={imageSet(deliveryImageId)}
                            sizes="(min-width: 1024px) 48vw, 100vw"
                            alt="Courier delivery van on city route"
                            className="h-96 w-full object-cover"
                        />
                    </div>
                </div>
            </section>
        </PublicShell>
    );
}
