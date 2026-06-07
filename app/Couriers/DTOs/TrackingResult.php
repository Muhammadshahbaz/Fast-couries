<?php

namespace App\Couriers\DTOs;

readonly class TrackingResult
{
    /**
     * @param list<TrackingEventData> $events
     */
    public function __construct(
        public bool $successful,
        public string $status,
        public array $events = [],
        public ?string $rawResponse = null,
        public ?string $errorMessage = null,
    ) {
    }

    /**
     * @param list<TrackingEventData> $events
     */
    public static function success(string $status, array $events, ?string $rawResponse = null): self
    {
        return new self(true, $status, $events, $rawResponse);
    }

    public static function failed(string $errorMessage, ?string $rawResponse = null): self
    {
        return new self(false, 'unknown', [], $rawResponse, $errorMessage);
    }
}
