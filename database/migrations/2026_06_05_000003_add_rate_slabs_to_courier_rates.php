<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courier_rates', function (Blueprint $table) {
            $table->json('rate_slabs')->nullable()->after('additional_kg_rate_paisa');
        });
    }

    public function down(): void
    {
        Schema::table('courier_rates', function (Blueprint $table) {
            $table->dropColumn('rate_slabs');
        });
    }
};
