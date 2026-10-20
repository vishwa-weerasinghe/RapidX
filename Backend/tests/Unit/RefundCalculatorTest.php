<?php

namespace Tests\Unit;

use App\Services\RefundCalculator;
use PHPUnit\Framework\TestCase;

/**
 * Unit coverage for the single source of truth behind the cancellation policy.
 *
 * BookingRefundTest already exercises the same tiers through the HTTP layer
 * (happy paths for 8+ / 3-7 / <3 days); this test file covers the edges that
 * the HTTP tests cannot reach: unparseable dates, midnight boundary handling,
 * status normalisation and the exact tier thresholds.
 */
class RefundCalculatorTest extends TestCase
{
    private RefundCalculator $calculator;

    protected function setUp(): void
    {
        parent::setUp();

        $this->calculator = new RefundCalculator();
    }

    /**
     * Run a callback while swallowing PHP-level warnings.
     *
     * Carbon's DateTime parser emits an E_WARNING *before* throwing when it
     * receives an unparseable date string. RefundCalculator correctly catches
     * the thrown exception (and the tests assert that behaviour), but in this
     * non-Laravel-booted unit context PHPUnit's error handler would still
     * record the native warning as a test warning. Silencing it here keeps the
     * suite output clean without hiding any assertion result.
     */
    private function withoutDateParsingWarnings(callable $callback): mixed
    {
        set_error_handler(static fn () => true);

        try {
            return $callback();
        } finally {
            restore_error_handler();
        }
    }

    public function test_full_refund_starts_at_exactly_eight_days_before_the_safari(): void
    {
        $this->assertSame(
            RefundCalculator::FULL_REFUND,
            $this->calculator->calculate('Confirmed', '2026-08-11', '2026-08-03')
        );
    }

    public function test_seven_days_before_the_safari_is_only_a_half_refund(): void
    {
        $this->assertSame(
            RefundCalculator::HALF_REFUND,
            $this->calculator->calculate('Confirmed', '2026-08-10', '2026-08-03')
        );
    }

    public function test_three_days_before_the_safari_is_the_last_half_refund_day(): void
    {
        $this->assertSame(
            RefundCalculator::HALF_REFUND,
            $this->calculator->calculate('Confirmed', '2026-08-06', '2026-08-03')
        );
    }

    public function test_two_days_before_the_safari_gives_no_refund(): void
    {
        $this->assertSame(
            RefundCalculator::NO_REFUND,
            $this->calculator->calculate('Confirmed', '2026-08-05', '2026-08-03')
        );
    }

    public function test_cancelling_on_the_safari_day_gives_no_refund(): void
    {
        $this->assertSame(
            RefundCalculator::NO_REFUND,
            $this->calculator->calculate('Confirmed', '2026-08-03', '2026-08-03')
        );
    }

    public function test_a_past_safari_date_never_refunds(): void
    {
        $this->assertSame(
            RefundCalculator::NO_REFUND,
            $this->calculator->calculate('Confirmed', '2026-08-02', '2026-08-03')
        );
    }

    public function test_an_unparseable_or_missing_date_never_refunds(): void
    {
        $this->assertSame(
            RefundCalculator::NO_REFUND,
            $this->withoutDateParsingWarnings(
                fn () => $this->calculator->calculate('Confirmed', 'not-a-date', '2026-08-03')
            )
        );
        $this->assertSame(
            RefundCalculator::NO_REFUND,
            $this->calculator->calculate('Confirmed', null, '2026-08-03')
        );
        $this->assertSame(
            RefundCalculator::NO_REFUND,
            $this->calculator->calculate('Confirmed', '', '2026-08-03')
        );
    }

    public function test_only_confirmed_bookings_can_earn_a_refund(): void
    {
        foreach (['Pending', 'In Cart', 'Cancelled', 'Completed', 'Failed'] as $status) {
            $this->assertSame(
                RefundCalculator::NO_REFUND,
                $this->calculator->calculate($status, '2026-08-11', '2026-08-03'),
                "Status '{$status}' must never refund"
            );
        }
    }

    public function test_status_comparison_ignores_case_and_spaces(): void
    {
        $this->assertTrue($this->calculator->isConfirmed('confirmed'));
        $this->assertTrue($this->calculator->isConfirmed('CONFIRMED'));
        $this->assertTrue($this->calculator->isConfirmed('Confirmed'));
        $this->assertFalse($this->calculator->isConfirmed('In Cart'));
        $this->assertSame('incart', $this->calculator->normalizeStatus('In Cart'));
        $this->assertSame('incart', $this->calculator->normalizeStatus('incart'));

        // A lowercase status still earns the tiered refund.
        $this->assertSame(
            RefundCalculator::FULL_REFUND,
            $this->calculator->calculate('confirmed', '2026-08-11', '2026-08-03')
        );
    }

    public function test_the_time_of_day_never_shifts_the_refund_tier(): void
    {
        // Both dates sit on the same midnight-to-midnight calendar days, so a
        // late-evening timestamp and an early-morning timestamp must resolve
        // to the identical tier.
        $this->assertSame(
            RefundCalculator::FULL_REFUND,
            $this->calculator->calculate('Confirmed', '2026-08-11 23:59:00', '2026-08-03 07:30:00')
        );
        $this->assertSame(
            RefundCalculator::HALF_REFUND,
            $this->calculator->calculate('Confirmed', '2026-08-10 00:01:00', '2026-08-03 23:55:00')
        );
    }

    public function test_days_until_safari_returns_null_when_the_date_cannot_be_parsed(): void
    {
        $this->assertNull($this->calculator->daysUntilSafari(null));
        $this->assertNull($this->calculator->daysUntilSafari(''));
        $this->assertNull($this->withoutDateParsingWarnings(
            fn () => $this->calculator->daysUntilSafari('definitely-not-a-date')
        ));
    }

    public function test_days_until_safari_counts_whole_calendar_days(): void
    {
        $this->assertSame(8, $this->calculator->daysUntilSafari('2026-08-11', '2026-08-03'));
        $this->assertSame(0, $this->calculator->daysUntilSafari('2026-08-03', '2026-08-03'));
        $this->assertSame(-2, $this->calculator->daysUntilSafari('2026-08-01', '2026-08-03'));
    }
}