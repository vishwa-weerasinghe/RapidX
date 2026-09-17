<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $isAdminCopy ? 'New Booking Received - Order #' . $payment->order_id : 'Safari Booking Confirmation - Order #' . $payment->order_id }}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f6f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #243329;">

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f3f6f4; padding: 30px 12px;">
        <tr>
            <td align="center">
                <!-- Email Main Wrapper -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 30, 15, 0.08); border: 1px solid #e1eade;">
                    
                    <!-- Branded Header -->
                    <tr>
                        <td align="center" style="background: linear-gradient(135deg, #153825 0%, #0d2418 100%); padding: 36px 30px 30px 30px; border-bottom: 3px solid #2e7d32;">
                            <div style="font-size: 11px; font-weight: 700; color: #86efac; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px;">
                                SRI LANKA WILDLIFE EXPEDITIONS
                            </div>
                            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; line-height: 1.3;">
                                MINNERIYA, KAUDULLA & WASGAMUWA
                            </h1>
                            <div style="font-size: 14px; font-weight: 600; color: #d1fae5; margin-top: 4px; letter-spacing: 1px;">
                                WILD JEEP SAFARI
                            </div>

                            <!-- Status Badge -->
                            <div style="margin-top: 20px;">
                                @if($isAdminCopy)
                                    <span style="display: inline-block; background-color: rgba(234, 179, 8, 0.2); border: 1px solid #eab308; color: #fef08a; padding: 6px 16px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                                        🔔 Admin Notification • New Booking
                                    </span>
                                @else
                                    <span style="display: inline-block; background-color: rgba(34, 197, 94, 0.2); border: 1px solid #22c55e; color: #86efac; padding: 6px 18px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                                        ✓ Booking Confirmed & Paid
                                    </span>
                                @endif
                            </div>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 36px 32px 28px 32px;">
                            @if($isAdminCopy)
                                <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #153825;">
                                    New Safari Reservation Received
                                </h2>
                                <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #4a5e51;">
                                    A new safari reservation has been successfully booked and paid online by <strong>{{ $payment->customer->First_Name ?? 'Guest' }} {{ $payment->customer->Last_Name ?? '' }}</strong>.
                                </p>
                            @else
                                <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #153825;">
                                    Ayubowan, {{ $payment->customer->First_Name ?? 'Valued Guest' }}! 🌿
                                </h2>
                                <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #4a5e51;">
                                    Thank you for booking your wildlife safari adventure with us! Your payment has been successfully processed, and your safari tour is now <strong>fully confirmed</strong>.
                                </p>
                            @endif

                            <!-- Key Details Highlight Grid -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px; background-color: #f7faf8; border: 1px solid #e1eade; border-radius: 12px; overflow: hidden;">
                                <tr>
                                    <td style="padding: 16px 20px; border-bottom: 1px solid #e1eade; width: 50%;">
                                        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #6b8273; letter-spacing: 0.5px;">Order ID</div>
                                        <div style="font-size: 15px; font-weight: 700; color: #153825; margin-top: 3px; font-family: monospace;">{{ $payment->order_id }}</div>
                                    </td>
                                    <td style="padding: 16px 20px; border-bottom: 1px solid #e1eade; width: 50%;">
                                        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #6b8273; letter-spacing: 0.5px;">Payment Reference</div>
                                        <div style="font-size: 15px; font-weight: 700; color: #153825; margin-top: 3px; font-family: monospace;">{{ $payment->payhere_payment_id ?? 'Approved' }}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 16px 20px; width: 50%;">
                                        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #6b8273; letter-spacing: 0.5px;">Total Amount Paid</div>
                                        <div style="font-size: 18px; font-weight: 800; color: #1e7e34; margin-top: 2px;">$ {{ number_format($payment->amount, 2) }}</div>
                                    </td>
                                    <td style="padding: 16px 20px; width: 50%;">
                                        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #6b8273; letter-spacing: 0.5px;">Payment Status</div>
                                        <div style="font-size: 14px; font-weight: 700; color: #15803d; margin-top: 3px;">
                                            ● Completed & Verified
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            @if($isAdminCopy && $payment->customer)
                                <!-- Customer Info Card (Admin Copy Only) -->
                                <div style="margin-bottom: 28px;">
                                    <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #153825;">
                                        Customer Contact Details
                                    </h3>
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f7faf8; border: 1px solid #e1eade; border-radius: 10px; font-size: 14px;">
                                        <tr>
                                            <td style="padding: 10px 16px; border-bottom: 1px solid #e1eade; font-weight: 600; color: #5a6e60; width: 130px;">Name:</td>
                                            <td style="padding: 10px 16px; border-bottom: 1px solid #e1eade; color: #153825; font-weight: 700;">{{ $payment->customer->First_Name ?? '' }} {{ $payment->customer->Last_Name ?? '' }}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px 16px; border-bottom: 1px solid #e1eade; font-weight: 600; color: #5a6e60;">Email:</td>
                                            <td style="padding: 10px 16px; border-bottom: 1px solid #e1eade; color: #153825;"><a href="mailto:{{ $payment->customer->Email }}" style="color: #1e7e34; text-decoration: none; font-weight: 600;">{{ $payment->customer->Email }}</a></td>
                                        </tr>
                                        @if(!empty($payment->customer->Phone_No))
                                        <tr>
                                            <td style="padding: 10px 16px; border-bottom: 1px solid #e1eade; font-weight: 600; color: #5a6e60;">Phone / WhatsApp:</td>
                                            <td style="padding: 10px 16px; border-bottom: 1px solid #e1eade; color: #153825;"><a href="tel:{{ $payment->customer->Phone_No }}" style="color: #153825; text-decoration: none; font-weight: 600;">{{ $payment->customer->Phone_No }}</a></td>
                                        </tr>
                                        @endif
                                        @if(!empty($payment->customer->NIC))
                                        <tr>
                                            <td style="padding: 10px 16px; font-weight: 600; color: #5a6e60;">Passport / NIC:</td>
                                            <td style="padding: 10px 16px; color: #153825;">{{ $payment->customer->NIC }}</td>
                                        </tr>
                                        @endif
                                    </table>
                                </div>
                            @endif

                            <!-- Safari Itinerary Table -->
                            <h3 style="margin: 0 0 12px 0; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #153825;">
                                Safari Tour Itinerary
                            </h3>

                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-bottom: 28px; border: 1px solid #e1eade; border-radius: 12px; overflow: hidden;">
                                <thead>
                                    <tr style="background-color: #153825; color: #ffffff;">
                                        <th align="left" style="padding: 12px 14px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Package</th>
                                        <th align="left" style="padding: 12px 14px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Date & Time</th>
                                        <th align="left" style="padding: 12px 14px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Pickup Point</th>
                                        <th align="center" style="padding: 12px 14px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Guests</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($payment->bookings as $index => $booking)
                                    <tr style="background-color: {{ $index % 2 === 0 ? '#ffffff' : '#f7faf8' }}; border-bottom: 1px solid #e1eade;">
                                        <td style="padding: 14px; font-size: 14px; font-weight: 700; color: #153825;">
                                            🐘 {{ $booking->package->Package_Name ?? 'Wild Safari Tour' }}
                                        </td>
                                        <td style="padding: 14px; font-size: 13px; color: #374151;">
                                            <div style="font-weight: 600; color: #153825;">
                                                {{ \Carbon\Carbon::parse($booking->Booking_Date)->format('M d, Y') }}
                                            </div>
                                            <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">
                                                🕒 {{ \Carbon\Carbon::parse($booking->Pickup_Time)->format('h:i A') }}
                                            </div>
                                        </td>
                                        <td style="padding: 14px; font-size: 13px; color: #374151;">
                                            📍 {{ $booking->Pickup_Location }}
                                        </td>
                                        <td align="center" style="padding: 14px; font-size: 13px; color: #153825; font-weight: 600;">
                                            <div>{{ $booking->No_of_adults }} Adult(s)</div>
                                            @if($booking->No_of_child > 0)
                                                <div style="font-size: 12px; color: #6b7280;">{{ $booking->No_of_child }} Child</div>
                                            @endif
                                        </td>
                                    </tr>
                                    @endforeach
                                </tbody>
                            </table>

                            @if(!$isAdminCopy)
                                <!-- Important Safari Tips (Customer Copy Only) -->
                                <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 8px; padding: 16px 20px; margin-bottom: 28px;">
                                    <div style="font-size: 14px; font-weight: 700; color: #15803d; margin-bottom: 6px;">
                                        📌 Important Reminders for Your Safari:
                                    </div>
                                    <ul style="margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.6; color: #374151;">
                                        <li>Please be ready at your pickup location <strong>15 minutes prior</strong> to scheduled departure.</li>
                                        <li>Bring comfortable clothing, hats, sunscreen, and your cameras or binoculars.</li>
                                        <li>National Park entrance fees and professional safari jeep driver are fully included.</li>
                                    </ul>
                                </div>
                            @endif

                            <!-- Sign-off -->
                            <p style="margin: 0 0 4px 0; font-size: 15px; color: #4a5e51;">
                                Warm regards,
                            </p>
                            <p style="margin: 0; font-size: 16px; font-weight: 800; color: #153825;">
                                The Wild Jeep Safari Team
                            </p>
                            <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b8273;">
                                Minneriya, Kaudulla & Wasgamuwa National Parks, Sri Lanka
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background-color: #f7faf8; padding: 24px 30px; border-top: 1px solid #e1eade; font-size: 12px; color: #6b8273; line-height: 1.6;">
                            <div style="margin-bottom: 10px;">
                                <strong>Need assistance or change your pickup point?</strong><br>
                                Contact us via WhatsApp / Call: <a href="tel:+94778902811" style="color: #1e7e34; font-weight: 700; text-decoration: none;">+94 77 8902811</a> 
                                &nbsp;•&nbsp; 
                                Email: <a href="mailto:info@minneriyawildjeepsafari.com" style="color: #1e7e34; font-weight: 700; text-decoration: none;">info@minneriyawildjeepsafari.com</a>
                            </div>
                            <div style="color: #9ca3af; font-size: 11px;">
                                © {{ date('Y') }} Minneriya, Kaudulla & Wasgamuwa Wild Jeep Safari. All rights reserved.
                            </div>
                        </td>
                    </tr>

                </table>
                <!-- End Main Wrapper -->
            </td>
        </tr>
    </table>

</body>
</html>
