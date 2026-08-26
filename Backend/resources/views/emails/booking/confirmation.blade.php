<x-mail::message>
@if($isAdminCopy)
# New Booking Received! (Admin Notification)
@else
# Booking Confirmed!
@endif

@if($isAdminCopy)
A new booking has been confirmed for **{{ $payment->customer->First_Name ?? 'Guest' }} {{ $payment->customer->Last_Name ?? '' }}**.
@else
Hello **{{ $payment->customer->First_Name ?? 'Guest' }}**,

Thank you for choosing RapidX! Your payment was successful, and your booking is now confirmed.
@endif

**Order ID:** {{ $payment->order_id }}  
**Payment ID:** {{ $payment->payhere_payment_id }}  
**Total Paid:** Rs. {{ number_format($payment->amount, 2) }}

## Booking Details

<x-mail::table>
| Package       | Date          | Time     | Location      | Adults | Children |
|:--------------|:--------------|:---------|:--------------|:-------|:---------|
@foreach($payment->bookings as $booking)
| {{ $booking->package->Package_Name ?? 'Custom' }} | {{ \Carbon\Carbon::parse($booking->Booking_Date)->format('M d, Y') }} | {{ $booking->Pickup_Time }} | {{ $booking->Pickup_Location }} | {{ $booking->No_of_adults }} | {{ $booking->No_of_child }} |
@endforeach
</x-mail::table>

@if(!$isAdminCopy)
If you need to make any changes or cancel your booking, you can do so through your dashboard (if you are a registered user).
@endif

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
