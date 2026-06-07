<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatbotController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
        ]);

        $message = strtolower($validated['message']);

        $reply = match (true) {
            str_contains($message, 'rate') || str_contains($message, 'price') || str_contains($message, 'charges') => 'Fast Couriers lets sellers compare courier charges before booking. Current sample rates include Leopards/Trax/M&P/BlueEx from Rs.248.99, TCS from Rs.280, and Overland from Rs.450.',
            str_contains($message, 'cod') || str_contains($message, 'payout') || str_contains($message, 'payment') => 'COD shipments flow into payout invoices after delivery. The invoice shows gross COD, Rs.85 bank charge, 1% cash handling, 4% COD deduction, and net payable.',
            str_contains($message, 'track') || str_contains($message, 'tracking') || str_contains($message, 'awb') => 'You can track shipments from the Track page using the Fast Couriers tracking number or courier AWB. Sellers also get buyer tracking links from the dashboard.',
            str_contains($message, 'courier') || str_contains($message, 'tcs') || str_contains($message, 'fedex') => 'We support a multi-courier model: TCS, FedEx, Leopards, Trax, M&P, BlueEx, Overland, Call Courier, and more as APIs are connected.',
            str_contains($message, 'register') || str_contains($message, 'join') || str_contains($message, 'signup') => 'You can join by clicking Register, adding business/KYC details, and then booking shipments from the seller dashboard.',
            str_contains($message, 'contact') || str_contains($message, 'support') => sprintf('You can send us a message from the Contact page, email %s, call %s, or message us on WhatsApp at %s.', config('company.support_email'), config('company.support_phone'), config('company.whatsapp')),
            default => 'I can help with courier rates, booking, tracking, COD payouts, seller registration, and support. Please tell me what you want to do.',
        };

        return response()->json(['reply' => $reply]);
    }
}
