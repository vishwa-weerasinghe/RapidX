import React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { CalendarDays, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBookings } from "../../context/BookingContext";
import { useTheme } from "../../context/ThemeContext";
import completedImg from "../../assets/completed.jpg";

export function CompletedSafari() {
  const { bookings, loading, error } = useBookings();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const isDark = theme === "dark";
  const cardClass = "card relative isolate w-full overflow-hidden";
  const overlayTint = isDark ? "bg-bg-dark/75" : "bg-offwhite/45";

  const pillClass = `inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium backdrop-blur-sm ${
    isDark
      ? "border-border-dark bg-surface/80 text-white"
      : "border-border-light bg-white/70 text-charcoal"
  }`;

  const panelClass = `rounded-2xl border p-4 backdrop-blur-sm ${
    isDark
      ? "border-border-dark bg-surface/80 text-white"
      : "border-border-light bg-white/70 text-charcoal"
  }`;

  const labelClass = isDark
    ? "text-[15px] font-medium text-white/90"
    : "text-[15px] font-medium text-charcoal";

  const pulseDot = isDark ? "bg-sacramento-300" : "bg-sacramento";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const completedBookings = bookings
    .filter((b) => b.Status === "Completed")
    .sort(
      (a, b) =>
        new Date(b.Booking_Date).getTime() -
        new Date(a.Booking_Date).getTime(),
    );

  if (loading) {
    return (
      <section className={`${cardClass} p-8 sm:p-12 flex flex-col items-center justify-center gap-3`}>
        <div className="w-10 h-10 rounded-full border-3 border-emerald-100 dark:border-emerald-950/40 border-t-sacramento dark:border-t-sacramento-300 animate-spin" />
        <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 animate-pulse">
          Loading your completed safaris...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`${cardClass} p-6 sm:p-10 lg:p-12`}>
        <p className={`text-lg font-medium ${labelClass}`}>
          Something went wrong — there are no completed safaris to display.
        </p>
      </section>
    );
  }

  if (completedBookings.length === 0) {
    return (
      <section className={`${cardClass} min-h-[380px] sm:min-h-[420px]`}>
        <div className="absolute inset-0 z-0 h-full w-full">
          <img
            src={completedImg}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-center"
          />
          <div className={`absolute inset-0 ${overlayTint}`} />
        </div>

        <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col gap-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`text-2xl sm:text-3xl lg:text-4xl font-serif leading-tight ${
              isDark ? "text-white" : "text-charcoal"
            }`}
          >
            Completed Safaris
          </motion.h1>

          <p className={`text-lg font-medium ${labelClass}`}>
            So far you have no completed safaris. If you want , you can share
            ideas about our service regarding your incart and pending bookings
          </p>

          <motion.button
            type="button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            onClick={() => navigate("/user/reviews")}
            className="btn-primary w-full sm:w-auto self-start rounded-xl px-6 py-3 text-sm font-semibold"
          >
            <Star size={16} className="shrink-0" />
            Write a review
          </motion.button>
        </div>
      </section>
    );
  }

  return (
    <section className={`${cardClass} min-h-[380px] sm:min-h-[420px]`}>
      <div className="absolute inset-0 z-0 h-full w-full">
        <img
          src={completedImg}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-center"
        />
        <div className={`absolute inset-0 ${overlayTint}`} />
      </div>

      <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={pillClass}>
            <span
              className={`w-2 h-2 rounded-full ${pulseDot} animate-pulse`}
            ></span>
            {completedBookings.length} Completed
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`text-2xl sm:text-3xl lg:text-4xl font-serif leading-tight ${
            isDark ? "text-white" : "text-charcoal"
          }`}
        >
          Completed Safaris
        </motion.h1>

        <p className={`text-lg font-medium ${labelClass}`}>
          Thank you for choosing us. Your safari tour is completed. Share
          your safari experience with others.
        </p>

        <div className="flex max-h-[400px] sm:max-h-[500px] flex-col gap-4 overflow-y-auto pr-1">
          {completedBookings.map((booking) => {
            const pkg = booking.package;
            const safariDate = booking.Booking_Date
              ? new Date(booking.Booking_Date)
              : null;
            const isValid = safariDate && !isNaN(safariDate.getTime());

            return (
              <div key={booking.Booking_ID} className={panelClass}>
                <div className="mb-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[16px] font-bold">
                      {pkg?.Package_Name || "Unknown Safari"}
                    </h4>
                    <span className="ml-2 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.5px] bg-sacramento/10 text-sacramento">
                      {booking.Status === "Completed"
                        ? "✓ Completed"
                        : "Past Safari"}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 text-sm">
                    <CalendarDays
                      size={14}
                      className={
                        isDark ? "text-sacramento-300" : "text-sacramento"
                      }
                    />
                    <span>
                      Safari Date:{" "}
                      {isValid
                        ? format(safariDate, "MMMM do, yyyy")
                        : booking.Booking_Date}
                    </span>
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={() => navigate("/user/reviews")}
                  className="btn-primary w-full rounded-xl px-3 py-2.5 text-[13px] font-semibold"
                >
                  <Star size={15} className="shrink-0" />
                  Write review
                </motion.button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}