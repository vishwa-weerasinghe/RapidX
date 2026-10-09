import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../axios";

export default function Cancellation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchBooking = useCallback(async () => {
      try {
        const response = await api.get(`/user/bookings/${id}`);
        setBooking(response.data);
        setForm({
          Booking_Date: response.data.Booking_Date || "",
          Pickup_Time: response.data.Pickup_Time || "",
          Area: response.data.Area || "",
          Pickup_Location: response.data.Pickup_Location || "",
          No_of_adults: response.data.No_of_adults || 1,
          No_of_child: response.data.No_of_child || 0,
        });
      } catch (error) {
        alert(error.response?.data?.message || "Failed to load booking.");
        navigate("/user/bookings");
      } finally {
        setLoading(false);
      }
    }, [id, navigate]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      await api.put(`/user/bookings/${id}`, form);
      // Reload the same booking so the page shows the updated values.
      await fetchBooking();
      alert("Booking updated successfully.");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update booking.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return <div className="flex h-screen items-center justify-center">Loading booking...</div>;
  }

  // A booking can only be edited while it is still in an editable state
  // (Pending / In Cart). Confirmed, cancelled, completed or failed bookings
  // are read-only for the customer.
  const isEditableStatus = (status) =>
    ["pending", "incart"].includes(
      String(status || "").toLowerCase().replace(/\s+/g, "")
    );

  const isEditable = isEditableStatus(booking?.Status);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-sacramento">Edit booking</h1>
        </div>
        <button type="button" onClick={() => navigate("/user/bookings")} className="btn-primary">
          Back to My Bookings
        </button>
      </div>

      <section className="card p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-charcoal dark:text-white">Booking details</h2>
            <p className="text-sm text-muted">Current status: {booking.Status}</p>
          </div>
          <span className="rounded-full bg-sacramento/10 px-3 py-1 text-sm font-semibold text-sacramento">
            {booking.package?.Package_Name || "Safari booking"}
          </span>
        </div>

        <form onSubmit={handleUpdate} className="grid gap-4 md:grid-cols-2">
          <label className="font-semibold text-charcoal dark:text-white">
            Safari date
            <input className="form-input mt-1" type="date" name="Booking_Date" value={form.Booking_Date} onChange={handleChange} disabled={!isEditable} required />
          </label>
          <label className="font-semibold text-charcoal dark:text-white">
            Pickup time
            <input className="form-input mt-1" type="time" name="Pickup_Time" value={form.Pickup_Time?.slice(0, 5)} onChange={handleChange} disabled={!isEditable} required />
          </label>
          <label className="font-semibold text-charcoal dark:text-white md:col-span-2">
            Pickup area
            <select className="form-input mt-1" name="Area" value={form.Area} onChange={handleChange} disabled={!isEditable} required>
              <option value="">-- Select area --</option>
              <option value="Dambulla">Dambulla (+ $12.00)</option>
              <option value="Sigiriya">Sigiriya (+ $10.00)</option>
              <option value="Habarana">Habarana (+ $3.00)</option>
              <option value="Kandalama">Kandalama (+ $16.00)</option>
            </select>
          </label>
          <label className="font-semibold text-charcoal dark:text-white md:col-span-2">
            Pickup location
            <input className="form-input mt-1" type="text" name="Pickup_Location" value={form.Pickup_Location} onChange={handleChange} disabled={!isEditable} required />
          </label>
          <label className="font-semibold text-charcoal dark:text-white">
            Adults
            <input className="form-input mt-1" type="number" min="1" name="No_of_adults" value={form.No_of_adults} onChange={handleChange} disabled={!isEditable} required />
          </label>
          <label className="font-semibold text-charcoal dark:text-white">
            Children
            <input className="form-input mt-1" type="number" min="0" name="No_of_child" value={form.No_of_child} onChange={handleChange} disabled={!isEditable} required />
          </label>
          <div className="flex flex-wrap gap-3 md:col-span-2">
            <button type="submit" className="btn-primary" disabled={saving || !isEditable}>
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
