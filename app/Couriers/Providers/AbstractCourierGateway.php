<?php

namespace App\Couriers\Providers;

use App\Couriers\Contracts\CourierGateway;
use Illuminate\Http\Client\Factory as HttpFactory;

abstract class AbstractCourierGateway implements CourierGateway
{
    public function __construct(
        protected readonly array $config,
        protected readonly HttpFactory $http,
    ) {
    }

    protected function baseUrl(): string
    {
        return rtrim($this->config['base_url'] ?? '', '/');
    }

    protected function isSandbox(): bool
    {
        return ($this->config['mode'] ?? 'sandbox') !== 'production';
    }
}
