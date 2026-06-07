<?php

namespace App\Http\Controllers;

use App\Models\SellerProfile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminSellerController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeAdmin($request);

        return Inertia::render('Admin/Sellers/Index', [
            'sellers' => User::query()
                ->with('sellerProfile')
                ->where('role', 'seller')
                ->latest()
                ->get()
                ->map(fn (User $seller) => [
                    'id' => $seller->id,
                    'name' => $seller->name,
                    'email' => $seller->email,
                    'phone' => $seller->phone,
                    'businessName' => $seller->sellerProfile?->business_name,
                    'cnicNumber' => $seller->sellerProfile?->cnic_number,
                    'cnicFrontUrl' => $seller->sellerProfile?->cnic_front_path ? Storage::disk('public')->url($seller->sellerProfile->cnic_front_path) : null,
                    'cnicBackUrl' => $seller->sellerProfile?->cnic_back_path ? Storage::disk('public')->url($seller->sellerProfile->cnic_back_path) : null,
                    'city' => $seller->sellerProfile?->city,
                    'bankName' => $seller->sellerProfile?->bank_name,
                    'bankAccountTitle' => $seller->sellerProfile?->bank_account_title,
                    'bankAccountNumber' => $seller->sellerProfile?->bank_account_number,
                    'walletProvider' => $seller->sellerProfile?->wallet_provider,
                    'walletNumber' => $seller->sellerProfile?->wallet_number,
                    'verificationStatus' => $seller->sellerProfile?->verification_status ?? 'missing',
                    'reviewNotes' => $seller->sellerProfile?->review_notes,
                    'rejectionReason' => $seller->sellerProfile?->rejection_reason,
                    'reviewedAt' => $seller->sellerProfile?->reviewed_at?->format('M d, Y h:i A'),
                    'createdAt' => $seller->created_at?->format('M d, Y'),
                ]),
        ]);
    }

    public function update(Request $request, User $seller): RedirectResponse
    {
        $this->authorizeAdmin($request);
        abort_unless($seller->role === 'seller', 404);

        $validated = $request->validate([
            'verification_status' => ['required', Rule::in(['pending', 'verified', 'rejected'])],
            'review_notes' => ['nullable', 'string', 'max:1000'],
            'rejection_reason' => ['nullable', 'string', 'max:1000'],
        ]);

        SellerProfile::query()->updateOrCreate(['user_id' => $seller->id], [
            'business_name' => $seller->sellerProfile?->business_name ?? $seller->name,
            'cnic_number' => $seller->sellerProfile?->cnic_number ?? 'missing-'.$seller->id,
            'city' => $seller->sellerProfile?->city ?? 'Not provided',
            'verification_status' => $validated['verification_status'],
            'review_notes' => $validated['review_notes'] ?? null,
            'rejection_reason' => $validated['verification_status'] === 'rejected'
                ? ($validated['rejection_reason'] ?? 'KYC requires correction before seller verification can be approved.')
                : null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return back()->with('success', "{$seller->name} verification updated.");
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless(in_array($request->user()->role, ['super_admin', 'sub_admin'], true), 403);
    }
}
