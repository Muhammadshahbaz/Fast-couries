<?php

namespace App\Couriers\Contracts;

use App\Couriers\DTOs\BookingData;
use App\Couriers\DTOs\BookingResult;
use App\Couriers\DTOs\CancellationResult;
use App\Couriers\DTOs\ReturnProofResult;
use App\Couriers\DTOs\TrackingResult;

interface CourierGateway
{
    public function code(): string;

    public function book(BookingData $booking): BookingResult;

    public function track(string $awb): TrackingResult;

    public function returnProof(string $awb): ReturnProofResult;

    public function cancel(string $awb): CancellationResult;
}
