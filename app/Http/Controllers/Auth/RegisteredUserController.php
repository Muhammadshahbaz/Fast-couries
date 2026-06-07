<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'business_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:'.User::class,
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'cnic_number' => 'required|string|max:20|unique:seller_profiles,cnic_number',
            'cnic_front' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:4096',
            'cnic_back' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:4096',
            'city' => 'required|string|max:120',
            'bank_name' => 'nullable|string|max:120',
            'bank_account_title' => 'nullable|string|max:255',
            'bank_account_number' => 'nullable|string|max:60',
            'wallet_provider' => 'nullable|string|in:JazzCash,Easypaisa',
            'wallet_number' => 'nullable|string|max:20',
            'terms_accepted' => 'accepted',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'role' => 'seller',
            'password' => Hash::make($request->password),
        ]);

        $user->sellerProfile()->create([
            'business_name' => $request->business_name,
            'cnic_number' => $request->cnic_number,
            'cnic_front_path' => $request->file('cnic_front')?->store('seller-kyc', 'public'),
            'cnic_back_path' => $request->file('cnic_back')?->store('seller-kyc', 'public'),
            'city' => $request->city,
            'bank_name' => $request->bank_name,
            'bank_account_title' => $request->bank_account_title,
            'bank_account_number' => $request->bank_account_number,
            'wallet_provider' => $request->wallet_provider,
            'wallet_number' => $request->wallet_number,
            'terms_accepted' => true,
            'verification_status' => 'pending',
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
