<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationEvent extends Model
{
    protected $fillable = ['seller_id', 'shipment_id', 'recipient_phone', 'channel', 'event_type', 'status', 'message', 'sent_at'];

    protected function casts(): array
    {
        return ['sent_at' => 'datetime'];
    }

    public function seller(): BelongsTo { return $this->belongsTo(User::class, 'seller_id'); }
    public function shipment(): BelongsTo { return $this->belongsTo(Shipment::class); }
}
