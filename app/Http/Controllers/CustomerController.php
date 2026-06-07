<?php

namespace App\Http\Controllers;

use App\Models\City;
use App\Models\CustomerAddress;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Customers/Index', [
            'customers' => CustomerAddress::query()
                ->with('city:id,name')
                ->where('seller_id', $request->user()->id)
                ->latest('last_order_at')
                ->get()
                ->map(fn (CustomerAddress $customer) => [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'phone' => $customer->phone,
                    'address' => $customer->address,
                    'area' => $customer->area,
                    'city' => $customer->city?->name,
                    'orders_count' => $customer->orders_count,
                    'last_order_at' => $customer->last_order_at?->format('M d, Y'),
                ]),
            'cities' => City::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'phone' => ['required', 'string', 'max:30', Rule::unique('customer_addresses', 'phone')->where('seller_id', $request->user()->id)],
            'city_id' => ['nullable', 'exists:cities,id'],
            'address' => ['required', 'string', 'max:1000'],
            'area' => ['nullable', 'string', 'max:120'],
        ]);

        $request->user()->customerAddresses()->create($validated);

        return back()->with('success', 'Customer saved.');
    }
}
