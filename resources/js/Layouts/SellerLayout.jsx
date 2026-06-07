import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';
import { BarChart3, Boxes, Brain, ClipboardList, Headphones, LayoutDashboard, PackagePlus, Rocket, ReceiptText, RotateCcw, Truck, Users, Zap } from 'lucide-react';

const navItems = [
    { label: 'Dashboard', href: 'dashboard', icon: LayoutDashboard },
    { label: 'AI Center', href: 'ai.index', icon: Brain },
    { label: 'Growth Suite', href: 'growth-suite.index', icon: Rocket },
    { label: 'Action Center', href: 'action-center.index', icon: Zap },
    { label: 'Orders', href: 'orders.index', icon: ClipboardList },
    { label: 'New Booking', href: 'bookings.create', icon: PackagePlus },
    { label: 'Bookings', href: 'bookings.index', icon: Truck },
    { label: 'Inventory', href: 'inventory.index', icon: Boxes },
    { label: 'Payouts', href: 'payouts.index', icon: ReceiptText },
    { label: 'Returns', href: 'returns.index', icon: RotateCcw },
    { label: 'Customers', href: 'customers.index', icon: Users },
    { label: 'Team', href: 'team.index', icon: Users },
    { label: 'Support', href: 'support.index', icon: Headphones },
    { label: 'Reports', href: 'reports.seller', icon: BarChart3 },
];

export default function SellerLayout({ header, children }) {
    return (
        <AuthenticatedLayout header={header}>
            <div className="bg-slate-50 lg:flex">
                <aside className="border-b border-gray-200 bg-white/90 shadow-sm backdrop-blur lg:min-h-[calc(100vh-145px)] lg:w-72 lg:border-b-0 lg:border-r">
                    <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-4 sm:px-6 lg:sticky lg:top-24 lg:block lg:space-y-1.5 lg:px-5">
                        <div className="hidden rounded-lg border border-cyan-100 bg-cyan-50 p-4 lg:mb-4 lg:block">
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-800">Seller portal</p>
                            <p className="mt-1 text-sm leading-6 text-cyan-950">Bookings, tracking, COD, returns, and AI tools.</p>
                        </div>
                        {navItems.map(({ label, href, icon: Icon }) => (
                            <Link
                                key={href}
                                href={route(href)}
                                className={`inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold transition lg:flex ${
                                    route().current(href)
                                        ? 'bg-gray-950 text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-cyan-50 hover:text-gray-950'
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </Link>
                        ))}
                    </div>
                </aside>
                <div className="min-w-0 flex-1">{children}</div>
            </div>
        </AuthenticatedLayout>
    );
}
