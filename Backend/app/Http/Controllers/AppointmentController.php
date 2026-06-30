<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AppointmentController extends Controller
{

    /**
     * Return booking appointments with customer details and assigned driver.
     */
    public function index()
    {
        // NOTE:
        // - bookings has Customer_ID, Vehicle_ID
        // - vehicles has Driver_ID
        // - drivers has Driver_Name, Phone_Number
        // - customers has First_Name, Last_Name, Phone_No, Email
        $rows = DB::table('bookings as b')
            ->join('customers as c', 'c.Customer_ID', '=', 'b.Customer_ID')
            ->join('vehicles as v', 'v.Vehicle_ID', '=', 'b.Vehicle_ID')
            ->join('drivers as d', 'd.Driver_ID', '=', 'v.Driver_ID')
            ->select([
                'b.Booking_ID',
                'b.Booking_Date',
                'b.Pickup_Time',
                'b.Pickup_Location',
                'b.Payment',
                'c.Customer_Type',
                'c.First_Name',
                'c.Last_Name',
                'c.Phone_No',
                'c.Email',
                'd.Driver_Name',
                'd.Phone_Number as Driver_Phone_Number',
            ])
            ->orderBy('b.Booking_Date')
            ->get();

        return response()->json($rows);
    }
}

