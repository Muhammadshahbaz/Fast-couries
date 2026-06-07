<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Courier extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'logo_path',
        'api_status',
        'api_mode',
        'api_credentials_status',
        'country_scope',
        'api_capabilities',
        'last_api_health_check_at',
        'webhook_secret',
        'last_api_error',
        'base_success_rate',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'base_success_rate' => 'decimal:2',
            'api_capabilities' => 'array',
            'last_api_health_check_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function rates(): HasMany
    {
        return $this->hasMany(CourierRate::class);
    }

    public function shipments(): HasMany
    {
        return $this->hasMany(Shipment::class);
    }
}
