<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SellerProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'business_name',
        'cnic_number',
        'cnic_front_path',
        'cnic_back_path',
        'city',
        'bank_name',
        'bank_account_title',
        'bank_account_number',
        'wallet_provider',
        'wallet_number',
        'terms_accepted',
        'verification_status',
        'reviewed_by',
        'reviewed_at',
        'review_notes',
        'rejection_reason',
    ];

    protected function casts(): array
    {
        return [
            'terms_accepted' => 'boolean',
            'reviewed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
