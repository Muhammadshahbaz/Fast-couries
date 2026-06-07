<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Courier;
use App\Models\Shipment;
use App\Models\TrackingEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicSiteTest extends TestCase
{
    use RefreshDatabase;

    public function test_homepage_loads(): void
    {
        $this->get('/')->assertOk();
    }

    public function test_public_tracking_finds_shipment(): void
    {
        $seller = User::factory()->create(['phone' => '03001230001']);
        $city = City::create(['name' => 'Karachi']);
        $courier = Courier::create([
            'name' => 'TCS',
            'code' => 'TCS',
            'api_status' => 'sandbox',
            'base_success_rate' => 94,
        ]);
        $shipment = Shipment::create([
            'seller_id' => $seller->id,
            'courier_id' => $courier->id,
            'city_id' => $city->id,
            'tracking_number' => 'FC260605PUBLIC',
            'receiver_name' => 'Buyer',
            'receiver_phone' => '03009998888',
            'receiver_address' => 'Test address',
            'weight_grams' => 500,
            'parcel_type' => 'Small Parcel',
            'status' => 'transit',
            'booked_at' => now(),
        ]);
        TrackingEvent::create([
            'shipment_id' => $shipment->id,
            'status' => 'transit',
            'location' => 'Karachi hub',
            'remarks' => 'Moving through courier network.',
            'occurred_at' => now(),
        ]);

        $this->get(route('track', ['tracking' => 'FC260605PUBLIC']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Track')
                ->where('shipment.trackingNumber', 'FC260605PUBLIC')
                ->where('shipment.status', 'transit')
            );
    }
}
