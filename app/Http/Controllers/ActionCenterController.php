<?php

namespace App\Http\Controllers;

use App\Models\CustomerAddress;
use App\Models\InventoryProduct;
use App\Models\NotificationEvent;
use App\Models\Order;
use App\Models\PickupRequest;
use App\Models\Shipment;
use App\Models\ShippingManifest;
use App\Models\SupportTicket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ActionCenterController extends Controller
{
    public function index(Request $request): Response
    {
        $sellerId = $request->user()->id;
        $pendingOrders = Order::query()
            ->with('inventoryProduct:id,name,sku')
            ->where('seller_id', $sellerId)
            ->whereIn('status', ['pending', 'packed'])
            ->whereNull('shipment_id')
            ->get();

        $pickList = $pendingOrders
            ->filter(fn (Order $order) => $order->inventoryProduct)
            ->groupBy('inventory_product_id')
            ->map(fn ($orders) => [
                'sku' => $orders->first()->inventoryProduct->sku,
                'name' => $orders->first()->inventoryProduct->name,
                'quantity' => $orders->sum('quantity'),
                'orders' => $orders->count(),
            ])
            ->values();

        return Inertia::render('ActionCenter/Index', [
            'stats' => [
                'pendingOrders' => $pendingOrders->count(),
                'readyShipments' => Shipment::where('seller_id', $sellerId)->where('status', 'booked')->count(),
                'returnsToReceive' => Shipment::where('seller_id', $sellerId)->where('status', 'returned')->whereNull('return_stock_recovered_at')->count(),
                'openClaims' => SupportTicket::where('seller_id', $sellerId)->where('category', 'claim')->where('status', 'open')->count(),
            ],
            'pickList' => $pickList,
            'manifests' => ShippingManifest::where('seller_id', $sellerId)->latest()->limit(10)->get(['id', 'manifest_number', 'total_shipments'])->map(fn (ShippingManifest $manifest) => [
                'id' => $manifest->id,
                'manifest_number' => $manifest->manifest_number,
                'shipments_count' => $manifest->total_shipments,
            ]),
            'pickups' => PickupRequest::query()
                ->with('manifest:id,manifest_number')
                ->where('seller_id', $sellerId)
                ->latest()
                ->limit(10)
                ->get()
                ->map(fn (PickupRequest $pickup) => [
                'id' => $pickup->id,
                'pickup_number' => $pickup->pickup_number,
                'manifest_number' => $pickup->manifest?->manifest_number ?? 'No manifest',
                'address' => $pickup->pickup_address,
                'pickup_date' => $pickup->pickup_date?->format('M d, Y'),
                'time_window' => $pickup->time_window,
                'status' => $pickup->status,
            ]),
            'notifications' => NotificationEvent::query()
                ->with('shipment:id,tracking_number')
                ->where('seller_id', $sellerId)
                ->latest()
                ->limit(10)
                ->get()
                ->map(fn (NotificationEvent $event) => [
                'id' => $event->id,
                'channel' => $event->channel,
                'event_type' => $event->event_type,
                'status' => $event->status,
                'recipient_phone' => $event->recipient_phone,
                'tracking_number' => $event->shipment?->tracking_number,
                'message' => $event->message,
                'created_at' => $event->created_at?->format('M d, h:i A'),
            ]),
            'returnedShipments' => Shipment::query()
                ->with(['inventoryProduct:id,name,sku'])
                ->where('seller_id', $sellerId)
                ->where('status', 'returned')
                ->whereNull('return_stock_recovered_at')
                ->latest('returned_at')
                ->limit(10)
                ->get(['id', 'tracking_number', 'inventory_product_id', 'product_quantity', 'receiver_name', 'returned_at']),
        ]);
    }

    public function pickup(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'shipping_manifest_id' => ['nullable', Rule::exists('shipping_manifests', 'id')->where('seller_id', $request->user()->id)],
            'pickup_address' => ['required', 'string', 'max:500'],
            'pickup_date' => ['required', 'date', 'after_or_equal:today'],
            'time_window' => ['required', 'string', 'max:80'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $request->user()->pickupRequests()->create($validated + [
            'pickup_number' => 'PU-'.now()->format('ymd').'-'.Str::upper(Str::random(5)),
            'status' => 'requested',
        ]);

        return back()->with('success', 'Pickup request created.');
    }

    public function recoverReturnStock(Request $request, Shipment $shipment): RedirectResponse
    {
        abort_unless($shipment->seller_id === $request->user()->id, 403);
        abort_unless($shipment->status === 'returned', 422);

        if ($shipment->inventory_product_id && $shipment->return_stock_recovered_at === null) {
            InventoryProduct::where('id', $shipment->inventory_product_id)->increment('stock_on_hand', $shipment->product_quantity);
            $shipment->forceFill(['return_stock_recovered_at' => now()])->save();
        }

        return back()->with('success', 'Returned item stock recovered.');
    }

    public function notifyBuyer(Request $request, Shipment $shipment): RedirectResponse
    {
        abort_unless($shipment->seller_id === $request->user()->id, 403);

        $validated = $request->validate([
            'event_type' => ['required', Rule::in(['booked', 'out_for_delivery', 'delivered', 'returned'])],
        ]);

        $message = match ($validated['event_type']) {
            'booked' => "Your order {$shipment->tracking_number} has been booked.",
            'out_for_delivery' => "Your order {$shipment->tracking_number} is out for delivery.",
            'delivered' => "Your order {$shipment->tracking_number} has been delivered.",
            'returned' => "Your order {$shipment->tracking_number} has been marked returned.",
        };

        NotificationEvent::create([
            'seller_id' => $request->user()->id,
            'shipment_id' => $shipment->id,
            'recipient_phone' => $shipment->receiver_phone,
            'channel' => 'whatsapp',
            'event_type' => $validated['event_type'],
            'status' => 'queued',
            'message' => $message,
        ]);

        return back()->with('success', 'Buyer notification queued.');
    }

    public function claim(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'shipment_id' => ['required', Rule::exists('shipments', 'id')->where('seller_id', $request->user()->id)],
            'subject' => ['required', 'string', 'max:160'],
            'message' => ['required', 'string', 'max:1500'],
        ]);

        SupportTicket::create($validated + [
            'seller_id' => $request->user()->id,
            'ticket_number' => 'CLM-'.now()->format('ymd').Str::upper(Str::random(5)),
            'category' => 'claim',
            'priority' => 'urgent',
            'status' => 'open',
        ]);

        return back()->with('success', 'Claim opened.');
    }
}
