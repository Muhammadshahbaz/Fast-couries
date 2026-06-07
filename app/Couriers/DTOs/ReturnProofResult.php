<?php

namespace App\Couriers\DTOs;

readonly class ReturnProofResult
{
    public function __construct(
        public bool $successful,
        public array $proof = [],
        public ?string $rawResponse = null,
        public ?string $errorMessage = null,
    ) {
    }

    public static function success(array $proof, ?string $rawResponse = null): self
    {
        return new self(true, $proof, $rawResponse);
    }

    public static function failed(string $errorMessage, ?string $rawResponse = null): self
    {
        return new self(false, [], $rawResponse, $errorMessage);
    }
}
