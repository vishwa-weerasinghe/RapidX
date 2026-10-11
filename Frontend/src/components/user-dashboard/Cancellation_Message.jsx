import React from "react";
import { Ban, CalendarDays, Clock, MapPin } from "lucide-react";
import { useBookings } from "../../context/BookingContext";
import { useTheme } from "../../context/ThemeContext";

function getRefundPercentage(bookingDate) {
  if (!bookingDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tourDate = new Date(bookingDate);
  if (Number.isNaN(tourDate.getTime())) return 0;
  tourDate.setHours(0, 0, 0, 0);
  const daysBeforeTour = Math.round((tourDate - today) / (1000 * 60 * 60 * 24));
  if (daysBeforeTour > 7) return 100;
  if (daysBeforeTour >= 3) return 50;
  return 0;
}

// The percentage that was actually applied when the booking was cancelled.
//
// The backend stores it as Refund_Percentage, so that is the source of truth:
// an admin may override the policy tier (25%, or a withheld 0%), and a booking
// that was never paid is always 0 regardless of its date. Recomputing it here
// from Booking_Date would show a different number than the one really refunded.
//
// The policy calculation is only a fallback for records cancelled before the
// column existed, where nothing was stored.
function getAppliedRefundPercentage(booking) {
  const stored = booking?.Refund_Percentage;

  if (stored !== null && stored !== undefined && stored !== "") {
    return Number(stored) || 0;
  }

  return getRefundPercentage(booking?.Booking_Date);
}

export function CancellationMessage() {
  const { bookings, loading } = useBookings();
  const { theme } = useTheme();

  const cancelledBookings = bookings.filter(
    (b) => b.Status === "Cancelled",
  );

  const isDark = theme === "dark";

  const cardClass = "card p-4 sm:p-6";
  const iconBoxClass = isDark
    ? "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sacramento-400 to-sacramento-300 text-white"
    : "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sacramento to-sacramento-600 text-white";
  const titleClass = isDark
    ? "text-xl font-semibold text-white font-serif"
    : "text-xl font-semibold text-charcoal font-serif";
  const counterClass = isDark
    ? "flex h-8 w-8 items-center justify-center rounded-full bg-border-dark text-sm font-bold text-white"
    : "flex h-8 w-8 items-center justify-center rounded-full bg-border-light text-sm font-bold text-sacramento";
  const mutedTextClass = isDark ? "text-gray-400" : "text-muted";
  const fieldTextClass = isDark ? "text-white" : "text-charcoal";
  const borderLineClass = isDark ? "border-border-dark" : "border-border-light";
  const itemClass = isDark
    ? "rounded-2xl border border-border-dark bg-surface p-3 sm:p-4"
    : "rounded-2xl border border-border-light bg-surface-2 p-3 sm:p-4";
  const cancelledBadgeClass = isDark
    ? "bg-red-500/10 text-red-400"
    : "bg-red-100 text-red-600";
  const highlightTextClass = isDark ? "text-sacramento-300" : "text-sacramento-600";

  const header = (
    <div className="mb-5 flex items-center gap-2.5">
      <div className={iconBoxClass}><Ban size={18} /></div>
      <h2 className={titleClass}>Booking Cancellation</h2>
      <div className={counterClass}>{cancelledBookings.length}</div>
    </div>
  );

  // Hide the whole card while the bookings are loading
  if (loading) {
    return null;
  }

  // No cancelled bookings — show the card with an empty-state message
  if (cancelledBookings.length === 0) {
    return (
      <div className={cardClass}>
        {header}
        <p className={`px-4 py-6 text-center text-[15px] font-medium ${mutedTextClass}`}>
          You have no cancelled bookings
        </p>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      {header}

      <div className="flex max-h-[400px] sm:max-h-[500px] flex-col gap-4 overflow-y-auto">
        {cancelledBookings.map((booking) => {
          const pkg = booking.package;
          const refundPercentage = getAppliedRefundPercentage(booking);
          const refundAmount = (Number(booking.Payment || 0) * refundPercentage) / 100;

          // Bookings cancelled by the staff carry a Customer_Message set by the
          // admin cancel endpoint; customer-initiated cancellations leave it null.
          const isStaffCancelled = Boolean(booking.Customer_Message);

          return (
            <div key={booking.Booking_ID} className={itemClass}>
              <div className="mb-3 flex items-start justify-between">
                <h4 className={`text-[16px] font-bold ${isDark ? "text-white" : "text-charcoal"}`}>{pkg?.Package_Name || "Unknown Safari"}</h4>
                <span className={`ml-2 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.5px] ${cancelledBadgeClass}`}>
                  ✕ Cancelled
                </span>
              </div>

              <div className={`mb-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm ${fieldTextClass}`}>
                <div className="flex items-center gap-1.5">
                  <CalendarDays size={14} className={isDark ? "text-sacramento-300" : "text-sacramento"} />
                  <span>{booking.Booking_Date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className={isDark ? "text-sacramento-300" : "text-sacramento"} />
                  <span>{booking.Pickup_Time}</span>
                </div>
                <div className="col-span-2 flex items-center gap-1.5">
                  <MapPin size={14} className={isDark ? "text-sacramento-300" : "text-sacramento"} />
                  <span className="truncate">{booking.Pickup_Location}</span>
                </div>
              </div>

              {isStaffCancelled ? (
                <>
                  <p className={`mb-2 text-sm leading-6 ${mutedTextClass}`}>
                    Sorry your booking is not accepted by the staff. Try again. Thank you for choosing us.
                  </p>

                  <p className={`mb-2 text-sm leading-6 ${mutedTextClass}`}>
                    Refund policy: an applicable refund of{" "}
                    <span className={`font-semibold ${highlightTextClass}`}>{refundPercentage}%</span>{" "}
                    will be issued to your original payment method within 7–14 business days.
                  </p>

                  <p className={`mb-3 text-sm leading-6 ${mutedTextClass}`}>
                    Refund is applied only for already paid bookings.
                  </p>
                </>
              ) : (
                <p className={`mb-3 text-sm leading-6 ${mutedTextClass}`}>
                  Your safari booking has been cancelled. An applicable refund of{" "}
                  <span className={`font-semibold ${highlightTextClass}`}>{refundPercentage}%</span>{" "}
                  will be issued to your original payment method within 7–14 business days.
                </p>
              )}

              <div className={`flex items-center justify-between border-t pt-3 ${borderLineClass}`}>
                <div className={`flex items-center gap-1.5 text-sm ${mutedTextClass}`}>
                  <Ban size={14} className={isDark ? "text-sacramento-300" : "text-sacramento"} />
                  <span>Booking #{booking.Booking_ID}</span>
                </div>
                <div className="text-right">
                  <span className={`block text-[11px] ${mutedTextClass}`}>Refund Amount</span>
                  <span className={`text-[16px] font-bold ${highlightTextClass}`}>$ {refundAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}