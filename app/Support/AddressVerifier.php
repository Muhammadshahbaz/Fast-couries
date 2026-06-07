<?php

namespace App\Support;

use Illuminate\Support\Str;

class AddressVerifier
{
    public function verify(string $address, ?string $area = null, ?string $phone = null, ?string $cityName = null, int $codAmountPaisa = 0): array
    {
        $normalizedAddress = trim(preg_replace('/\s+/', ' ', $address) ?? '');
        $normalizedArea = filled($area) ? trim(preg_replace('/\s+/', ' ', (string) $area) ?? '') : null;
        $phoneDigits = preg_replace('/\D+/', '', (string) $phone) ?? '';
        $city = filled($cityName) ? trim((string) $cityName) : null;

        $score = 35;
        $issues = [];
        $recommendations = [];
        $wordCount = str_word_count($normalizedAddress);
        $lowerAddress = Str::lower($normalizedAddress);
        $landmarkWords = ['house', 'flat', 'shop', 'office', 'building', 'block', 'street', 'road', 'near', 'main', 'floor', 'sector', 'phase', 'mohalla', 'town', 'market'];

        if ($wordCount >= 6) {
            $score += 20;
        } else {
            $issues[] = 'Address is short. Add house/shop number, street, block, and nearest landmark.';
        }

        if (Str::contains($lowerAddress, $landmarkWords)) {
            $score += 20;
        } else {
            $issues[] = 'No landmark or street clue found.';
        }

        if (preg_match('/\d/', $normalizedAddress) === 1) {
            $score += 10;
        } else {
            $issues[] = 'No house, shop, street, block, or floor number found.';
        }

        if (filled($normalizedArea)) {
            $score += 10;
        } else {
            $issues[] = 'Area or tehsil is missing.';
        }

        if ($city && Str::contains($lowerAddress, Str::lower($city))) {
            $score += 5;
        }

        if (strlen($phoneDigits) >= 10) {
            $score += 10;
        } else {
            $issues[] = 'Phone number looks incomplete.';
        }

        if ($codAmountPaisa >= 2000000) {
            $recommendations[] = 'High COD order. Confirm by call or WhatsApp before dispatch.';
        }

        if ($issues === []) {
            $recommendations[] = 'Address is ready for dispatch.';
        } else {
            $recommendations[] = 'Ask customer for a clearer location before handing over to courier.';
        }

        $score = min(100, max(0, $score));
        $level = match (true) {
            $score >= 80 => 'strong',
            $score >= 60 => 'needs_review',
            default => 'high_risk',
        };

        return [
            'score' => $score,
            'level' => $level,
            'issues' => $issues,
            'recommendations' => $recommendations,
            'normalized' => [
                'address' => $normalizedAddress,
                'area' => $normalizedArea,
                'phone_digits' => $phoneDigits,
                'city' => $city,
            ],
        ];
    }
}
