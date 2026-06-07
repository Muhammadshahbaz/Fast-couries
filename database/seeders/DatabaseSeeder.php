<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Courier;
use App\Models\CourierRate;
use App\Models\InventoryProduct;
use App\Models\Order;
use App\Models\Shipment;
use App\Models\SupportTicket;
use App\Models\TrackingEvent;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $seller = User::factory()->create([
            'name' => 'Ayesha Khan',
            'email' => 'seller@example.com',
            'phone' => '03001234567',
            'role' => 'seller',
            'phone_verified' => true,
            'phone_verified_at' => now(),
            'password' => Hash::make('password'),
        ]);

        $seller->sellerProfile()->create([
            'business_name' => 'Khan Apparel',
            'cnic_number' => '42101-1234567-1',
            'city' => 'Karachi',
            'bank_name' => 'Meezan Bank',
            'bank_account_title' => 'Ayesha Khan',
            'bank_account_number' => 'PK36MEZN0000001122334455',
            'wallet_provider' => 'JazzCash',
            'wallet_number' => '03001234567',
            'terms_accepted' => true,
            'verification_status' => 'verified',
        ]);

        $products = collect([
            ['name' => 'Cotton T-Shirt Black', 'sku' => 'TSHIRT-BLK-M', 'description' => 'Medium black cotton t-shirt', 'weight_grams' => 450, 'stock_on_hand' => 38, 'low_stock_alert' => 8],
            ['name' => 'Women Lawn Suit', 'sku' => 'LAWN-3PC-001', 'description' => 'Three-piece stitched lawn suit', 'weight_grams' => 900, 'stock_on_hand' => 14, 'low_stock_alert' => 5],
            ['name' => 'Kids Hoodie', 'sku' => 'HOODIE-KID-RED', 'description' => 'Red winter hoodie for kids', 'weight_grams' => 750, 'stock_on_hand' => 4, 'low_stock_alert' => 6],
        ])->map(fn (array $product) => InventoryProduct::create($product + [
            'seller_id' => $seller->id,
            'is_active' => true,
        ]));

        User::factory()->create([
            'name' => 'Ops Admin',
            'email' => 'admin@example.com',
            'phone' => '03007654321',
            'role' => 'super_admin',
            'two_factor_enabled' => true,
            'password' => Hash::make('password'),
        ]);

        $cities = collect([
            ['name' => 'Karachi', 'province' => 'Sindh', 'same_day_cod_enabled' => true],
            ['name' => 'Lahore', 'province' => 'Punjab', 'same_day_cod_enabled' => true],
            ['name' => 'Islamabad', 'province' => 'ICT', 'same_day_cod_enabled' => true],
            ['name' => 'Rawalpindi', 'province' => 'Punjab', 'same_day_cod_enabled' => true],
            ['name' => 'Faisalabad', 'province' => 'Punjab', 'same_day_cod_enabled' => false],
            ['name' => 'Multan', 'province' => 'Punjab', 'same_day_cod_enabled' => false],
            ['name' => 'Peshawar', 'province' => 'Khyber Pakhtunkhwa', 'same_day_cod_enabled' => false],
            ['name' => 'Quetta', 'province' => 'Balochistan', 'same_day_cod_enabled' => false],
        ])->mapWithKeys(fn (array $city) => [$city['name'] => City::create($city)]);

        $couriers = collect([
            ['name' => 'TCS', 'code' => 'TCS', 'api_status' => 'sandbox', 'api_mode' => 'sandbox', 'api_credentials_status' => 'configured', 'country_scope' => 'pakistan', 'base_success_rate' => 94],
            ['name' => 'FedEx', 'code' => 'FDX', 'api_status' => 'sandbox', 'api_mode' => 'sandbox', 'api_credentials_status' => 'configured', 'country_scope' => 'international', 'base_success_rate' => 95],
            ['name' => 'Leopards', 'code' => 'LCS', 'api_status' => 'sandbox', 'api_mode' => 'sandbox', 'api_credentials_status' => 'configured', 'country_scope' => 'pakistan', 'base_success_rate' => 91],
            ['name' => 'Trax', 'code' => 'TRX', 'api_status' => 'sandbox', 'api_mode' => 'sandbox', 'api_credentials_status' => 'configured', 'country_scope' => 'pakistan', 'base_success_rate' => 90],
            ['name' => 'M&P', 'code' => 'MNP', 'api_status' => 'sandbox', 'api_mode' => 'sandbox', 'api_credentials_status' => 'configured', 'country_scope' => 'pakistan', 'base_success_rate' => 90],
            ['name' => 'BlueEx', 'code' => 'BEX', 'api_status' => 'sandbox', 'api_mode' => 'sandbox', 'api_credentials_status' => 'configured', 'country_scope' => 'pakistan', 'base_success_rate' => 89],
            ['name' => 'Overland', 'code' => 'OVR', 'api_status' => 'sandbox', 'api_mode' => 'sandbox', 'api_credentials_status' => 'configured', 'country_scope' => 'pakistan', 'base_success_rate' => 87],
            ['name' => 'Call Courier', 'code' => 'CC', 'api_status' => 'sandbox', 'api_mode' => 'sandbox', 'api_credentials_status' => 'configured', 'country_scope' => 'pakistan', 'base_success_rate' => 88],
        ])->mapWithKeys(fn (array $courier) => [$courier['code'] => Courier::create($courier + [
            'api_capabilities' => [
                'book' => true,
                'track' => true,
                'cancel' => true,
                'label' => true,
                'webhook' => true,
                'return_proof' => true,
            ],
            'webhook_secret' => 'demo-'.$courier['code'].'-secret',
            'last_api_health_check_at' => now()->subMinutes(random_int(5, 90)),
        ])]);

        foreach ($cities as $cityName => $city) {
            foreach ($couriers as $courierCode => $courier) {
                $rateCard = match ($courierCode) {
                    'TCS' => [
                        'base_weight_grams' => 500,
                        'base_rate_paisa' => 28000,
                        'additional_kg_rate_paisa' => 30000,
                        'rate_slabs' => [
                            ['upto_grams' => 500, 'rate_paisa' => 28000],
                            ['upto_grams' => 1000, 'rate_paisa' => 30000],
                            ['extra_kg_rate_paisa' => 30000],
                        ],
                    ],
                    'OVR' => [
                        'base_weight_grams' => 5000,
                        'base_rate_paisa' => 45000,
                        'additional_kg_rate_paisa' => 10000,
                        'rate_slabs' => [
                            ['upto_grams' => 5000, 'rate_paisa' => 45000],
                            ['extra_kg_rate_paisa' => 10000],
                        ],
                    ],
                    'LCS', 'TRX', 'MNP', 'BEX' => [
                        'base_weight_grams' => 500,
                        'base_rate_paisa' => 24899,
                        'additional_kg_rate_paisa' => 15660,
                        'rate_slabs' => [
                            ['upto_grams' => 500, 'rate_paisa' => 24899],
                            ['upto_grams' => 1000, 'rate_paisa' => 28188],
                            ['extra_kg_rate_paisa' => 15660],
                        ],
                    ],
                    default => [
                        'base_weight_grams' => 500,
                        'base_rate_paisa' => 32000,
                        'additional_kg_rate_paisa' => 18000,
                        'rate_slabs' => [
                            ['upto_grams' => 500, 'rate_paisa' => 32000],
                            ['upto_grams' => 1000, 'rate_paisa' => 38000],
                            ['extra_kg_rate_paisa' => 18000],
                        ],
                    ],
                };

                CourierRate::create([
                    'courier_id' => $courier->id,
                    'city_id' => $city->id,
                    'base_weight_grams' => $rateCard['base_weight_grams'],
                    'base_rate_paisa' => $rateCard['base_rate_paisa'],
                    'additional_kg_rate_paisa' => $rateCard['additional_kg_rate_paisa'],
                    'rate_slabs' => $rateCard['rate_slabs'],
                    'our_fee_paisa' => 0,
                    'delivery_days_min' => $city->same_day_cod_enabled ? 1 : 2,
                    'delivery_days_max' => in_array($cityName, ['Quetta', 'Peshawar'], true) ? 5 : 3,
                    'success_rate' => $courier->base_success_rate - (in_array($cityName, ['Quetta'], true) ? 3 : 0),
                ]);
            }
        }

        Order::create([
            'seller_id' => $seller->id,
            'inventory_product_id' => $products[0]->id,
            'city_id' => $cities['Lahore']->id,
            'order_number' => 'ORD-'.now()->format('ymd').'-DEMO1',
            'customer_name' => 'Nida Hassan',
            'customer_phone' => '03008887777',
            'customer_address' => 'House 45, Model Town',
            'customer_area' => 'Model Town',
            'quantity' => 2,
            'cod_amount_paisa' => 420000,
            'status' => 'pending',
            'notes' => 'Pack both shirts together.',
        ]);

        Order::create([
            'seller_id' => $seller->id,
            'inventory_product_id' => $products[2]->id,
            'city_id' => $cities['Islamabad']->id,
            'order_number' => 'ORD-'.now()->format('ymd').'-DEMO2',
            'customer_name' => 'Zain Malik',
            'customer_phone' => '03112223333',
            'customer_address' => 'Street 8, G-10',
            'customer_area' => 'G-10',
            'quantity' => 1,
            'cod_amount_paisa' => 285000,
            'status' => 'packed',
            'notes' => 'Customer requested evening delivery.',
        ]);

        $statuses = ['booked', 'picked', 'transit', 'out_for_delivery', 'delivered', 'returned'];
        $receiverNames = ['Hamza Ali', 'Sara Ahmed', 'Bilal Raza', 'Mariam Noor', 'Usman Shah', 'Hina Malik'];

        foreach (range(0, 23) as $index) {
            $city = $cities->values()[$index % $cities->count()];
            $rate = CourierRate::where('city_id', $city->id)->orderBy('base_rate_paisa')->first();
            $status = $statuses[$index % count($statuses)];
            $bookedAt = now()->subDays($index % 8)->subHours($index);

            $shipment = Shipment::create([
                'seller_id' => $seller->id,
                'courier_id' => $rate->courier_id,
                'city_id' => $city->id,
                'inventory_product_id' => $products[$index % $products->count()]->id,
                'product_quantity' => 1,
                'tracking_number' => 'FC'.now()->format('ymd').str_pad((string) ($index + 1), 5, '0', STR_PAD_LEFT),
                'external_awb' => 'PK-'.$rate->courier->code.'-'.str_pad((string) ($index + 100), 6, '0', STR_PAD_LEFT),
                'receiver_name' => $receiverNames[$index % count($receiverNames)],
                'receiver_phone' => '03'.random_int(10, 49).random_int(1000000, 9999999),
                'receiver_address' => 'House '.$index.', Block '.chr(65 + ($index % 5)).', Main Road',
                'receiver_area' => ['Gulshan', 'DHA', 'Model Town', 'Satellite Town'][$index % 4],
                'weight_grams' => [500, 750, 1000, 1500][$index % 4],
                'parcel_type' => ['Document', 'Small Parcel', 'Large Parcel', 'Fragile'][$index % 4],
                'cod_amount_paisa' => [0, 250000, 385000, 499900, 725000][$index % 5],
                'shipping_charge_paisa' => $rate->base_rate_paisa,
                'our_fee_paisa' => $rate->our_fee_paisa,
                'status' => $status,
                'description' => 'Ecommerce order from Khan Apparel',
                'special_instructions' => $index % 3 === 0 ? 'Call before delivery' : null,
                'booked_at' => $bookedAt,
                'delivered_at' => $status === 'delivered' ? $bookedAt->copy()->addDays(2) : null,
                'returned_at' => $status === 'returned' ? $bookedAt->copy()->addDays(3) : null,
                'return_reason' => $status === 'returned' ? 'Customer unavailable' : null,
                'return_proof' => $status === 'returned' ? [
                    'status' => 'verified',
                    'attempts' => 3,
                    'last_attempt_at' => $bookedAt->copy()->addDays(2)->format('Y-m-d H:i:s'),
                    'buyer_response' => 'Buyer refused delivery after rider call.',
                    'rider_statement' => 'Rider reached the receiver address, called the buyer twice, and waited 12 minutes before marking the parcel as return.',
                    'rider_name' => 'Rider '.$index,
                    'rider_phone' => '0300999'.str_pad((string) $index, 4, '0', STR_PAD_LEFT),
                    'geo_location' => $city->name.' delivery zone',
                    'courier_reference' => 'RET-'.$rate->courier->code.'-'.str_pad((string) ($index + 700), 6, '0', STR_PAD_LEFT),
                    'call_recording_url' => route('couriers.proof.call-recording.sandbox', ['awb' => 'PK-'.$rate->courier->code.'-'.str_pad((string) ($index + 100), 6, '0', STR_PAD_LEFT)]),
                    'photo_url' => route('couriers.proof.attempt-photo.sandbox', ['awb' => 'PK-'.$rate->courier->code.'-'.str_pad((string) ($index + 100), 6, '0', STR_PAD_LEFT)]),
                ] : null,
                'return_proof_verified_at' => $status === 'returned' ? $bookedAt->copy()->addDays(3)->addMinutes(20) : null,
            ]);

            TrackingEvent::create([
                'shipment_id' => $shipment->id,
                'status' => 'booked',
                'location' => 'Karachi hub',
                'remarks' => 'Shipment booked through Fast Couriers.',
                'occurred_at' => $bookedAt,
            ]);

            if ($status !== 'booked') {
                TrackingEvent::create([
                    'shipment_id' => $shipment->id,
                    'status' => $status,
                    'location' => $city->name.' facility',
                    'rider_name' => in_array($status, ['out_for_delivery', 'delivered', 'returned'], true) ? 'Rider '.$index : null,
                    'rider_phone' => in_array($status, ['out_for_delivery', 'delivered', 'returned'], true) ? '0300999'.str_pad((string) $index, 4, '0', STR_PAD_LEFT) : null,
                    'remarks' => str_replace('_', ' ', ucfirst($status)),
                    'occurred_at' => $bookedAt->copy()->addDay(),
                ]);
            }
        }

        SupportTicket::create([
            'seller_id' => $seller->id,
            'shipment_id' => Shipment::where('seller_id', $seller->id)->where('status', 'returned')->value('id'),
            'ticket_number' => 'SUP-'.now()->format('ymd').'ABCDE',
            'category' => 'return',
            'priority' => 'urgent',
            'status' => 'open',
            'subject' => 'Need return proof for customer',
            'message' => 'Customer is asking for return proof and rider remarks.',
        ]);

        SupportTicket::create([
            'seller_id' => $seller->id,
            'shipment_id' => Shipment::where('seller_id', $seller->id)->where('status', 'delivered')->value('id'),
            'ticket_number' => 'SUP-'.now()->format('ymd').'FGHIJ',
            'category' => 'payout',
            'priority' => 'normal',
            'status' => 'open',
            'subject' => 'COD payout confirmation',
            'message' => 'Please confirm today payout invoice.',
        ]);
    }
}
