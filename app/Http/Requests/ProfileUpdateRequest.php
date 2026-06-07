<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'business_name' => ['nullable', 'string', 'max:255'],
            'cnic_number' => [
                'nullable',
                'string',
                'max:20',
                Rule::unique('seller_profiles', 'cnic_number')->ignore($this->user()->sellerProfile?->id),
            ],
            'cnic_front' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'cnic_back' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'city' => ['nullable', 'string', 'max:120'],
            'bank_name' => ['nullable', 'string', 'max:120'],
            'bank_account_title' => ['nullable', 'string', 'max:255'],
            'bank_account_number' => ['nullable', 'string', 'max:60'],
            'wallet_provider' => ['nullable', 'string', Rule::in(['', 'JazzCash', 'Easypaisa'])],
            'wallet_number' => ['nullable', 'string', 'max:20'],
        ];
    }
}
