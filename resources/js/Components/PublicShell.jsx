import ApplicationLogo from '@/Components/ApplicationLogo';
import ChatbotWidget from '@/Components/ChatbotWidget';
import { Link, usePage } from '@inertiajs/react';

export default function PublicShell({ children }) {
    const { company, flash } = usePage().props;

    return (
        <main className="min-h-screen bg-[#f7f8fa] text-gray-950">
            <nav className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/95 shadow-sm shadow-gray-950/[0.03] backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center gap-2">
                        <ApplicationLogo />
                    </Link>
                    <div className="hidden items-center gap-1 rounded-full border border-gray-200 bg-gray-50 p-1 text-sm font-semibold text-gray-600 lg:flex">
                        {[
                            ['About', route('about')],
                            ['Services', route('services')],
                            ['Pricing', route('pricing')],
                            ['Integrations', route('integrations')],
                            ['Advance COD', route('advance-cod')],
                            ['Operations', route('operations-sop')],
                            ['FAQ', route('faq')],
                            ['Contact', route('contact')],
                        ].map(([label, href]) => (
                            <Link key={label} href={href} className="rounded-full px-3 py-2 transition hover:bg-white hover:text-gray-950 hover:shadow-sm">
                                {label}
                            </Link>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('login')} className="rounded-md px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-100">Login</Link>
                        <Link href={route('register')} className="rounded-md bg-gray-950 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-gray-800">Register</Link>
                    </div>
                </div>
            </nav>
            {(flash?.success || flash?.error) && (
                <div className="bg-gray-50 px-4 pt-4 sm:px-6 lg:px-8">
                    <div className={`mx-auto max-w-7xl rounded-md px-4 py-3 text-sm font-semibold ${
                        flash.error
                            ? 'border border-rose-200 bg-rose-50 text-rose-800'
                            : 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                    }`}>
                        {flash.error || flash.success}
                    </div>
                </div>
            )}
            {children}
            <footer className="border-t border-gray-200 bg-white py-12">
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
                    <div className="flex flex-wrap gap-x-4 gap-y-2 font-semibold lg:justify-end">
                        <Link href={route('track')}>Track</Link>
                        <Link href={route('bulk-shipping')}>Bulk Shipping</Link>
                        <Link href={route('claims')}>Claims</Link>
                        <Link href={route('cod-policy')}>COD Policy</Link>
                        <Link href={route('operations-sop')}>Operations</Link>
                        <Link href={route('deployment-checklist')}>Deployment</Link>
                        <Link href={route('privacy')}>Privacy</Link>
                        <Link href={route('terms')}>Terms</Link>
                    </div>
                </div>
            </footer>
            <ChatbotWidget />
        </main>
    );
}
