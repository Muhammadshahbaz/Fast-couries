<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'business_name' => 'Test Store',
            'phone' => '03001231234',
            'email' => 'test@example.com',
            'cnic_number' => '42101-7654321-0',
            'city' => 'Karachi',
            'bank_name' => 'HBL',
            'bank_account_title' => 'Test User',
            'bank_account_number' => 'PK00HABB0000000000000000',
            'wallet_provider' => 'JazzCash',
            'wallet_number' => '03001231234',
            'terms_accepted' => true,
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $this->assertDatabaseHas('seller_profiles', [
            'business_name' => 'Test Store',
            'cnic_number' => '42101-7654321-0',
            'verification_status' => 'pending',
        ]);
        $response->assertRedirect(route('dashboard', absolute: false));
    }
}
