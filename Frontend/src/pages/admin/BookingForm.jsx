import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../axios";
import { pickupTimeOptions, getPickupTimeOptions } from "../../constants/pickupTimeOptions";

export default function BookingForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [pkg, setPkg] = useState(null);
  const [form, setForm] = useState({
    Booking_Date: "",
    Pickup_Time: "13:00",
    Pickup_Location: "",
    No_of_adults: 1,
    No_of_child: 0,
    Payment: 0,
    Status: "Confirmed",
  });

  useEffect(() => {
    fetchBooking();
  }, []);

  // Load booking
  const fetchBooking = async () => {
    try {
      const res = await api.get(`/bookings/${id}`);
      const data = res.data;

      setForm({
        Booking_Date: data.Booking_Date || "",
        Pickup_Time: data.Pickup_Time || "13:00",
        Pickup_Location: data.Pickup_Location || "",
        No_of_adults: data.No_of_adults || 1,
        No_of_child: data.No_of_child || 0,
        Payment: data.Payment || 0,
        Status: data.Status || "Confirmed",
      });
      setPkg(data.package || null);
    } catch (err) {
      console.log(err);
      alert("Failed to load booking");
    } finally {
      setLoading(false);
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
        <div className="w-12 h-12 border-4 border-sacramento border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto card p-6 mt-6">

      <h2 className="text-2xl font-bold text-sacramento mb-6">
        Edit Booking
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Date */}
        <div>
          <label className="font-semibold text-charcoal dark:text-white">Booking Date</label>
          <input
            type="date"
            name="Booking_Date"
            value={form.Booking_Date}
            onChange={handleChange}
            className="form-input mt-1"
          />
        </div>

        {/* Time */}
        <div>
          <label className="font-semibold text-charcoal dark:text-white">Pickup Time</label>
          <select
            name="Pickup_Time"
            value={form.Pickup_Time}
            onChange={handleChange}
            className="form-input mt-1"
          >
            {getPickupTimeOptions(pkg).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="font-semibold text-charcoal dark:text-white">Pickup Location</label>
          <input
            type="text"
            name="Pickup_Location"
            value={form.Pickup_Location}
            onChange={handleChange}
            className="form-input mt-1"
          />
        </div>

        {/* Adults & Children */}
        <div className="grid grid-cols-2 gap-4">

          <div>
            <label className="font-semibold text-charcoal dark:text-white">Adults</label>
            <input
              type="number"
              name="No_of_adults"
              value={form.No_of_adults}
              onChange={handleChange}
              className="form-input mt-1"
            />
          </div>

          <div>
            <label className="font-semibold text-charcoal dark:text-white">Children</label>
            <input
              type="number"
              name="No_of_child"
              value={form.No_of_child}
              onChange={handleChange}
              className="form-input mt-1"
            />
          </div>

        </div>

        {/* Payment */}
        <div>
          <label className="font-semibold text-charcoal dark:text-white">Payment</label>
          <input
            type="number"
            name="Payment"
            value={form.Payment}
            onChange={handleChange}
            className="form-input mt-1"
          />
        </div>

        {/* Status */}
        <div>
          <label className="font-semibold text-charcoal dark:text-white">Status</label>
          <select
            name="Status"
            value={form.Status}
            onChange={handleChange}
            className="form-input mt-1"
          >
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn-primary w-full py-2.5"
        >
          Update Booking
        </button>

      </form>
    </div>
  );
}