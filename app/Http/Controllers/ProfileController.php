<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'sellerProfile' => $request->user()->sellerProfile,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $profileFields = collect($validated)->only([
            'business_name',
            'cnic_number',
            'city',
            'bank_name',
            'bank_account_title',
            'bank_account_number',
            'wallet_provider',
            'wallet_number',
        ])->toArray();

        $request->user()->fill(collect($validated)->only(['name', 'email'])->toArray());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        if ($request->user()->role === 'seller') {
            $profile = $request->user()->sellerProfile;
            $requiresReview = ! $profile || collect(['business_name', 'cnic_number', 'city', 'bank_name', 'bank_account_title', 'bank_account_number', 'wallet_provider', 'wallet_number'])
                ->contains(fn (string $field) => array_key_exists($field, $profileFields) && ($profile?->{$field} ?? null) !== ($profileFields[$field] ?? null));

            if ($request->hasFile('cnic_front')) {
                if ($profile?->cnic_front_path) {
                    Storage::disk('public')->delete($profile->cnic_front_path);
                }

                $profileFields['cnic_front_path'] = $request->file('cnic_front')->store('seller-kyc', 'public');
                $requiresReview = true;
            }

            if ($request->hasFile('cnic_back')) {
                if ($profile?->cnic_back_path) {
                    Storage::disk('public')->delete($profile->cnic_back_path);
                }

                $profileFields['cnic_back_path'] = $request->file('cnic_back')->store('seller-kyc', 'public');
                $requiresReview = true;
            }

            if ($requiresReview) {
                $profileFields += [
                    'verification_status' => 'pending',
                    'reviewed_by' => null,
                    'reviewed_at' => null,
                    'review_notes' => null,
                    'rejection_reason' => null,
                ];
            }

            $request->user()->sellerProfile()->updateOrCreate(
                ['user_id' => $request->user()->id],
                $profileFields + ['terms_accepted' => true]
            );
        }

        return Redirect::route('profile.edit')->with('success', 'Profile updated. KYC changes are now pending admin review.');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
