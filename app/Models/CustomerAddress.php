<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerAddress extends Model
{
    protected $fillable = ['seller_id', 'city_id', 'name', 'phone', 'address', 'area', 'orders_count', 'last_order_at'];

    protected function casts(): array
    {
        return ['last_order_at' => 'datetime'];
    }

    public function seller(): BelongsTo { return $this->belongsTo(User::class, 'seller_id'); }
    public function city(): BelongsTo { return $this->belongsTo(City::class); }
}
