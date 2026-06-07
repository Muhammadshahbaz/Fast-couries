<?php

namespace Tests\Unit;

use App\Support\AddressVerifier;
use PHPUnit\Framework\TestCase;

class AddressVerifierTest extends TestCase
{
    public function test_it_scores_complete_addresses_as_strong(): void
    {
        $result = (new AddressVerifier())->verify(
            'House 12, Street 4, Main Road near Market Lahore',
            'Gulberg',
            '03001234567',
            'Lahore',
            150000,
        );

        $this->assertSame('strong', $result['level']);
        $this->assertGreaterThanOrEqual(80, $result['score']);
        $this->assertSame([], $result['issues']);
    }

    public function test_it_flags_weak_addresses_for_review(): void
    {
        $result = (new AddressVerifier())->verify('Lahore', null, '123', 'Lahore', 2500000);

        $this->assertSame('high_risk', $result['level']);
        $this->assertNotEmpty($result['issues']);
        $this->assertNotEmpty($result['recommendations']);
    }
}
