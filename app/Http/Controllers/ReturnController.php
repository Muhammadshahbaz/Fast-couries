<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReturnController extends Controller
{
    public function __invoke(Request $request): Response
    {
        return Inertia::render('Returns/Index', [
            'returns' => Shipment::query()
                ->with(['courier:id,name', 'city:id,name', 'events' => fn ($query) => $query->latest('occurred_at')->limit(1)])
                ->where('seller_id', $request->user()->id)
                ->where('status', 'returned')
                ->latest('returned_at')
                ->get()
                ->map(fn (Shipment $shipment) => [
                    'id' => $shipment->id,
                    'trackingNumber' => $shipment->tracking_number,
                    'receiver' => $shipment->receiver_name,
                    'phone' => $shipment->receiver_phone,
                    'courier' => $shipment->courier?->name,
                    'city' => $shipment->city?->name,
                    'codAmount' => $shipment->cod_amount_paisa,
                    'reason' => $shipment->return_reason ?? 'Not provided',
                    'returnedAt' => $shipment->returned_at?->format('M d, Y h:i A'),
                    'lastRemark' => $shipment->events->first()?->remarks,
                    'proof' => $this->returnProofPayload($shipment),
                ]),
        ]);
    }

    private function returnProofPayload(Shipment $shipment): array
    {
        $proof = $shipment->return_proof ?? [];

        return [
            'status' => $proof['status'] ?? 'pending',
            'attempts' => $proof['attempts'] ?? 0,
            'buyerResponse' => $proof['buyer_response'] ?? null,
            'riderStatement' => $proof['rider_statement'] ?? null,
            'riderName' => $proof['rider_name'] ?? null,
            'riderPhone' => $proof['rider_phone'] ?? null,
            'geoLocation' => $proof['geo_location'] ?? null,
            'courierReference' => $proof['courier_reference'] ?? null,
            'callRecordingUrl' => $proof['call_recording_url'] ?? null,
            'photoUrl' => $proof['photo_url'] ?? null,
            'lastAttemptAt' => isset($proof['last_attempt_at']) ? date('M d, Y h:i A', strtotime($proof['last_attempt_at'])) : null,
            'verifiedAt' => $shipment->return_proof_verified_at?->format('M d, Y h:i A'),
            'proofScore' => $this->returnProofScore($proof, $shipment),
            'summary' => $this->returnProofSummary($proof, $shipment),
        ];
    }

    private function returnProofScore(array $proof, Shipment $shipment): int
    {
        $score = 20;
        $score += min((int) ($proof['attempts'] ?? 0), 3) * 12;
        $score += ! empty($proof['buyer_response']) ? 12 : 0;
        $score += ! empty($proof['rider_statement']) ? 12 : 0;
        $score += ! empty($proof['call_recording_url']) ? 15 : 0;
        $score += ! empty($proof['photo_url']) ? 12 : 0;
        $score += ! empty($proof['geo_location']) ? 8 : 0;
        $score += $shipment->return_proof_verified_at ? 11 : 0;

        return min($score, 100);
    }

    private function returnProofSummary(array $proof, Shipment $shipment): string
    {
        $attempts = (int) ($proof['attempts'] ?? 0);
        $buyerResponse = $proof['buyer_response'] ?? $shipment->return_reason ?? 'No buyer response recorded';
        $evidence = collect([
            ! empty($proof['call_recording_url']) ? 'call recording' : null,
            ! empty($proof['photo_url']) ? 'attempt photo' : null,
            ! empty($proof['geo_location']) ? 'attempt location' : null,
            ! empty($proof['rider_statement']) ? 'rider statement' : null,
        ])->filter()->implode(', ');

        return "Delivery was attempted {$attempts} time(s). Buyer response: {$buyerResponse}. Evidence available: ".($evidence ?: 'basic courier status only').'.';
    }
}
