<?php

namespace App\Http\Controllers;

use App\Couriers\CourierBookingService;
use App\Models\City;
use App\Models\CourierRate;
use App\Models\InventoryProduct;
use App\Models\Order;
use App\Models\ShippingManifest;
use App\Models\Shipment;
use App\Notifications\ShipmentStatusUpdated;
use App\Support\AddressVerifier;
use App\Support\ShippingRateCalculator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $orderQuery = Order::query()
            ->with(['inventoryProduct:id,name,sku,weight_grams,stock_on_hand', 'city:id,name', 'shipment:id,tracking_number,status'])
            ->where('seller_id', $request->user()->id);

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $orderQuery->where('status', $request->input('status'));
        }

        if ($request->filled('city_id') && $request->input('city_id') !== 'all') {
            $orderQuery->where('city_id', $request->integer('city_id'));
        }

        if ($request->filled('product_id') && $request->input('product_id') !== 'all') {
            $orderQuery->where('inventory_product_id', $request->integer('product_id'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $orderQuery->where(function ($query) use ($search) {
                $query->where('order_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        $orders = $orderQuery
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Order $order) => [
                'id' => $order->id,
                'orderNumber' => $order->order_number,
                'customerName' => $order->customer_name,
                'customerPhone' => $order->customer_phone,
                'customerAddress' => $order->customer_address,
                'customerArea' => $order->customer_area,
                'addressScore' => $order->address_score,
                'addressVerificationLevel' => $order->address_verification_level,
                'addressVerification' => $order->address_verification,
                'cityId' => $order->city_id,
                'city' => $order->city?->name,
                'product' => $order->inventoryProduct ? [
                    'id' => $order->inventoryProduct->id,
                    'name' => $order->inventoryProduct->name,
                    'sku' => $order->inventoryProduct->sku,
                    'stockOnHand' => $order->inventoryProduct->stock_on_hand,
                ] : null,
                'quantity' => $order->quantity,
                'codAmount' => $order->cod_amount_paisa,
                'status' => $order->status,
                'notes' => $order->notes,
                'shipment' => $order->shipment ? [
                    'id' => $order->shipment->id,
                    'trackingNumber' => $order->shipment->tracking_number,
                    'status' => $order->shipment->status,
                ] : null,
                'createdAt' => $order->created_at?->format('M d, Y'),
            ]);

        $baseOrders = Order::query()->where('seller_id', $request->user()->id);
        $ordersForCharts = Order::query()
            ->with('inventoryProduct:id,name,sku')
            ->where('seller_id', $request->user()->id);

        return Inertia::render('Orders/Index', [
            'stats' => [
                'pending' => (clone $baseOrders)->where('status', 'pending')->count(),
                'packed' => (clone $baseOrders)->where('status', 'packed')->count(),
                'shipped' => (clone $baseOrders)->where('status', 'shipped')->count(),
                'codPending' => (clone $baseOrders)->whereIn('status', ['pending', 'packed'])->sum('cod_amount_paisa'),
                'addressRisk' => (clone $baseOrders)
                    ->where(function ($query) {
                        $query->where('address_verification_level', 'high_risk')
                            ->orWhere('address_score', '<', 60);
                    })
                    ->whereNull('shipment_id')
                    ->count(),
            ],
            'charts' => [
                'status' => collect(['pending', 'packed', 'shipped', 'delivered', 'returned'])
                    ->map(fn (string $status) => [
                        'label' => ucfirst($status),
                        'value' => (clone $ordersForCharts)->where('status', $status)->count(),
                    ]),
                'lastSevenDays' => collect(range(6, 0))->map(function (int $daysAgo) use ($ordersForCharts) {
                    $date = now()->subDays($daysAgo);

                    return [
                        'label' => $date->format('D'),
                        'orders' => (clone $ordersForCharts)->whereDate('created_at', $date)->count(),
                    ];
                }),
                'topSkus' => (clone $ordersForCharts)
                    ->whereNotNull('inventory_product_id')
                    ->selectRaw('inventory_product_id, sum(quantity) as units')
                    ->groupBy('inventory_product_id')
                    ->orderByDesc('units')
                    ->limit(5)
                    ->get()
                    ->map(fn (Order $order) => [
                        'sku' => $order->inventoryProduct?->sku ?? 'Manual',
                        'name' => $order->inventoryProduct?->name ?? 'Manual order',
                        'units' => (int) $order->units,
                    ]),
            ],
            'filters' => [
                'status' => $request->input('status', 'all'),
                'city_id' => $request->input('city_id', 'all'),
                'product_id' => $request->input('product_id', 'all'),
                'search' => $request->input('search', ''),
            ],
            'orders' => $orders,
            'cities' => City::query()->orderBy('name')->get(['id', 'name']),
            'products' => InventoryProduct::query()
                ->where('seller_id', $request->user()->id)
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'sku', 'weight_grams', 'stock_on_hand']),
        ]);
    }

    public function store(Request $request, AddressVerifier $addressVerifier): RedirectResponse
    {
        $validated = $request->validate($this->rules($request));
        $validated += $this->addressVerificationFields($validated, $addressVerifier);

        $request->user()->orders()->create($validated + [
            'order_number' => $this->orderNumber(),
            'status' => 'pending',
        ]);

        return back()->with('success', 'Order created.');
    }

    public function update(Request $request, Order $order, AddressVerifier $addressVerifier): RedirectResponse
    {
        abort_unless($order->seller_id === $request->user()->id, 403);
        abort_unless($order->shipment_id === null, 422, 'Shipped orders cannot be edited.');

        $validated = $request->validate($this->rules($request, $order));
        $validated += $this->addressVerificationFields($validated, $addressVerifier);

        $order->update($validated);

        return back()->with('success', 'Order updated.');
    }

    public function import(Request $request, AddressVerifier $addressVerifier): RedirectResponse
    {
        $request->validate([
            'orders_csv' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        $cities = City::query()
            ->get(['id', 'name'])
            ->keyBy(fn (City $city) => Str::lower(trim($city->name)))
            ->all();
        $products = InventoryProduct::query()
            ->where('seller_id', $request->user()->id)
            ->where('is_active', true)
            ->get(['id', 'sku', 'name', 'stock_on_hand'])
            ->keyBy(fn (InventoryProduct $product) => Str::lower(trim($product->sku)))
            ->all();

        $handle = fopen($request->file('orders_csv')->getRealPath(), 'r');
        $headers = $this->normalizeCsvRow(fgetcsv($handle, null, ',', '"', '\\') ?: []);
        $requiredHeaders = ['customer_name', 'customer_phone', 'customer_address', 'city', 'sku', 'quantity', 'cod_amount'];
        $errors = [];
        $created = 0;
        $skipped = 0;
        $rowNumber = 1;
        $reservedStockBySku = [];

        if ($headers !== $requiredHeaders && array_diff($requiredHeaders, $headers) !== []) {
            fclose($handle);

            return back()->with('importResult', [
                'created' => 0,
                'skipped' => 0,
                'errors' => [[
                    'row' => 1,
                    'message' => 'CSV header must include: '.implode(', ', $requiredHeaders).'. Optional column: notes.',
                ]],
            ]);
        }

        while (($rawRow = fgetcsv($handle, null, ',', '"', '\\')) !== false) {
            $rowNumber++;

            if (count(array_filter($rawRow, fn ($value) => filled($value))) === 0) {
                continue;
            }

            $row = array_combine($headers, array_slice(array_pad($rawRow, count($headers), ''), 0, count($headers)));

            $customerName = trim($row['customer_name'] ?? '');
            $customerPhone = trim($row['customer_phone'] ?? '');
            $customerAddress = trim($row['customer_address'] ?? '');
            $cityName = Str::lower(trim($row['city'] ?? ''));
            $sku = Str::lower(trim($row['sku'] ?? ''));
            $quantity = (int) ($row['quantity'] ?? 0);
            $codAmount = trim($row['cod_amount'] ?? '0');
            $notes = trim($row['notes'] ?? '');

            $city = $cities[$cityName] ?? null;
            $product = $sku !== '' ? ($products[$sku] ?? null) : null;
            $rowErrors = [];

            if ($customerName === '') {
                $rowErrors[] = 'customer_name is required';
            }
            if ($customerPhone === '') {
                $rowErrors[] = 'customer_phone is required';
            }
            if ($customerAddress === '') {
                $rowErrors[] = 'customer_address is required';
            }
            if (! $city) {
                $rowErrors[] = 'city not found';
            }
            if ($sku !== '' && ! $product) {
                $rowErrors[] = 'SKU not found';
            }
            if ($quantity < 1) {
                $rowErrors[] = 'quantity must be at least 1';
            }
            if ($product) {
                $reserved = $reservedStockBySku[$product->sku] ?? 0;
                $available = max($product->stock_on_hand - $reserved, 0);

                if ($quantity > $available) {
                    $rowErrors[] = "insufficient stock for {$product->sku}; {$available} available";
                }
            }
            if (! is_numeric($codAmount) || (float) $codAmount < 0) {
                $rowErrors[] = 'cod_amount cannot be negative';
            }

            if ($rowErrors !== []) {
                $errors[] = [
                    'row' => $rowNumber,
                    'message' => implode(', ', $rowErrors),
                ];
                $skipped++;
                continue;
            }

            $verificationFields = $this->addressVerificationFields([
                'city_id' => $city->id,
                'customer_phone' => $customerPhone,
                'customer_address' => $customerAddress,
                'customer_area' => null,
                'cod_amount_paisa' => $this->amountToPaisa($codAmount),
            ], $addressVerifier, $city->name);

            $request->user()->orders()->create([
                'inventory_product_id' => $product?->id,
                'city_id' => $city->id,
                'order_number' => $this->orderNumber(),
                'customer_name' => $customerName,
                'customer_phone' => $customerPhone,
                'customer_address' => $customerAddress,
                'quantity' => $quantity,
                'cod_amount_paisa' => $this->amountToPaisa($codAmount),
                'status' => 'pending',
                'notes' => $notes !== '' ? $notes : null,
            ] + $verificationFields);

            if ($product) {
                $reservedStockBySku[$product->sku] = ($reservedStockBySku[$product->sku] ?? 0) + $quantity;
            }

            $created++;
        }

        fclose($handle);

        return back()->with('importResult', [
            'created' => $created,
            'skipped' => $skipped,
            'errors' => array_slice($errors, 0, 20),
        ]);
    }

    public function template()
    {
        $rows = [
            ['customer_name', 'customer_phone', 'customer_address', 'city', 'sku', 'quantity', 'cod_amount', 'notes'],
            ['Ali Raza', '03001234567', 'House 12, Main Road', 'Lahore', 'TSHIRT-BLK-M', '1', '2500', 'Call before delivery'],
        ];

        $csv = collect($rows)
            ->map(fn (array $row) => collect($row)->map(fn ($value) => '"'.str_replace('"', '""', $value).'"')->implode(','))
            ->implode("\n");

        return response($csv."\n", 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="fast-couriers-orders-template.csv"',
        ]);
    }

    public function createShipment(Request $request, Order $order, CourierBookingService $bookingService, ShippingRateCalculator $calculator): RedirectResponse
    {
        abort_unless($order->seller_id === $request->user()->id, 403);
        $this->ensureSellerVerified($request);

        if ($order->shipment_id !== null) {
            return redirect()->route('shipments.show', $order->shipment_id);
        }

        $rate = $this->bestRateForOrder($order, $calculator);
        $shipment = $this->createShipmentRecord($request, $order, $rate, $calculator);

        $bookingService->book($shipment);
        $request->user()->notify(new ShipmentStatusUpdated($shipment));

        return redirect()
            ->route('shipments.show', $shipment)
            ->with('success', "Order {$order->order_number} shipped with {$rate->courier->name}.");
    }

    public function batchShipment(Request $request, CourierBookingService $bookingService, ShippingRateCalculator $calculator): RedirectResponse
    {
        $this->ensureSellerVerified($request);

        $validated = $request->validate([
            'order_ids' => ['required', 'array', 'min:1', 'max:100'],
            'order_ids.*' => ['integer'],
        ]);

        $orders = Order::query()
            ->where('seller_id', $request->user()->id)
            ->whereNull('shipment_id')
            ->whereIn('status', ['pending', 'packed'])
            ->whereIn('id', $validated['order_ids'])
            ->with(['inventoryProduct', 'city'])
            ->get();

        if ($orders->isEmpty()) {
            throw ValidationException::withMessages([
                'order_ids' => 'Select at least one pending or packed order.',
            ]);
        }

        $shipments = collect();

        foreach ($orders as $order) {
            $rate = $this->bestRateForOrder($order, $calculator);
            $shipment = $this->createShipmentRecord($request, $order, $rate, $calculator);
            $bookingService->book($shipment);
            $request->user()->notify(new ShipmentStatusUpdated($shipment));
            $shipments->push($shipment->refresh());
        }

        $manifest = $request->user()->shippingManifests()->create([
            'manifest_number' => $this->manifestNumber(),
            'shipment_ids' => $shipments->pluck('id')->values()->all(),
            'total_shipments' => $shipments->count(),
            'total_cod_paisa' => $shipments->sum('cod_amount_paisa'),
            'status' => 'ready',
        ]);

        return redirect()
            ->route('manifests.show', $manifest)
            ->with('success', "{$shipments->count()} shipments created and manifest {$manifest->manifest_number} is ready.");
    }

    private function rules(Request $request, ?Order $order = null): array
    {
        return [
            'inventory_product_id' => [
                'nullable',
                Rule::exists('inventory_products', 'id')
                    ->where('seller_id', $request->user()->id)
                    ->where('is_active', true),
            ],
            'city_id' => ['required', 'exists:cities,id'],
            'customer_name' => ['required', 'string', 'max:160'],
            'customer_phone' => ['required', 'string', 'max:30'],
            'customer_address' => ['required', 'string', 'max:1000'],
            'customer_area' => ['nullable', 'string', 'max:120'],
            'quantity' => ['required', 'integer', 'min:1', 'max:1000'],
            'cod_amount_paisa' => ['required', 'integer', 'min:0', 'max:100000000'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    private function normalizeCsvRow(array $row): array
    {
        return collect($row)
            ->map(fn ($value) => Str::of((string) $value)->trim()->lower()->replace(' ', '_')->toString())
            ->all();
    }

    private function amountToPaisa(string $amount): int
    {
        $clean = trim(str_replace(',', '', $amount));
        [$rupees, $paisa] = array_pad(explode('.', $clean, 2), 2, '0');

        return ((int) $rupees * 100) + (int) str_pad(substr($paisa, 0, 2), 2, '0');
    }

    private function addressVerificationFields(array $payload, AddressVerifier $addressVerifier, ?string $cityName = null): array
    {
        $cityName ??= City::query()->whereKey($payload['city_id'])->value('name');
        $verification = $addressVerifier->verify(
            $payload['customer_address'],
            $payload['customer_area'] ?? null,
            $payload['customer_phone'],
            $cityName,
            (int) ($payload['cod_amount_paisa'] ?? 0),
        );

        return [
            'address_score' => $verification['score'],
            'address_verification_level' => $verification['level'],
            'address_verification' => $verification,
        ];
    }

    private function bestRateForOrder(Order $order, ShippingRateCalculator $calculator): CourierRate
    {
        $order->loadMissing(['inventoryProduct', 'city']);

        $rate = CourierRate::query()
            ->with('courier')
            ->where('city_id', $order->city_id)
            ->where('is_active', true)
            ->whereHas('courier', fn ($query) => $query->where('is_active', true))
            ->get()
            ->map(function (CourierRate $rate) use ($calculator, $order) {
                $weight = max(($order->inventoryProduct?->weight_grams ?? 500) * $order->quantity, 1);
                $rate->calculated_charge = $calculator->charge($rate, $weight) + $rate->our_fee_paisa;

                return $rate;
            })
            ->sortBy([
                ['calculated_charge', 'asc'],
                ['success_rate', 'desc'],
            ])
            ->first();

        if (! $rate) {
            throw ValidationException::withMessages([
                'order' => 'No active courier rate is available for this order city.',
            ]);
        }

        return $rate;
    }

    private function createShipmentRecord(Request $request, Order $order, CourierRate $rate, ShippingRateCalculator $calculator): Shipment
    {
        return DB::transaction(function () use ($request, $order, $rate, $calculator) {
            $product = null;

            if ($order->inventory_product_id) {
                $product = InventoryProduct::query()
                    ->where('seller_id', $request->user()->id)
                    ->lockForUpdate()
                    ->findOrFail($order->inventory_product_id);

                if ($product->stock_on_hand < $order->quantity) {
                    throw ValidationException::withMessages([
                        'order' => "Only {$product->stock_on_hand} units are available for {$product->name}.",
                    ]);
                }
            }

            $weightGrams = max(($product?->weight_grams ?? 500) * $order->quantity, 1);
            $shippingCharge = $calculator->charge($rate, $weightGrams);
            $addressVerification = $order->address_verification;

            if (! is_array($addressVerification)) {
                $addressVerification = app(AddressVerifier::class)->verify(
                    $order->customer_address,
                    $order->customer_area,
                    $order->customer_phone,
                    $order->city?->name,
                    $order->cod_amount_paisa,
                );
            }

            $shipment = Shipment::create([
                'seller_id' => $request->user()->id,
                'courier_id' => $rate->courier_id,
                'city_id' => $order->city_id,
                'inventory_product_id' => $product?->id,
                'product_quantity' => $order->quantity,
                'tracking_number' => $this->trackingNumber(),
                'receiver_name' => $order->customer_name,
                'receiver_phone' => $order->customer_phone,
                'receiver_address' => $order->customer_address,
                'receiver_area' => $order->customer_area,
                'address_score' => $order->address_score ?? $addressVerification['score'],
                'address_verification_level' => $order->address_verification_level ?? $addressVerification['level'],
                'address_verification' => $addressVerification,
                'weight_grams' => $weightGrams,
                'parcel_type' => 'Small Parcel',
                'cod_amount_paisa' => $order->cod_amount_paisa,
                'shipping_charge_paisa' => $shippingCharge,
                'our_fee_paisa' => $rate->our_fee_paisa,
                'status' => 'booked',
                'description' => $product ? "{$product->name} ({$product->sku})" : "Order {$order->order_number}",
                'special_instructions' => $order->notes,
                'booked_at' => now(),
            ]);

            if ($product) {
                $product->decrement('stock_on_hand', $order->quantity);
            }

            $order->forceFill([
                'shipment_id' => $shipment->id,
                'status' => 'shipped',
            ])->save();

            return $shipment;
        });
    }

    private function orderNumber(): string
    {
        do {
            $orderNumber = 'ORD-'.now()->format('ymd').'-'.Str::upper(Str::random(5));
        } while (Order::where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }

    private function trackingNumber(): string
    {
        do {
            $trackingNumber = 'FC'.now()->format('ymd').Str::upper(Str::random(6));
        } while (Shipment::where('tracking_number', $trackingNumber)->exists());

        return $trackingNumber;
    }

    private function manifestNumber(): string
    {
        do {
            $manifestNumber = 'MAN-'.now()->format('ymd').'-'.Str::upper(Str::random(5));
        } while (ShippingManifest::where('manifest_number', $manifestNumber)->exists());

        return $manifestNumber;
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
            ->with('error', 'Your seller KYC must be verified before orders can be shipped. Please complete your profile and wait for admin approval.'));
    }
}
