import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
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

/* =====================================================
   CANCELLATION POLICY MODAL
   Shown on the My Bookings page when the customer clicks
   "Cancel". The booking can only be cancelled after ticking
   the agreement box. Lives here so all cancellation-related
   code is in one place (moved from MyBookings.jsx).
   ===================================================== */

// Owns the whole cancellation flow state: the booking the user is
// cancelling, whether they have ticked the "Agree and continue
// cancellation" box, and the in-flight cancellation request.
// eslint-disable-next-line react-refresh/only-export-components -- this hook belongs alongside the modal it drives
export function useCancellation(onCancelled) {
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [policyAgreed, setPolicyAgreed] = useState(false);

  // Cancel booking — only reachable from the policy modal after the user
  // has ticked "Agree and continue cancellation".
  const handleCancelBooking = async (bookingId) => {
    setCancellingId(bookingId);

    try {
      const response = await api.patch(
        `/user/bookings/${bookingId}/cancel`,
        // The backend requires the policy to be acknowledged, matching the
        // agreement box that had to be ticked before this ran.
        { agreed: true }
      );

      alert(
        `Booking cancelled. Applicable refund: ${response.data.refund_percentage}%.`
      );

      closeCancelPolicy();
      onCancelled();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to cancel booking."
      );
    } finally {
      setCancellingId(null);
    }
  };

  // Open the cancellation policy modal for a booking
  const openCancelPolicy = (booking) => {
    setPolicyAgreed(false);
    setCancelTarget(booking);
  };

  // Close the cancellation policy modal
  const closeCancelPolicy = () => {
    setPolicyAgreed(false);
    setCancelTarget(null);
  };

  return {
    cancelTarget,
    cancellingId,
    policyAgreed,
    setPolicyAgreed,
    openCancelPolicy,
    closeCancelPolicy,
    handleCancelBooking,
  };
}

// A confirmed booking is expired once its safari date has fully passed
// (compared at midnight, matching the refund helper used elsewhere).
function isBookingDatePassed(bookingDate) {
  if (!bookingDate) return false;

  const safariDay = new Date(bookingDate);
  if (Number.isNaN(safariDay.getTime())) return false;
  safariDay.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return safariDay < today;
}

