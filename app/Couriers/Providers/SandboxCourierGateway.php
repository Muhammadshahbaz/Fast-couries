<?php

namespace App\Couriers\Providers;

use App\Couriers\DTOs\BookingData;
use App\Couriers\DTOs\BookingResult;
use App\Couriers\DTOs\CancellationResult;
use App\Couriers\DTOs\ReturnProofResult;
use App\Couriers\DTOs\TrackingEventData;
use App\Couriers\DTOs\TrackingResult;
use Carbon\CarbonImmutable;
use Illuminate\Http\Client\Factory as HttpFactory;

class SandboxCourierGateway extends AbstractCourierGateway
{
    public function __construct(
        protected readonly string $courierCode,
        array $config,
        HttpFactory $http,
    ) {
        parent::__construct($config, $http);
    }

    public function code(): string
    {
        return $this->courierCode;
    }

    public function book(BookingData $booking): BookingResult
    {
        $awb = strtoupper($this->courierCode).'-SANDBOX-'.substr($booking->trackingNumber, -8);

        return BookingResult::success(
            externalAwb: $awb,
            labelUrl: route('couriers.labels.sandbox', ['awb' => $awb], absolute: false),
            rawResponse: json_encode([
                'mode' => 'sandbox',
                'courier' => $this->courierCode,
                'awb' => $awb,
            ]),
        );
    }

    public function track(string $awb): TrackingResult
    {
        $isReturn = str_contains($awb, 'RETURN');
        $status = $isReturn ? 'returned' : 'transit';

        return TrackingResult::success($status, [
            new TrackingEventData(
                status: 'booked',
                location: 'Sandbox booking desk',
                remarks: 'Shipment accepted by '.$this->courierCode.'.',
                occurredAt: CarbonImmutable::now()->subHours(6),
            ),
            new TrackingEventData(
                status: $status,
                location: $isReturn ? 'Sandbox delivery zone' : 'Sandbox hub',
                remarks: $isReturn ? 'Buyer refused delivery after verified rider attempt.' : 'Shipment is moving through the '.$this->courierCode.' network.',
                occurredAt: CarbonImmutable::now()->subHour(),
                riderName: $isReturn ? 'Sandbox Rider' : null,
                riderPhone: $isReturn ? '03009990000' : null,
            ),
        ], json_encode([
            'mode' => 'sandbox',
            'awb' => $awb,
            'status' => $status,
        ]));
    }

    public function returnProof(string $awb): ReturnProofResult
    {
        $proof = [
            'status' => 'verified',
            'attempts' => 3,
            'last_attempt_at' => now()->subHour()->format('Y-m-d H:i:s'),
            'buyer_response' => 'Buyer refused delivery after rider call.',
            'rider_statement' => 'Rider reached the receiver address, called the buyer twice, and waited before marking return.',
            'rider_name' => 'Sandbox Rider',
            'rider_phone' => '03009990000',
            'geo_location' => 'Sandbox delivery zone',
            'courier_reference' => 'RET-'.$awb,
            'call_recording_url' => route('couriers.proof.call-recording.sandbox', ['awb' => $awb], absolute: false),
            'photo_url' => route('couriers.proof.attempt-photo.sandbox', ['awb' => $awb], absolute: false),
        ];

        return ReturnProofResult::success($proof, json_encode($proof));
    }

    public function cancel(string $awb): CancellationResult
    {
        return CancellationResult::success(json_encode([
            'mode' => 'sandbox',
            'awb' => $awb,
            'cancelled' => true,
        ]));
    }
}
