import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

export default function MarketingPageHeader({
    eyebrow,
    title,
    description,
    primaryAction,
    secondaryAction,
    children,
}) {
    const wrapperClass = children
        ? 'mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:px-8'
        : 'mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8';

    return (
        <section className="border-b border-gray-200 bg-white">
            <div className={wrapperClass}>
                <div className="max-w-3xl">
                    <p className="text-sm font-bold uppercase text-cyan-700">{eyebrow}</p>
                    <h1 className="mt-2 text-4xl font-bold leading-tight text-gray-950 sm:text-5xl">{title}</h1>
                    {description && <p className="mt-5 text-lg leading-8 text-gray-600">{description}</p>}
                    {(primaryAction || secondaryAction) && (
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            {primaryAction && (
                                <Link
                                    href={primaryAction.href}
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-gray-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-gray-800"
                                >
                                    {primaryAction.label}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            )}
                            {secondaryAction && (
                                <Link
                                    href={secondaryAction.href}
                                    className="inline-flex min-h-12 items-center justify-center rounded-md border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
                                >
                                    {secondaryAction.label}
                                </Link>
                            )}
                        </div>
                    )}
                </div>
                {children && <div>{children}</div>}
            </div>
        </section>
    );
}
