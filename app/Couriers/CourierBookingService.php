<?php

namespace App\Couriers;

use App\Couriers\DTOs\BookingData;
use App\Models\Shipment;
use App\Models\TrackingEvent;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CourierBookingService
{
    public function __construct(private readonly CourierManager $couriers)
    {
    }

    public function book(Shipment $shipment): Shipment
    {
        $shipment->loadMissing(['courier', 'city']);

        if (! $shipment->courier) {
            throw new RuntimeException('Shipment has no courier assigned.');
        }

        $result = $this->couriers
            ->gateway($shipment->courier->code)
            ->book(BookingData::fromShipment($shipment));

        if (! $result->successful || $result->externalAwb === null) {
            throw new RuntimeException($result->errorMessage ?? 'Courier booking failed.');
        }

        return DB::transaction(function () use ($shipment, $result) {
            $shipment->forceFill([
                'external_awb' => $result->externalAwb,
                'label_url' => $result->labelUrl,
                'courier_payload' => $result->rawResponse,
                'api_synced_at' => now(),
            ])->save();

            TrackingEvent::create([
                'shipment_id' => $shipment->id,
                'status' => 'booked',
                'location' => $shipment->city?->name,
                'remarks' => 'Booked with '.$shipment->courier?->name.' API.',
                'occurred_at' => now(),
            ]);

            return $shipment->refresh();
        });
    }
}
