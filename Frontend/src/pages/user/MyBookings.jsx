import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Navigation,
  Users,
  Baby,
  CreditCard,
  Pencil,
  XCircle,
  Search,
  Clock,
  CheckCircle2,
} from "lucide-react";
import api from "../../axios";
import {
  useCancellation,
  CancellationModal,
} from "./cancellation.jsx";

export default function MyBookings() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get(`/user-bookings/${user.Customer_ID}`);
      setBookings(res.data);
    } catch (err) {
      console.log(err);
      alert("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  // The cancellation flow (policy modal state, agreement checkbox and the
  // cancel API call) lives in cancellation.jsx.
  const {
    cancelTarget,
    cancellingId,
    policyAgreed,
    setPolicyAgreed,
    openCancelPolicy,
    closeCancelPolicy,
    handleCancelBooking,
  } = useCancellation(fetchBookings);

  // Booking statuses that can still be edited by the customer
  const isEditableStatus = (status) =>
    ["pending", "incart"].includes(
      String(status || "").toLowerCase().replace(/\s+/g, "")
    );

  // Only open the edit form for bookings that can still be modified
  const handleClickEdit = (booking) => {
    if (!isEditableStatus(booking.Status)) {
      alert("This booking cannot be modified.");
      return;
    }
    navigate(`/user/bookings/${booking.Booking_ID}/edit`);
  };

  // Search / filter
  const filteredBookings = bookings.filter((booking) => {
    const query = search.trim().toLowerCase();

    return (
      booking.package?.Package_Name?.toLowerCase().includes(query) ||
      booking.Booking_Date?.toLowerCase().includes(query) ||
      booking.Pickup_Location?.toLowerCase().includes(query) ||
      booking.Status?.toLowerCase().includes(query)
    );
  });

  // Status styling
  const statusClass = (status) => {
    const s = status?.toLowerCase();
    if (s === "cancelled") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    if (s === "pending") return "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
    if (s === "confirmed") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300";
    return "bg-sacramento/10 text-sacramento";
  };

  // Loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3 bg-slate-50/50 dark:bg-bg-dark">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-100 dark:border-emerald-950/40 border-t-sacramento dark:border-t-sacramento-300 animate-spin" />
        <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 animate-pulse">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-bg-dark py-6 sm:py-8 px-4 sm:px-6 lg:px-8 text-charcoal dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Modern Header Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-border-light dark:border-border-dark/60 bg-white dark:bg-[#16231c] p-6 sm:p-8 shadow-sm">
          <div className="absolute -top-14 -right-14 w-48 h-48 bg-sacramento/10 dark:bg-sacramento-900/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sacramento/10 dark:bg-sacramento-900/40 text-sacramento dark:text-sacramento-300 text-xs font-bold mb-2.5 border border-sacramento/20">
                <CalendarDays size={13} />
                <span>Customer Reservation History</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                My Safari Bookings
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Inspect reservation progress, view driver allocations, and review past trips.
              </p>
            </div>

          </div>
        </div>

        {/* Modern Search & Stats Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#16231c] p-3.5 sm:p-4 rounded-2xl border border-border-light dark:border-border-dark/60 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by tour, date, location, or status..."
              aria-label="Search my bookings"
              className="w-full pl-10 pr-9 py-2 rounded-xl text-sm bg-slate-50 dark:bg-surface-2 border border-slate-200/80 dark:border-border-dark text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sacramento/30"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <XCircle size={15} />
              </button>
            )}
          </div>

          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {filteredBookings.length} of {bookings.length} reservations
          </div>
        </div>

      {/* No Results */}
      {filteredBookings.length === 0 ? (
        <div className="card rounded-2xl p-8 text-center text-muted">
          {bookings.length === 0
            ? "You do not have any bookings yet."
            : "No bookings match your search."}
        </div>
      ) : (
        <>
          {/* =====================================================
              MOBILE CARD VIEW
              ===================================================== */}
          <div className="space-y-5 md:hidden">
            {filteredBookings.map((booking) => {
              const isCancelled =
                booking.Status?.toLowerCase() === "cancelled";

              return (
                <article
                  key={booking.Booking_ID}
                  className="group relative overflow-hidden rounded-2xl border border-border-light bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-border-dark dark:bg-slate-900"
                >
                  {/* Top Accent */}
                  <div className="h-1.5 bg-sacramento" />

                  <div className="p-5">

                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">
                        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.15em] text-muted">
                          Safari Package
                        </p>

                        <h2 className="truncate text-xl font-bold text-charcoal dark:text-white">
                          {booking.package?.Package_Name ||
                            "Safari Booking"}
                        </h2>

                      </div>

                      {/* Status */}
                      <span
                        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusClass(
                          booking.Status
                        )}`}
                      >
                        {booking.Status}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="my-5 border-t border-border-light dark:border-border-dark" />

                    {/* Date, Area & Pickup */}
                    <div className="grid grid-cols-2 gap-3">

                      {/* Date */}
                      <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                        <div className="flex items-center gap-2">
                          <CalendarDays
                            size={16}
                            className="text-sacramento"
                          />

                          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                            Date
                          </p>
                        </div>

                        <p className="mt-2 text-sm font-bold text-charcoal dark:text-white">
                          {booking.Booking_Date || "—"}
                        </p>
                      </div>

                      {/* Area */}
                      <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                        <div className="flex items-center gap-2">
                          <Navigation
                            size={16}
                            className="text-sacramento"
                          />

                          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                            Area
                          </p>
                        </div>

                        <p className="mt-2 text-sm font-bold text-charcoal dark:text-white">
                          {booking.Area || "—"}
                        </p>
                      </div>

                      {/* Pickup */}
                      <div className="col-span-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                        <div className="flex items-center gap-2">
                          <MapPin
                            size={16}
                            className="text-sacramento"
                          />

                          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                            Pickup
                          </p>
                        </div>

                        <p
                          className="mt-2 truncate text-sm font-bold text-charcoal dark:text-white"
                          title={booking.Pickup_Location}
                        >
                          {booking.Pickup_Location || "—"}
                        </p>
                      </div>

                    </div>

                    {/* Guests */}
                    <div className="mt-3 grid grid-cols-2 gap-3">

                      {/* Adults */}
                      <div className="flex items-center gap-3 rounded-xl border border-border-light p-3 dark:border-border-dark">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sacramento/10 text-sacramento">
                          <Users size={18} />
                        </div>

                        <div>
                          <p className="text-[11px] text-muted">
                            Adults
                          </p>

                          <p className="text-base font-bold text-charcoal dark:text-white">
                            {booking.No_of_adults || 0}
                          </p>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="flex items-center gap-3 rounded-xl border border-border-light p-3 dark:border-border-dark">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sacramento/10 text-sacramento">
                          <Baby size={18} />
                        </div>

                        <div>
                          <p className="text-[11px] text-muted">
                            Children
                          </p>

                          <p className="text-base font-bold text-charcoal dark:text-white">
                            {booking.No_of_child || 0}
                          </p>
                        </div>
                      </div>

                    </div>

                    {/* Payment */}
                    <div className="mt-4 flex items-center justify-between rounded-xl bg-sacramento/10 px-4 py-3">

                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-medium text-muted">
                            Total Payment
                          </p>
                          {booking.payment?.payment_method === "Pay Later" && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-200/70 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                              Pay Later
                            </span>
                          )}
                        </div>

                        <p className="mt-0.5 text-xl font-extrabold text-sacramento">
                          $ {booking.Payment || "0.00"}
                        </p>
                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sacramento text-white">
                        <CreditCard size={19} />
                      </div>

                    </div>

                    {/* Actions */}
                    <div className="mt-5 grid grid-cols-2 gap-3">

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => handleClickEdit(booking)}
                        className="flex items-center justify-center gap-2 rounded-xl border border-sacramento px-4 py-2.5 text-sm font-bold text-sacramento transition-all duration-200 hover:bg-sacramento hover:text-white"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      {/* Cancel */}
                      <button
                        type="button"
                        onClick={() =>
                          openCancelPolicy(booking)
                        }
                        disabled={
                          isCancelled ||
                          cancellingId === booking.Booking_ID
                        }
                        className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <XCircle size={16} />

                        {cancellingId === booking.Booking_ID
                          ? "Cancelling..."
                          : "Cancel"}
                      </button>

                    </div>

                  </div>
                </article>
              );
            })}
          </div>

          {/* =====================================================
              TABLET + DESKTOP VIEW
              ===================================================== */}
          <div className="hidden overflow-x-auto rounded-xl card md:block">
            <table className="w-full">

              <thead className="bg-sacramento text-white">
                <tr>
                  <th className="p-3 text-left">
                    Booking ID
                  </th>

                  <th className="p-3 text-left">
                    Package
                  </th>

                  <th className="p-3 text-left">
                    Date
                  </th>

                  <th className="p-3 text-left">
                    Pickup Area
                  </th>

                  <th className="p-3 text-left">
                    Pickup
                  </th>

                  <th className="p-3 text-center">
                    Adults
                  </th>

                  <th className="p-3 text-center">
                    Children
                  </th>

                  <th className="p-3 text-right">
                    Payment
                  </th>

                  <th className="p-3 text-center">
                    Status
                  </th>

                  <th className="p-3 text-center">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredBookings.map((booking) => {
                  const isCancelled =
                    booking.Status?.toLowerCase() === "cancelled";

                  return (
                    <tr
                      key={booking.Booking_ID}
                      className="table-row"
                    >

                      <td className="p-3 font-semibold text-charcoal/80 dark:text-white/80">
                        #{booking.Booking_ID}
                      </td>

                      <td className="p-3 text-charcoal/80 dark:text-white/80">
                        {booking.package?.Package_Name}
                      </td>

                      <td className="p-3 text-charcoal/80 dark:text-white/80">
                        {booking.Booking_Date}
                      </td>

                      <td className="p-3 text-charcoal/80 dark:text-white/80">
                        {booking.Area || "—"}
                      </td>

                      <td className="p-3 text-charcoal/80 dark:text-white/80">
                        {booking.Pickup_Location}
                      </td>

                      <td className="p-3 text-center text-charcoal/80 dark:text-white/80">
                        {booking.No_of_adults}
                      </td>

                      <td className="p-3 text-center text-charcoal/80 dark:text-white/80">
                        {booking.No_of_child}
                      </td>

                      <td className="p-3 text-right text-charcoal dark:text-white">
                        <div className="font-bold">$ {booking.Payment}</div>
                        {booking.payment?.payment_method === "Pay Later" ? (
                          <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300">
                            Pay Later
                          </span>
                        ) : (
                          <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300">
                            {booking.payment?.payment_method || "Paid"}
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-center">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${statusClass(
                            booking.Status
                          )}`}
                        >
                          {booking.Status}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <BookingActions
                          bookingId={booking.Booking_ID}
                          isCancelled={isCancelled}
                          isCancelling={
                            cancellingId === booking.Booking_ID
                          }
                          onEdit={() => handleClickEdit(booking)}
                          onCancel={() =>
                            openCancelPolicy(booking)
                          }
                        />
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        </>
      )}

      {/* =====================================================
          CANCELLATION POLICY MODAL
          Shown when the customer clicks "Cancel". The booking
          can only be cancelled after ticking the agreement box.
          The modal itself lives in cancellation.jsx.
          ===================================================== */}
      <CancellationModal
        booking={cancelTarget}
        cancellingId={cancellingId}
        policyAgreed={policyAgreed}
        onPolicyAgreedChange={setPolicyAgreed}
        onClose={closeCancelPolicy}
        onConfirm={handleCancelBooking}
      />
      </div>
    </div>
  );
}

/* =====================================================
   Desktop / Tablet Actions
   ===================================================== */

function BookingActions({
  bookingId,
  isCancelled,
  isCancelling,
  onEdit,
  onCancel,
}) {
  return (
    <div className="flex items-center justify-end gap-2">

      {/* Edit */}
      <button
        type="button"
        title="Reschedule this booking"
        onClick={onEdit}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-surface-2 hover:bg-sacramento hover:text-white dark:hover:bg-sacramento dark:hover:text-white border border-slate-200/80 dark:border-border-dark transition-all active:scale-95"
      >
        <Pencil size={14} />
        Edit
      </button>

      {/* Cancel */}
      <button
        type="button"
        title="Cancel this booking"
        onClick={onCancel}
        disabled={isCancelled || isCancelling}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 dark:hover:text-white border border-amber-200/80 dark:border-amber-800/40 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <XCircle size={14} />

        {isCancelling
          ? "Cancelling..."
          : "Cancel"}
      </button>

    </div>
  );
}