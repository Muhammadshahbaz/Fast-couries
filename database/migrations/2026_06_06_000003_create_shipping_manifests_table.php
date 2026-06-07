<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipping_manifests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();
            $table->string('manifest_number')->unique();
            $table->json('shipment_ids');
            $table->unsignedInteger('total_shipments')->default(0);
            $table->unsignedBigInteger('total_cod_paisa')->default(0);
            $table->string('status')->default('ready');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipping_manifests');
    }
};
