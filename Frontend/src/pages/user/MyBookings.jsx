import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

  // Cancel a booking straight from the table (same flow as cancellation.jsx).
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    setCancellingId(bookingId);
    try {
      const response = await api.patch(`/user/bookings/${bookingId}/cancel`);
      alert(`Booking cancelled. Applicable refund: ${response.data.refund_percentage}%.`);
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel booking.");
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const query = search.trim().toLowerCase();

    return (
      booking.package?.Package_Name?.toLowerCase().includes(query) ||
      booking.Booking_Date?.toLowerCase().includes(query) ||
      booking.Pickup_Location?.toLowerCase().includes(query) ||
      booking.Status?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-14 h-14 border-4 border-sacramento border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold text-sacramento mb-6">
        My Bookings
      </h1>

      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by package, date, pickup location, or status..."
        aria-label="Search my bookings"
        className="form-input w-full max-w-xl mb-6"
      />

      <div className="overflow-x-auto rounded-xl card">
        <table className="w-full">

          <thead className="bg-sacramento text-white">

            <tr>
              <th className="p-3 text-left">Package</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Pickup</th>
              <th className="p-3 text-center">Adults</th>
              <th className="p-3 text-center">Children</th>
              <th className="p-3 text-right">Payment</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Action</th>
            </tr>

          </thead>

          <tbody>

            {filteredBookings.length === 0 && (
              <tr>
                <td colSpan="8" className="p-6 text-center text-muted">
                  {bookings.length === 0
                    ? "You do not have any bookings yet."
                    : "No bookings match your search."}
                </td>
              </tr>
            )}

            {filteredBookings.map((booking) => {
              const isCancelled = booking.Status?.toLowerCase() === "cancelled";

              return (
              <tr key={booking.Booking_ID} className="table-row">

                <td className="p-3 text-charcoal/80 dark:text-white/80">
                  {booking.package?.Package_Name}
                </td>

                <td className="p-3 text-charcoal/80 dark:text-white/80">
                  {booking.Booking_Date}
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
                  <span className={`rounded-full px-3 py-1 text-sm font-semibold ${isCancelled
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    : "bg-sacramento/10 text-sacramento"
                    }`}>
                    {booking.Status}
                  </span>
                </td>

                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      title="Reschedule this booking"
                      onClick={() => navigate(`/user/bookings/${booking.Booking_ID}/edit`)}
                      disabled={isCancelled}
                      className="rounded-lg bg-sacramento px-3 py-1.5 text-sm font-semibold text-white hover:bg-sacramento/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      title="Cancel this booking"
                      onClick={() => handleCancelBooking(booking.Booking_ID)}
                      disabled={isCancelled || cancellingId === booking.Booking_ID}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {cancellingId === booking.Booking_ID ? "Cancelling..." : "Cancel"}
                    </button>
                  </div>
                </td>

              </tr>
              );
            })}

          </tbody>

        </table>
      </div>

    </div>
  );
}
