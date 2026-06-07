<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Courier;
use App\Models\CourierRate;
use App\Models\InventoryProduct;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_seller_can_book_with_selected_courier_rate(): void
    {
        $seller = User::factory()->create([
            'role' => 'seller',
            'email_verified_at' => now(),
            'phone' => '03001230000',
        ]);
        $seller->sellerProfile()->create([
            'business_name' => 'Booking Seller',
            'cnic_number' => '35202-1111111-1',
            'city' => 'Lahore',
            'terms_accepted' => true,
            'verification_status' => 'verified',
        ]);

        $city = City::create([
            'name' => 'Karachi',
            'province' => 'Sindh',
            'same_day_cod_enabled' => true,
        ]);

        $tcs = Courier::create([
            'name' => 'TCS',
            'code' => 'TCS',
            'api_status' => 'sandbox',
            'country_scope' => 'pakistan',
            'base_success_rate' => 94,
            'is_active' => true,
        ]);

        $fedEx = Courier::create([
            'name' => 'FedEx',
            'code' => 'FDX',
            'api_status' => 'sandbox',
            'country_scope' => 'international',
            'base_success_rate' => 95,
            'is_active' => true,
        ]);

        CourierRate::create([
            'courier_id' => $tcs->id,
            'city_id' => $city->id,
            'base_weight_grams' => 500,
            'base_rate_paisa' => 30000,
            'additional_kg_rate_paisa' => 10000,
            'our_fee_paisa' => 3000,
            'delivery_days_min' => 1,
            'delivery_days_max' => 2,
            'success_rate' => 94,
        ]);

        $selectedRate = CourierRate::create([
            'courier_id' => $fedEx->id,
            'city_id' => $city->id,
            'base_weight_grams' => 500,
            'base_rate_paisa' => 45000,
            'additional_kg_rate_paisa' => 15000,
            'our_fee_paisa' => 5000,
            'delivery_days_min' => 1,
            'delivery_days_max' => 3,
            'success_rate' => 95,
        ]);
        $product = InventoryProduct::create([
            'seller_id' => $seller->id,
            'name' => 'Cotton T-Shirt',
            'sku' => 'TSHIRT-BLK-M',
            'description' => 'Black cotton t-shirt',
            'weight_grams' => 450,
            'stock_on_hand' => 10,
            'low_stock_alert' => 3,
            'is_active' => true,
        ]);

        $response = $this->actingAs($seller)->post(route('bookings.store'), [
            'receiver_name' => 'Ali Raza',
            'receiver_phone' => '03009998888',
            'receiver_address' => 'House 12, Main Road',
            'receiver_area' => 'Gulshan',
            'city_id' => $city->id,
            'inventory_product_id' => $product->id,
            'product_quantity' => 2,
            'courier_rate_id' => $selectedRate->id,
            'weight_grams' => 1500,
            'parcel_type' => 'Small Parcel',
            'cod_amount_paisa' => 250000,
            'description' => 'Clothing order',
            'special_instructions' => 'Call before delivery',
        ]);

        $shipment = Shipment::first();

        $response->assertRedirect(route('shipments.show', $shipment));

        $this->assertSame($fedEx->id, $shipment->courier_id);
        $this->assertSame($product->id, $shipment->inventory_product_id);
        $this->assertSame(2, $shipment->product_quantity);
        $this->assertSame(60000, $shipment->shipping_charge_paisa);
        $this->assertSame(5000, $shipment->our_fee_paisa);
        $this->assertNotNull($shipment->address_score);
        $this->assertSame('strong', $shipment->address_verification_level);
        $this->assertIsArray($shipment->address_verification);
        $this->assertStringStartsWith('FDX-SANDBOX-', $shipment->external_awb);
        $this->assertSame(8, $product->refresh()->stock_on_hand);
    }

    public function test_booking_rejects_inventory_when_stock_is_insufficient(): void
    {
        $seller = User::factory()->create([
            'role' => 'seller',
            'email_verified_at' => now(),
            'phone' => '03001230003',
        ]);
        $seller->sellerProfile()->create([
            'business_name' => 'Inventory Seller',
            'cnic_number' => '35202-1111111-2',
            'city' => 'Lahore',
            'terms_accepted' => true,
            'verification_status' => 'verified',
        ]);
        $city = City::create(['name' => 'Lahore', 'province' => 'Punjab']);
        $courier = Courier::create(['name' => 'TCS', 'code' => 'TCS', 'api_status' => 'sandbox', 'country_scope' => 'pakistan']);
        $rate = CourierRate::create([
            'courier_id' => $courier->id,
            'city_id' => $city->id,
            'base_weight_grams' => 500,
            'base_rate_paisa' => 30000,
            'additional_kg_rate_paisa' => 10000,
            'delivery_days_min' => 1,
            'delivery_days_max' => 2,
            'success_rate' => 94,
        ]);
        $product = InventoryProduct::create([
            'seller_id' => $seller->id,
            'name' => 'Low Stock Item',
            'sku' => 'LOW-001',
            'weight_grams' => 500,
            'stock_on_hand' => 1,
            'low_stock_alert' => 2,
            'is_active' => true,
        ]);

        $this->actingAs($seller)->post(route('bookings.store'), [
            'receiver_name' => 'Ali Raza',
            'receiver_phone' => '03009998888',
            'receiver_address' => 'House 12, Main Road',
            'city_id' => $city->id,
            'inventory_product_id' => $product->id,
            'product_quantity' => 2,
            'courier_rate_id' => $rate->id,
            'weight_grams' => 500,
            'parcel_type' => 'Small Parcel',
            'cod_amount_paisa' => 250000,
        ])->assertSessionHasErrors('inventory_product_id');

        $this->assertSame(1, $product->refresh()->stock_on_hand);
        $this->assertSame(0, Shipment::count());
    }

    public function test_seller_can_view_bookings_page(): void
    {
        $seller = User::factory()->create([
            'role' => 'seller',
            'email_verified_at' => now(),
            'phone' => '03001230002',
        ]);

        $this->actingAs($seller)
            ->get(route('bookings.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Bookings/Index'));
    }
}
