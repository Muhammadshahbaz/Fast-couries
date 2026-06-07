import MarketingPageHeader from '@/Components/MarketingPageHeader';
import PublicShell from '@/Components/PublicShell';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function Contact() {
    const { company } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        company: '',
        topic: 'seller_onboarding',
        message: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post(route('contact.submit'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <PublicShell>
            <Head title="Contact Fast Couriers" />
            <MarketingPageHeader
                eyebrow="Contact"
                title="Talk to Fast Couriers."
                description="For seller onboarding, courier API partnerships, operations support, payout questions, and enterprise integrations, send us a message. We are Lahore based and built for ecommerce sellers across Pakistan."
            >
                <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"><Mail className="h-5 w-5 text-cyan-700" /><p className="mt-3 font-semibold text-gray-950">Email</p><p className="text-sm text-gray-500">{company.supportEmail}</p></div>
                    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"><Phone className="h-5 w-5 text-cyan-700" /><p className="mt-3 font-semibold text-gray-950">Phone</p><p className="text-sm text-gray-500">{company.supportPhone}</p><p className="mt-1 text-xs text-gray-400">WhatsApp: {company.whatsapp}</p></div>
                    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"><MapPin className="h-5 w-5 text-cyan-700" /><p className="mt-3 font-semibold text-gray-950">Office</p><p className="text-sm text-gray-500">{company.office}</p><p className="mt-1 text-xs text-gray-400">{company.hours}</p></div>
                </div>
            </MarketingPageHeader>

            <section className="bg-slate-50 py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
                    <div>
                        <div className="rounded-lg border border-cyan-100 bg-cyan-50 p-6">
                            <h2 className="text-xl font-bold text-gray-950">What to include</h2>
                            <p className="mt-2 text-sm leading-6 text-cyan-950">Share your monthly order volume, pickup city, courier preference, average COD value, and whether you need store/API integration.</p>
                        </div>
                    </div>
                    <form onSubmit={submit} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-950">Send a message</h2>
                        <p className="mt-1 text-sm text-gray-500">Share your volume, city, courier needs, or payout question so the team can respond properly.</p>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <label className="block"><span className="text-sm font-semibold text-gray-700">Name</span><input value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />{errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}</label>
                            <label className="block"><span className="text-sm font-semibold text-gray-700">Email</span><input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />{errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}</label>
                            <label className="block"><span className="text-sm font-semibold text-gray-700">Phone</span><input value={data.phone} onChange={(e) => setData('phone', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" /></label>
                            <label className="block"><span className="text-sm font-semibold text-gray-700">Company</span><input value={data.company} onChange={(e) => setData('company', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" /></label>
                            <label className="block sm:col-span-2"><span className="text-sm font-semibold text-gray-700">Topic</span><select value={data.topic} onChange={(e) => setData('topic', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm"><option value="seller_onboarding">Seller onboarding</option><option value="courier_api">Courier/API partnership</option><option value="support">Shipment support</option><option value="payout">COD payout</option><option value="enterprise">Enterprise account</option></select></label>
                            <label className="block sm:col-span-2"><span className="text-sm font-semibold text-gray-700">Message</span><textarea rows="6" value={data.message} onChange={(e) => setData('message', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />{errors.message && <p className="mt-1 text-xs text-rose-600">{errors.message}</p>}</label>
                        </div>
                        <button disabled={processing} className="mt-5 rounded-md bg-gray-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">Submit message</button>
                    </form>
                </div>
                </div>
            </section>
        </PublicShell>
    );
}
