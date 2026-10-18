import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Calendar, Clock, MapPin, Users, Baby, Save, Info } from "lucide-react";
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
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-bg-dark">
        <div className="w-12 h-12 border-4 border-sacramento border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
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
    <div className="min-h-screen py-6 sm:py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300 bg-slate-50/50 dark:bg-bg-dark text-slate-800 dark:text-white">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Navigation & Header Banner */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/user/bookings")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-[#16231c] text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-surface-2 transition shadow-xs active:scale-95"
          >
            <ArrowLeft size={16} />
            <span>My Bookings</span>
          </button>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-border-light dark:border-border-dark/60 bg-white dark:bg-[#16231c] p-6 sm:p-8 shadow-sm">
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-sacramento/10 dark:bg-sacramento-900/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-sacramento text-white rounded-2xl shadow-sm shrink-0">
                <Calendar size={24} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Modify Booking #{booking.Booking_ID}
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {booking.package?.Package_Name || "Safari Adventure"}
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-surface-2 border border-slate-200/80 dark:border-border-dark text-xs font-bold text-slate-700 dark:text-slate-300 self-start sm:self-auto">
              <span>Status: {booking.Status}</span>
            </div>
          </div>
        </div>

        {!isEditable && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 text-xs sm:text-sm flex items-start gap-3">
            <Info size={18} className="shrink-0 mt-0.5" />
            <span>
              This booking is in <strong>{booking.Status}</strong> status and can no longer be edited online. Please contact our support team for changes.
            </span>
          </div>
        )}

        {/* Edit Form */}
        <section className="rounded-3xl border border-border-light dark:border-border-dark/60 bg-white dark:bg-[#16231c] p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                  <Calendar size={14} className="text-sacramento dark:text-castleton-300" />
                  <span>Safari Date</span>
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-surface-2 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sacramento/30 focus:border-sacramento transition disabled:opacity-60"
                  type="date"
                  name="Booking_Date"
                  value={form.Booking_Date}
                  onChange={handleChange}
                  disabled={!isEditable}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                  <Clock size={14} className="text-sacramento dark:text-castleton-300" />
                  <span>Pickup Time</span>
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-surface-2 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sacramento/30 focus:border-sacramento transition disabled:opacity-60"
                  type="time"
                  name="Pickup_Time"
                  value={form.Pickup_Time?.slice(0, 5)}
                  onChange={handleChange}
                  disabled={!isEditable}
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                  <MapPin size={14} className="text-sacramento dark:text-castleton-300" />
                  <span>Pickup Area</span>
                </label>
                <select
                  className="w-full rounded-2xl border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-surface-2 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sacramento/30 focus:border-sacramento transition disabled:opacity-60"
                  name="Area"
                  value={form.Area}
                  onChange={handleChange}
                  disabled={!isEditable}
                  required
                >
                  <option value="">-- Select area --</option>
                  <option value="Dambulla">Dambulla (+ $12.00)</option>
                  <option value="Sigiriya">Sigiriya (+ $10.00)</option>
                  <option value="Habarana">Habarana (+ $3.00)</option>
                  <option value="Kandalama">Kandalama (+ $16.00)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                  <MapPin size={14} className="text-sacramento dark:text-castleton-300" />
                  <span>Pickup Location (Hotel/Villa)</span>
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-surface-2 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sacramento/30 focus:border-sacramento transition disabled:opacity-60"
                  type="text"
                  name="Pickup_Location"
                  value={form.Pickup_Location}
                  onChange={handleChange}
                  disabled={!isEditable}
                  placeholder="e.g. Heritance Kandalama, Sigiriya Village Hotel"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                  <Users size={14} className="text-sacramento dark:text-castleton-300" />
                  <span>Number of Adults</span>
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-surface-2 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sacramento/30 focus:border-sacramento transition disabled:opacity-60"
                  type="number"
                  min="1"
                  name="No_of_adults"
                  value={form.No_of_adults}
                  onChange={handleChange}
                  disabled={!isEditable}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                  <Baby size={14} className="text-sacramento dark:text-castleton-300" />
                  <span>Number of Children</span>
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-surface-2 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sacramento/30 focus:border-sacramento transition disabled:opacity-60"
                  type="number"
                  min="0"
                  name="No_of_child"
                  value={form.No_of_child}
                  onChange={handleChange}
                  disabled={!isEditable}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-border-dark/60">
              <button
                type="button"
                onClick={() => navigate("/user/bookings")}
                className="px-5 py-3 rounded-2xl border border-slate-200 dark:border-border-dark text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-surface-2 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !isEditable}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sacramento hover:bg-sacramento-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-sacramento/20 transition cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                <span>{saving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </form>
        </section>
      </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-border-light dark:border-border-dark/60 bg-white dark:bg-[#16231c] shadow-2xl">

        {/* Header */}
        <div className="flex items-start gap-3.5 border-b border-slate-100 dark:border-border-dark/60 p-6">
          <div className="shrink-0 rounded-2xl bg-red-100 dark:bg-red-950/50 p-3 text-red-600 dark:text-red-400">
            <AlertTriangle size={22} />
          </div>

          <div className="min-w-0">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Cancellation Policy
            </h2>

            <p className="mt-0.5 truncate text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Booking #{booking.Booking_ID}
              {booking.package?.Package_Name
                ? ` — ${booking.package.Package_Name}`
                : ""}
            </p>
          </div>
        </div>

        {/* Policy body */}
        <div className="max-h-[50vh] space-y-4 overflow-y-auto p-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          {/* Body content, in priority order:
                1. expired confirmed  -> explain it cannot be cancelled
                2. not confirmed      -> unpaid, cancellable with no refund
                3. admin picker       -> choose the refund percentage
                4. customer policy    -> the published refund tiers        */}
          {isExpiredConfirmed ? (
            <p className="p-3.5 rounded-2xl bg-slate-50 dark:bg-surface-2 border border-slate-100 dark:border-border-dark/40 text-slate-700 dark:text-slate-300">
              Sorry, your request cannot be completed as your safari tour date has already passed.
            </p>
          ) : !isConfirmed ? (
            <p className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
              Your booking is not confirmed yet. You can cancel it at any time with no cancellation charges.
            </p>
          ) : showRefundOptions ? (
            <div className="space-y-2">
              <label
                htmlFor="cancellation-refund-percentage"
                className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Applicable refund percentage
              </label>
              <select
                id="cancellation-refund-percentage"
                value={selectedRefund}
                onChange={(event) => onRefundChange(event.target.value)}
                disabled={cancellingId === booking.Booking_ID}
                className="w-full rounded-2xl border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-surface-2 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sacramento/30 focus:border-sacramento transition"
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
              <p className="text-xs text-slate-400">
                Refunds are issued to the original payment method and typically take 7–14 business days.
              </p>
            </div>
          ) : (
            <>
              <p className="text-slate-600 dark:text-slate-300">
                Please review our cancellation policy before proceeding. The eligible refund depends on your safari date:
              </p>

              <ul className="space-y-2.5">
                <li className="rounded-2xl bg-slate-50 dark:bg-surface-2/60 p-3.5 border border-slate-100 dark:border-border-dark/40">
                  <span className="font-bold text-slate-900 dark:text-white block sm:inline">
                    More than 7 days before tour:
                  </span>{" "}
                  100% refund (minus transaction fee).
                </li>

                <li className="rounded-2xl bg-slate-50 dark:bg-surface-2/60 p-3.5 border border-slate-100 dark:border-border-dark/40">
                  <span className="font-bold text-slate-900 dark:text-white block sm:inline">
                    3–7 days before tour:
                  </span>{" "}
                  50% refund.
                </li>

                <li className="rounded-2xl bg-slate-50 dark:bg-surface-2/60 p-3.5 border border-slate-100 dark:border-border-dark/40">
                  <span className="font-bold text-slate-900 dark:text-white block sm:inline">
                    Less than 3 days or no-show:
                  </span>{" "}
                  Non-refundable.
                </li>
              </ul>

              <p className="text-xs text-slate-400">
                Refunds are returned to the original card and take 7–14 business days to appear. This action cannot be reversed.
              </p>
            </>
          )}

          {/* Agreement checkbox */}
          <label
            htmlFor="cancellation-policy-agreement"
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
              policyAgreed
                ? "border-sacramento bg-sacramento/10 text-sacramento dark:border-emerald-500/50"
                : "border-slate-200 dark:border-border-dark bg-slate-50/50 dark:bg-surface-2/40"
            }`}
          >
            <input
              id="cancellation-policy-agreement"
              type="checkbox"
              checked={policyAgreed}
              onChange={(event) =>
                onPolicyAgreedChange(event.target.checked)
              }
              className="mt-0.5 h-4 w-4 shrink-0 rounded accent-sacramento cursor-pointer"
            />

            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              I have read and agree to the cancellation terms & conditions
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 dark:border-border-dark/60 p-6 sm:flex-row sm:justify-end">
          {isExpiredConfirmed ? (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl border border-slate-200 dark:border-border-dark text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-surface-2 transition cursor-pointer"
            >
              Back
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={cancellingId === booking.Booking_ID}
                className="px-5 py-3 rounded-2xl border border-slate-200 dark:border-border-dark text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-surface-2 transition cursor-pointer"
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
                className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-red-600/20 transition cursor-pointer active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
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
                  : "Confirm Cancellation"}
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

