import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../axios";

const policySections = [
  {
    title: "1) Cancellations by Customers",
    items: [
      "More than 7 days before the tour date: full refund, minus payment gateway or transaction fees.",
      "3–7 days before the tour date: 50% refund.",
      "Less than 3 days before the tour date or a no-show: no refund.",
    ],
  },
  {
    title: "2) Cancellations by the Service Provider",
    text: "If we cancel or reschedule your safari because of a park closure, unsafe weather, jeep breakdown, or another unforeseen circumstance, you will receive a full refund when rescheduling is not possible.",
  },
  {
    title: "3) Rescheduling",
    text: "You may request a reschedule at least 72 hours before the scheduled safari. Approval depends on jeep and guide availability. Requests made later may incur fees or may not be possible.",
  },
  {
    title: "4) Partial Cancellations (Group Bookings)",
    text: "Partial cancellations may be accepted for group bookings with revised pricing. Refunds are calculated using the updated group size and cancellation notice period.",
  },
  {
    title: "5) Refund Processing",
    items: [
      "Refunds are issued to the original payment method.",
      "Processing typically takes 7–14 business days, depending on your bank or payment provider.",
      "We are not responsible for delays caused by third-party payment processors.",
    ],
  },
  {
    title: "6) Non-Refundable Items",
    items: [
      "National park entrance tickets once purchased.",
      "Last-minute add-ons or services confirmed on the day of the safari.",
      "No-shows or arrivals more than 30 minutes after the agreed pickup time.",
    ],
  },
  {
    title: "7) Contact Us",
    text: "Email: info@minneriyawildjeepsafari.com | Phone/WhatsApp: +94 77 890 2811",
  },
];

export default function Cancellation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await api.get(`/user/bookings/${id}`);
        setBooking(response.data);
        setForm({
          Booking_Date: response.data.Booking_Date || "",
          Pickup_Time: response.data.Pickup_Time || "",
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
    };

    fetchBooking();
  }, [id, navigate]);

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
      const response = await api.put(`/user/bookings/${id}`, form);
      setBooking(response.data.booking);
      alert("Booking updated successfully.");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update booking.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    setCancelling(true);
    try {
      const response = await api.patch(`/user/bookings/${id}/cancel`);
      setBooking(response.data.booking);
      alert(`Booking cancelled. Applicable refund: ${response.data.refund_percentage}%.`);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel booking.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading || !form) {
    return <div className="flex h-screen items-center justify-center">Loading booking...</div>;
  }

  const isCancelled = booking?.Status?.toLowerCase() === "cancelled";

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sacramento">Booking #{booking.Booking_ID}</p>
          <h1 className="text-3xl font-bold text-sacramento">Edit or cancel booking</h1>
        </div>
        <button type="button" onClick={() => navigate("/user/bookings")} className="btn-secondary">
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
            <input className="form-input mt-1" type="date" name="Booking_Date" value={form.Booking_Date} onChange={handleChange} disabled={isCancelled} required />
          </label>
          <label className="font-semibold text-charcoal dark:text-white">
            Pickup time
            <input className="form-input mt-1" type="time" name="Pickup_Time" value={form.Pickup_Time?.slice(0, 5)} onChange={handleChange} disabled={isCancelled} required />
          </label>
          <label className="font-semibold text-charcoal dark:text-white md:col-span-2">
            Pickup location
            <input className="form-input mt-1" type="text" name="Pickup_Location" value={form.Pickup_Location} onChange={handleChange} disabled={isCancelled} required />
          </label>
          <label className="font-semibold text-charcoal dark:text-white">
            Adults
            <input className="form-input mt-1" type="number" min="1" name="No_of_adults" value={form.No_of_adults} onChange={handleChange} disabled={isCancelled} required />
          </label>
          <label className="font-semibold text-charcoal dark:text-white">
            Children
            <input className="form-input mt-1" type="number" min="0" name="No_of_child" value={form.No_of_child} onChange={handleChange} disabled={isCancelled} required />
          </label>
          <div className="flex flex-wrap gap-3 md:col-span-2">
            <button type="submit" className="btn-primary" disabled={saving || isCancelled}>
              {saving ? "Saving..." : "Save changes"}
            </button>
            <button type="button" onClick={handleCancel} className="rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50" disabled={cancelling || isCancelled}>
              {cancelling ? "Cancelling..." : isCancelled ? "Booking cancelled" : "Delete / Cancel booking"}
            </button>
          </div>
        </form>
      </section>

      <section className="card p-6">
        <h2 className="mb-5 text-2xl font-bold text-sacramento">Return & Refund Policy</h2>
        <div className="space-y-5">
          {policySections.map((section) => (
            <article key={section.title}>
              <h3 className="font-bold text-charcoal dark:text-white">{section.title}</h3>
              {section.text && <p className="mt-1 text-sm leading-6 text-muted">{section.text}</p>}
              {section.items && (
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-6 text-muted">
                  {section.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
            </article>
          ))}
        </div>
        <p className="mt-6 border-t border-gray-200 pt-4 text-xs text-muted dark:border-gray-700">Effective date: 19 August 2025 · Last updated: 19 August 2025</p>
      </section>
    </div>
  );
}
