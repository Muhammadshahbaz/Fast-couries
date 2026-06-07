import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { BadgeCheck, Boxes, CircleDollarSign, MapPinned } from 'lucide-react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen bg-slate-50 text-gray-950 lg:grid lg:grid-cols-[0.95fr_1.05fr]">
            <section className="relative hidden min-h-screen overflow-hidden bg-gray-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
                <div className="absolute inset-x-0 top-0 h-64 bg-cyan-400/10" />
                <div className="relative z-10">
                    <Link href="/">
                        <ApplicationLogo dark />
                    </Link>
                    <div className="mt-20 max-w-lg">
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-200">Seller logistics platform</p>
                        <h1 className="mt-4 text-5xl font-black leading-tight tracking-normal">Ship faster, prove returns, and settle COD with confidence.</h1>
                        <p className="mt-5 text-base leading-8 text-gray-300">
                            One operational system for courier comparison, bookings, tracking, inventory, return proof, and payout visibility.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 grid gap-3 sm:grid-cols-2">
                    {[
                        [MapPinned, 'Address checks'],
                        [BadgeCheck, 'Proof-ready returns'],
                        [CircleDollarSign, 'COD settlement'],
                        [Boxes, 'Inventory forecast'],
                    ].map(([Icon, label]) => (
                        <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <Icon className="h-5 w-5 text-cyan-200" />
                            <p className="mt-3 text-sm font-bold text-white">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="flex min-h-screen flex-col px-4 py-6 sm:px-6 lg:px-10">
                <div className="flex items-center justify-between">
                    <Link href="/" className="lg:hidden">
                        <ApplicationLogo />
                    </Link>
                    <Link href="/" className="ml-auto rounded-md px-3 py-2 text-sm font-bold text-gray-600 hover:bg-white hover:text-gray-950">
                        Back to site
                    </Link>
                </div>

                <div className="flex flex-1 items-center justify-center py-8">
                    <div className="w-full max-w-3xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                        {children}
                    </div>
                </div>
            </section>
        </div>
    );
}
