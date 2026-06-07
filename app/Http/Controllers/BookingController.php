<?php

namespace App\Http\Controllers;

use App\Couriers\CourierBookingService;
use App\Models\City;
use App\Models\CourierRate;
use App\Models\InventoryProduct;
use App\Models\Shipment;
use App\Support\AddressVerifier;
use App\Support\ShippingRateCalculator;
use App\Notifications\ShipmentStatusUpdated;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function create(): Response
    {
        $this->ensureSellerVerified(request());

        return Inertia::render('Bookings/Create', [
            'cities' => City::query()
                ->orderBy('name')
                ->get(['id', 'name', 'province', 'same_day_cod_enabled']),
            'rates' => CourierRate::query()
                ->with(['courier:id,name,code,country_scope,api_status,api_mode,api_credentials_status,api_capabilities,last_api_health_check_at,base_success_rate', 'city:id,name'])
                ->where('is_active', true)
                ->whereHas('courier', fn ($query) => $query->where('is_active', true))
                ->orderBy('base_rate_paisa')
                ->get()
                ->map(fn (CourierRate $rate) => [
                    'id' => $rate->id,
                    'cityId' => $rate->city_id,
                    'courierId' => $rate->courier_id,
                    'courier' => $rate->courier->name,
                    'courierCode' => $rate->courier->code,
                    'countryScope' => $rate->courier->country_scope,
                    'apiStatus' => $rate->courier->api_status,
                    'apiMode' => $rate->courier->api_mode,
                    'apiCredentialsStatus' => $rate->courier->api_credentials_status,
                    'capabilities' => $rate->courier->api_capabilities ?? [],
                    'lastApiHealthCheckAt' => $rate->courier->last_api_health_check_at?->format('M d, h:i A'),
                    'reliabilityScore' => min(100, round(((float) $rate->success_rate * 0.7) + ((float) $rate->courier->base_success_rate * 0.3), 2)),
                    'baseWeightGrams' => $rate->base_weight_grams,
                    'baseRatePaisa' => $rate->base_rate_paisa,
                    'additionalKgRatePaisa' => $rate->additional_kg_rate_paisa,
                    'rateSlabs' => $rate->rate_slabs ?? [],
                    'ourFeePaisa' => $rate->our_fee_paisa,
                    'deliveryDaysMin' => $rate->delivery_days_min,
                    'deliveryDaysMax' => $rate->delivery_days_max,
                    'successRate' => $rate->success_rate,
                ]),
            'products' => InventoryProduct::query()
                ->where('seller_id', request()->user()->id)
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'sku', 'description', 'weight_grams', 'stock_on_hand'])
                ->map(fn (InventoryProduct $product) => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'description' => $product->description,
                    'weightGrams' => $product->weight_grams,
                    'stockOnHand' => $product->stock_on_hand,
                ]),
        ]);
    }

    public function store(Request $request, AddressVerifier $addressVerifier, CourierBookingService $bookingService, ShippingRateCalculator $calculator): RedirectResponse
    {
        $this->ensureSellerVerified($request);

        $validated = $request->validate([
            'receiver_name' => ['required', 'string', 'max:255'],
            'receiver_phone' => ['required', 'string', 'max:20'],
            'receiver_address' => ['required', 'string', 'max:1000'],
            'receiver_area' => ['nullable', 'string', 'max:120'],
            'city_id' => ['required', 'exists:cities,id'],
            'inventory_product_id' => [
                'nullable',
                Rule::exists('inventory_products', 'id')
                    ->where('seller_id', $request->user()->id)
                    ->where('is_active', true),
            ],
            'product_quantity' => ['nullable', 'integer', 'min:1', 'max:1000'],
            'courier_rate_id' => [
                'required',
                Rule::exists('courier_rates', 'id')->where('city_id', $request->integer('city_id')),
            ],
            'weight_grams' => ['required', 'integer', 'min:1', 'max:50000'],
            'parcel_type' => ['required', 'string', Rule::in(['Document', 'Small Parcel', 'Large Parcel', 'Fragile'])],
            'cod_amount_paisa' => ['required', 'integer', 'min:0', 'max:100000000'],
            'description' => ['nullable', 'string', 'max:500'],
            'special_instructions' => ['nullable', 'string', 'max:500'],
        ]);

        $rate = CourierRate::query()->with('courier')->findOrFail($validated['courier_rate_id']);
        $city = City::query()->findOrFail($validated['city_id']);
        $shippingCharge = $calculator->charge($rate, $validated['weight_grams']);
        $validated['product_quantity'] = $validated['product_quantity'] ?? 1;
        $addressVerification = $addressVerifier->verify(
            $validated['receiver_address'],
            $validated['receiver_area'] ?? null,
            $validated['receiver_phone'],
            $city->name,
            $validated['cod_amount_paisa'],
        );

        $shipment = DB::transaction(function () use ($request, $validated, $rate, $shippingCharge, $addressVerification) {
            $product = null;

            if (! empty($validated['inventory_product_id'])) {
                $product = InventoryProduct::query()
                    ->where('seller_id', $request->user()->id)
                    ->lockForUpdate()
                    ->findOrFail($validated['inventory_product_id']);

                if ($product->stock_on_hand < $validated['product_quantity']) {
                    throw ValidationException::withMessages([
                        'inventory_product_id' => "Only {$product->stock_on_hand} units are available for {$product->name}.",
                    ]);
                }
            }

            $shipment = Shipment::create([
                'seller_id' => $request->user()->id,
                'courier_id' => $rate->courier_id,
                'city_id' => $validated['city_id'],
                'inventory_product_id' => $product?->id,
                'product_quantity' => $validated['product_quantity'],
                'tracking_number' => $this->trackingNumber(),
                'receiver_name' => $validated['receiver_name'],
                'receiver_phone' => $validated['receiver_phone'],
                'receiver_address' => $validated['receiver_address'],
                'receiver_area' => $validated['receiver_area'] ?? null,
                'address_score' => $addressVerification['score'],
                'address_verification_level' => $addressVerification['level'],
                'address_verification' => $addressVerification,
                'weight_grams' => $validated['weight_grams'],
                'parcel_type' => $validated['parcel_type'],
                'cod_amount_paisa' => $validated['cod_amount_paisa'],
                'shipping_charge_paisa' => $shippingCharge,
                'our_fee_paisa' => $rate->our_fee_paisa,
                'status' => 'booked',
                'description' => $validated['description'] ?? null,
                'special_instructions' => $validated['special_instructions'] ?? null,
                'booked_at' => now(),
            ]);

            if ($product) {
                $product->decrement('stock_on_hand', $validated['product_quantity']);
            }

            return $shipment;
        });

        $bookingService->book($shipment);
        $request->user()->notify(new ShipmentStatusUpdated($shipment));

        return redirect()
            ->route('shipments.show', $shipment)
            ->with('success', "Shipment {$shipment->tracking_number} booked with {$rate->courier->name}.");
    }

    private function trackingNumber(): string
    {
        do {
            $trackingNumber = 'FC'.now()->format('ymd').Str::upper(Str::random(6));
        } while (Shipment::where('tracking_number', $trackingNumber)->exists());

        return $trackingNumber;
    }

    private function ensureSellerVerified(Request $request): void
    {
        if ($request->user()->role !== 'seller') {
            return;
        }

        if ($request->user()->sellerProfile?->verification_status === 'verified') {
            return;
        }

        abort(redirect()
            ->route('profile.edit')
            ->with('error', 'Your seller KYC must be verified before you can book shipments. Please complete your profile and wait for admin approval.'));
    }
}
