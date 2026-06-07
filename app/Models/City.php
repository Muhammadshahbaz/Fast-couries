<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class City extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'province', 'same_day_cod_enabled'];

    protected function casts(): array
    {
        return [
            'same_day_cod_enabled' => 'boolean',
        ];
    }

    public function rates(): HasMany
    {
        return $this->hasMany(CourierRate::class);
    }
}
