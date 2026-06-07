import { Bot, Send, X } from 'lucide-react';
import { useState } from 'react';

const starterMessages = [
    { from: 'bot', text: 'Hi, I am the Fast Couriers assistant. Ask me about rates, COD payouts, tracking, courier partners, or seller registration.' },
];

export default function ChatbotWidget() {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState(starterMessages);
    const [loading, setLoading] = useState(false);

    const send = async (event) => {
        event.preventDefault();
        if (!message.trim()) return;

        const userMessage = message.trim();
        setMessages((items) => [...items, { from: 'user', text: userMessage }]);
        setMessage('');
        setLoading(true);

        try {
            const response = await fetch(route('chatbot.message'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    Accept: 'application/json',
                },
                body: JSON.stringify({ message: userMessage }),
            });
            const data = await response.json();
            setMessages((items) => [...items, { from: 'bot', text: data.reply }]);
        } catch {
            setMessages((items) => [...items, { from: 'bot', text: 'Sorry, I could not respond right now. Please use the contact form and our team will help.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-40">
            {open && (
                <div className="mb-3 w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl sm:w-96">
                    <div className="flex items-center justify-between bg-gray-950 px-4 py-3 text-white">
                        <div className="flex items-center gap-2 text-sm font-semibold"><Bot className="h-4 w-4" />Fast Couriers Support</div>
                        <button onClick={() => setOpen(false)}><X className="h-4 w-4" /></button>
                    </div>
                    <div className="max-h-80 space-y-3 overflow-y-auto p-4">
                        {messages.map((item, index) => (
                            <div key={`${item.from}-${index}`} className={`rounded-lg px-3 py-2 text-sm leading-6 ${item.from === 'user' ? 'ml-8 bg-cyan-50 text-cyan-950' : 'mr-8 bg-gray-100 text-gray-700'}`}>
                                {item.text}
                            </div>
                        ))}
                        {loading && <div className="mr-8 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-500">Thinking...</div>}
                    </div>
                    <form onSubmit={send} className="flex gap-2 border-t border-gray-100 p-3">
                        <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask about shipping..." className="min-w-0 flex-1 rounded-md border-gray-300 text-sm" />
                        <button className="grid h-10 w-10 place-items-center rounded-md bg-gray-950 text-white"><Send className="h-4 w-4" /></button>
                    </form>
                </div>
            )}
            <button onClick={() => setOpen((value) => !value)} className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-4 py-3 text-sm font-bold text-gray-950 shadow-xl">
                <Bot className="h-5 w-5" />
                Support
            </button>
        </div>
    );
}
