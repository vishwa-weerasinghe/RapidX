import { useEffect, useState } from "react";
import api from "../../axios";
import { useNavigate } from "react-router-dom";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsResponse, vehiclesResponse] = await Promise.all([
        api.get("/bookings"),
        api.get("/vehicles"),
      ]);

      setBookings(bookingsResponse.data);
      setVehicles(vehiclesResponse.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleChange = async (bookingId, vehicleId) => {
    try {
      await api.put(`/bookings/${bookingId}`, {
        Vehicle_ID: vehicleId || null,
      });

      await fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update vehicle assignment.");
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
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete booking.");
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const query = search.trim().toLowerCase();
    const customerName = `${booking.customer?.First_Name ?? ""} ${booking.customer?.Last_Name ?? ""}`;

    return (
      String(booking.Booking_ID ?? "").toLowerCase().includes(query) ||
      customerName.toLowerCase().includes(query) ||
      booking.package?.Package_Name?.toLowerCase().includes(query) ||
      booking.Booking_Date?.toLowerCase().includes(query) ||
      booking.Pickup_Time?.toLowerCase().includes(query) ||
      booking.Pickup_Location?.toLowerCase().includes(query) ||
      booking.Status?.toLowerCase().includes(query)
    );
  });

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

      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search ID, customer, package, date, location, or status..."
        aria-label="Search bookings"
        className="w-full max-w-xl mb-6 rounded-xl border border-green-200 px-4 py-3 outline-none focus:ring-2 focus:ring-green-600"
      />

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
              <th className="px-4 py-3 text-left">Vehicle</th>
              <th className="px-4 py-3 text-left">Driver</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>

            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="13" className="text-center py-6 text-gray-500">
                  {bookings.length === 0
                    ? "No bookings found."
                    : "No bookings match your search."}
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
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

                  <td className="px-4 py-3">
                    <select
                      value={booking.Vehicle_ID ?? ""}
                      onChange={(event) => handleVehicleChange(booking.Booking_ID, event.target.value)}
                      className="min-w-40 border border-gray-300 rounded px-2 py-1"
                      aria-label={`Vehicle for booking ${booking.Booking_ID}`}
                    >
                      <option value="">Not assigned</option>
                      {vehicles.map((vehicle) => (
                        <option key={vehicle.Vehicle_ID} value={vehicle.Vehicle_ID}>
                          {vehicle.Vehicle_No} ({vehicle.Vehicle_Type})
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-3">
                    {booking.vehicle?.driver?.Driver_Name || "—"}
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
