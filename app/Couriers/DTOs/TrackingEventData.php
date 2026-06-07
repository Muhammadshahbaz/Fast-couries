<?php

namespace App\Couriers\DTOs;

use Carbon\CarbonImmutable;

readonly class TrackingEventData
{
    public function __construct(
        public string $status,
        public ?string $location,
        public ?string $remarks,
        public CarbonImmutable $occurredAt,
        public ?string $riderName = null,
        public ?string $riderPhone = null,
    ) {
    }
}
