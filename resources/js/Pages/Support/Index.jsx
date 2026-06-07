import SellerLayout from '@/Layouts/SellerLayout';
import { Head, useForm } from '@inertiajs/react';
import { Brain, Headphones, MessageSquareText } from 'lucide-react';

export default function Index({ tickets, shipments, assistants = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({ shipment_id: '', category: 'delivery', priority: 'normal', subject: '', message: '' });
    const submit = (event) => { event.preventDefault(); post(route('support.store'), { onSuccess: () => reset('subject', 'message', 'shipment_id') }); };
    const applyAssistant = (assistant) => {
        setData({
            ...data,
            category: assistant.category,
            priority: assistant.priority,
            subject: assistant.subject,
            message: assistant.message,
        });
    };

    return (
        <SellerLayout header={<div><h2 className="text-xl font-semibold text-gray-950">Support Center</h2><p className="text-sm text-gray-500">Create tickets for delivery, returns, payout, and technical issues.</p></div>}>
            <Head title="Support" />
            <div className="bg-gray-50 py-8">
                <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
                    <div className="space-y-5">
                        <section className="rounded-lg border border-cyan-100 bg-cyan-50 p-5 shadow-sm">
                            <div className="mb-4 flex items-start gap-3">
                                <Brain className="mt-0.5 h-5 w-5 text-cyan-700" />
                                <div>
                                    <h3 className="font-semibold text-gray-950">Support assistant</h3>
                                    <p className="mt-1 text-sm text-cyan-900">Start with a professional ticket draft for common operations issues.</p>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                {assistants.map((assistant) => (
                                    <button key={assistant.label} type="button" onClick={() => applyAssistant(assistant)} className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2 text-left text-sm font-semibold text-gray-800 ring-1 ring-cyan-100 hover:bg-cyan-50">
                                        <span>{assistant.label}</span>
                                        <MessageSquareText className="h-4 w-4 text-cyan-700" />
                                    </button>
                                ))}
                            </div>
                        </section>

                        <form onSubmit={submit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-2"><Headphones className="h-5 w-5 text-cyan-700" /><h3 className="font-semibold text-gray-950">New ticket</h3></div>
                            <select className="w-full rounded-md border-gray-300 text-sm" value={data.shipment_id} onChange={(e) => setData('shipment_id', e.target.value)}><option value="">No shipment selected</option>{shipments.map((shipment) => <option key={shipment.id} value={shipment.id}>{shipment.tracking_number}</option>)}</select>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <select className="rounded-md border-gray-300 text-sm" value={data.category} onChange={(e) => setData('category', e.target.value)}><option value="delivery">Delivery</option><option value="return">Return</option><option value="payout">Payout</option><option value="technical">Technical</option><option value="other">Other</option></select>
                                <select className="rounded-md border-gray-300 text-sm" value={data.priority} onChange={(e) => setData('priority', e.target.value)}><option value="normal">Normal</option><option value="urgent">Urgent</option></select>
                            </div>
                            <input className="w-full rounded-md border-gray-300 text-sm" value={data.subject} onChange={(e) => setData('subject', e.target.value)} placeholder="Subject" />
                            {errors.subject && <p className="text-sm text-red-600">{errors.subject}</p>}
                            <textarea className="min-h-28 w-full rounded-md border-gray-300 text-sm" value={data.message} onChange={(e) => setData('message', e.target.value)} placeholder="Explain the issue" />
                            {errors.message && <p className="text-sm text-red-600">{errors.message}</p>}
                            <button disabled={processing} className="w-full rounded-md bg-gray-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">Submit ticket</button>
                        </form>
                    </div>

                    <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 p-5"><h3 className="font-semibold text-gray-950">Open tickets</h3></div>
                        <div className="divide-y divide-gray-100">
                            {tickets.map((ticket) => <article key={ticket.ticketNumber} className="p-5"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-gray-950">{ticket.subject}</p><p className="text-xs text-gray-500">{ticket.ticketNumber} | {ticket.category} | {ticket.trackingNumber ?? 'No shipment'}</p></div><span className="w-fit rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">{ticket.status}</span></div><p className="mt-3 text-sm text-gray-600">{ticket.message}</p></article>)}
                        </div>
                    </section>
                </div>
            </div>
        </SellerLayout>
    );
}
