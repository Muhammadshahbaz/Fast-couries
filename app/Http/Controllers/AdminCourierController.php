<?php

namespace App\Http\Controllers;

use App\Couriers\CourierManager;
use App\Models\Courier;
use App\Models\CourierRate;
use App\Models\City;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminCourierController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeAdmin($request);

        return Inertia::render('Admin/Couriers/Index', [
            'couriers' => Courier::query()
                ->with(['rates.city:id,name,province'])
                ->withCount('rates')
                ->orderBy('name')
                ->get()
                ->map(fn (Courier $courier) => [
                    'id' => $courier->id,
                    'name' => $courier->name,
                    'code' => $courier->code,
                    'apiStatus' => $courier->api_status,
                    'apiMode' => $courier->api_mode ?: config("couriers.providers.{$courier->code}.mode", 'sandbox'),
                    'apiCredentialsStatus' => $courier->api_credentials_status,
                    'countryScope' => $courier->country_scope,
                    'capabilities' => $courier->api_capabilities ?? [],
                    'lastApiHealthCheckAt' => $courier->last_api_health_check_at?->format('M d, Y h:i A'),
                    'lastApiError' => $courier->last_api_error,
                    'webhookUrl' => route('webhooks.couriers', ['code' => $courier->code]),
                    'webhookSecretConfigured' => filled($courier->webhook_secret ?: config("couriers.providers.{$courier->code}.webhook_secret")),
                    'envKeys' => $this->envKeysFor($courier->code),
                    'integration' => $this->integrationPayload($courier),
                    'successRate' => $courier->base_success_rate,
                    'active' => $courier->is_active,
                    'ratesCount' => $courier->rates_count,
                    'rates' => $courier->rates
                        ->sortBy(fn (CourierRate $rate) => $rate->city?->name)
                        ->values()
                        ->map(fn (CourierRate $rate) => [
                            'id' => $rate->id,
                            'city' => $rate->city?->name,
                            'province' => $rate->city?->province,
                            'baseWeightGrams' => $rate->base_weight_grams,
                            'baseRatePaisa' => $rate->base_rate_paisa,
                            'additionalKgRatePaisa' => $rate->additional_kg_rate_paisa,
                            'rateSlabs' => $rate->rate_slabs ?? [],
                            'ourFeePaisa' => $rate->our_fee_paisa,
                            'deliveryDaysMin' => $rate->delivery_days_min,
                            'deliveryDaysMax' => $rate->delivery_days_max,
                            'successRate' => $rate->success_rate,
                            'active' => $rate->is_active,
                        ]),
                ]),
        ]);
    }

    public function updateCourier(Request $request, Courier $courier): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'api_status' => ['required', Rule::in(['sandbox', 'connected', 'down', 'disabled'])],
            'api_mode' => ['required', Rule::in(['sandbox', 'production'])],
            'api_credentials_status' => ['required', Rule::in(['missing', 'configured', 'verified'])],
            'country_scope' => ['required', Rule::in(['pakistan', 'international'])],
            'api_capabilities' => ['required', 'array'],
            'api_capabilities.book' => ['required', 'boolean'],
            'api_capabilities.track' => ['required', 'boolean'],
            'api_capabilities.cancel' => ['required', 'boolean'],
            'api_capabilities.label' => ['required', 'boolean'],
            'api_capabilities.webhook' => ['required', 'boolean'],
            'api_capabilities.return_proof' => ['required', 'boolean'],
            'base_success_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'is_active' => ['required', 'boolean'],
        ]);

        $courier->update($validated);

        return redirect()->route('admin.couriers.index')->with('success', "{$courier->name} updated.");
    }

    public function healthCheck(Request $request, Courier $courier, CourierManager $couriers): RedirectResponse
    {
        $this->authorizeAdmin($request);

        try {
            $missingCredentials = $this->missingCredentialKeys($courier->code);

            if (($courier->api_mode ?? 'sandbox') === 'production' && $missingCredentials !== []) {
                throw new \RuntimeException('Missing production credential keys: '.implode(', ', $missingCredentials));
            }

            $gateway = $couriers->gateway($courier->code);
            $gateway->returnProof($courier->code.'-HEALTH-CHECK');

            $courier->forceFill([
                'api_status' => $courier->api_mode === 'production' ? 'connected' : 'sandbox',
                'api_credentials_status' => $courier->api_mode === 'production' ? 'verified' : 'configured',
                'last_api_health_check_at' => now(),
                'last_api_error' => null,
            ])->save();
        } catch (\Throwable $exception) {
            $courier->forceFill([
                'api_status' => 'down',
                'last_api_health_check_at' => now(),
                'last_api_error' => Str::limit($exception->getMessage(), 1000),
            ])->save();
        }

        return back()->with('success', "{$courier->name} health check completed.");
    }

    public function updateRate(Request $request, CourierRate $rate): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'base_weight_grams' => ['required', 'integer', 'min:1', 'max:50000'],
            'base_rate_paisa' => ['required', 'integer', 'min:0'],
            'additional_kg_rate_paisa' => ['required', 'integer', 'min:0'],
            'our_fee_paisa' => ['required', 'integer', 'min:0'],
            'delivery_days_min' => ['required', 'integer', 'min:1', 'max:30'],
            'delivery_days_max' => ['required', 'integer', 'min:1', 'max:30', 'gte:delivery_days_min'],
            'success_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'is_active' => ['required', 'boolean'],
            'rate_slabs' => ['required', 'array', 'min:1'],
            'rate_slabs.*.upto_grams' => ['nullable', 'integer', 'min:1', 'max:100000'],
            'rate_slabs.*.rate_paisa' => ['nullable', 'integer', 'min:0'],
            'rate_slabs.*.extra_kg_rate_paisa' => ['nullable', 'integer', 'min:0'],
        ]);

        $validated['rate_slabs'] = collect($validated['rate_slabs'])
            ->filter(fn (array $slab) => isset($slab['extra_kg_rate_paisa']) || (isset($slab['upto_grams'], $slab['rate_paisa'])))
            ->values()
            ->all();

        $rate->update($validated);

        return redirect()->route('admin.couriers.index')->with('success', 'Courier rate updated.');
    }

    public function exportRates(Request $request): StreamedResponse
    {
        $this->authorizeAdmin($request);

        return response()->streamDownload(function () {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['courier_code', 'city', 'base_weight_grams', 'base_rate_paisa', 'additional_kg_rate_paisa', 'delivery_days_min', 'delivery_days_max', 'success_rate', 'is_active']);

            CourierRate::query()
                ->with(['courier:id,code', 'city:id,name'])
                ->orderBy('courier_id')
                ->orderBy('city_id')
                ->each(function (CourierRate $rate) use ($handle) {
                    fputcsv($handle, [
                        $rate->courier?->code,
                        $rate->city?->name,
                        $rate->base_weight_grams,
                        $rate->base_rate_paisa,
                        $rate->additional_kg_rate_paisa,
                        $rate->delivery_days_min,
                        $rate->delivery_days_max,
                        $rate->success_rate,
                        $rate->is_active ? 1 : 0,
                    ]);
                });

            fclose($handle);
        }, 'fast-couriers-rates.csv', ['Content-Type' => 'text/csv']);
    }

    public function importRates(Request $request): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'rate_file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        $handle = fopen($validated['rate_file']->getRealPath(), 'r');
        $header = fgetcsv($handle);
        $updated = 0;

        while (($row = fgetcsv($handle)) !== false) {
            $data = array_combine($header, $row);
            $courier = Courier::where('code', $data['courier_code'] ?? null)->first();
            $city = City::where('name', $data['city'] ?? null)->first();

            if (! $courier || ! $city) {
                continue;
            }

            CourierRate::updateOrCreate([
                'courier_id' => $courier->id,
                'city_id' => $city->id,
            ], [
                'base_weight_grams' => (int) ($data['base_weight_grams'] ?? 500),
                'base_rate_paisa' => (int) ($data['base_rate_paisa'] ?? 0),
                'additional_kg_rate_paisa' => (int) ($data['additional_kg_rate_paisa'] ?? 0),
                'delivery_days_min' => (int) ($data['delivery_days_min'] ?? 1),
                'delivery_days_max' => (int) ($data['delivery_days_max'] ?? 3),
                'success_rate' => (float) ($data['success_rate'] ?? $courier->base_success_rate),
                'is_active' => (bool) (int) ($data['is_active'] ?? 1),
            ]);

            $updated++;
        }

        fclose($handle);

        return back()->with('success', "{$updated} rates imported.");
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless(in_array($request->user()->role, ['super_admin', 'sub_admin'], true), 403);
    }

    private function envKeysFor(string $code): array
    {
        return match ($code) {
            'TCS' => ['TCS_MODE', 'TCS_API_BASE_URL', 'TCS_ACCOUNT_NUMBER', 'TCS_API_USERNAME', 'TCS_API_PASSWORD', 'TCS_RETURN_PROOF_ENDPOINT', 'TCS_WEBHOOK_SECRET'],
            'FDX' => ['FEDEX_MODE', 'FEDEX_API_BASE_URL', 'FEDEX_ACCOUNT_NUMBER', 'FEDEX_CLIENT_ID', 'FEDEX_CLIENT_SECRET', 'FEDEX_WEBHOOK_SECRET'],
            'LCS' => ['LEOPARDS_MODE', 'LEOPARDS_API_BASE_URL', 'LEOPARDS_API_KEY', 'LEOPARDS_API_PASSWORD', 'LEOPARDS_WEBHOOK_SECRET'],
            'TRX' => ['TRAX_MODE', 'TRAX_API_BASE_URL', 'TRAX_API_KEY', 'TRAX_WEBHOOK_SECRET'],
            'MNP' => ['MNP_MODE', 'MNP_API_BASE_URL', 'MNP_API_USERNAME', 'MNP_API_PASSWORD', 'MNP_WEBHOOK_SECRET'],
            'BEX' => ['BLUEEX_MODE', 'BLUEEX_API_BASE_URL', 'BLUEEX_API_USERNAME', 'BLUEEX_API_PASSWORD', 'BLUEEX_WEBHOOK_SECRET'],
            'OVR' => ['OVERLAND_MODE', 'OVERLAND_API_BASE_URL', 'OVERLAND_API_KEY', 'OVERLAND_WEBHOOK_SECRET'],
            'CC' => ['CALL_COURIER_MODE', 'CALL_COURIER_API_BASE_URL', 'CALL_COURIER_LOGIN_ID', 'CALL_COURIER_KEY', 'CALL_COURIER_WEBHOOK_SECRET'],
            default => [],
        };
    }

    private function integrationPayload(Courier $courier): array
    {
        $config = config("couriers.providers.{$courier->code}", []);
        $requiredCredentials = $config['required_credentials'] ?? [];
        $missingCredentials = $this->missingCredentialKeys($courier->code);
        $productionAdapterReady = (bool) ($config['production_adapter'] ?? false);
        $webhookReady = filled($courier->webhook_secret ?: ($config['webhook_secret'] ?? null));

        return [
            'productionAdapterReady' => $productionAdapterReady,
            'requiredCredentials' => $requiredCredentials,
            'missingCredentials' => $missingCredentials,
            'configuredCredentials' => array_values(array_diff($requiredCredentials, $missingCredentials)),
            'endpointKeys' => $config['endpoint_keys'] ?? [],
            'standardFields' => $config['standard_fields'] ?? [],
            'webhookEvents' => $config['webhook_events'] ?? [],
            'readiness' => [
                [
                    'label' => 'Credentials configured',
                    'done' => $missingCredentials === [],
                    'detail' => $missingCredentials === [] ? 'All required environment keys are present.' : 'Missing: '.implode(', ', $missingCredentials),
                ],
                [
                    'label' => 'Production adapter',
                    'done' => $productionAdapterReady,
                    'detail' => $productionAdapterReady ? 'Live booking/tracking adapter exists.' : 'Currently uses sandbox adapter until courier API docs are mapped.',
                ],
                [
                    'label' => 'Webhook secret',
                    'done' => $webhookReady,
                    'detail' => $webhookReady ? 'Webhook secret is available for signed callbacks.' : 'Set webhook secret before accepting courier callbacks.',
                ],
                [
                    'label' => 'Health check',
                    'done' => $courier->last_api_health_check_at !== null && $courier->last_api_error === null,
                    'detail' => $courier->last_api_health_check_at ? ($courier->last_api_error ?: 'Last check passed.') : 'Run health check before enabling production traffic.',
                ],
            ],
        ];
    }

    private function missingCredentialKeys(string $code): array
    {
        $config = config("couriers.providers.$code", []);

        return collect($config['required_credentials'] ?? [])
            ->filter(fn (string $key) => blank($config[$key] ?? null))
            ->values()
            ->all();
    }
}
