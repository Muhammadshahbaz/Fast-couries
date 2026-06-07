<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('couriers', function (Blueprint $table) {
            $table->string('country_scope')->default('pakistan')->after('api_status');
            $table->json('api_capabilities')->nullable()->after('country_scope');
            $table->timestamp('last_api_health_check_at')->nullable()->after('api_capabilities');
        });

        Schema::table('shipments', function (Blueprint $table) {
            $table->string('label_url')->nullable()->after('external_awb');
            $table->json('courier_payload')->nullable()->after('proof_photo_path');
            $table->timestamp('api_synced_at')->nullable()->after('courier_payload');
        });
    }

    public function down(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->dropColumn(['label_url', 'courier_payload', 'api_synced_at']);
        });

        Schema::table('couriers', function (Blueprint $table) {
            $table->dropColumn(['country_scope', 'api_capabilities', 'last_api_health_check_at']);
        });
    }
};
