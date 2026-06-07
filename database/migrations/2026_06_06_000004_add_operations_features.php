<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->timestamp('return_stock_recovered_at')->nullable()->after('returned_at');
        });

        Schema::create('pickup_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('shipping_manifest_id')->nullable()->constrained()->nullOnDelete();
            $table->string('pickup_number')->unique();
            $table->string('pickup_address');
            $table->date('pickup_date');
            $table->string('time_window')->default('12:00-18:00');
            $table->string('status')->default('requested')->index();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('customer_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('city_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('phone');
            $table->text('address');
            $table->string('area')->nullable();
            $table->unsignedInteger('orders_count')->default(0);
            $table->timestamp('last_order_at')->nullable();
            $table->timestamps();
            $table->unique(['seller_id', 'phone']);
        });

        Schema::create('notification_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('shipment_id')->nullable()->constrained()->nullOnDelete();
            $table->string('recipient_phone');
            $table->string('channel')->default('whatsapp');
            $table->string('event_type');
            $table->string('status')->default('queued');
            $table->text('message');
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });

        Schema::create('team_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->string('email');
            $table->string('role');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['seller_id', 'email']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('team_members');
        Schema::dropIfExists('notification_events');
        Schema::dropIfExists('customer_addresses');
        Schema::dropIfExists('pickup_requests');

        Schema::table('shipments', function (Blueprint $table) {
            $table->dropColumn('return_stock_recovered_at');
        });
    }
};
