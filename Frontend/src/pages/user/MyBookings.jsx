import { useEffect, useState } from "react";
import api from "../../axios";

export default function MyBookings() {
  const user = JSON.parse(localStorage.getItem("user"));

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
        Loading...
      </div>
    );
  }

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold text-green-800 mb-6">
        My Bookings
      </h1>

      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by package, date, pickup location, or status..."
        aria-label="Search my bookings"
        className="w-full max-w-xl mb-6 rounded-xl border border-green-200 px-4 py-3 outline-none focus:ring-2 focus:ring-green-600"
      />

      <table className="w-full border">

        <thead className="bg-green-700 text-white">

          <tr>
            <th className="p-3">Package</th>
            <th className="p-3">Date</th>
            <th className="p-3">Pickup</th>
            <th className="p-3">Adults</th>
            <th className="p-3">Children</th>
            <th className="p-3">Payment</th>
            <th className="p-3">Status</th>
          </tr>

        </thead>

        <tbody>

          {filteredBookings.length === 0 && (
            <tr>
              <td colSpan="7" className="p-6 text-center text-gray-500">
                {bookings.length === 0
                  ? "You do not have any bookings yet."
                  : "No bookings match your search."}
              </td>
            </tr>
          )}

          {filteredBookings.map((booking) => (

            <tr key={booking.Booking_ID} className="border-b">

              <td className="p-3">
                {booking.package?.Package_Name}
              </td>

              <td className="p-3">
                {booking.Booking_Date}
              </td>

              <td className="p-3">
                {booking.Pickup_Location}
              </td>

              <td className="p-3">
                {booking.No_of_adults}
              </td>

              <td className="p-3">
                {booking.No_of_child}
              </td>

              <td className="p-3">
                Rs. {booking.Payment}
              </td>

              <td className="p-3">
                {booking.Status}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}
