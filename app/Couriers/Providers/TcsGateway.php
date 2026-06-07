<?php

namespace App\Couriers\Providers;

use App\Couriers\DTOs\BookingData;
use App\Couriers\DTOs\BookingResult;
use App\Couriers\DTOs\CancellationResult;
use App\Couriers\DTOs\ReturnProofResult;
use App\Couriers\DTOs\TrackingEventData;
use App\Couriers\DTOs\TrackingResult;
use Carbon\CarbonImmutable;

class TcsGateway extends SandboxCourierGateway
{
    public function book(BookingData $booking): BookingResult
    {
        if ($this->isSandbox()) {
            return parent::book($booking);
        }

        $response = $this->http->baseUrl($this->baseUrl())
            ->acceptJson()
            ->asJson()
            ->post($this->config['book_endpoint'] ?? '/book', [
                'account_number' => $this->config['account_number'],
                'username' => $this->config['username'],
                'password' => $this->config['password'],
                'reference' => $booking->trackingNumber,
                'receiver_name' => $booking->receiverName,
                'receiver_phone' => $booking->receiverPhone,
                'receiver_address' => $booking->receiverAddress,
                'city' => $booking->receiverCity,
                'weight_grams' => $booking->weightGrams,
                'cod_amount' => $booking->codAmountRupees(),
                'description' => $booking->description,
            ]);

        if ($response->failed()) {
            return BookingResult::failed('TCS booking API failed.', $response->body());
        }

        $payload = $response->json();
        $awb = data_get($payload, 'awb') ?? data_get($payload, 'consignment_number') ?? data_get($payload, 'tracking_number');

        return $awb
            ? BookingResult::success((string) $awb, data_get($payload, 'label_url'), $response->body())
            : BookingResult::failed('TCS booking API did not return an AWB.', $response->body());
    }

    public function track(string $awb): TrackingResult
    {
        if ($this->isSandbox()) {
            return parent::track($awb);
        }

        $response = $this->http->baseUrl($this->baseUrl())
            ->acceptJson()
            ->get($this->config['track_endpoint'] ?? '/track', [
                'account_number' => $this->config['account_number'],
                'username' => $this->config['username'],
                'password' => $this->config['password'],
                'awb' => $awb,
            ]);

        if ($response->failed()) {
            return TrackingResult::failed('TCS tracking API failed.', $response->body());
        }

        $payload = $response->json();
        $status = data_get($payload, 'status', 'transit');
        $events = collect(data_get($payload, 'events', []))->map(fn (array $event) => new TrackingEventData(
            status: data_get($event, 'status', $status),
            location: data_get($event, 'location'),
            remarks: data_get($event, 'remarks'),
            occurredAt: new CarbonImmutable(data_get($event, 'occurred_at', now())),
        ))->all();

        return TrackingResult::success($status, $events, $response->body());
    }

    public function cancel(string $awb): CancellationResult
    {
        if ($this->isSandbox()) {
            return parent::cancel($awb);
        }

        $response = $this->http->baseUrl($this->baseUrl())
            ->acceptJson()
            ->asJson()
            ->post($this->config['cancel_endpoint'] ?? '/cancel', [
                'account_number' => $this->config['account_number'],
                'username' => $this->config['username'],
                'password' => $this->config['password'],
                'awb' => $awb,
            ]);

        return $response->successful()
            ? CancellationResult::success($response->body())
            : CancellationResult::failed('TCS cancellation API failed.', $response->body());
    }

    public function returnProof(string $awb): ReturnProofResult
    {
        if ($this->isSandbox() || empty($this->config['return_proof_endpoint'])) {
            return parent::returnProof($awb);
        }

        $response = $this->http->baseUrl($this->baseUrl())
            ->acceptJson()
            ->get($this->config['return_proof_endpoint'], [
                'account_number' => $this->config['account_number'],
                'username' => $this->config['username'],
                'password' => $this->config['password'],
                'awb' => $awb,
            ]);

        if ($response->failed()) {
            return ReturnProofResult::failed('TCS return proof API failed.', $response->body());
        }

        $payload = $response->json();
        $proof = [
            'status' => data_get($payload, 'status', 'verified'),
            'attempts' => (int) data_get($payload, 'attempts', 0),
            'last_attempt_at' => data_get($payload, 'last_attempt_at'),
            'buyer_response' => data_get($payload, 'buyer_response'),
            'rider_statement' => data_get($payload, 'rider_statement'),
            'rider_name' => data_get($payload, 'rider.name'),
            'rider_phone' => data_get($payload, 'rider.phone'),
            'geo_location' => data_get($payload, 'geo_location'),
            'courier_reference' => data_get($payload, 'courier_reference'),
            'call_recording_url' => data_get($payload, 'call_recording_url'),
            'photo_url' => data_get($payload, 'photo_url'),
        ];

        return ReturnProofResult::success($proof, $response->body());
    }
}
