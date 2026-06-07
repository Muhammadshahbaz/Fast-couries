<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\SupportTicket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SupportTicketController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Support/Index', [
            'tickets' => SupportTicket::query()
                ->with('shipment:id,tracking_number')
                ->where('seller_id', $request->user()->id)
                ->latest()
                ->get()
                ->map(fn (SupportTicket $ticket) => [
                    'ticketNumber' => $ticket->ticket_number,
                    'trackingNumber' => $ticket->shipment?->tracking_number,
                    'category' => $ticket->category,
                    'priority' => $ticket->priority,
                    'status' => $ticket->status,
                    'subject' => $ticket->subject,
                    'message' => $ticket->message,
                    'createdAt' => $ticket->created_at?->format('M d, Y h:i A'),
                ]),
            'shipments' => Shipment::query()
                ->where('seller_id', $request->user()->id)
                ->latest('booked_at')
                ->limit(50)
                ->get(['id', 'tracking_number']),
            'assistants' => [
                [
                    'label' => 'Return proof review',
                    'category' => 'return',
                    'priority' => 'urgent',
                    'subject' => 'Review return proof for disputed parcel',
                    'message' => 'Please review the courier return proof, including rider statement, buyer response, call recording, proof photo, and attempt timestamp. We need confirmation that delivery was properly attempted before accepting the return.',
                ],
                [
                    'label' => 'Delivery delay',
                    'category' => 'delivery',
                    'priority' => 'normal',
                    'subject' => 'Delivery delay follow-up',
                    'message' => 'Please check the latest courier scan and rider assignment. Customer is waiting for delivery confirmation, so kindly share the expected delivery window and any issue at destination.',
                ],
                [
                    'label' => 'COD payout',
                    'category' => 'payout',
                    'priority' => 'normal',
                    'subject' => 'COD payout reconciliation',
                    'message' => 'Please verify COD settlement for this shipment and share invoice deductions, bank charges, cash handling fee, and expected payout date.',
                ],
                [
                    'label' => 'Courier API issue',
                    'category' => 'technical',
                    'priority' => 'urgent',
                    'subject' => 'Courier API sync issue',
                    'message' => 'Courier booking or tracking sync needs review. Please check API health, credentials, last webhook payload, and whether the shipment requires manual retry.',
                ],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'shipment_id' => ['nullable', Rule::exists('shipments', 'id')->where('seller_id', $request->user()->id)],
            'category' => ['required', Rule::in(['delivery', 'return', 'payout', 'technical', 'other'])],
            'priority' => ['required', Rule::in(['normal', 'urgent'])],
            'subject' => ['required', 'string', 'max:160'],
            'message' => ['required', 'string', 'max:1500'],
        ]);

        SupportTicket::create($validated + [
            'seller_id' => $request->user()->id,
            'ticket_number' => 'SUP-'.now()->format('ymd').Str::upper(Str::random(5)),
            'status' => 'open',
        ]);

        return redirect()->route('support.index')->with('success', 'Support ticket created.');
    }
}
