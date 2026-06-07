<?php

namespace App\Http\Controllers;

use App\Couriers\CourierManager;
use App\Couriers\CourierTrackingService;
use App\Models\Shipment;
use App\Models\TrackingEvent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class ShipmentController extends Controller
{
    public function show(Request $request, Shipment $shipment): Response
    {
        $this->authorizeSellerShipment($request, $shipment);

        $shipment->load(['courier:id,name,code', 'city:id,name,province', 'events' => fn ($query) => $query->latest('occurred_at')]);

        return Inertia::render('Shipments/Show', [
            'shipment' => $this->shipmentPayload($shipment),
        ]);
    }

    public function sync(Request $request, Shipment $shipment, CourierTrackingService $tracking): RedirectResponse
    {
        $this->authorizeSellerShipment($request, $shipment);

        try {
            $tracking->sync($shipment);
        } catch (RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', 'Courier tracking synced.');
    }

    public function cancel(Request $request, Shipment $shipment, CourierManager $couriers): RedirectResponse
    {
        $this->authorizeSellerShipment($request, $shipment);
        $shipment->loadMissing('courier');

        if (! in_array($shipment->status, ['booked', 'picked'], true)) {
            return back()->with('error', 'Only booked or picked shipments can be cancelled.');
        }

        if (! $shipment->external_awb || ! $shipment->courier) {
            return back()->with('error', 'Shipment has no courier AWB to cancel.');
        }

        $result = $couriers->gateway($shipment->courier->code)->cancel($shipment->external_awb);

        if (! $result->successful) {
            return back()->with('error', $result->errorMessage ?? 'Courier cancellation failed.');
        }

        $shipment->forceFill([
            'status' => 'cancelled',
            'courier_payload' => $result->rawResponse,
            'api_synced_at' => now(),
        ])->save();

        TrackingEvent::create([
            'shipment_id' => $shipment->id,
            'status' => 'cancelled',
            'location' => $shipment->city?->name,
            'remarks' => 'Shipment cancelled through '.$shipment->courier?->name.' API.',
            'occurred_at' => now(),
        ]);

        return back()->with('success', 'Shipment cancelled.');
    }

    private function authorizeSellerShipment(Request $request, Shipment $shipment): void
    {
        abort_unless($shipment->seller_id === $request->user()->id, 403);
    }

    private function shipmentPayload(Shipment $shipment): array
    {
        return [
            'id' => $shipment->id,
            'trackingNumber' => $shipment->tracking_number,
            'externalAwb' => $shipment->external_awb,
            'labelUrl' => $shipment->label_url,
            'receiver' => $shipment->receiver_name,
            'phone' => $shipment->receiver_phone,
            'address' => $shipment->receiver_address,
            'area' => $shipment->receiver_area,
            'city' => $shipment->city?->name,
            'province' => $shipment->city?->province,
            'courier' => $shipment->courier?->name,
            'courierCode' => $shipment->courier?->code,
            'status' => $shipment->status,
            'weightGrams' => $shipment->weight_grams,
            'parcelType' => $shipment->parcel_type,
            'codAmount' => $shipment->cod_amount_paisa,
            'shippingCharge' => $shipment->shipping_charge_paisa,
            'ourFee' => $shipment->our_fee_paisa,
            'description' => $shipment->description,
            'specialInstructions' => $shipment->special_instructions,
            'bookedAt' => $shipment->booked_at?->format('M d, Y h:i A'),
            'deliveredAt' => $shipment->delivered_at?->format('M d, Y h:i A'),
            'returnedAt' => $shipment->returned_at?->format('M d, Y h:i A'),
            'returnReason' => $shipment->return_reason,
            'returnProof' => $this->returnProofPayload($shipment),
            'apiSyncedAt' => $shipment->api_synced_at?->format('M d, Y h:i A'),
            'publicTrackingUrl' => route('track', ['tracking' => $shipment->tracking_number]),
            'events' => $shipment->events->map(fn (TrackingEvent $event) => [
                'status' => $event->status,
                'location' => $event->location,
                'riderName' => $event->rider_name,
                'riderPhone' => $event->rider_phone,
                'remarks' => $event->remarks,
                'occurredAt' => $event->occurred_at?->format('M d, Y h:i A'),
            ]),
        ];
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
