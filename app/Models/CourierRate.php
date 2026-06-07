<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourierRate extends Model
{
    use HasFactory;

    protected $fillable = [
        'courier_id',
        'city_id',
        'base_weight_grams',
        'base_rate_paisa',
        'additional_kg_rate_paisa',
        'rate_slabs',
        'our_fee_paisa',
        'delivery_days_min',
        'delivery_days_max',
        'success_rate',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'success_rate' => 'decimal:2',
            'rate_slabs' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function courier(): BelongsTo
    {
        return $this->belongsTo(Courier::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }
}
