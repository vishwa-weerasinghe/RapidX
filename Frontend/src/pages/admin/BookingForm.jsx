import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../axios";

export default function BookingForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);

  const [form, setForm] = useState({
    Booking_Date: "",
    Pickup_Time: "",
    Pickup_Location: "",
    No_of_adults: 1,
    No_of_child: 0,
    Payment: 0,
    Status: "Pending",
    Vehicle_ID: "",
  });

  useEffect(() => {
    fetchBooking();
    fetchVehicles();
  }, []);

  // Load booking
  const fetchBooking = async () => {
    try {
      const res = await api.get(`/bookings/${id}`);
      const data = res.data;

      setForm({
        Booking_Date: data.Booking_Date || "",
        Pickup_Time: data.Pickup_Time || "",
        Pickup_Location: data.Pickup_Location || "",
        No_of_adults: data.No_of_adults || 1,
        No_of_child: data.No_of_child || 0,
        Payment: data.Payment || 0,
        Status: data.Status || "Pending",
        Vehicle_ID: data.Vehicle_ID || "",
      });
    } catch (err) {
      console.log(err);
      alert("Failed to load booking");
    } finally {
      setLoading(false);
    }
  };

  // Load vehicles
  const fetchVehicles = async () => {
    try {
      const res = await api.get("/vehicles");
      setVehicles(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/bookings/${id}`, form);

      alert("Booking updated successfully");
      navigate("/admin/bookings");
    } catch (err) {
      console.log(err);
      alert(
        err.response?.data?.message ||
        "Failed to update booking"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow mt-6">

      <h2 className="text-2xl font-bold text-green-800 mb-6">
        Edit Booking
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Date */}
        <div>
          <label className="font-semibold">Booking Date</label>
          <input
            type="date"
            name="Booking_Date"
            value={form.Booking_Date}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Time */}
        <div>
          <label className="font-semibold">Pickup Time</label>
          <input
            type="time"
            name="Pickup_Time"
            value={form.Pickup_Time}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Location */}
        <div>
          <label className="font-semibold">Pickup Location</label>
          <input
            type="text"
            name="Pickup_Location"
            value={form.Pickup_Location}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Adults & Children */}
        <div className="grid grid-cols-2 gap-4">

          <div>
            <label className="font-semibold">Adults</label>
            <input
              type="number"
              name="No_of_adults"
              value={form.No_of_adults}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="font-semibold">Children</label>
            <input
              type="number"
              name="No_of_child"
              value={form.No_of_child}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

        </div>

        {/* Payment */}
        <div>
          <label className="font-semibold">Payment</label>
          <input
            type="number"
            name="Payment"
            value={form.Payment}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Status */}
        <div>
          <label className="font-semibold">Status</label>
          <select
            name="Status"
            value={form.Status}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Vehicle */}
        <div>
          <label className="font-semibold">Vehicle</label>
          <select
            name="Vehicle_ID"
            value={form.Vehicle_ID}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">-- Select Vehicle --</option>
            {vehicles.map((v) => (
              <option key={v.Vehicle_ID} value={v.Vehicle_ID}>
                {v.Vehicle_Name || `Vehicle ${v.Vehicle_ID}`}
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800"
        >
          Update Booking
        </button>

      </form>
    </div>
  );
}