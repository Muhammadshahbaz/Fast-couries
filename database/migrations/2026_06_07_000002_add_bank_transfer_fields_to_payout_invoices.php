<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payout_invoices', function (Blueprint $table) {
            $table->string('bank_transfer_status')->default('not_ready')->after('status')->index();
            $table->string('bank_provider')->nullable()->after('bank_transfer_status');
            $table->string('bank_export_batch')->nullable()->after('bank_provider')->index();
            $table->string('bank_payment_reference')->nullable()->after('bank_export_batch');
            $table->timestamp('bank_ready_at')->nullable()->after('bank_payment_reference');
            $table->timestamp('bank_exported_at')->nullable()->after('bank_ready_at');
            $table->timestamp('bank_processing_at')->nullable()->after('bank_exported_at');
            $table->timestamp('bank_failed_at')->nullable()->after('bank_processing_at');
            $table->text('bank_failure_reason')->nullable()->after('bank_failed_at');
        });
    }

    public function down(): void
    {
        Schema::table('payout_invoices', function (Blueprint $table) {
            $table->dropColumn([
                'bank_transfer_status',
                'bank_provider',
                'bank_export_batch',
                'bank_payment_reference',
                'bank_ready_at',
                'bank_exported_at',
                'bank_processing_at',
                'bank_failed_at',
                'bank_failure_reason',
            ]);
        });
    }
};
