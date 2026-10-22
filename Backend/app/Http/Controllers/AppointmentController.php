<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user || !$this->isAdmin($user)) {
            return response()->json(['message' => 'Only administrators can view appointments.'], 403);
        }

        $query = Booking::select(
            'bookings.Booking_ID',
            'bookings.Booking_Date',
            'bookings.Pickup_Time',
            'bookings.Pickup_Location',
            'bookings.Customer_ID',
            'bookings.Vehicle_ID',
            'bookings.Payment_ID',
            'bookings.Payment',
            'bookings.Status',
            'customers.First_Name',
            'customers.Last_Name',
            'customers.Phone_No',
            'customers.Email',
            'customers.Customer_Type',
            'packages.Package_Name'
        )
        ->join('customers', 'bookings.Customer_ID', '=', 'customers.Customer_ID')
        ->leftJoin('packages', 'bookings.Package_ID', '=', 'packages.id')
        ->leftJoin('payments', 'bookings.Payment_ID', '=', 'payments.Payment_ID')
        ->addSelect('payments.status as Payment_Status');

        // Optional monthly filter: ?month=YYYY-MM
        if ($request->has('month') && $request->month) {
            $month = $request->month;
            if (preg_match('/^\d{4}-\d{2}$/', $month)) {
                $query->whereBetween('bookings.Booking_Date', [
                    $month . '-01',
                    $month . '-31',
                ]);
            }
        }

        $appointments = $query
            ->orderBy('bookings.Booking_Date', 'desc')
            ->orderBy('bookings.Pickup_Time')
            ->get();

        return response()->json($appointments);
    }

    public function summary(Request $request)
    {
        $user = $request->user();

        if (!$user || !$this->isAdmin($user)) {
            return response()->json(['message' => 'Only administrators can view appointments.'], 403);
        }

        $query = Booking::query();

        if ($request->has('month') && $request->month) {
            $month = $request->month;
            if (preg_match('/^\d{4}-\d{2}$/', $month)) {
                $query->whereBetween('Booking_Date', [
                    $month . '-01',
                    $month . '-31',
                ]);
            }
        }

        $totalConfirmed = (clone $query)->where('Status', 'Confirmed')->count();
        $totalUnconfirmed = (clone $query)->whereIn('Status', ['In Cart', 'Pending'])->count();
        $totalCancelled = (clone $query)->where('Status', 'Cancelled')->count();
        $totalEarningsConfirmed = (clone $query)->where('Status', 'Confirmed')->sum('Payment');
        $totalEarningsUnconfirmed = (clone $query)->whereIn('Status', ['In Cart', 'Pending'])->sum('Payment');
        $totalRefunds = (clone $query)
            ->where('Status', 'Cancelled')
            ->whereHas('payment', fn ($paymentQuery) => $paymentQuery->where('status', 'Success'))
            ->sum('Payment');

        return response()->json([
            'total_confirmed' => $totalConfirmed,
            'total_unconfirmed' => $totalUnconfirmed,
            'total_cancelled' => $totalCancelled,
            'total_earnings' => $totalEarningsConfirmed,
            'total_earnings_confirmed' => $totalEarningsConfirmed,
            'total_earnings_unconfirmed' => $totalEarningsUnconfirmed,
            'total_refunds' => $totalRefunds,
        ]);
    }

    /**
     * Annual booking report grouped by month for a given year (?year=YYYY).
     * Rows = months (Jan..Dec always present), columns = total confirmed /
    * booking counts and earnings grouped by month. Cancelled payments are
    * exposed separately as refunds, and total is net of refunds.
     */
    public function annualReport(Request $request)
    {
        $user = $request->user();

        if (!$user || !$this->isAdmin($user)) {
            return response()->json(['message' => 'Only administrators can view appointments.'], 403);
        }

        $year = now()->format('Y');
        if ($request->has('year') && preg_match('/^\d{4}$/', (string) $request->year)) {
            $year = $request->year;
        }

        $monthExpression = DB::connection()->getDriverName() === 'sqlite'
            ? "strftime('%Y-%m', Booking_Date)"
            : "DATE_FORMAT(Booking_Date, '%Y-%m')";

        $byMonth = Booking::query()
            ->selectRaw("{$monthExpression} as month")
            ->selectRaw("SUM(CASE WHEN Status = 'Confirmed' THEN 1 ELSE 0 END) as total_confirmed")
            ->selectRaw("SUM(CASE WHEN Status = 'In Cart' THEN 1 ELSE 0 END) as total_in_cart")
            ->selectRaw("SUM(CASE WHEN Status = 'Pending' THEN 1 ELSE 0 END) as total_pending")
            ->selectRaw("SUM(CASE WHEN Status = 'Cancelled' THEN 1 ELSE 0 END) as total_cancelled")
            ->selectRaw("SUM(CASE WHEN Status = 'Confirmed' THEN Payment ELSE 0 END) as earnings_confirmed")
            ->selectRaw("SUM(CASE WHEN Status IN ('In Cart', 'Pending') THEN Payment ELSE 0 END) as earnings_unconfirmed")
            ->selectRaw("SUM(CASE WHEN Status = 'Cancelled' AND Payment_ID IN (SELECT Payment_ID FROM payments WHERE status = 'Success') THEN Payment ELSE 0 END) as refunds")
            ->whereYear('Booking_Date', $year)
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        $totals = [
            'total_confirmed'    => 0,
            'total_in_cart'      => 0,
            'total_pending'      => 0,
            'total_cancelled'    => 0,
            'earnings_confirmed' => 0,
            'earnings_unconfirmed' => 0,
            'refunds'            => 0,
            'total'              => 0,
        ];

        $rows = [];
        for ($m = 1; $m <= 12; $m++) {
            $key = $year . '-' . str_pad((string) $m, 2, '0', STR_PAD_LEFT);
            $row = $byMonth->get($key);

            $item = [
                'month'              => $key,
                'label'              => \Carbon\Carbon::createFromDate((int) $year, $m, 1)->format('F'),
                'total_confirmed'    => (int) ($row->total_confirmed ?? 0),
                'total_in_cart'      => (int) ($row->total_in_cart ?? 0),
                'total_pending'      => (int) ($row->total_pending ?? 0),
                'total_cancelled'    => (int) ($row->total_cancelled ?? 0),
                'earnings_confirmed' => (float) ($row->earnings_confirmed ?? 0),
                'earnings_unconfirmed' => (float) ($row->earnings_unconfirmed ?? 0),
                'refunds'            => (float) ($row->refunds ?? 0),
            ];
            $item['total'] = round($item['earnings_confirmed'] + $item['earnings_unconfirmed'] - $item['refunds'], 2);

            foreach ($totals as $k => $v) {
                $totals[$k] = round($v + $item[$k], 2);
            }

            $rows[] = $item;
        }

        return response()->json([
            'year'   => $year,
            'rows'   => $rows,
            'totals' => $totals,
        ]);
    }

    private function isAdmin($user): bool
    {
        $role = $user->role ?? $user->Role ?? $user->user_type ?? null;
        return in_array(strtolower((string) $role), ['admin', 'administrator', 'superadmin'], true);
    }
}
