import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link, router, usePage } from '@inertiajs/react';
import ChatbotWidget from '@/Components/ChatbotWidget';
import {
    ArrowRight,
    BadgeCheck,
    Boxes,
    CheckCircle2,
    CircleDollarSign,
    ClipboardList,
    FileCheck2,
    Headphones,
    PackageCheck,
    PackageSearch,
    Plug,
    Search,
    ShieldCheck,
    Truck,
    Wallet,
    Warehouse,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

const imageUrl = (id, width, quality = 92) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=${quality}`;
const imageSet = (id) => [1280, 1920, 2560, 3840].map((width) => `${imageUrl(id, width)} ${width}w`).join(', ');

const heroImageId = 'photo-1586528116311-ad8dd3c8310d';
const warehouseImageId = 'photo-1553413077-190dd305871c';
const deliveryImageId = 'photo-1566576721346-d4a3b4eaeb55';

const heroImage = imageUrl(heroImageId, 3840, 95);
const warehouseImage = imageUrl(warehouseImageId, 2560, 94);
const deliveryImage = imageUrl(deliveryImageId, 2560, 94);

const partners = ['TCS', 'Leopards', 'Trax', 'M&P', 'BlueEx', 'Overland', 'Call Courier', 'FedEx'];

const services = [
    {
        icon: Truck,
        title: 'Multi-courier booking',
        text: 'Sellers compare courier charges, delivery days, API status, and city success rate before booking.',
    },
    {
        icon: CircleDollarSign,
        title: 'COD settlement control',
        text: 'Delivered COD shipments move into invoice-ready payout batches with bank and handling deductions.',
    },
    {
        icon: PackageSearch,
        title: 'Tracking and labels',
        text: 'Every shipment has AWB, label access, buyer tracking link, and a courier timeline from one dashboard.',
    },
    {
        icon: Headphones,
        title: 'Returns and support',
        text: 'Return cases, payout questions, and delivery issues stay attached to shipment history.',
    },
];

const advantages = [
    {
        title: 'We are not one courier',
        text: 'You are not locked into one network. Fast Couriers lets sellers compare multiple couriers and choose the best option for each city, parcel weight, and buyer promise.',
    },
    {
        title: 'Rates, delivery, and COD stay together',
        text: 'Most sellers manage booking, tracking, returns, and payouts in separate places. We connect them into one operational flow from shipment creation to COD invoice.',
    },
    {
        title: 'Built for ecommerce cash flow',
        text: 'COD visibility, invoice-level deductions, payout status, and admin approval are part of the product from day one so sellers know what is collected and what is payable.',
    },
    {
        title: 'Operations tools are included',
        text: 'Admins can manage courier health, city rates, seller KYC, shipment status, payout approvals, and reports. That means the platform can actually run the business behind the website.',
    },
];

const growthTools = [
    [Wallet, 'Faster COD options', 'Verified sellers can manage COD invoices clearly and request eligibility for faster settlement programs as their volume grows.', 'advance-cod'],
    [Plug, 'Store and API connections', 'Connect Shopify, WooCommerce, bulk CSV, and merchant systems so orders move into shipping without manual re-entry.', 'integrations'],
    [ShieldCheck, 'Claims and parcel protection', 'Keep lost, damaged, and disputed shipment cases organized with proof, status, and courier escalation history.', 'claims'],
    [Boxes, 'Bulk shipping controls', 'Handle batch labels, manifests, order imports, returns, and operations reporting when daily order volume increases.', 'bulk-shipping'],
];

const joinReasons = [
    ['Lower shipping confusion', 'Compare TCS, Leopards, Trax, M&P, BlueEx, Overland, Call Courier, and FedEx from one screen.'],
    ['Better courier decisions', 'Pick by charges, speed, API status, and delivery success instead of guessing.'],
    ['Cleaner COD settlement', 'Generate payout invoices with bank charge, cash handling, COD deduction, and net payable clearly shown.'],
    ['Professional buyer experience', 'Give buyers a public tracking link instead of making them chase screenshots or courier portals.'],
];

const operations = [
    ['Rate comparison', 'City and weight based courier options before booking.'],
    ['Courier API layer', 'TCS, FedEx, Leopards, M&P, BlueEx, Call Courier and more.'],
    ['Admin controls', 'Manage couriers, slabs, payout approvals, API health, and seller operations.'],
    ['Public tracking', 'Buyers can track using Fast Couriers number or courier AWB.'],
];

const rateRows = [
    ['Leopards / Trax / M&P / BlueEx', '0-0.5 kg', 'Rs.248.99', 'Extra kg Rs.156.60'],
    ['TCS', '0-0.5 kg', 'Rs.280', 'Extra kg Rs.300'],
    ['Overland', '0-5 kg', 'Rs.450', 'Extra kg Rs.100'],
];

const stats = [
    ['8+', 'courier partners'],
    ['1300+', 'coverage target'],
    ['Same day', 'COD workflow'],
    ['Live', 'tracking timeline'],
];

const trustItems = [
    [ShieldCheck, 'Verified seller onboarding', 'KYC, pickup profile, payout details, and admin review help keep COD accounts controlled from the start.'],
    [BadgeCheck, 'Courier API readiness', 'Each courier has credentials, health checks, webhook setup, capabilities, and rate slabs managed from the admin console.'],
    [PackageCheck, 'Return proof workflow', 'Returned parcels can carry rider remarks, attempt count, buyer response, call recording, photo proof, and courier reference.'],
    [CircleDollarSign, 'Transparent COD records', 'Payout invoices show gross COD, bank charges, handling deductions, net payable, and payment status.'],
];

const productScreens = [
    ['Courier comparison', 'Compare charge, delivery days, API health, COD fit, and lane reliability before booking.', ['Leopards Rs.248.99', 'TCS Rs.280', 'Best match']],
    ['Seller dashboard', 'Daily bookings, COD ready to invoice, delivery success, low stock, and action insights in one place.', ['24 shipments', 'Rs.184k COD', '91% success']],
    ['Return proof', 'Show delivery attempts, rider statement, buyer response, call recording, photo proof, and proof strength.', ['3 attempts', 'Call proof', '92% proof']],
    ['COD invoice', 'Gross COD, bank charges, cash handling, deductions, net payable, and paid status stay transparent.', ['Gross Rs.68k', 'Net Rs.64k', 'Paid']],
    ['Courier API readiness', 'Admin can see credentials, webhook events, adapter readiness, health checks, and rate slabs.', ['TCS ready', 'Webhook set', 'Health passed']],
];

function money(paisa) {
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format((paisa ?? 0) / 100);
}

function RatePreview() {
    return (
        <div className="grid gap-3">
            {[
                ['Leopards', 24899, '1-2 days', '91%', true],
                ['TCS', 28000, '1-2 days', '94%', false],
                ['BlueEx', 24899, '2-3 days', '89%', false],
            ].map(([name, rate, days, success, recommended]) => (
                <div key={name} className={`grid grid-cols-[1fr_auto] gap-3 rounded-lg border p-4 ${recommended ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-white'}`}>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-950">{name}</p>
                            {recommended && <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">Best match</span>}
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{days} | {success} success</p>
                    </div>
                    <p className="text-right font-bold text-gray-950">{money(rate)}</p>
                </div>
            ))}
        </div>
    );
}

