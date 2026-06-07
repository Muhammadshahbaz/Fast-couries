<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'seller_id',
        'inventory_product_id',
        'city_id',
        'shipment_id',
        'order_number',
        'customer_name',
        'customer_phone',
        'customer_address',
        'customer_area',
        'address_score',
        'address_verification_level',
        'address_verification',
        'quantity',
        'cod_amount_paisa',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'address_verification' => 'array',
        ];
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function inventoryProduct(): BelongsTo
    {
        return $this->belongsTo(InventoryProduct::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function shipment(): BelongsTo
    {
        return $this->belongsTo(Shipment::class);
    }
}
