<?php

namespace Tests\Feature;

use App\Couriers\CourierBookingService;
use App\Couriers\CourierManager;
use App\Couriers\CourierTrackingService;
use App\Models\City;
use App\Models\Courier;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourierGatewayTest extends TestCase
{
    use RefreshDatabase;

    public function test_configured_courier_gateway_can_be_resolved(): void
    {
        $gateway = app(CourierManager::class)->gateway('TCS');

        $this->assertSame('TCS', $gateway->code());
    }

    public function test_shipment_can_be_booked_through_sandbox_gateway(): void
    {
        $shipment = $this->makeShipment('TCS');

        $booked = app(CourierBookingService::class)->book($shipment);

        $this->assertStringStartsWith('TCS-SANDBOX-', $booked->external_awb);
        $this->assertNotNull($booked->label_url);
        $this->assertNotNull($booked->api_synced_at);
        $this->assertDatabaseHas('tracking_events', [
            'shipment_id' => $shipment->id,
            'status' => 'booked',
            'remarks' => 'Booked with TCS API.',
        ]);
    }

    public function test_shipment_tracking_can_be_synced_through_sandbox_gateway(): void
    {
        $shipment = app(CourierBookingService::class)->book($this->makeShipment('FDX'));

        $synced = app(CourierTrackingService::class)->sync($shipment);

        $this->assertSame('transit', $synced->status);
        $this->assertDatabaseHas('tracking_events', [
            'shipment_id' => $shipment->id,
            'status' => 'transit',
            'location' => 'Sandbox hub',
        ]);
    }

    public function test_returned_tracking_sync_stores_courier_proof(): void
    {
        $shipment = app(CourierBookingService::class)->book($this->makeShipment('TCS'));
        $shipment->forceFill(['external_awb' => 'TCS-SANDBOX-RETURN-0001'])->save();

        $synced = app(CourierTrackingService::class)->sync($shipment);

        $this->assertSame('returned', $synced->status);
        $this->assertNotNull($synced->returned_at);
        $this->assertNotNull($synced->return_proof_verified_at);
        $this->assertSame('verified', $synced->return_proof['status']);
        $this->assertSame('Buyer refused delivery after rider call.', $synced->return_reason);
        $this->assertDatabaseHas('tracking_events', [
            'shipment_id' => $shipment->id,
            'status' => 'returned',
            'location' => 'Sandbox delivery zone',
        ]);
    }

    public function test_return_pages_include_verified_proof_payload(): void
    {
        $this->seed();
        $seller = User::where('email', 'seller@example.com')->firstOrFail();

        $this->actingAs($seller)
            ->get(route('returns.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Returns/Index')
                ->where('returns.0.proof.status', 'verified')
                ->where('returns.0.proof.attempts', 3)
            );
    }

    public function test_courier_webhook_updates_status_and_return_proof(): void
    {
        $shipment = app(CourierBookingService::class)->book($this->makeShipment('TCS'));
        $shipment->courier->forceFill(['webhook_secret' => 'test-secret'])->save();

        $this->postJson(route('webhooks.couriers', ['code' => 'TCS']), [
            'awb' => $shipment->external_awb,
            'status' => 'returned',
            'occurred_at' => now()->toIso8601String(),
            'location' => 'Karachi delivery zone',
            'remarks' => 'Buyer refused delivery after call.',
            'return_reason' => 'Buyer refused delivery',
            'return_proof' => [
                'status' => 'verified',
                'attempts' => 2,
                'last_attempt_at' => now()->toIso8601String(),
                'buyer_response' => 'Buyer refused on recorded call.',
                'rider_statement' => 'Rider reached address and waited 10 minutes.',
                'rider_name' => 'Rider Test',
                'rider_phone' => '03009990000',
                'geo_location' => 'Karachi delivery zone',
                'courier_reference' => 'RET-123',
                'call_recording_url' => 'https://example.com/call.mp3',
                'photo_url' => 'https://example.com/photo.jpg',
            ],
        ], [
            'X-Fast-Couriers-Webhook-Secret' => 'test-secret',
        ])->assertOk()
            ->assertJsonFragment(['status' => 'returned']);

        $shipment->refresh();

        $this->assertSame('returned', $shipment->status);
        $this->assertSame('Buyer refused delivery', $shipment->return_reason);
        $this->assertSame('verified', $shipment->return_proof['status']);
        $this->assertNotNull($shipment->return_proof_verified_at);
        $this->assertDatabaseHas('tracking_events', [
            'shipment_id' => $shipment->id,
            'status' => 'returned',
            'location' => 'Karachi delivery zone',
        ]);
    }

    public function test_admin_courier_page_exposes_integration_readiness(): void
    {
        $this->seed();
        $admin = User::where('email', 'admin@example.com')->firstOrFail();

        $this->actingAs($admin)
            ->get(route('admin.couriers.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Couriers/Index')
                ->where('couriers.0.integration.productionAdapterReady', false)
                ->has('couriers.0.integration.requiredCredentials')
                ->has('couriers.0.integration.readiness', 4)
            );
    }

    public function test_production_health_check_reports_missing_credentials(): void
    {
        $this->seed();
        $admin = User::where('email', 'admin@example.com')->firstOrFail();
        $courier = Courier::where('code', 'TCS')->firstOrFail();

        $courier->forceFill([
            'api_mode' => 'production',
            'api_credentials_status' => 'verified',
        ])->save();

        $this->actingAs($admin)
            ->post(route('admin.couriers.health-check', $courier))
            ->assertRedirect();

        $courier->refresh();

        $this->assertSame('down', $courier->api_status);
        $this->assertStringContainsString('Missing production credential keys', $courier->last_api_error);
        $this->assertNotNull($courier->last_api_health_check_at);
    }

    private function makeShipment(string $courierCode): Shipment
    {
        $seller = User::factory()->create([
            'role' => 'seller',
            'phone' => '03001112222',
        ]);

        $city = City::create([
            'name' => 'Karachi',
            'province' => 'Sindh',
            'same_day_cod_enabled' => true,
        ]);

        $courier = Courier::create([
            'name' => $courierCode === 'FDX' ? 'FedEx' : 'TCS',
            'code' => $courierCode,
            'api_status' => 'sandbox',
            'country_scope' => $courierCode === 'FDX' ? 'international' : 'pakistan',
            'api_capabilities' => [
                'book' => true,
                'track' => true,
                'cancel' => true,
                'label' => true,
            ],
            'base_success_rate' => 94,
            'is_active' => true,
        ]);

        return Shipment::create([
            'seller_id' => $seller->id,
            'courier_id' => $courier->id,
            'city_id' => $city->id,
            'tracking_number' => 'FC26060500001',
            'receiver_name' => 'Test Receiver',
            'receiver_phone' => '03009998888',
            'receiver_address' => 'Test address',
            'receiver_area' => 'Gulshan',
            'weight_grams' => 750,
            'parcel_type' => 'Small Parcel',
            'cod_amount_paisa' => 250000,
            'shipping_charge_paisa' => 28000,
            'our_fee_paisa' => 3000,
            'status' => 'booked',
            'booked_at' => now(),
        ]);
    }
}