function ProductShowcase() {
    return (
        <section className="bg-[#f7f8fa] py-14 sm:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8 grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                    <div>
                        <p className="text-sm font-semibold uppercase text-cyan-700">See the platform in action</p>
                        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Real product workflows sellers can understand immediately.</h2>
                    </div>
                    <p className="leading-7 text-gray-600">
                        The product is built around daily logistics decisions: choosing couriers, tracking delivery, proving returns, settling COD, and managing courier API readiness.
                    </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-5">
                    {productScreens.map(([title, text, chips], index) => (
                        <article key={title} className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm shadow-gray-950/[0.03] transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gray-950/[0.07] ${index === 0 ? 'lg:col-span-2' : ''}`}>
                            <div className="rounded-md border border-gray-800 bg-gray-950 p-3 text-white">
                                <div className="mb-4 flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                                    <span className="h-2 w-2 rounded-full bg-amber-300" />
                                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                </div>
                                <div className="space-y-2">
                                    {chips.map((chip, chipIndex) => (
                                        <div key={chip} className={`rounded-md px-3 py-2 text-xs font-bold ${chipIndex === chips.length - 1 ? 'bg-cyan-300 text-gray-950' : 'bg-white/10 text-gray-100'}`}>
                                            {chip}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <h3 className="mt-4 font-bold text-gray-950">{title}</h3>
                            <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function Welcome({ auth }) {
    const { company } = usePage().props;
    const [tracking, setTracking] = useState('');

    const track = (event) => {
        event.preventDefault();
        router.get(route('track'), { tracking });
    };

    return (
        <>
            <Head title="Fast Couriers | Courier Aggregation for Ecommerce" />
            <Head>
                <meta name="description" content="Fast Couriers helps ecommerce sellers compare couriers, book shipments, track buyers, prove returns, and manage COD payout invoices from one dashboard." />
                <meta property="og:title" content="Fast Couriers | Courier Aggregation for Ecommerce" />
                <meta property="og:description" content="Multi-courier booking, buyer tracking, return proof, COD payout visibility, and admin courier API readiness for ecommerce sellers." />
                <meta property="og:image" content="/og-fast-couriers.svg" />
                <meta name="twitter:card" content="summary_large_image" />
            </Head>

            <main className="min-h-screen bg-[#f6f7f9] text-gray-950">
                <nav className="sticky top-0 z-30 border-b border-white/10 bg-gray-950/95 text-white shadow-lg shadow-gray-950/10 backdrop-blur">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
                        <Link href="/" className="flex items-center gap-2">
                            <ApplicationLogo dark iconClassName="bg-white text-gray-950" />
                        </Link>

                        <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-sm font-semibold text-gray-200 lg:flex">
                            <Link href={route('about')} className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white">About</Link>
                            <a href="#services" className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white">Services</a>
                            <a href="#network" className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white">Network</a>
                            <Link href={route('pricing')} className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white">Pricing</Link>
                            <Link href={route('integrations')} className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white">Integrations</Link>
                            <Link href={route('advance-cod')} className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white">Advance COD</Link>
                            <Link href={route('faq')} className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white">FAQ</Link>
                            <a href="#operations" className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white">Operations</a>
                            <Link href={route('track')} className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white">Track</Link>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            {auth.user ? (
                                <Link href={route('dashboard')} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-950 shadow-sm transition hover:bg-cyan-50 sm:px-4">
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')} className="rounded-md px-3 py-2 text-sm font-semibold text-gray-100 transition hover:bg-white/10 sm:px-4">
                                        Login
                                    </Link>
                                    <Link href={route('register')} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-950 shadow-sm transition hover:bg-cyan-50 sm:px-4">
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                <section className="relative overflow-hidden">
                    <img
                        src={heroImage}
                        srcSet={imageSet(heroImageId)}
                        sizes="100vw"
                        alt="Modern logistics warehouse with packed ecommerce parcels"
                        className="absolute inset-0 h-full w-full object-cover brightness-75 saturate-[0.9]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/95 to-gray-950/70" />
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-950/40 via-transparent to-gray-950/70" />
                    <div className="relative mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl gap-10 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[0.95fr_0.75fr] lg:items-center lg:px-8">
                        <div className="max-w-3xl">
                            <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 shadow-sm shadow-gray-950/20 backdrop-blur sm:mb-5 sm:text-sm">
                                <Zap className="h-4 w-4" />
                                <span className="leading-5">Built for ecommerce sellers who want choice, control, and faster COD clarity</span>
                            </div>
                            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.65)] sm:text-5xl lg:text-6xl">
                                Stop depending on one courier. Ship smarter with the best option for every order.
                            </h1>
                            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-100 drop-shadow-[0_2px_14px_rgba(0,0,0,0.6)] sm:mt-6 sm:text-lg sm:leading-8">
                                Fast Couriers combines multi-courier booking, city-wise rate comparison, buyer tracking, returns visibility, and COD payout invoices in one professional platform for Pakistan’s online sellers.
                            </p>

                            <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row">
                                <Link href={route('register')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-cyan-300 px-5 py-3 text-sm font-bold text-gray-950 shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-200">
                                    Join Fast Couriers
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link href={route('login')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15">
                                    Login to portal
                                </Link>
                            </div>

                            <form onSubmit={track} className="mt-7 flex max-w-xl flex-col gap-3 rounded-lg border border-white/20 bg-white p-3 shadow-xl sm:mt-8 sm:flex-row">
                                <label className="flex min-h-12 flex-1 items-center gap-2 rounded-md px-2">
                                    <Search className="h-4 w-4 text-gray-400" />
                                    <input className="w-full border-0 p-0 text-sm text-gray-950 focus:ring-0" value={tracking} onChange={(event) => setTracking(event.target.value)} placeholder="Track shipment number" />
                                </label>
                                <button className="min-h-12 rounded-md bg-gray-950 px-5 py-2 text-sm font-semibold text-white">Track</button>
                            </form>
                        </div>

                        <div className="hidden rounded-lg border border-white/15 bg-white/10 p-5 shadow-2xl shadow-gray-950/30 backdrop-blur lg:block">
                            <div className="rounded-md border border-white/10 bg-gray-950/80 p-4 text-white">
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold uppercase text-cyan-200">Live courier decision</p>
                                        <h2 className="mt-1 text-xl font-bold">Lahore to Islamabad</h2>
                                    </div>
                                    <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-gray-950">Best match</span>
                                </div>
                                <RatePreview />
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                {stats.map(([value, label]) => (
                                    <div key={label} className="rounded-md border border-white/10 bg-white/10 p-4">
                                        <p className="text-2xl font-bold text-white">{value}</p>
                                        <p className="mt-1 text-sm leading-5 text-gray-300">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="border-b border-gray-200 bg-white py-14 sm:py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-8 grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                            <div>
                                <p className="text-sm font-semibold uppercase text-cyan-700">Why sellers can trust us</p>
                                <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Trust is built into the workflow, not added later.</h2>
                            </div>
                            <p className="leading-7 text-gray-600">
                                Fast Couriers connects courier choice with KYC, verified return proof, COD invoice records, support history, and admin oversight so sellers have evidence when something goes wrong.
                            </p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {trustItems.map(([Icon, title, text]) => (
                                <article key={title} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm shadow-gray-950/[0.03] transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gray-950/[0.07]">
                                    <Icon className="h-5 w-5 text-cyan-700" />
                                    <h3 className="mt-4 font-bold text-gray-950">{title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <ProductShowcase />

                <section id="network" className="border-y border-gray-200 bg-white">
                    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-9 sm:px-6 lg:grid-cols-[auto_1fr] lg:items-center lg:px-8">
                        <div>
                            <p className="text-sm font-semibold uppercase text-cyan-700">Courier network</p>
                            <h2 className="mt-1 text-2xl font-bold">One account, many courier options.</h2>
                        </div>
                        <div className="flex flex-wrap gap-3 lg:justify-end">
                            {partners.map((partner) => (
                                <span key={partner} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm shadow-gray-950/[0.03]">{partner}</span>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-white py-14 sm:py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
                            <div className="max-w-xl">
                                <p className="text-sm font-semibold uppercase text-cyan-700">What makes us different</p>
                                <h2 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">Fast Couriers is a courier command center, not only a delivery booking page.</h2>
                                <p className="mt-4 leading-7 text-gray-600">
                                    Fast Couriers gives ecommerce sellers one place to choose the right courier, control operations, and understand COD money clearly.
                                </p>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {advantages.map((item) => (
                                    <article key={item.title} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm shadow-gray-950/[0.03] transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gray-950/[0.07]">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                        <h3 className="mt-4 font-bold text-gray-950">{item.title}</h3>
                                        <p className="mt-2 text-sm leading-6 text-gray-600">{item.text}</p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="border-y border-gray-200 bg-[#f7f8fa] py-14 sm:py-16">
                    <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
                        <div className="max-w-xl">
                            <p className="text-sm font-semibold uppercase text-cyan-700">Built for ecommerce growth</p>
                            <h2 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">Everything serious sellers need after booking a parcel.</h2>
                            <p className="mt-4 leading-7 text-gray-600">
                                Fast Couriers helps sellers move from manual courier follow-up to a complete shipping workflow: payments, integrations, protection, and bulk operations in one place.
                            </p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {growthTools.map(([Icon, title, text, routeName]) => (
                                <Link key={title} href={route(routeName)} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm shadow-gray-950/[0.03] transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-lg hover:shadow-gray-950/[0.07]">
                                    <Icon className="h-5 w-5 text-cyan-700" />
                                    <h3 className="mt-4 font-bold text-gray-950">{title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
                                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-800">
                                        Learn more
                                        <ArrowRight className="h-4 w-4" />
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-gray-950 py-16 text-white">
                    <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
                        <div>
                            <p className="text-sm font-semibold uppercase text-cyan-300">Why sellers should join</p>
                            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">More courier choice. Less manual work. Clearer payouts.</h2>
                            <p className="mt-4 leading-7 text-gray-300">
                                If you sell on Instagram, Shopify, WooCommerce, marketplaces, or your own store, Fast Couriers gives your team one system for shipping and settlement.
                            </p>
                            <Link href={route('register')} className="mt-6 inline-flex items-center gap-2 rounded-md bg-cyan-400 px-5 py-3 text-sm font-bold text-gray-950">
                                Register as seller
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {joinReasons.map(([title, text]) => (
                                <article key={title} className="rounded-lg border border-white/10 bg-white/[0.07] p-5 shadow-lg shadow-gray-950/10">
                                    <h3 className="font-bold">{title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-gray-300">{text}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="services" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                        <div>
                            <p className="text-sm font-semibold uppercase text-cyan-700">What sellers get</p>
                            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">A complete shipping workspace, not just a booking form.</h2>
                            <p className="mt-4 leading-7 text-gray-600">
                                The platform connects rate comparison, courier booking, shipment operations, public tracking, COD payout invoices, and admin controls into one clean workflow.
                            </p>
                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                {services.map(({ icon: Icon, title, text }) => (
                                    <article key={title} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm shadow-gray-950/[0.03]">
                                        <Icon className="h-5 w-5 text-cyan-700" />
                                        <h3 className="mt-4 font-bold text-gray-950">{title}</h3>
                                        <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
                                    </article>
                                ))}
                            </div>
                        </div>
                        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm shadow-gray-950/[0.04]">
                            <img
                                src={warehouseImage}
                                srcSet={imageSet(warehouseImageId)}
                                sizes="(min-width: 1024px) 50vw, 100vw"
                                alt="Organized ecommerce warehouse shelves"
                                className="h-80 w-full object-cover"
                            />
                            <div className="grid gap-0 divide-y divide-gray-100 p-5">
                                {operations.map(([title, text]) => (
                                    <div key={title} className="grid gap-2 py-4 sm:grid-cols-[190px_1fr]">
                                        <p className="font-semibold text-gray-950">{title}</p>
                                        <p className="text-sm leading-6 text-gray-600">{text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white py-16">
                    <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8">
                        <div className="overflow-hidden rounded-lg shadow-lg shadow-gray-950/[0.08]">
                            <img
                                src={deliveryImage}
                                srcSet={imageSet(deliveryImageId)}
                                sizes="(min-width: 1024px) 50vw, 100vw"
                                alt="Courier delivery vehicle on a city road"
                                className="h-full min-h-[420px] w-full object-cover"
                            />
                        </div>
                        <div className="flex flex-col justify-center">
                            <p className="text-sm font-semibold uppercase text-cyan-700">Seller dashboard</p>
                            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Choose courier by shipping charges, speed, and success rate.</h2>
                            <p className="mt-4 leading-7 text-gray-600">
                                After login, sellers select destination city and parcel weight, then choose from available courier charges. Recommended courier is shown, but the seller can pick any partner.
                            </p>
                            <div className="mt-6">
                                <RatePreview />
                            </div>
                        </div>
                    </div>
                </section>

                <section id="pricing" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mb-8 grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                        <div>
                            <p className="text-sm font-semibold uppercase text-cyan-700">Rate card</p>
                            <h2 className="mt-2 text-3xl font-bold">Transparent courier slabs.</h2>
                        </div>
                        <p className="leading-7 text-gray-600">
                            Bank charges of Rs.85, 1% cash handling, and 4% COD deduction are handled at payout invoice level, not per parcel.
                        </p>
                    </div>
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm shadow-gray-950/[0.04]">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-950 text-xs uppercase text-gray-200">
                                <tr>
                                    <th className="px-5 py-4">Courier</th>
                                    <th className="px-5 py-4">Slab</th>
                                    <th className="px-5 py-4">Rate</th>
                                    <th className="px-5 py-4">Extra</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {rateRows.map((row) => (
                                    <tr key={row[0]}>
                                        {row.map((cell, index) => <td key={cell} className={`px-5 py-4 ${index === 0 ? 'font-semibold text-gray-950' : 'text-gray-700'}`}>{cell}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section id="operations" className="bg-gray-950 py-16 text-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
                            <div>
                                <p className="text-sm font-semibold uppercase text-cyan-300">Operations ready</p>
                                <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Built for sellers and internal teams.</h2>
                                <p className="mt-4 leading-7 text-gray-300">
                                    Sellers get simple shipping workflows. Admins get controls for courier rates, payout approvals, API health, and the next layer of shipment operations.
                                </p>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {[
                                    [BadgeCheck, 'Courier rate management', 'Admin can update active couriers, API status, success rates, and city slabs.'],
                                    [FileCheck2, 'Payout approvals', 'Finance can review COD invoices and mark seller payments as paid.'],
                                    [PackageCheck, 'Shipment lifecycle', 'Seller can view labels, sync tracking, cancel eligible shipments, and share buyer links.'],
                                    [Plug, 'API foundation', 'Provider adapters are ready for TCS, FedEx, Leopards, M&P, BlueEx, and more.'],
                                    [ClipboardList, 'Bulk order controls', 'Batch booking, manifests, and import workflows help high-volume sellers move faster.'],
                                    [Warehouse, 'Fulfillment support', 'Warehouse, pick-pack, and return receiving tools work from the same shipment data.'],
                                ].map(([Icon, title, text]) => (
                                    <article key={title} className="rounded-lg border border-white/10 bg-white/[0.07] p-5 shadow-lg shadow-gray-950/10">
                                        <Icon className="h-5 w-5 text-cyan-300" />
                                        <h3 className="mt-4 font-bold">{title}</h3>
                                        <p className="mt-2 text-sm leading-6 text-gray-300">{text}</p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white py-16">
                    <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
                        <div>
                            <p className="text-sm font-semibold uppercase text-cyan-700">Start today</p>
                            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Join before your shipping operations become harder to control.</h2>
                            <p className="mt-4 max-w-2xl leading-7 text-gray-600">
                                As order volume grows, courier selection, tracking, returns, and COD reconciliation become messy. Fast Couriers gives sellers a structured system early, so growth does not turn into manual follow-up.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                            <Link href={route('register')} className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-950 px-5 py-3 text-sm font-semibold text-white">
                                Register free
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link href={route('login')} className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800">
                                Login
                            </Link>
                        </div>
                    </div>
                </section>

                <footer className="border-t border-gray-200 bg-white py-10">
                    <div className="mx-auto grid max-w-7xl gap-8 px-4 text-sm text-gray-500 sm:px-6 lg:grid-cols-[1.15fr_0.85fr_1fr] lg:px-8">
                        <div>
                            <ApplicationLogo />
                            <p className="mt-3 max-w-sm leading-6">Courier aggregation, tracking, COD visibility, and seller operations for ecommerce businesses in Pakistan.</p>
                            <p className="mt-3 text-xs font-semibold uppercase text-gray-400">Operating hours: {company.hours}</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-950">Contact</h3>
                            <div className="mt-3 space-y-2 leading-6">
                                <p>Email: {company.supportEmail}</p>
                                <p>WhatsApp: {company.whatsapp}</p>
                                <p>Phone: {company.supportPhone}</p>
                                <p>Office: {company.office}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 lg:justify-end">
                            <Link href={route('about')}>About</Link>
                            <Link href={route('services')}>Services</Link>
                            <Link href={route('pricing')}>Pricing</Link>
                            <Link href={route('integrations')}>Integrations</Link>
                            <Link href={route('advance-cod')}>Advance COD</Link>
                            <Link href={route('cod-policy')}>COD Policy</Link>
                            <Link href={route('operations-sop')}>Operations</Link>
                            <Link href={route('claims')}>Claims</Link>
                            <Link href={route('bulk-shipping')}>Bulk</Link>
                            <Link href={route('deployment-checklist')}>Deployment</Link>
                            <Link href={route('faq')}>FAQ</Link>
                            <Link href={route('track')}>Track</Link>
                            <Link href={route('contact')}>Contact</Link>
                            <Link href={route('privacy')}>Privacy</Link>
                            <Link href={route('terms')}>Terms</Link>
                            <Link href={route('login')}>Login</Link>
                            <Link href={route('register')}>Register</Link>
                        </div>
                    </div>
                </footer>
                <ChatbotWidget />
            </main>
        </>
    );
}
