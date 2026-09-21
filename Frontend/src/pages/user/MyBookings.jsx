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
} from "lucide-react";
import api from "../../axios";

export default function MyBookings() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

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

  // Cancel booking
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setCancellingId(bookingId);

    try {
      const response = await api.patch(
        `/user/bookings/${bookingId}/cancel`
      );

      alert(
        `Booking cancelled. Applicable refund: ${response.data.refund_percentage}%.`
      );

      fetchBookings();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to cancel booking."
      );
    } finally {
      setCancellingId(null);
    }
  };

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
  const statusClass = (status) =>
    status?.toLowerCase() === "cancelled"
      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
      : "bg-sacramento/10 text-sacramento";

  // Loading
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-sacramento border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-sacramento">
          My Bookings
        </h1>

        <p className="mt-1 text-sm text-muted">
          View and manage your safari bookings
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by package, date, pickup location, or status..."
          aria-label="Search my bookings"
          className="form-input w-full max-w-xl"
        />
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
                        <p className="text-xs font-medium text-muted">
                          Total Payment
                        </p>

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
                          handleCancelBooking(booking.Booking_ID)
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
                        $ {booking.Payment}
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
                            handleCancelBooking(
                              booking.Booking_ID
                            )
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
        className="flex items-center gap-1 rounded-lg bg-sacramento px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-sacramento/90"
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
        className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <XCircle size={14} />

        {isCancelling
          ? "Cancelling..."
          : "Cancel"}
      </button>

    </div>
  );
}