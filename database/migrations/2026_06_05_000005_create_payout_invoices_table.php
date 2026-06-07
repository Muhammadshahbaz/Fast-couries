<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payout_invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();
            $table->string('invoice_number')->unique();
            $table->unsignedInteger('gross_cod_paisa')->default(0);
            $table->unsignedInteger('bank_charge_paisa')->default(0);
            $table->unsignedInteger('cash_handling_paisa')->default(0);
            $table->unsignedInteger('cod_fee_paisa')->default(0);
            $table->unsignedInteger('net_payable_paisa')->default(0);
            $table->string('status')->default('generated')->index();
            $table->timestamp('generated_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });

        Schema::create('payout_invoice_shipment', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payout_invoice_id')->constrained()->cascadeOnDelete();
            $table->foreignId('shipment_id')->unique()->constrained()->cascadeOnDelete();
            $table->unsignedInteger('cod_amount_paisa')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payout_invoice_shipment');
        Schema::dropIfExists('payout_invoices');
    }
};
