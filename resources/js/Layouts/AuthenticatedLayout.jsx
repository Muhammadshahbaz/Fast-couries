import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { Bell, Menu, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;
    const isAdmin = ['super_admin', 'sub_admin'].includes(user.role);

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-slate-50 text-gray-950">
            <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 shadow-sm backdrop-blur">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-20 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo />
                                </Link>
                            </div>

                            {isAdmin && <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex"><ResponsiveNavLink href={route('admin.dashboard')} active={route().current('admin.dashboard')}>Admin Console</ResponsiveNavLink></div>}
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center sm:gap-3">
                            <Link
                                href={route('ai.index')}
                                className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-800 hover:bg-cyan-100"
                            >
                                <ShieldCheck className="h-3.5 w-3.5" />
                                AI protected
                            </Link>
                            <button type="button" className="rounded-full border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50" title="Notifications">
                                <Bell className="h-4 w-4" />
                            </button>
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 py-1.5 pl-1.5 pr-3 text-sm font-bold leading-4 text-gray-700 transition hover:bg-white hover:text-gray-950 focus:outline-none"
                                            >
                                                <span className="grid h-8 w-8 place-items-center rounded-full bg-gray-950 text-xs font-bold text-white">
                                                    {user.name?.slice(0, 1) ?? 'U'}
                                                </span>
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                {showingNavigationDropdown ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        {isAdmin && <ResponsiveNavLink href={route('admin.dashboard')} active={route().current('admin.dashboard')}>Admin Console</ResponsiveNavLink>}
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="border-b border-gray-200 bg-white/80 backdrop-blur">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

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

            <main className="relative">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.08),transparent_32%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_30%)]" />
                <div className="relative">{children}</div>
            </main>
        </div>
    );
}
