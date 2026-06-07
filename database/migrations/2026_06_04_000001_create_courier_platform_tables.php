<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seller_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('business_name');
            $table->string('cnic_number')->unique();
            $table->string('cnic_front_path')->nullable();
            $table->string('cnic_back_path')->nullable();
            $table->string('city');
            $table->string('bank_name')->nullable();
            $table->string('bank_account_title')->nullable();
            $table->string('bank_account_number')->nullable();
            $table->string('wallet_provider')->nullable();
            $table->string('wallet_number')->nullable();
            $table->boolean('terms_accepted')->default(false);
            $table->string('verification_status')->default('pending')->index();
            $table->timestamps();
        });

        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('province')->nullable();
            $table->boolean('same_day_cod_enabled')->default(false);
            $table->timestamps();
        });

        Schema::create('couriers', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('code')->unique();
            $table->string('logo_path')->nullable();
            $table->string('api_status')->default('sandbox');
            $table->decimal('base_success_rate', 5, 2)->default(90);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('courier_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('courier_id')->constrained()->cascadeOnDelete();
            $table->foreignId('city_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('base_weight_grams')->default(500);
            $table->unsignedInteger('base_rate_paisa');
            $table->unsignedInteger('additional_kg_rate_paisa')->default(0);
            $table->unsignedInteger('our_fee_paisa')->default(0);
            $table->unsignedTinyInteger('delivery_days_min')->default(1);
            $table->unsignedTinyInteger('delivery_days_max')->default(3);
            $table->decimal('success_rate', 5, 2)->default(90);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['courier_id', 'city_id']);
        });

        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('courier_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('city_id')->nullable()->constrained()->nullOnDelete();
            $table->string('tracking_number')->unique();
            $table->string('external_awb')->nullable();
            $table->string('receiver_name');
            $table->string('receiver_phone');
            $table->text('receiver_address');
            $table->string('receiver_area')->nullable();
            $table->unsignedInteger('weight_grams');
            $table->string('parcel_type');
            $table->unsignedInteger('cod_amount_paisa')->default(0);
            $table->unsignedInteger('shipping_charge_paisa')->default(0);
            $table->unsignedInteger('our_fee_paisa')->default(0);
            $table->string('status')->default('booked')->index();
            $table->text('description')->nullable();
            $table->text('special_instructions')->nullable();
            $table->timestamp('booked_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('returned_at')->nullable();
            $table->string('return_reason')->nullable();
            $table->string('proof_photo_path')->nullable();
            $table->timestamps();
        });

        Schema::create('tracking_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipment_id')->constrained()->cascadeOnDelete();
            $table->string('status');
            $table->string('location')->nullable();
            $table->string('rider_name')->nullable();
            $table->string('rider_phone')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamp('occurred_at')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tracking_events');
        Schema::dropIfExists('shipments');
        Schema::dropIfExists('courier_rates');
        Schema::dropIfExists('couriers');
        Schema::dropIfExists('cities');
        Schema::dropIfExists('seller_profiles');
    }
};
