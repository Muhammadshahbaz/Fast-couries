<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'company' => [
                'name' => config('company.name'),
                'legalName' => config('company.legal_name'),
                'domain' => config('company.domain'),
                'supportEmail' => config('company.support_email'),
                'supportPhone' => config('company.support_phone'),
                'whatsapp' => config('company.whatsapp'),
                'office' => config('company.office'),
                'hours' => config('company.hours'),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'importResult' => fn () => $request->session()->get('importResult'),
            ],
        ];
    }
}
