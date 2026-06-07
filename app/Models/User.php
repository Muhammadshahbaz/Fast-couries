<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'role',
        'phone_verified',
        'phone_verified_at',
        'two_factor_enabled',
        'trusted_until',
        'failed_login_attempts',
        'locked_until',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified' => 'boolean',
            'phone_verified_at' => 'datetime',
            'two_factor_enabled' => 'boolean',
            'trusted_until' => 'datetime',
            'locked_until' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function sellerProfile(): HasOne
    {
        return $this->hasOne(SellerProfile::class);
    }

    public function shipments(): HasMany
    {
        return $this->hasMany(Shipment::class, 'seller_id');
    }

    public function inventoryProducts(): HasMany
    {
        return $this->hasMany(InventoryProduct::class, 'seller_id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'seller_id');
    }

    public function shippingManifests(): HasMany
    {
        return $this->hasMany(ShippingManifest::class, 'seller_id');
    }

    public function pickupRequests(): HasMany
    {
        return $this->hasMany(PickupRequest::class, 'seller_id');
    }

    public function customerAddresses(): HasMany
    {
        return $this->hasMany(CustomerAddress::class, 'seller_id');
    }

    public function teamMembers(): HasMany
    {
        return $this->hasMany(TeamMember::class, 'seller_id');
    }
}
