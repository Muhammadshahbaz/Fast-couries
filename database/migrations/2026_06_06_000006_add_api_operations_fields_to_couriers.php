<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('couriers', function (Blueprint $table) {
            $table->string('api_mode')->default('sandbox')->after('api_status');
            $table->string('api_credentials_status')->default('missing')->after('api_mode');
            $table->string('webhook_secret')->nullable()->after('last_api_health_check_at');
            $table->text('last_api_error')->nullable()->after('webhook_secret');
        });
    }

    public function down(): void
    {
        Schema::table('couriers', function (Blueprint $table) {
            $table->dropColumn(['api_mode', 'api_credentials_status', 'webhook_secret', 'last_api_error']);
        });
    }
};
