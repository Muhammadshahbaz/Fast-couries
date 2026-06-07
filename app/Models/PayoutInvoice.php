<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class PayoutInvoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'seller_id',
        'invoice_number',
        'gross_cod_paisa',
        'bank_charge_paisa',
        'cash_handling_paisa',
        'cod_fee_paisa',
        'net_payable_paisa',
        'status',
        'bank_transfer_status',
        'bank_provider',
        'bank_export_batch',
        'bank_payment_reference',
        'bank_ready_at',
        'bank_exported_at',
        'bank_processing_at',
        'bank_failed_at',
        'bank_failure_reason',
        'generated_at',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'generated_at' => 'datetime',
            'paid_at' => 'datetime',
            'bank_ready_at' => 'datetime',
            'bank_exported_at' => 'datetime',
            'bank_processing_at' => 'datetime',
            'bank_failed_at' => 'datetime',
        ];
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function shipments(): BelongsToMany
    {
        return $this->belongsToMany(Shipment::class)
            ->withPivot('cod_amount_paisa')
            ->withTimestamps();
    }
}
