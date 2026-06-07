<?php

namespace App\Http\Controllers;

use App\Couriers\CourierTrackingService;
use App\Models\Courier;
use App\Models\Shipment;
use App\Models\TrackingEvent;
use App\Notifications\ShipmentStatusUpdated;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class AdminShipmentController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeAdmin($request);

        $shipments = Shipment::query()
            ->with(['seller:id,name,email,phone', 'courier:id,name,code', 'city:id,name'])
            ->when($request->filled('q'), function ($query) use ($request) {
                $term = '%'.$request->string('q')->toString().'%';

                $query->where(function ($query) use ($term) {
                    $query->where('tracking_number', 'like', $term)
                        ->orWhere('external_awb', 'like', $term)
                        ->orWhere('receiver_name', 'like', $term)
                        ->orWhere('receiver_phone', 'like', $term);
                });
            })
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->when($request->filled('courier_id'), fn ($query) => $query->where('courier_id', $request->integer('courier_id')))
            ->latest('booked_at')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Shipment $shipment) => [
                'id' => $shipment->id,
                'trackingNumber' => $shipment->tracking_number,
                'externalAwb' => $shipment->external_awb,
                'seller' => $shipment->seller?->name,
                'sellerEmail' => $shipment->seller?->email,
                'receiver' => $shipment->receiver_name,
                'phone' => $shipment->receiver_phone,
                'city' => $shipment->city?->name,
                'courier' => $shipment->courier?->name,
                'courierCode' => $shipment->courier?->code,
                'status' => $shipment->status,
                'codAmount' => $shipment->cod_amount_paisa,
                'shippingCharge' => $shipment->shipping_charge_paisa,
                'apiSyncedAt' => $shipment->api_synced_at?->format('M d, Y h:i A'),
                'bookedAt' => $shipment->booked_at?->format('M d, Y h:i A'),
            ]);

        return Inertia::render('Admin/Shipments/Index', [
            'filters' => [
                'q' => $request->string('q')->toString(),
                'status' => $request->string('status')->toString(),
                'courier_id' => $request->string('courier_id')->toString(),
            ],
            'couriers' => Courier::query()->orderBy('name')->get(['id', 'name', 'code']),
            'statuses' => ['booked', 'picked', 'transit', 'out_for_delivery', 'delivered', 'returned', 'cancelled'],
            'shipments' => $shipments,
        ]);
    }

    public function updateStatus(Request $request, Shipment $shipment): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'status' => ['required', Rule::in(['booked', 'picked', 'transit', 'out_for_delivery', 'delivered', 'returned', 'cancelled'])],
            'remarks' => ['nullable', 'string', 'max:500'],
        ]);

        $returnProof = $shipment->return_proof;

        if ($validated['status'] === 'returned' && empty($returnProof)) {
            $returnProof = [
                'status' => 'verified',
                'attempts' => 2,
                'last_attempt_at' => now()->format('Y-m-d H:i:s'),
                'buyer_response' => 'Buyer did not accept the parcel during delivery attempt.',
                'rider_statement' => $validated['remarks'] ?: 'Rider attempted delivery and recorded buyer non-acceptance.',
                'rider_name' => 'Operations rider',
                'rider_phone' => null,
                'geo_location' => 'Fast Couriers operations',
                'courier_reference' => 'OPS-RET-'.$shipment->tracking_number,
                'call_recording_url' => $shipment->external_awb ? route('couriers.proof.call-recording.sandbox', ['awb' => $shipment->external_awb]) : null,
                'photo_url' => $shipment->external_awb ? route('couriers.proof.attempt-photo.sandbox', ['awb' => $shipment->external_awb]) : null,
            ];
        }

        $shipment->forceFill([
            'status' => $validated['status'],
            'delivered_at' => $validated['status'] === 'delivered' ? ($shipment->delivered_at ?? now()) : $shipment->delivered_at,
            'returned_at' => $validated['status'] === 'returned' ? ($shipment->returned_at ?? now()) : $shipment->returned_at,
            'return_reason' => $validated['status'] === 'returned' ? ($validated['remarks'] ?: $shipment->return_reason) : $shipment->return_reason,
            'return_proof' => $validated['status'] === 'returned' ? $returnProof : $shipment->return_proof,
            'return_proof_verified_at' => $validated['status'] === 'returned' ? ($shipment->return_proof_verified_at ?? now()) : $shipment->return_proof_verified_at,
            'api_synced_at' => now(),
        ])->save();

        TrackingEvent::create([
            'shipment_id' => $shipment->id,
            'status' => $validated['status'],
            'location' => 'Fast Couriers operations',
            'remarks' => $validated['remarks'] ?: 'Status updated by operations.',
            'occurred_at' => now(),
        ]);

        $shipment->seller?->notify(new ShipmentStatusUpdated($shipment));

        return back()->with('success', "{$shipment->tracking_number} updated.");
    }

    public function sync(Request $request, Shipment $shipment, CourierTrackingService $tracking): RedirectResponse
    {
        $this->authorizeAdmin($request);

        try {
            $tracking->sync($shipment);
        } catch (RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', "{$shipment->tracking_number} tracking synced.");
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless(in_array($request->user()->role, ['super_admin', 'sub_admin'], true), 403);
    }
}
