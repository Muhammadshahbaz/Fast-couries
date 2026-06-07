<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_is_displayed(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get('/profile');

        $response->assertOk();
    }

    public function test_profile_information_can_be_updated(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $user->refresh();

        $this->assertSame('Test User', $user->name);
        $this->assertSame('test@example.com', $user->email);
        $this->assertNull($user->email_verified_at);
    }

    public function test_seller_profile_setup_can_be_updated(): void
    {
        $user = User::factory()->create(['role' => 'seller']);

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => $user->name,
                'email' => $user->email,
                'business_name' => 'Demo Apparel',
                'cnic_number' => '35202-1234567-1',
                'city' => 'Lahore',
                'bank_name' => 'Meezan Bank',
                'bank_account_title' => 'Demo Apparel',
                'bank_account_number' => 'PK36MEZN0000001122334455',
                'wallet_provider' => 'JazzCash',
                'wallet_number' => '03001234567',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $this->assertDatabaseHas('seller_profiles', [
            'user_id' => $user->id,
            'business_name' => 'Demo Apparel',
            'city' => 'Lahore',
            'bank_account_number' => 'PK36MEZN0000001122334455',
            'wallet_provider' => 'JazzCash',
        ]);
    }

    public function test_seller_can_upload_kyc_documents_and_profile_returns_to_pending_review(): void
    {
        Storage::fake('public');

        $user = User::factory()->create(['role' => 'seller']);
        $user->sellerProfile()->create([
            'business_name' => 'Demo Apparel',
            'cnic_number' => '35202-7654321-1',
            'city' => 'Lahore',
            'terms_accepted' => true,
            'verification_status' => 'verified',
        ]);

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => $user->name,
                'email' => $user->email,
                'business_name' => 'Demo Apparel Updated',
                'cnic_number' => '35202-7654321-1',
                'city' => 'Lahore',
                'cnic_front' => UploadedFile::fake()->image('front.jpg'),
                'cnic_back' => UploadedFile::fake()->image('back.jpg'),
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $profile = $user->sellerProfile()->first();

        $this->assertSame('pending', $profile->verification_status);
        $this->assertNull($profile->reviewed_at);
        Storage::disk('public')->assertExists($profile->cnic_front_path);
        Storage::disk('public')->assertExists($profile->cnic_back_path);
    }

    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => $user->email,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $this->assertNotNull($user->refresh()->email_verified_at);
    }

    public function test_user_can_delete_their_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->delete('/profile', [
                'password' => 'password',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/');

        $this->assertGuest();
        $this->assertNull($user->fresh());
    }

    public function test_correct_password_must_be_provided_to_delete_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from('/profile')
            ->delete('/profile', [
                'password' => 'wrong-password',
            ]);

        $response
            ->assertSessionHasErrors('password')
            ->assertRedirect('/profile');

        $this->assertNotNull($user->fresh());
    }
}
