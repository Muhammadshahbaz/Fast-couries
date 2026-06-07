<?php

namespace App\Couriers;

use App\Models\Shipment;
use App\Models\TrackingEvent;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CourierTrackingService
{
    public function __construct(private readonly CourierManager $couriers)
    {
    }

    public function sync(Shipment $shipment): Shipment
    {
        $shipment->loadMissing('courier');

        if (! $shipment->courier || ! $shipment->external_awb) {
            throw new RuntimeException('Shipment must have a courier and AWB before tracking sync.');
        }

        $gateway = $this->couriers->gateway($shipment->courier->code);
        $result = $gateway->track($shipment->external_awb);

        if (! $result->successful) {
            throw new RuntimeException($result->errorMessage ?? 'Courier tracking failed.');
        }

        return DB::transaction(function () use ($shipment, $result, $gateway) {
            $returnProof = null;

            if ($result->status === 'returned' && $shipment->external_awb) {
                $proofResult = $gateway->returnProof($shipment->external_awb);
                $returnProof = $proofResult->successful ? $proofResult->proof : null;
            }

            $shipment->forceFill([
                'status' => $result->status,
                'returned_at' => $result->status === 'returned' ? ($shipment->returned_at ?? now()) : $shipment->returned_at,
                'return_reason' => $result->status === 'returned' ? ($returnProof['buyer_response'] ?? $shipment->return_reason) : $shipment->return_reason,
                'return_proof' => $returnProof ?? $shipment->return_proof,
                'return_proof_verified_at' => $returnProof ? now() : $shipment->return_proof_verified_at,
                'courier_payload' => $result->rawResponse,
                'api_synced_at' => now(),
            ])->save();

            foreach ($result->events as $event) {
                TrackingEvent::firstOrCreate([
                    'shipment_id' => $shipment->id,
                    'status' => $event->status,
                    'occurred_at' => $event->occurredAt,
                ], [
                    'location' => $event->location,
                    'rider_name' => $event->riderName,
                    'rider_phone' => $event->riderPhone,
                    'remarks' => $event->remarks,
                ]);
            }

            return $shipment->refresh();
        });
    }
}
