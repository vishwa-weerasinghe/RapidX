<?php

namespace App\Services;

use Carbon\Carbon;


class RefundCalculator
{
    // Tier thresholds = whole days before the safari date.
    public const FULL_REFUND_MIN_DAYS = 8; // "more than 7 days"  -> 100%
    public const HALF_REFUND_MIN_DAYS = 3; // "3 to 7 days"       ->  50%

    public const FULL_REFUND = 100;
    public const HALF_REFUND = 50;
    public const NO_REFUND = 0;

    
    public function calculate(string $status, mixed $bookingDate, mixed $today = null): int
    {
        if (!$this->isConfirmed($status)) {
            return self::NO_REFUND;
        }

        $days = $this->daysUntilSafari($bookingDate, $today);

        // No usable date (or a date already in the past) -> fail safe to 0%.
        if ($days === null || $days < 0) {
            return self::NO_REFUND;
        }

        if ($days >= self::FULL_REFUND_MIN_DAYS) {
            return self::FULL_REFUND;
        }

        if ($days >= self::HALF_REFUND_MIN_DAYS) {
            return self::HALF_REFUND;
        }

        return self::NO_REFUND;
    }

    
    public function daysUntilSafari(mixed $bookingDate, mixed $today = null): ?int
    {
        if (!$bookingDate) {
            return null;
        }

        try {
            $safariDay = Carbon::parse($bookingDate)->startOfDay();
        } catch (\Throwable $e) {
            return null;
        }

        $referenceDay = $today
            ? Carbon::parse($today)->startOfDay()
            : Carbon::now()->startOfDay();

        // Signed difference: positive when the safari is in the future.
        return (int) round($referenceDay->diffInDays($safariDay, false));
    }

    public function isConfirmed(string $status): bool
    {
        return $this->normalizeStatus($status) === 'confirmed';
    }

    
    public function normalizeStatus(string $status): string
    {
        return strtolower(str_replace(' ', '', (string) $status));
    }
}
