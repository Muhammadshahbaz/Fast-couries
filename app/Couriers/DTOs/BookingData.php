<?php

namespace App\Couriers\DTOs;

use App\Models\Shipment;

readonly class BookingData
{
    public function __construct(
        public string $trackingNumber,
        public string $receiverName,
        public string $receiverPhone,
        public string $receiverAddress,
        public string $receiverCity,
        public ?string $receiverArea,
        public int $weightGrams,
        public string $parcelType,
        public int $codAmountPaisa,
        public ?string $description,
        public ?string $specialInstructions,
    ) {
    }

    public static function fromShipment(Shipment $shipment): self
    {
        $shipment->loadMissing('city');

        return new self(
            trackingNumber: $shipment->tracking_number,
            receiverName: $shipment->receiver_name,
            receiverPhone: $shipment->receiver_phone,
            receiverAddress: $shipment->receiver_address,
            receiverCity: $shipment->city?->name ?? '',
            receiverArea: $shipment->receiver_area,
            weightGrams: $shipment->weight_grams,
            parcelType: $shipment->parcel_type,
            codAmountPaisa: $shipment->cod_amount_paisa,
            description: $shipment->description,
            specialInstructions: $shipment->special_instructions,
        );
    }

    public function codAmountRupees(): float
    {
        return $this->codAmountPaisa / 100;
    }

    public function weightKg(): float
    {
        return max($this->weightGrams / 1000, 0.1);
    }
}
