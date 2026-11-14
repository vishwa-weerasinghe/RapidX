<?php

namespace App\Services;

use Carbon\Carbon;
use Throwable;

class BookingSchedule
{
    public static function isInFuture(string $date, string $time): bool
    {
        try {
            $scheduledAt = Carbon::parse($date . ' ' . $time, 'Asia/Colombo');
        } catch (Throwable) {
            return false;
        }

        return $scheduledAt->isAfter(now('Asia/Colombo'));
    }
}
