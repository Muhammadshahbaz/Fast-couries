<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->string('sku');
            $table->text('description')->nullable();
            $table->unsignedInteger('weight_grams')->default(500);
            $table->unsignedInteger('stock_on_hand')->default(0);
            $table->unsignedInteger('low_stock_alert')->default(5);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['seller_id', 'sku']);
        });

        Schema::table('shipments', function (Blueprint $table) {
            $table->foreignId('inventory_product_id')->nullable()->after('city_id')->constrained('inventory_products')->nullOnDelete();
            $table->unsignedInteger('product_quantity')->default(1)->after('inventory_product_id');
        });
    }

    public function down(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('inventory_product_id');
            $table->dropColumn('product_quantity');
        });

        Schema::dropIfExists('inventory_products');
    }
};
