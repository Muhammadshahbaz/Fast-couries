<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->json('return_proof')->nullable()->after('return_reason');
            $table->timestamp('return_proof_verified_at')->nullable()->after('return_proof');
        });
    }

    public function down(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->dropColumn(['return_proof', 'return_proof_verified_at']);
        });
    }
};
