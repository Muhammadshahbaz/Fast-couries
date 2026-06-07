<?php

namespace App\Couriers\DTOs;

readonly class CancellationResult
{
    public function __construct(
        public bool $successful,
        public ?string $rawResponse = null,
        public ?string $errorMessage = null,
    ) {
    }

    public static function success(?string $rawResponse = null): self
    {
        return new self(true, $rawResponse);
    }

    public static function failed(string $errorMessage, ?string $rawResponse = null): self
    {
        return new self(false, $rawResponse, $errorMessage);
    }
}
