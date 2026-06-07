<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedTinyInteger('address_score')->nullable()->after('customer_area');
            $table->string('address_verification_level')->nullable()->after('address_score')->index();
            $table->json('address_verification')->nullable()->after('address_verification_level');
        });

        Schema::table('shipments', function (Blueprint $table) {
            $table->unsignedTinyInteger('address_score')->nullable()->after('receiver_area');
            $table->string('address_verification_level')->nullable()->after('address_score')->index();
            $table->json('address_verification')->nullable()->after('address_verification_level');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'address_score',
                'address_verification_level',
                'address_verification',
            ]);
        });

        Schema::table('shipments', function (Blueprint $table) {
            $table->dropColumn([
                'address_score',
                'address_verification_level',
                'address_verification',
            ]);
        });
    }
};
