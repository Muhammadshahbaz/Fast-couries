<?php

namespace App\Support;

use App\Models\CourierRate;

class ShippingRateCalculator
{
    public function charge(CourierRate $rate, int $weightGrams): int
    {
        $slabs = $rate->rate_slabs ?? [];

        if ($slabs !== []) {
            return $this->chargeFromSlabs($slabs, $weightGrams);
        }

        $extraGrams = max($weightGrams - $rate->base_weight_grams, 0);
        $extraKgUnits = (int) ceil($extraGrams / 1000);

        return $rate->base_rate_paisa + ($extraKgUnits * $rate->additional_kg_rate_paisa);
    }

    /**
     * @param list<array{upto_grams?: int, rate_paisa?: int, extra_kg_rate_paisa?: int}> $slabs
     */
    private function chargeFromSlabs(array $slabs, int $weightGrams): int
    {
        foreach ($slabs as $slab) {
            if (isset($slab['upto_grams'], $slab['rate_paisa']) && $weightGrams <= $slab['upto_grams']) {
                return $slab['rate_paisa'];
            }
        }

        $lastFixedSlab = collect($slabs)
            ->filter(fn (array $slab) => isset($slab['upto_grams'], $slab['rate_paisa']))
            ->sortBy('upto_grams')
            ->last();
        $extraKgRate = collect($slabs)->firstWhere('extra_kg_rate_paisa')['extra_kg_rate_paisa'] ?? 0;

        if (! $lastFixedSlab || $extraKgRate <= 0) {
            return 0;
        }

        $extraGrams = max($weightGrams - $lastFixedSlab['upto_grams'], 0);
        $extraKgUnits = (int) ceil($extraGrams / 1000);

        return $lastFixedSlab['rate_paisa'] + ($extraKgUnits * $extraKgRate);
    }
}
