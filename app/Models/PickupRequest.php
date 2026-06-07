<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PickupRequest extends Model
{
    protected $fillable = ['seller_id', 'shipping_manifest_id', 'pickup_number', 'pickup_address', 'pickup_date', 'time_window', 'status', 'notes'];

    protected function casts(): array
    {
        return ['pickup_date' => 'date'];
    }

    public function seller(): BelongsTo { return $this->belongsTo(User::class, 'seller_id'); }
    public function manifest(): BelongsTo { return $this->belongsTo(ShippingManifest::class, 'shipping_manifest_id'); }
}
