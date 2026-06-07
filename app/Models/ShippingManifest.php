<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShippingManifest extends Model
{
    use HasFactory;

    protected $fillable = [
        'seller_id',
        'manifest_number',
        'shipment_ids',
        'total_shipments',
        'total_cod_paisa',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'shipment_ids' => 'array',
        ];
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }
}
