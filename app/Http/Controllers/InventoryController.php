<?php

namespace App\Http\Controllers;

use App\Models\InventoryProduct;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(Request $request): Response
    {
        $products = InventoryProduct::query()
            ->where('seller_id', $request->user()->id)
            ->withCount('shipments')
            ->orderBy('name')
            ->get();

        return Inertia::render('Inventory/Index', [
            'stats' => [
                'totalProducts' => $products->count(),
                'activeProducts' => $products->where('is_active', true)->count(),
                'stockUnits' => $products->sum('stock_on_hand'),
                'lowStock' => $products->filter(fn (InventoryProduct $product) => $product->isLowStock())->count(),
            ],
            'products' => $products->map(fn (InventoryProduct $product) => [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'description' => $product->description,
                'weightGrams' => $product->weight_grams,
                'stockOnHand' => $product->stock_on_hand,
                'lowStockAlert' => $product->low_stock_alert,
                'isActive' => $product->is_active,
                'isLowStock' => $product->isLowStock(),
                'shipmentsCount' => $product->shipments_count,
            ]),
            'forecast' => $products->map(function (InventoryProduct $product) use ($request) {
                $unitsLast30Days = Order::query()
                    ->where('seller_id', $request->user()->id)
                    ->where('inventory_product_id', $product->id)
                    ->where('created_at', '>=', now()->subDays(30))
                    ->sum('quantity');
                $dailyAverage = round($unitsLast30Days / 30, 2);
                $daysOfStock = $dailyAverage > 0 ? (int) floor($product->stock_on_hand / $dailyAverage) : null;
                $suggestedReorder = max(($product->low_stock_alert * 2) - $product->stock_on_hand, 0);

                return [
                    'id' => $product->id,
                    'sku' => $product->sku,
                    'name' => $product->name,
                    'unitsLast30Days' => (int) $unitsLast30Days,
                    'dailyAverage' => $dailyAverage,
                    'daysOfStock' => $daysOfStock,
                    'suggestedReorder' => (int) $suggestedReorder,
                    'recommendation' => match (true) {
                        $dailyAverage === 0.0 => 'No recent order demand yet.',
                        $product->stock_on_hand <= $product->low_stock_alert => 'Reorder now before booking more campaigns.',
                        $daysOfStock !== null && $daysOfStock <= 7 => 'Plan reorder this week.',
                        default => 'Stock looks healthy.',
                    },
                ];
            })->values(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->rules($request));

        $request->user()->inventoryProducts()->create($validated);

        return back()->with('success', 'Product added to inventory.');
    }

    public function update(Request $request, InventoryProduct $product): RedirectResponse
    {
        abort_unless($product->seller_id === $request->user()->id, 403);

        $validated = $request->validate($this->rules($request, $product));

        $product->update($validated);

        return back()->with('success', 'Inventory product updated.');
    }

    private function rules(Request $request, ?InventoryProduct $product = null): array
    {
        return [
            'name' => ['required', 'string', 'max:160'],
            'sku' => [
                'required',
                'string',
                'max:80',
                Rule::unique('inventory_products', 'sku')
                    ->where('seller_id', $request->user()->id)
                    ->ignore($product?->id),
            ],
            'description' => ['nullable', 'string', 'max:500'],
            'weight_grams' => ['required', 'integer', 'min:1', 'max:50000'],
            'stock_on_hand' => ['required', 'integer', 'min:0', 'max:1000000'],
            'low_stock_alert' => ['required', 'integer', 'min:0', 'max:1000000'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
