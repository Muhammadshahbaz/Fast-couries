<?php

namespace Tests\Unit;

use App\Models\CourierRate;
use App\Support\ShippingRateCalculator;
use PHPUnit\Framework\TestCase;

class ShippingRateCalculatorTest extends TestCase
{
    public function test_leopards_trax_mnp_blueex_rate_card_slabs(): void
    {
        $calculator = new ShippingRateCalculator();
        $rate = new CourierRate([
            'base_weight_grams' => 500,
            'base_rate_paisa' => 24899,
            'additional_kg_rate_paisa' => 15660,
            'rate_slabs' => [
                ['upto_grams' => 500, 'rate_paisa' => 24899],
                ['upto_grams' => 1000, 'rate_paisa' => 28188],
                ['extra_kg_rate_paisa' => 15660],
            ],
        ]);

        $this->assertSame(24899, $calculator->charge($rate, 500));
        $this->assertSame(28188, $calculator->charge($rate, 1000));
        $this->assertSame(43848, $calculator->charge($rate, 1500));
    }

    public function test_tcs_rate_card_slabs(): void
    {
        $calculator = new ShippingRateCalculator();
        $rate = new CourierRate([
            'base_weight_grams' => 500,
            'base_rate_paisa' => 28000,
            'additional_kg_rate_paisa' => 30000,
            'rate_slabs' => [
                ['upto_grams' => 500, 'rate_paisa' => 28000],
                ['upto_grams' => 1000, 'rate_paisa' => 30000],
                ['extra_kg_rate_paisa' => 30000],
            ],
        ]);

        $this->assertSame(28000, $calculator->charge($rate, 500));
        $this->assertSame(30000, $calculator->charge($rate, 1000));
        $this->assertSame(60000, $calculator->charge($rate, 1500));
    }

    public function test_overland_rate_card_slabs(): void
    {
        $calculator = new ShippingRateCalculator();
        $rate = new CourierRate([
            'base_weight_grams' => 5000,
            'base_rate_paisa' => 45000,
            'additional_kg_rate_paisa' => 10000,
            'rate_slabs' => [
                ['upto_grams' => 5000, 'rate_paisa' => 45000],
                ['extra_kg_rate_paisa' => 10000],
            ],
        ]);

        $this->assertSame(45000, $calculator->charge($rate, 5000));
        $this->assertSame(55000, $calculator->charge($rate, 5500));
        $this->assertSame(65000, $calculator->charge($rate, 6500));
    }
}
