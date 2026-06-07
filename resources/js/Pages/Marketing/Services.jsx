import MarketingPageHeader from '@/Components/MarketingPageHeader';
import PublicShell from '@/Components/PublicShell';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Banknote, Barcode, Brain, CheckCircle2, CircleDollarSign, ClipboardList, FileCheck2, Headphones, MapPinCheck, PackageSearch, Plug, RotateCcw, ShieldCheck, ShoppingCart, Truck, Warehouse, Zap } from 'lucide-react';

const imageUrl = (id, width, quality = 92) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=${quality}`;
const imageSet = (id) => [1280, 1920, 2560, 3840].map((width) => `${imageUrl(id, width)} ${width}w`).join(', ');
const serviceImageId = 'photo-1566576721346-d4a3b4eaeb55';

const coreServices = [
    [Truck, 'Multi-courier booking', 'Compare courier charges, delivery days, API status, city coverage, and success rate before dispatching an order.'],
    [PackageSearch, 'Tracking and labels', 'Generate Fast Couriers tracking numbers, courier AWBs, labels, public buyer tracking links, and shipment timelines.'],
    [CircleDollarSign, 'COD payout invoices', 'Convert delivered COD parcels into payout invoices with bank charge, cash handling, COD fee, net payable, and status history.'],
    [RotateCcw, 'Returns and proof', 'Track return reasons, rider statements, delivery attempts, call recording links, proof photos, and claim-ready evidence.'],
    [Warehouse, 'Inventory and order management', 'Manage SKUs, product weights, low-stock alerts, manual orders, CSV imports, batch dispatch, and manifests.'],
    [Headphones, 'Support and operations', 'Keep delivery issues, payout questions, return disputes, and technical support attached to shipment history.'],
];

const workflow = [
    ['Import or create order', 'Add customer, city, COD, product, weight, and delivery instructions.'],
    ['Check risk and courier options', 'Review address score, COD risk, courier rate, speed, success rate, and API health.'],
    ['Book and hand over parcel', 'Generate tracking, AWB, label, stock movement, and dispatch manifest.'],
    ['Track delivery and returns', 'Sync courier status, rider events, return proof, and support tickets.'],
    ['Reconcile COD', 'Generate payout invoice and review deductions, transfer status, and payable balance.'],
];

const advanced = [
    [Brain, 'AI address and return-risk checks', 'Score weak addresses, high-COD orders, city mismatch, and return-prone parcels before dispatch.'],
    [Plug, 'Store and API integrations', 'Prepare Shopify, WooCommerce, Daraz, WhatsApp Business, courier APIs, public merchant API, and webhooks.'],
    [Barcode, 'Barcode dispatch controls', 'Use manifest and scan-ready workflows to reduce missed handovers and courier disputes.'],
    [ShieldCheck, 'Claims and seller protection', 'Build claim packets using AWB, proof, status timeline, courier reference, and support history.'],
];

const sellerTypes = [
    ['Instagram and WhatsApp sellers', 'Move from manual DMs and spreadsheets to structured bookings, confirmation messages, and tracking.'],
    ['Shopify and WooCommerce stores', 'Prepare automated order import, courier booking, and tracking updates back to the store.'],
    ['COD-heavy ecommerce brands', 'Protect cashflow with payout invoices, deduction clarity, faster COD readiness, and reconciliation controls.'],
    ['Growing warehouses', 'Use inventory, batch shipping, manifests, roles, and reports as daily order volume increases.'],
];

export default function Services() {
    return (
        <PublicShell>
            <Head title="Services | Fast Couriers">
                <meta name="description" content="Fast Couriers services include multi-courier booking, tracking, COD payout invoices, return proof, inventory, integrations, AI address checks, and seller operations." />
            </Head>

            <MarketingPageHeader
                eyebrow="Services"
                title="Shipping, COD, returns, and seller operations in one workspace."
                description="Fast Couriers helps ecommerce sellers compare couriers, book parcels, track buyers, prove returns, manage COD payouts, and grow into automated operations without jumping between tools."
                primaryAction={{ label: 'Start shipping', href: route('register') }}
                secondaryAction={{ label: 'View rate card', href: route('pricing') }}
            >
                <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                    <img
                        src={imageUrl(serviceImageId, 2560, 94)}
                        srcSet={imageSet(serviceImageId)}
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        alt="Courier delivery service vehicle on city road"
                        className="h-[420px] w-full object-cover"
                    />
                </div>
            </MarketingPageHeader>

            <section className="border-y border-gray-200 bg-slate-50 py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 grid gap-4 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
                        <div>
                            <p className="text-sm font-bold uppercase text-cyan-700">Core services</p>
                            <h2 className="mt-2 text-3xl font-bold text-gray-950 sm:text-4xl">The daily shipping tools sellers actually need.</h2>
                        </div>
                        <p className="leading-7 text-gray-600">
                            Each service is connected to the same order, shipment, courier, inventory, support, and payout record so the team can see context without searching manually.
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {coreServices.map(([Icon, title, text]) => (
                            <article key={title} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                                <Icon className="h-6 w-6 text-cyan-700" />
                                <h3 className="mt-4 text-lg font-bold text-gray-950">{title}</h3>
                                <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-white py-16">
                <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8">
                    <div>
                        <p className="text-sm font-bold uppercase text-cyan-700">Operating workflow</p>
                        <h2 className="mt-2 text-3xl font-bold text-gray-950 sm:text-4xl">From order to COD settlement.</h2>
                        <p className="mt-4 leading-7 text-gray-600">
                            The product is designed around the real movement of a seller order, not around isolated features.
                        </p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                        {workflow.map(([title, text], index) => (
                            <div key={title} className="grid gap-4 border-b border-gray-100 p-5 last:border-b-0 sm:grid-cols-[72px_1fr]">
                                <div className="flex items-start gap-3">
                                    <span className="grid h-10 w-10 place-items-center rounded-full bg-gray-950 text-sm font-bold text-white">{index + 1}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-950">{title}</h3>
                                    <p className="mt-1 text-sm leading-6 text-gray-600">{text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-gray-950 py-16 text-white">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
                    <div>
                        <p className="text-sm font-bold uppercase text-cyan-300">Advanced services</p>
                        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">What makes Fast Couriers different from a simple courier account.</h2>
                        <p className="mt-4 leading-7 text-gray-300">
                            The platform adds intelligence, proof, automation, and seller growth tools around the shipment.
                        </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {advanced.map(([Icon, title, text]) => (
                            <article key={title} className="rounded-lg border border-white/10 bg-white/5 p-5">
                                <Icon className="h-5 w-5 text-cyan-300" />
                                <h3 className="mt-4 font-bold">{title}</h3>
                                <p className="mt-2 text-sm leading-6 text-gray-300">{text}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-white py-16">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8">
                    <div>
                        <p className="text-sm font-bold uppercase text-cyan-700">Who we serve</p>
                        <h2 className="mt-2 text-3xl font-bold text-gray-950 sm:text-4xl">Built for sellers at different stages.</h2>
                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            {sellerTypes.map(([title, text]) => (
                                <article key={title} className="rounded-lg border border-gray-200 bg-slate-50 p-5">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                    <h3 className="mt-4 font-bold text-gray-950">{title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-lg border border-cyan-100 bg-cyan-50 p-6">
                        <MapPinCheck className="h-6 w-6 text-cyan-700" />
                        <h3 className="mt-4 text-2xl font-bold text-gray-950">Service promise</h3>
                        <p className="mt-3 leading-7 text-cyan-950">
                            We help sellers reduce courier confusion, avoid weak-address dispatches, keep buyers informed, and understand COD payout status clearly.
                        </p>
                        <div className="mt-6 space-y-3">
                            {[
                                'Multiple courier options from one dashboard',
                                'Transparent COD deductions and payout records',
                                'Return proof and support history attached to shipments',
                                'AI and automation roadmap for serious ecommerce teams',
                            ].map((item) => (
                                <div key={item} className="flex gap-2 text-sm font-semibold text-cyan-950">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-t border-gray-200 bg-slate-50 py-16">
                <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-950">Ready to manage courier operations from one place?</h2>
                    <p className="mx-auto mt-3 max-w-2xl leading-7 text-gray-600">
                        Create an account, compare couriers, book shipments, and start building cleaner COD and return operations.
                    </p>
                    <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link href={route('register')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-gray-950 px-5 py-3 text-sm font-bold text-white">
                            Register now
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link href={route('contact')} className="inline-flex min-h-12 items-center justify-center rounded-md border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800">
                            Contact sales
                        </Link>
                    </div>
                </div>
            </section>
        </PublicShell>
    );
}
