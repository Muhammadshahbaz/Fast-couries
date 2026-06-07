import MarketingPageHeader from '@/Components/MarketingPageHeader';
import PublicShell from '@/Components/PublicShell';
import { Head } from '@inertiajs/react';
import { CheckCircle2, Database, KeyRound, Mail, Server, ShieldCheck } from 'lucide-react';

const sections = [
    [KeyRound, 'Environment and secrets', ['APP_KEY set', 'APP_URL set to production domain', 'Courier API credentials added', 'Webhook secrets configured', 'Admin password changed']],
    [Database, 'Database and storage', ['Production database provisioned', 'Daily backups enabled', 'Private storage linked', 'Public storage linked', 'Seed demo data disabled for production']],
    [Server, 'Workers and scheduler', ['Queue worker running', 'Laravel scheduler configured', 'Failed jobs monitored', 'Log rotation enabled', 'Health checks monitored']],
    [Mail, 'Email and notifications', ['Transactional mail configured', 'Support mailbox added', 'Seller notifications tested', 'Contact form delivery verified', 'DNS SPF/DKIM checked']],
    [ShieldCheck, 'Security and access', ['HTTPS/SSL active', 'Admin accounts limited', 'Role permissions reviewed', 'Webhook CSRF exception limited', 'Backups access restricted']],
    [CheckCircle2, 'Operations readiness', ['Seller approval SOP reviewed', 'Return proof evidence rules confirmed', 'Payout dispute owner assigned', 'Courier failure escalation process tested', 'Claims workflow ready']],
];

export default function DeploymentChecklist() {
    return (
        <PublicShell>
            <Head title="Deployment Checklist | Fast Couriers">
                <meta name="description" content="Production deployment checklist for Fast Couriers: environment, courier API secrets, database, queues, mail, SSL, backups, and admin access." />
            </Head>

            <MarketingPageHeader
                eyebrow="Production checklist"
                title="Before Fast Couriers goes live."
                description="Use this checklist before connecting real sellers, live courier APIs, COD payouts, and buyer tracking traffic."
            />

            <article className="bg-slate-50 py-16">
                <section className="mx-auto grid max-w-6xl gap-4 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
                    {sections.map(([Icon, title, rows]) => (
                        <div key={title} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-2">
                                <Icon className="h-5 w-5 text-cyan-700" />
                                <h2 className="font-bold text-gray-950">{title}</h2>
                            </div>
                            <div className="mt-4 space-y-3">
                                {rows.map((row) => (
                                    <p key={row} className="flex items-center gap-2 text-sm text-gray-600">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                        {row}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ))}
                </section>
            </article>
        </PublicShell>
    );
}
