<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\ShippingManifest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ManifestController extends Controller
{
    public function show(Request $request, ShippingManifest $manifest): Response
    {
        abort_unless($manifest->seller_id === $request->user()->id, 403);

        $shipments = Shipment::query()
            ->with(['courier:id,name,code', 'city:id,name'])
            ->where('seller_id', $request->user()->id)
            ->whereIn('id', $manifest->shipment_ids ?? [])
            ->orderBy('courier_id')
            ->orderBy('tracking_number')
            ->get();

        return Inertia::render('Manifests/Show', [
            'manifest' => [
                'id' => $manifest->id,
                'manifestNumber' => $manifest->manifest_number,
                'status' => $manifest->status,
                'totalShipments' => $manifest->total_shipments,
                'totalCod' => $manifest->total_cod_paisa,
                'createdAt' => $manifest->created_at?->format('M d, Y h:i A'),
            ],
            'shipments' => $shipments->map(fn (Shipment $shipment) => [
                'id' => $shipment->id,
                'trackingNumber' => $shipment->tracking_number,
                'externalAwb' => $shipment->external_awb,
                'labelUrl' => $shipment->label_url,
                'receiver' => $shipment->receiver_name,
                'phone' => $shipment->receiver_phone,
                'city' => $shipment->city?->name,
                'courier' => $shipment->courier?->name,
                'courierCode' => $shipment->courier?->code,
                'codAmount' => $shipment->cod_amount_paisa,
                'shippingCharge' => $shipment->shipping_charge_paisa + $shipment->our_fee_paisa,
                'weightGrams' => $shipment->weight_grams,
            ]),
        ]);
    }
}
