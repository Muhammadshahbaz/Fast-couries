<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicTrackingController extends Controller
{
    public function show(Request $request): Response
    {
        $trackingNumber = trim((string) $request->query('tracking'));
        $shipment = null;

        if ($trackingNumber !== '') {
            $shipment = Shipment::query()
                ->with(['courier:id,name,code', 'city:id,name', 'events' => fn ($query) => $query->orderBy('occurred_at')])
                ->where('tracking_number', $trackingNumber)
                ->orWhere('external_awb', $trackingNumber)
                ->first();
        }

        return Inertia::render('Track', [
            'query' => $trackingNumber,
            'shipment' => $shipment ? [
                'trackingNumber' => $shipment->tracking_number,
                'externalAwb' => $shipment->external_awb,
                'receiverName' => $shipment->receiver_name,
                'city' => $shipment->city?->name,
                'courier' => $shipment->courier?->name,
                'status' => $shipment->status,
                'bookedAt' => $shipment->booked_at?->format('M d, Y h:i A'),
                'events' => $shipment->events->map(fn ($event) => [
                    'status' => $event->status,
                    'location' => $event->location,
                    'remarks' => $event->remarks,
                    'occurredAt' => $event->occurred_at?->format('M d, Y h:i A'),
                ]),
            ] : null,
        ]);
    }
}
