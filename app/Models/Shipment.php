<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Shipment extends Model
{
    use HasFactory;

    protected $fillable = [
        'seller_id',
        'courier_id',
        'city_id',
        'inventory_product_id',
        'product_quantity',
        'tracking_number',
        'external_awb',
        'label_url',
        'receiver_name',
        'receiver_phone',
        'receiver_address',
        'receiver_area',
        'address_score',
        'address_verification_level',
        'address_verification',
        'weight_grams',
        'parcel_type',
        'cod_amount_paisa',
        'shipping_charge_paisa',
        'our_fee_paisa',
        'status',
        'description',
        'special_instructions',
        'booked_at',
        'delivered_at',
        'returned_at',
        'return_stock_recovered_at',
        'return_reason',
        'return_proof',
        'return_proof_verified_at',
        'proof_photo_path',
        'courier_payload',
        'api_synced_at',
    ];

    protected function casts(): array
    {
        return [
            'booked_at' => 'datetime',
            'delivered_at' => 'datetime',
            'returned_at' => 'datetime',
            'return_stock_recovered_at' => 'datetime',
            'return_proof' => 'array',
            'return_proof_verified_at' => 'datetime',
            'address_verification' => 'array',
            'courier_payload' => 'array',
            'api_synced_at' => 'datetime',
        ];
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function courier(): BelongsTo
    {
        return $this->belongsTo(Courier::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function inventoryProduct(): BelongsTo
    {
        return $this->belongsTo(InventoryProduct::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(TrackingEvent::class);
    }

    public function payoutInvoices(): BelongsToMany
    {
        return $this->belongsToMany(PayoutInvoice::class)
            ->withPivot('cod_amount_paisa')
            ->withTimestamps();
    }
}
