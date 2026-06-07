<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingListController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $shipments = Shipment::query()
            ->with(['courier:id,name,code', 'city:id,name'])
            ->where('seller_id', $request->user()->id)
            ->latest('booked_at')
            ->paginate(15)
            ->through(fn (Shipment $shipment) => [
                'id' => $shipment->id,
                'trackingNumber' => $shipment->tracking_number,
                'externalAwb' => $shipment->external_awb,
                'labelUrl' => $shipment->label_url,
                'receiver' => $shipment->receiver_name,
                'phone' => $shipment->receiver_phone,
                'city' => $shipment->city?->name,
                'courier' => $shipment->courier?->name,
                'courierCode' => $shipment->courier?->code,
                'status' => $shipment->status,
                'weightGrams' => $shipment->weight_grams,
                'codAmount' => $shipment->cod_amount_paisa,
                'shippingCharge' => $shipment->shipping_charge_paisa,
                'bookedAt' => $shipment->booked_at?->format('M d, Y h:i A'),
            ]);

        return Inertia::render('Bookings/Index', [
            'shipments' => $shipments,
        ]);
    }
}
