import { useEffect, useState } from "react";
import api from "../../axios";
import { useNavigate } from "react-router-dom";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings");
      setBookings(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  // EDIT
  const handleEdit = (booking) => {
    navigate(`/admin/bookings/${booking.Booking_ID}/edit`);
  };

  //  DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;

    try {
      await api.delete(`/bookings/${id}`);
      alert("Booking deleted successfully.");
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert("Failed to delete booking.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-14 h-14 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold text-green-800 mb-6">
        Booking Management
      </h1>

      <div className="overflow-x-auto bg-white rounded-xl shadow">

        <table className="min-w-full">

          <thead className="bg-green-700 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Booking ID</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Package</th>
              <th className="px-4 py-3 text-left">Booking Date</th>
              <th className="px-4 py-3 text-left">Pickup Time</th>
              <th className="px-4 py-3 text-left">Pickup Location</th>
              <th className="px-4 py-3 text-center">Adults</th>
              <th className="px-4 py-3 text-center">Children</th>
              <th className="px-4 py-3 text-right">Payment</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>

            {bookings.length === 0 ? (
              <tr>
                <td colSpan="11" className="text-center py-6 text-gray-500">
                  No bookings found.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.Booking_ID} className="border-b hover:bg-gray-50">

                  <td className="px-4 py-3">{booking.Booking_ID}</td>

                  <td className="px-4 py-3">
                    {booking.customer
                      ? `${booking.customer.First_Name} ${booking.customer.Last_Name}`
                      : "-"}
                  </td>

                  <td className="px-4 py-3">
                    {booking.package?.Package_Name || "-"}
                  </td>

                  <td className="px-4 py-3">{booking.Booking_Date}</td>
                  <td className="px-4 py-3">{booking.Pickup_Time}</td>
                  <td className="px-4 py-3">{booking.Pickup_Location}</td>
                  <td className="px-4 py-3 text-center">{booking.No_of_adults}</td>
                  <td className="px-4 py-3 text-center">{booking.No_of_child}</td>
                  <td className="px-4 py-3 text-right">Rs. {booking.Payment}</td>

                  <td className="px-4 py-3 text-center">
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold">
                      {booking.Status}
                    </span>
                  </td>

                  {/*  ACTIONS */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleEdit(booking)}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(booking.Booking_ID)}
                      className="text-red-600 dark:text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}
