<?php

namespace App\Couriers;

use App\Couriers\Contracts\CourierGateway;
use App\Couriers\Providers\SandboxCourierGateway;
use Illuminate\Contracts\Container\Container;
use Illuminate\Http\Client\Factory as HttpFactory;
use InvalidArgumentException;

class CourierManager
{
    public function __construct(
        private readonly Container $container,
        private readonly HttpFactory $http,
    ) {
    }

    public function gateway(string $code): CourierGateway
    {
        $code = strtoupper($code);
        $config = config("couriers.providers.$code");

        if ($config === null) {
            throw new InvalidArgumentException("Courier provider [$code] is not configured.");
        }

        $gatewayClass = $config['gateway'] ?? SandboxCourierGateway::class;

        return $this->container->make($gatewayClass, [
            'courierCode' => $code,
            'config' => $config,
            'http' => $this->http,
        ]);
    }
}
