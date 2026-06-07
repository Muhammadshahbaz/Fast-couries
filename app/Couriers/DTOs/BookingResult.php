<?php

namespace App\Couriers\DTOs;

readonly class BookingResult
{
    public function __construct(
        public bool $successful,
        public ?string $externalAwb,
        public ?string $labelUrl,
        public ?string $rawResponse = null,
        public ?string $errorMessage = null,
    ) {
    }

    public static function success(string $externalAwb, ?string $labelUrl = null, ?string $rawResponse = null): self
    {
        return new self(true, $externalAwb, $labelUrl, $rawResponse);
    }

    public static function failed(string $errorMessage, ?string $rawResponse = null): self
    {
        return new self(false, null, null, $rawResponse, $errorMessage);
    }
}
