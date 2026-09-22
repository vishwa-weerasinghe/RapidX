import React from "react";
import { CalendarDays, MapPin, Clock, Users, Baby, Truck } from "lucide-react";
import { useBookings } from "../../context/BookingContext";
import { useTheme } from "../../context/ThemeContext";

export function BookingCard() {
  const { bookings, loading, error } = useBookings();
  const { theme } = useTheme();

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
  const confirmedBadgeClass = isDark
    ? "bg-sacramento text-white"
    : "bg-sacramento/10 text-sacramento";
  // Confirmed (not yet past) sorted soonest-first
  const upcomingBookings = bookings
    .filter((b) => b.Status === "Confirmed")
    .sort((a, b) => new Date(a.Booking_Date).getTime() - new Date(b.Booking_Date).getTime());

  if (loading) {
    return (
      <div className={cardClass}>
        <div className="mb-5 flex items-center gap-2.5">
          <div className={iconBoxClass}><CalendarDays size={18} /></div>
          <h2 className={titleClass}>My Safari Bookings</h2>
        </div>
        <p className={`py-4 text-center text-sm ${mutedTextClass}`}>
          <span className="mr-2 inline-block h-5 w-5 align-middle rounded-full border-[3px] border-sacramento border-t-transparent animate-spin"></span>
          Loading your adventures...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cardClass}>
        <div className="mb-5 flex items-center gap-2.5">
          <div className={iconBoxClass}><CalendarDays size={18} /></div>
          <h2 className={titleClass}>My Safari Bookings</h2>
        </div>
        <p className="text-center text-sm text-red-600">{error}</p>
      </div>
    );
  }

    return (
    <div className={cardClass}>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={iconBoxClass}><CalendarDays size={18} /></div>
            <h2 className={titleClass}>My Safari Bookings</h2>
          </div>
          <div className={counterClass}>{upcomingBookings.length}</div>
        </div>

        {upcomingBookings.length === 0 ? (
        <div className="px-4 py-6 sm:py-8 text-center">
          <div className="mb-3 text-5xl">🦁</div>
          <p className={`text-[15px] font-medium ${mutedTextClass}`}>No safari adventures booked yet!</p>
          <p className={`mt-1 text-sm ${mutedTextClass}`}>Explore our packages and start your journey.</p>
        </div>
      ) : (
        <>
          {/* Upcoming bookings list */}
          <div className="flex max-h-[400px] sm:max-h-[500px] flex-col gap-4 overflow-y-auto">
            {upcomingBookings.map((booking) => {
                const pkg = booking.package;
                return (
                  <div key={booking.Booking_ID} className={isDark ? "rounded-2xl border border-border-dark bg-surface p-3 sm:p-4" : "rounded-2xl border border-border-light bg-surface-2 p-3 sm:p-4"}>
                    <div className="mb-3 flex items-start justify-between">
                      <h4 className={`text-[16px] font-bold ${isDark ? "text-white" : "text-charcoal"}`}>{pkg?.Package_Name || "Unknown Safari"}</h4>
                      <span className={`ml-2 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.5px] ${confirmedBadgeClass}`}>
                        ● Confirmed
                      </span>
                    </div>

                    <div className={`mb-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm ${fieldTextClass}`}>
                      <DateField Icon={CalendarDays} value={booking.Booking_Date} dark={isDark} />
                      <DateField Icon={Clock} value={booking.Pickup_Time} dark={isDark} />
                      <div className="col-span-2 flex items-center gap-1.5">
                        <MapPin size={14} className={isDark ? "text-sacramento-300" : "text-sacramento"} />
                        <span className="truncate">{booking.Pickup_Location}</span>
                      </div>
                      <DateField Icon={Users} value={`${booking.No_of_adults} ${booking.No_of_adults === 1 ? "Adult" : "Adults"}`} dark={isDark} />
                      <DateField Icon={Baby} value={`${booking.No_of_child} ${booking.No_of_child === 1 ? "Child" : "Children"}`} dark={isDark} />
                    </div>

                    <div className={`flex items-center justify-between border-t pt-3 ${borderLineClass}`}>
                      <div className={`flex items-center gap-1.5 text-sm ${mutedTextClass}`}>
                        <Truck size={14} className={isDark ? "text-sacramento-300" : "text-sacramento"} />
                        <span>{booking.vehicle ? booking.vehicle.Registration_No || "Assigned" : "Awaiting vehicle"}</span>
                      </div>
                      <div className="text-right">
                        <span className={`block text-[11px] ${mutedTextClass}`}>Total</span>
                        <span className={`text-[16px] font-bold ${isDark ? "text-sacramento-300" : "text-sacramento-600"}`}>$ {Number(booking.Payment || 0).toLocaleString()}</span>
                      </div>
                    </div>

                  </div>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
}

function DateField({ Icon, value, dark }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={14} className={dark ? "text-sacramento-300" : "text-sacramento"} />
      <span>{value}</span>
    </div>
  );
}