// The modal itself — renders nothing while no booking is being cancelled.
export function CancellationModal({
  booking,
  cancellingId,
  policyAgreed,
  onPolicyAgreedChange,
  onClose,
  onConfirm,
  // Optional admin-only extras. When `refundOptions` is provided the policy
  // tier list is replaced by a dropdown so staff can choose the applicable
  // refund percentage. The customer flow omits them and keeps the policy text.
  refundOptions,
  selectedRefund,
  onRefundChange,
}) {
  if (!booking) return null;

  // Only a confirmed booking follows the refund tiers. Anything else was never
  // paid, so it can be cancelled freely with no refund.
  const isConfirmed =
    String(booking.Status || "").toLowerCase() === "confirmed";

  // An expired confirmed booking cannot be cancelled (the backend rejects it),
  // so its modal explains why and offers only a way back.
  const isExpiredConfirmed = isConfirmed && isBookingDatePassed(booking.Booking_Date);

  // The admin refund picker only makes sense for a confirmed booking that is
  // still upcoming. Every other status is unpaid, so there is nothing to
  // refund and no percentage to choose.
  const showRefundOptions = Boolean(refundOptions) && isConfirmed && !isExpiredConfirmed;

  // The confirm button stays disabled until the agreement box is ticked and,
  // for admins, a refund option has actually been chosen.
  const refundChosen = !showRefundOptions || Boolean(selectedRefund);
  const canConfirm = policyAgreed && refundChosen;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl card shadow-2xl">

        {/* Header */}
        <div className="flex items-start gap-3 border-b border-border-light p-5 dark:border-border-dark">
          <div className="shrink-0 rounded-xl bg-red-100 p-2.5 text-red-600 dark:bg-red-900/40 dark:text-red-400">
            <AlertTriangle size={20} />
          </div>

          <div className="min-w-0">
            <h2 className="text-xl font-bold text-charcoal dark:text-white">
              Cancellation Policy
            </h2>

            <p className="mt-0.5 truncate text-sm text-muted">
              Booking #{booking.Booking_ID}
              {booking.package?.Package_Name
                ? ` — ${booking.package.Package_Name}`
                : ""}
            </p>
          </div>
        </div>

        {/* Policy body */}
        <div className="max-h-[50vh] space-y-4 overflow-y-auto p-5">
          {/* Body content, in priority order:
                1. expired confirmed  -> explain it cannot be cancelled
                2. not confirmed      -> unpaid, cancellable with no refund
                3. admin picker       -> choose the refund percentage
                4. customer policy    -> the published refund tiers        */}
          {isExpiredConfirmed ? (
            <p className="text-sm text-charcoal/80 dark:text-white/80">
              Sorry, your request cannot be completed as your
              booking date is expired.
            </p>
          ) : !isConfirmed ? (
            <p className="text-sm text-charcoal/80 dark:text-white/80">
              Your booking is not confirmed, therefore you can
              cancel it at any time and refund is not applied as
              you have not paid for the booking.
            </p>
          ) : showRefundOptions ? (
            <div className="space-y-2">
              <label
                htmlFor="cancellation-refund-percentage"
                className="block text-sm font-semibold text-charcoal dark:text-white"
              >
                Applicable refund percentage
              </label>
              <select
                id="cancellation-refund-percentage"
                value={selectedRefund}
                onChange={(event) => onRefundChange(event.target.value)}
                disabled={cancellingId === booking.Booking_ID}
                className="form-input mt-1"
              >
                <option value="" disabled>
                  -- Select refund percentage --
                </option>
                {refundOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <p className="text-sm text-muted">
                Refunds are issued to the original payment method
                and typically take 7–14 business days to appear.
                This action cannot be undone.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-charcoal/80 dark:text-white/80">
                Please review our cancellation policy before
                proceeding. The refund you receive depends on how
                close to the safari date you cancel:
              </p>

              <ul className="space-y-2 text-sm text-charcoal/80 dark:text-white/80">
                <li className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/70">
                  <span className="font-semibold text-charcoal dark:text-white">
                    More than 7 days before the safari date:
                  </span>{" "}
                  100% refund (minus payment gateway / transaction
                  fees).
                </li>

                <li className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/70">
                  <span className="font-semibold text-charcoal dark:text-white">
                    3–7 days before the safari date:
                  </span>{" "}
                  50% refund.
                </li>

                <li className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/70">
                  <span className="font-semibold text-charcoal dark:text-white">
                    Less than 3 days before the safari date or
                    no-show:
                  </span>{" "}
                  No refund.
                </li>
              </ul>

              <p className="text-sm text-muted">
                Refunds are issued to the original payment method
                and typically take 7–14 business days to appear.
                This action cannot be undone.
              </p>
            </>
          )}

          {/* Agreement checkbox — required to continue. Shown for every booking
              so the policy is always acknowledged, including expired confirmed
              ones (which still cannot be cancelled: their footer offers only a
              way back). */}
          <label
              htmlFor="cancellation-policy-agreement"
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                policyAgreed
                  ? "border-sacramento bg-sacramento/5"
                  : "border-border-light bg-slate-50 dark:border-border-dark dark:bg-slate-800/70"
              }`}
            >
              <input
                id="cancellation-policy-agreement"
                type="checkbox"
                checked={policyAgreed}
                onChange={(event) =>
                  onPolicyAgreedChange(event.target.checked)
                }
                className="mt-0.5 h-4 w-4 shrink-0 rounded accent-sacramento"
              />

              <span className="text-sm font-semibold text-charcoal dark:text-white">
                Agree and continue cancellation
              </span>
            </label>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-border-light p-5 dark:border-border-dark sm:flex-row sm:justify-end">
          {/* Expired confirmed bookings cannot be cancelled — only offer a
              way back instead of a cancel action. */}
          {isExpiredConfirmed ? (
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Back
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={cancellingId === booking.Booking_ID}
                className="btn-secondary"
              >
                Keep my booking
              </button>

              <button
                type="button"
                onClick={() =>
                  onConfirm(booking.Booking_ID)
                }
                disabled={
                  !canConfirm ||
                  cancellingId === booking.Booking_ID
                }
                className="btn-danger disabled:cursor-not-allowed disabled:opacity-50"
                title={
                  !policyAgreed
                    ? "Tick the agreement to continue"
                    : !refundChosen
                      ? "Select a refund percentage to continue"
                      : undefined
                }
              >
                {cancellingId === booking.Booking_ID
                  ? "Cancelling..."
                  : "Cancel my booking"}
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

