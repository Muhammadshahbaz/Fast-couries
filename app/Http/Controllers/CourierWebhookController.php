<?php

namespace App\Http\Controllers;

use App\Models\Courier;
use App\Models\Shipment;
use App\Models\TrackingEvent;
use Illuminate\Support\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;

class CourierWebhookController extends Controller
{
    public function __invoke(Request $request, string $code): JsonResponse
    {
        $courier = Courier::where('code', strtoupper($code))->firstOrFail();
        $secret = $courier->webhook_secret ?: config("couriers.providers.{$courier->code}.webhook_secret");

        abort_unless($secret && hash_equals($secret, (string) $request->header('X-Fast-Couriers-Webhook-Secret')), 403);

        $validated = $request->validate([
            'awb' => ['nullable', 'string', 'max:120'],
            'tracking_number' => ['nullable', 'string', 'max:120'],
            'status' => ['required', Rule::in(['booked', 'picked', 'transit', 'out_for_delivery', 'delivered', 'returned', 'cancelled'])],
            'occurred_at' => ['nullable', 'date'],
            'location' => ['nullable', 'string', 'max:255'],
            'remarks' => ['nullable', 'string', 'max:1000'],
            'rider_name' => ['nullable', 'string', 'max:120'],
            'rider_phone' => ['nullable', 'string', 'max:30'],
            'return_reason' => ['nullable', 'string', 'max:500'],
            'return_proof' => ['nullable', 'array'],
            'return_proof.status' => ['nullable', 'string', 'max:50'],
            'return_proof.attempts' => ['nullable', 'integer', 'min:0', 'max:20'],
            'return_proof.last_attempt_at' => ['nullable', 'date'],
            'return_proof.buyer_response' => ['nullable', 'string', 'max:500'],
            'return_proof.rider_statement' => ['nullable', 'string', 'max:1000'],
            'return_proof.rider_name' => ['nullable', 'string', 'max:120'],
            'return_proof.rider_phone' => ['nullable', 'string', 'max:30'],
            'return_proof.geo_location' => ['nullable', 'string', 'max:255'],
            'return_proof.courier_reference' => ['nullable', 'string', 'max:120'],
            'return_proof.call_recording_url' => ['nullable', 'url', 'max:1000'],
            'return_proof.photo_url' => ['nullable', 'url', 'max:1000'],
        ]);

        abort_unless(($validated['awb'] ?? null) || ($validated['tracking_number'] ?? null), 422);

        $shipment = Shipment::query()
            ->where('courier_id', $courier->id)
            ->where(function ($query) use ($validated) {
                $query->when($validated['awb'] ?? null, fn ($query, $awb) => $query->orWhere('external_awb', $awb))
                    ->when($validated['tracking_number'] ?? null, fn ($query, $trackingNumber) => $query->orWhere('tracking_number', $trackingNumber));
            })
            ->firstOrFail();

        $returnProof = $validated['return_proof'] ?? null;

        $shipment->forceFill([
            'status' => $validated['status'],
            'delivered_at' => $validated['status'] === 'delivered' ? ($shipment->delivered_at ?? now()) : $shipment->delivered_at,
            'returned_at' => $validated['status'] === 'returned' ? ($shipment->returned_at ?? now()) : $shipment->returned_at,
            'return_reason' => $validated['status'] === 'returned' ? ($validated['return_reason'] ?? Arr::get($returnProof, 'buyer_response') ?? $shipment->return_reason) : $shipment->return_reason,
            'return_proof' => $validated['status'] === 'returned' ? ($returnProof ?? $shipment->return_proof) : $shipment->return_proof,
            'return_proof_verified_at' => $returnProof ? now() : $shipment->return_proof_verified_at,
            'courier_payload' => $request->all(),
            'api_synced_at' => now(),
        ])->save();

        TrackingEvent::firstOrCreate([
            'shipment_id' => $shipment->id,
            'status' => $validated['status'],
            'occurred_at' => isset($validated['occurred_at']) ? Carbon::parse($validated['occurred_at']) : now(),
        ], [
            'location' => $validated['location'] ?? $shipment->city?->name,
            'rider_name' => $validated['rider_name'] ?? Arr::get($returnProof, 'rider_name'),
            'rider_phone' => $validated['rider_phone'] ?? Arr::get($returnProof, 'rider_phone'),
            'remarks' => $validated['remarks'] ?? $validated['return_reason'] ?? Arr::get($returnProof, 'rider_statement'),
        ]);

        return response()->json([
            'ok' => true,
            'shipment' => $shipment->tracking_number,
            'status' => $shipment->status,
        ]);
    }
}
