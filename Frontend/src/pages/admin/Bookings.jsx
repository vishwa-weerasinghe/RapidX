import { useCallback, useEffect, useRef, useState } from "react";
import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isValid,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
  subYears,
} from "date-fns";
import api from "../../axios";
import { useNavigate } from "react-router-dom";
import { pickupTimeOptions, getPickupTimeOptions, getDefaultPickupTime } from "../../constants/pickupTimeOptions";
import { CancellationModal } from "../user/cancellation.jsx";

const emptyCreateForm = {
  Booking_Date: "",
  Pickup_Time: "13:00",
  Area: "",
  Pickup_Location: "",
  No_of_adults: 1,
  No_of_child: 0,
  Package_ID: "",
  Customer_ID: "",
  First_Name: "",
  Last_Name: "",
  Email: "",
  Phone_No: "",
  NIC: "",
  Country: "",
  Status: "Confirmed",
};

// ── Multi-vehicle assignment helpers ────────────────────────────────────────
// One vehicle covers up to 6 passengers:
//   <= 6 passengers  → 1 vehicle
//   > 6 & <= 12      → 2 vehicles
//   > 12 & <= 18     → 3 vehicles ... and so on.
const PASSENGERS_PER_VEHICLE = 6;

const getPassengerTotal = (booking) =>
  Number(booking?.No_of_adults || 0) + Number(booking?.No_of_child || 0);

const calculateRequiredVehicles = (booking) => {
  const passengers = getPassengerTotal(booking);
  if (passengers <= 0) return 1;
  return Math.ceil(passengers / PASSENGERS_PER_VEHICLE);
};

const getAssignedVehicles = (booking) => {
  const list = Array.isArray(booking?.vehicles) ? booking.vehicles.filter(Boolean) : [];
  if (list.length > 0) return list;
  // Fall back to the legacy single-vehicle column for older bookings.
  return booking?.vehicle ? [booking.vehicle] : [];
};

const isUnseenAdminBooking = (booking) =>
  booking?.Admin_Seen === false || booking?.Admin_Seen === 0 || booking?.Admin_Seen === "0";

// Booking IDs come back from the API as numbers (or numeric strings), so every
// comparison and lookup goes through this normaliser.
const getBookingId = (booking) => Number(booking?.Booking_ID || 0);

// `parseISO()` throws on null/undefined, so empty inputs are filtered out first.
const parseDateInput = (value) => {
  if (!value) return null;

  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
};

// Mirrors the period boundaries the backend applies (Monday -> Sunday weeks,
// calendar months/years) so the summary shown to the admin is exactly the
// range the server queried rather than a second, possibly different guess.
const periodRange = (period, fromDate, toDate) => {
  const today = new Date();

  switch (period) {
    case "this_week":
      return [
        startOfWeek(today, { weekStartsOn: 1 }),
        endOfWeek(today, { weekStartsOn: 1 }),
      ];
    case "this_month":
      return [startOfMonth(today), endOfMonth(today)];
    case "last_month": {
      const lastMonth = subMonths(today, 1);
      return [startOfMonth(lastMonth), endOfMonth(lastMonth)];
    }
    case "this_year":
      return [startOfYear(today), endOfYear(today)];
    case "last_year": {
      const lastYear = subYears(today, 1);
      return [startOfYear(lastYear), endOfYear(lastYear)];
    }
    case "custom":
      return [parseDateInput(fromDate), parseDateInput(toDate)];
    default:
      return [null, null];
  }
};

const formatPeriodRange = ([from, to]) => {
  const fmt = (date) => (date ? format(date, "d MMM yyyy") : null);

  if (from && to) return `${fmt(from)} to ${fmt(to)}`;
  if (from) return `from ${fmt(from)}`;
  if (to) return `up to ${fmt(to)}`;
  return "";
};

// A "<select>" value is always a string, so the same period list is reused for
// both the dropdown options and the summary label.
const PERIOD_OPTIONS = [
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_year", label: "This Year" },
  { value: "last_year", label: "Last Year" },
  { value: "all_time", label: "All Time" },
  { value: "custom", label: "Custom Date Range" },
];

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [packages, setPackages] = useState([]);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("all_time");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [newBookingIds, setNewBookingIds] = useState(new Set());
  const [notificationBookingIds, setNotificationBookingIds] = useState(new Set());
  // The "new bookings only" view has no UI toggle yet, so it stays off and the
  // table always shows every booking the API returned for the current filter.
  const showNewOnly = false;
  const [showNotifications, setShowNotifications] = useState(false);
  const [assignmentModal, setAssignmentModal] = useState(null);
  const [savingAssignment, setSavingAssignment] = useState(false);

  // Cancellation policy modal — reused from the user booking screen so the
  // admin sees the exact same policy / not-confirmed / expired messages
  // before a booking is cancelled.
  const [cancelTarget, setCancelTarget] = useState(null);
  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  // The refund tiers an admin may apply when cancelling a confirmed booking.
  // The selected value is sent to the backend and overrides the percentage
  // the policy would have calculated automatically.
  const REFUND_OPTIONS = ["100%", "50%", "25%", "0%"];

  // Starts empty on purpose: the modal's confirm button stays disabled until
  // the admin actively picks a tier, so a refund is never applied by accident.
  const [selectedRefund, setSelectedRefund] = useState("");
  const bookingsRef = useRef(bookings);
  const periodRef = useRef(period);
  const searchRef = useRef(search);
  const fromDateRef = useRef(fromDate);
  const toDateRef = useRef(toDate);
  const filterDebounceRef = useRef(null);
  const filterEffectInitialized = useRef(false);

  const navigate = useNavigate();

  // Query parameters shared by every list request (initial load, filter change
  // and the auto-refresh poll) so period + search are always applied together
  // on the server instead of being filtered in the browser.
  const buildBookingParams = useCallback(() => {
    const params = { period: periodRef.current };
    const trimmedSearch = searchRef.current.trim();

    if (trimmedSearch) {
      params.search = trimmedSearch;
    }

    if (periodRef.current === "custom" && (fromDateRef.current || toDateRef.current)) {
      if (fromDateRef.current) params.from_date = fromDateRef.current;
      if (toDateRef.current) params.to_date = toDateRef.current;
    }

    // A custom range with no dates yet must not accidentally load everything,
    // and an inverted range would silently render an empty table.
    if (periodRef.current === "custom") {
      const from = fromDateRef.current;
      const to = toDateRef.current;

      if (!from && !to) return null;
      if (from && to && from > to) return null;
    }

    return params;
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const params = buildBookingParams();

      const [bookingsResponse, vehiclesResponse] = await Promise.all([
        params ? api.get("/bookings", { params }) : Promise.resolve({ data: [] }),
        api.get("/vehicles"),
      ]);

      setBookings(bookingsResponse.data);
      setVehicles(vehiclesResponse.data);
      setNewBookingIds(new Set(
        bookingsResponse.data
          .filter(isUnseenAdminBooking)
          .map(getBookingId)
      ));
    } catch (err) {
      console.error(err);
      alert("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, [buildBookingParams]);

  const fetchPackages = useCallback(async () => {
    try {
      const res = await api.get("/packages");
      setPackages(res.data);
      if (res.data.length > 0) {
        const firstPackage = res.data[0];
        setSelectedPackage(firstPackage);
        setCreateForm((prev) => ({ ...prev, Package_ID: String(firstPackage.Package_ID || firstPackage.id || "") }));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    bookingsRef.current = bookings;
  }, [bookings]);

  useEffect(() => {
    periodRef.current = period;
  }, [period]);

  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  useEffect(() => {
    fromDateRef.current = fromDate;
  }, [fromDate]);

  useEffect(() => {
    toDateRef.current = toDate;
  }, [toDate]);

  useEffect(() => {
    fetchData();
    fetchPackages();
  }, [fetchData, fetchPackages]);

  // Single value that changes whenever any filter input changes, so the effect
  // below can re-query without listing each source of state separately.
  const filterKey = `${period}|${search}|${fromDate}|${toDate}`;

  // Keep the list scoped to the selected booking period + search on the server.
  useEffect(() => {
    if (!filterEffectInitialized.current) {
      filterEffectInitialized.current = true;
      return;
    }

    if (filterDebounceRef.current) {
      window.clearTimeout(filterDebounceRef.current);
    }

    filterDebounceRef.current = window.setTimeout(() => {
      fetchData();
    }, 450);

    return () => {
      if (filterDebounceRef.current) {
        window.clearTimeout(filterDebounceRef.current);
      }
    };
  }, [fetchData, filterKey]);

  useEffect(() => {
    const interval = setInterval(() => {
      const params = buildBookingParams();
      if (!params) return;

      api.get("/bookings", { params }).then((response) => {
        const latest = response.data || [];
        setBookings(latest);
        setNewBookingIds(new Set(
          latest.filter(isUnseenAdminBooking).map(getBookingId)
        ));
      }).catch(() => { });

    }, 5000);

    return () => clearInterval(interval);
  }, [buildBookingParams]);

  const openAssignModal = (booking) => {
    const required = calculateRequiredVehicles(booking);
    const alreadyAssigned = getAssignedVehicles(booking).map((vehicle) => String(vehicle.Vehicle_ID));

    setAssignmentModal({
      booking,
      selections: Array.from({ length: required }, (_, index) => alreadyAssigned[index] ?? ""),
    });
  };

  const handleAssignmentSlotChange = (slotIndex, value) => {
    setAssignmentModal((prev) => {
      const selections = [...prev.selections];
      selections[slotIndex] = value;
      return { ...prev, selections };
    });
  };

  const handleSaveAssignment = async () => {
    const { booking, selections } = assignmentModal;
    const required = selections.length;
    const chosen = selections.filter(Boolean);

    if (chosen.length < required) {
      alert(`This booking needs ${required} vehicle(s). Please select all ${required}.`);
      return;
    }

    if (new Set(chosen).size !== chosen.length) {
      alert("The same vehicle is selected more than once. Please pick different vehicles.");
      return;
    }

    try {
      setSavingAssignment(true);
      await api.put(`/bookings/${booking.Booking_ID}/vehicles`, {
        Vehicle_IDs: chosen.map(Number),
        Required_Count: required,
      });

      setAssignmentModal(null);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to assign vehicles.");
    } finally {
      setSavingAssignment(false);
    }
  };

  const handleCollectPayment = async (booking) => {
    const customerName = booking.customer
      ? `${booking.customer.First_Name} ${booking.customer.Last_Name}`
      : "Guest";
    const confirmed = window.confirm(
      `Collect payment of $${booking.Payment} for Booking #${booking.Booking_ID} (${customerName}) and mark this booking as Confirmed?`
    );
    if (!confirmed) return;

    try {
      const res = await api.post(`/bookings/${booking.Booking_ID}/collect-payment`);
      alert(res.data?.message || "Payment collected and booking confirmed!");
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to collect payment.");
    }
  };

  const handleEdit = (booking) => {
    navigate("/booking", {
      state: { bookingId: booking.Booking_ID },
    });
  };

  // Open the shared cancellation policy modal for a booking. The actual
  // deletion only happens after the admin ticks "Agree and continue
  // cancellation" in the modal.
  const openCancelPolicy = (booking) => {
    setPolicyAgreed(false);
    setSelectedRefund("");
    setCancelTarget(booking);
  };

  // Close the cancellation policy modal
  const closeCancelPolicy = () => {
    setPolicyAgreed(false);
    setCancelTarget(null);
  };

  // Cancel booking — only reachable from the policy modal after the admin
  // has ticked "Agree and continue cancellation".
  const handleCancelBooking = async (bookingId) => {
    setCancellingId(bookingId);

    try {
      // "50%" -> 50. Only sent when the admin actually picked a tier (the modal
      // blocks confirming otherwise); omitting it lets the backend fall back to
      // the policy-calculated percentage for unpaid bookings.
      const refundPercentage = selectedRefund
        ? Number.parseInt(selectedRefund, 10)
        : null;

      const response = await api.delete(`/bookings/${bookingId}`, {
        data: {
          // The backend requires the policy to be acknowledged, matching the
          // agreement box that had to be ticked before this ran.
          agreed: true,
          ...(refundPercentage === null
            ? {}
            : { Refund_Percentage: refundPercentage }),
        },
      });
      alert(`Booking cancelled successfully. Applicable refund: ${response.data.refund_percentage}%`);
      closeCancelPolicy();
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to cancel booking.");
    } finally {
      setCancellingId(null);
    }
  };

  const handleCreateInputChange = (event) => {
    const { name, value } = event.target;

    setCreateForm((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "Package_ID") {
        const pkg = packages.find((item) => String(item.Package_ID || item.id) === String(value));
        setSelectedPackage(pkg || null);
        if (pkg) {
          const available = getPickupTimeOptions(pkg);
          if (!available.some((opt) => opt.value === prev.Pickup_Time)) {
            updated.Pickup_Time = getDefaultPickupTime(pkg);
          }
        }
      }

      return updated;
    });
  };

  const calculateCreatePayment = () => {
    if (!selectedPackage) return 0;

    const adults = Number(createForm.No_of_adults || 0);
    const adultRate = adults <= 1
      ? Number(selectedPackage.price_one_adult || 0)
      : Number(selectedPackage.price_more_adult || 0);
    const childTotal = Number(createForm.No_of_child || 0) * Number(selectedPackage.price_child || 0);

    return adults * adultRate + childTotal;
  };

  const handleCreateBooking = async (event) => {
    event.preventDefault();
    setCreating(true);

    const payload = {
      Booking_Date: createForm.Booking_Date,
      Pickup_Time: createForm.Pickup_Time,
      Area: createForm.Area,
      Pickup_Location: createForm.Pickup_Location,
      No_of_adults: Number(createForm.No_of_adults),
      No_of_child: Number(createForm.No_of_child),
      Package_ID: createForm.Package_ID,
      Payment: calculateCreatePayment(),
      Status: createForm.Status,
      Created_By_Admin: true,
    };

    if (createForm.Customer_ID) {
      payload.Customer_ID = createForm.Customer_ID;
    } else {
      payload.First_Name = createForm.First_Name;
      payload.Last_Name = createForm.Last_Name;
      payload.Email = createForm.Email;
      payload.Phone_No = createForm.Phone_No;
      payload.NIC = createForm.NIC;
      payload.Country = createForm.Country;
    }

    try {
      await api.post("/bookings", payload);
      alert("Booking created successfully.");
      setShowCreateModal(false);
      setCreateForm(emptyCreateForm);
      setSelectedPackage(packages[0] || null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create booking.");
    } finally {
      setCreating(false);
    }
  };

  const handleBellClick = async () => {
    if (showNotifications) {
      setShowNotifications(false);
      return;
    }

    try {
      const response = await api.get("/admin/bookings/notifications");
      const notifications = response.data || [];
      setBookings((current) => {
        const notificationById = new Map(notifications.map((booking) => [getBookingId(booking), booking]));
        return current.map((booking) => notificationById.get(getBookingId(booking)) || booking);
      });
      setNotificationBookingIds(new Set(notifications.map(getBookingId)));
      setNewBookingIds(new Set());
      setShowNotifications(true);
      await api.post("/admin/bookings/mark-seen");
    } catch (err) {
      console.error(err);
      setShowNotifications(true);
    }
  };

  const handlePeriodChange = (event) => {
    const value = event.target.value;
    setPeriod(value);

    // Leaving the custom picker clears the range so it does not leak into
    // another period (or force a reload with stale dates).
    if (period === "custom" && value !== "custom") {
      setFromDate("");
      setToDate("");
    }
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  // Search + date period filtering happen on the backend (`/bookings`), so the
  // list returned by the API is already scoped. Only the "new bookings" toggle
  // still narrows things down client-side. The rows are then ordered by
  // Booking_ID descending so the most recently created bookings (105 above 104,
  // above 103, ...) always appear first, whichever period is selected.
  const filteredBookings = bookings
    .filter((booking) => {
      if (!showNewOnly) return true;
      return notificationBookingIds.has(getBookingId(booking));
    })
    .sort((a, b) => getBookingId(b) - getBookingId(a));

  const hasNoCustomDates = period === "custom" && !fromDate && !toDate;
  const hasInvertedCustomRange =
    period === "custom" && Boolean(fromDate) && Boolean(toDate) && fromDate > toDate;

  // ISO date strings ("YYYY-MM-DD") compare correctly as plain strings.
  const activeRangeLabel = period === "all_time"
    ? ""
    : formatPeriodRange(periodRange(period, fromDate, toDate));

  const activePeriodLabel =
    PERIOD_OPTIONS.find((option) => option.value === period)?.label || "This Month";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-14 h-14 border-4 border-sacramento border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
       <h1 className="text-3xl md:text-4xl font-black text-[#29AB87] dark:text-white tracking-tight">
          Booking Management
      </h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBellClick}
            className="relative rounded-full card p-2 shadow-sm hover:bg-offwhite-100 dark:hover:bg-surface-2"
            title="Booking notifications"
            aria-label="Booking notifications"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {newBookingIds.size > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                {newBookingIds.size}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-28 top-20 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-xl border border-border-light bg-white p-3 shadow-xl dark:border-border-dark dark:bg-bg-dark">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-bold text-charcoal dark:text-white">Booking notifications</h2>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="rounded-md px-2 py-1 text-lg leading-none text-muted hover:bg-offwhite-100 dark:hover:bg-surface-2"
                  aria-label="Close booking notifications"
                  title="Close"
                >
                  x
                </button>
              </div>
              {notificationBookingIds.size === 0 ? (
                <p className="py-3 text-sm text-muted">No new booking notifications.</p>
              ) : (
                <div className="max-h-72 space-y-2 overflow-y-auto">
                  {bookings
                    .filter((booking) => notificationBookingIds.has(getBookingId(booking)))
                    .map((booking) => (
                      <button
                        type="button"
                        key={booking.Booking_ID}
                        onClick={() => setShowNotifications(false)}
                        className="w-full rounded-lg border border-border-light p-3 text-left hover:bg-offwhite-100 dark:border-border-dark dark:hover:bg-surface-2"
                      >
                        <p className="text-xs font-bold text-sacramento">
                          {booking.package?.Package_Name || "Safari package"} - {booking.Status}
                        </p>
                        <p className="mt-1 text-sm text-charcoal dark:text-white">
                          {booking.Admin_Message || "A new booking has been received."}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          Safari date: {booking.Booking_Date}
                        </p>
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
          <button type="button" onClick={() => navigate("/booking")} className="btn-primary">
            + Add Booking
          </button>
        </div>
      </div>

      {showNewOnly && newBookingIds.size === 0 && (
        <p className="mb-6 text-sm text-muted">No new bookings to show.</p>
      )}

      {/* Search + Booking Period are stacked vertically: the period dropdown
          sits directly under the search bar, and the table follows below. */}
      <div className="mb-6 flex flex-col items-start gap-4">
        <input
          type="search"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search ID, customer, package, date, location, or status..."
          aria-label="Search bookings"
          className="form-input w-full max-w-xl"
        />

        <div className="flex w-full max-w-xl flex-col gap-1">
          <label
            htmlFor="booking-period"
            className="text-xs font-semibold text-charcoal dark:text-white"
          >
            Booking Period
          </label>
          <select
            id="booking-period"
            value={period}
            onChange={handlePeriodChange}
            className="form-input"
            aria-label="Booking period"
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {period === "custom" && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="booking-from-date"
                className="text-xs font-semibold text-charcoal dark:text-white"
              >
                From Date
              </label>
              <input
                id="booking-from-date"
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="form-input"
              />
            </div>
            <span className="text-sm text-muted">to</span>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="booking-to-date"
                className="text-xs font-semibold text-charcoal dark:text-white"
              >
                To Date
              </label>
              <input
                id="booking-to-date"
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="form-input"
              />
            </div>
          </div>
        )}
      </div>

      {hasNoCustomDates && (
        <p className="mb-6 text-sm text-muted">
          Select a From Date and To Date to view bookings in that range.
        </p>
      )}

      {hasInvertedCustomRange && (
        <p className="mb-6 text-sm font-semibold text-red-600 dark:text-red-400" role="alert">
          The From Date must be on or before the To Date.
        </p>
      )}

      {!hasNoCustomDates && !hasInvertedCustomRange && (
        <p className="mb-6 text-sm text-muted">
          Showing{" "}
          <span className="font-semibold text-charcoal dark:text-white">
            {filteredBookings.length}
          </span>{" "}
          booking{filteredBookings.length === 1 ? "" : "s"} for{" "}
          <span className="font-semibold text-charcoal dark:text-white">
            {activePeriodLabel}
          </span>
          {activeRangeLabel ? ` (${activeRangeLabel})` : ""}
          {search.trim() ? ` matching “${search.trim()}”` : ""}.
        </p>
      )}

      {assignmentModal && (() => {
        const modalBooking = assignmentModal.booking;
        const selections = assignmentModal.selections;
        const required = selections.length;
        const allSlotsFilled = selections.every(Boolean);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl card p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-charcoal dark:text-white">Assign Vehicles</h2>
              <p className="text-sm text-muted mb-4">
                Booking #{modalBooking.Booking_ID} ·{" "}
                {modalBooking.customer
                  ? `${modalBooking.customer.First_Name} ${modalBooking.customer.Last_Name}`
                  : "Guest"}
              </p>

              <div className="rounded-lg bg-sacramento/10 p-3 text-sm text-sacramento mb-4">
                Passengers: <strong>{getPassengerTotal(modalBooking)}</strong> ({modalBooking.No_of_adults} adults +{" "}
                {modalBooking.No_of_child} children) →{" "}
                <strong>
                  {required} vehicle{required > 1 ? "s" : ""} required
                </strong>{" "}
                (max {PASSENGERS_PER_VEHICLE} passengers per vehicle)
              </div>

              <div className="space-y-3">
                {selections.map((selectedValue, slotIndex) => {
                  const takenElsewhere = new Set(
                    selections.filter((value, otherIndex) => otherIndex !== slotIndex && value)
                  );

                  return (
                    <div key={slotIndex}>
                      <label className="mb-1 block text-sm font-semibold text-charcoal dark:text-white">
                        Vehicle {slotIndex + 1} of {required}
                      </label>
                      <select
                        value={selectedValue}
                        onChange={(event) => handleAssignmentSlotChange(slotIndex, event.target.value)}
                        className="form-input"
                        aria-label={`Vehicle ${slotIndex + 1} of ${required} for booking ${modalBooking.Booking_ID}`}
                      >
                        <option value="">Select a vehicle…</option>
                        {vehicles.map((vehicle) => (
                          <option
                            key={vehicle.Vehicle_ID}
                            value={vehicle.Vehicle_ID}
                            disabled={takenElsewhere.has(String(vehicle.Vehicle_ID))}
                          >
                            {vehicle.Vehicle_No} ({vehicle.Vehicle_Type}, {vehicle.No_of_Seats} seats)
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setAssignmentModal(null)} className="btn-secondary">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAssignment}
                  disabled={!allSlotsFilled || savingAssignment}
                  className="btn-primary disabled:opacity-60"
                >
                  {savingAssignment
                    ? "Saving..."
                    : `Assign ${required} Vehicle${required > 1 ? "s" : ""}`}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <CancellationModal
        booking={cancelTarget}
        cancellingId={cancellingId}
        policyAgreed={policyAgreed}
        onPolicyAgreedChange={setPolicyAgreed}
        onClose={closeCancelPolicy}
        onConfirm={handleCancelBooking}
        refundOptions={REFUND_OPTIONS}
        selectedRefund={selectedRefund}
        onRefundChange={setSelectedRefund}
      />

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-sacramento">Add New Booking</h2>
                <p className="text-sm text-muted">Create a booking for a registered customer or a guest/unregistered customer.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-charcoal dark:text-white">Booking Date</label>
                  <input
                    type="date"
                    name="Booking_Date"
                    value={createForm.Booking_Date}
                    onChange={handleCreateInputChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-charcoal dark:text-white">Pickup Time</label>
                  <select
                    name="Pickup_Time"
                    value={createForm.Pickup_Time}
                    onChange={handleCreateInputChange}
                    className="form-input"
                    required
                  >
                    {getPickupTimeOptions(selectedPackage).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-charcoal dark:text-white">Pickup Location</label>
                  <input
                    type="text"
                    name="Pickup_Location"
                    value={createForm.Pickup_Location}
                    onChange={handleCreateInputChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-charcoal dark:text-white">Adults</label>
                  <input
                    type="number"
                    min="1"
                    name="No_of_adults"
                    value={createForm.No_of_adults}
                    onChange={handleCreateInputChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-charcoal dark:text-white">Children</label>
                  <input
                    type="number"
                    min="0"
                    name="No_of_child"
                    value={createForm.No_of_child}
                    onChange={handleCreateInputChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-charcoal dark:text-white">Package</label>
                  <select
                    name="Package_ID"
                    value={createForm.Package_ID}
                    onChange={handleCreateInputChange}
                    className="form-input"
                    required
                  >
                    <option value="">Select a package</option>
                    {packages.map((item) => (
                      <option key={item.Package_ID || item.id} value={item.Package_ID || item.id}>
                        {item.Package_Name} - 1 Adult: $ {item.price_one_adult} / Adult (2+): $ {item.price_more_adult} / Child: $ {item.price_child}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-charcoal dark:text-white">Status</label>
                  <select
                    name="Status"
                    value={createForm.Status}
                    onChange={handleCreateInputChange}
                    className="form-input"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl border border-border-light bg-offwhite-100 p-4 dark:border-border-dark dark:bg-surface-2">
                <label className="mb-1 block text-sm font-semibold text-charcoal dark:text-white">Customer ID (optional)</label>
                <input
                  type="text"
                  name="Customer_ID"
                  value={createForm.Customer_ID}
                  onChange={handleCreateInputChange}
                  className="form-input"
                  placeholder="Leave blank to create a guest customer"
                />
                {!createForm.Customer_ID && (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-charcoal dark:text-white">First Name</label>
                      <input
                        type="text"
                        name="First_Name"
                        value={createForm.First_Name}
                        onChange={handleCreateInputChange}
                        className="form-input"
                        required={!createForm.Customer_ID}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-charcoal dark:text-white">Last Name</label>
                      <input
                        type="text"
                        name="Last_Name"
                        value={createForm.Last_Name}
                        onChange={handleCreateInputChange}
                        className="form-input"
                        required={!createForm.Customer_ID}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-charcoal dark:text-white">Email</label>
                      <input
                        type="email"
                        name="Email"
                        value={createForm.Email}
                        onChange={handleCreateInputChange}
                        className="form-input"
                        required={!createForm.Customer_ID}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-charcoal dark:text-white">Phone Number</label>
                      <input
                        type="text"
                        name="Phone_No"
                        value={createForm.Phone_No}
                        onChange={handleCreateInputChange}
                        className="form-input"
                        required={!createForm.Customer_ID}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-charcoal dark:text-white">NIC</label>
                      <input
                        type="text"
                        name="NIC"
                        value={createForm.NIC}
                        onChange={handleCreateInputChange}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-charcoal dark:text-white">Country</label>
                      <input
                        type="text"
                        name="Country"
                        value={createForm.Country}
                        onChange={handleCreateInputChange}
                        className="form-input"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-lg bg-sacramento/10 p-3 text-sm text-sacramento">
                Estimated payment: $ {calculateCreatePayment().toLocaleString()}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary disabled:opacity-60"
                >
                  {creating ? "Creating..." : "Create Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl card">
        <table className="min-w-full">
          <thead className="bg-sacramento text-white">
            <tr>
              <th className="px-4 py-3 text-left">Booking ID</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Package</th>
              <th className="px-4 py-3 text-left">Booking Date</th>
              <th className="px-4 py-3 text-left">Pickup Time</th>
              <th className="px-4 py-3 text-left">Pickup Area</th>
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
                <td colSpan="14" className="py-6 text-center text-muted">
                  {hasNoCustomDates
                    ? "Select From and To dates to view bookings in this range."
                    : hasInvertedCustomRange
                      ? "The From Date must be on or before the To Date."
                      : search.trim()
                        ? `No bookings match “${search.trim()}” in ${activePeriodLabel}${activeRangeLabel ? ` (${activeRangeLabel})` : ""}.`
                        : `No bookings found for ${activePeriodLabel}${activeRangeLabel ? ` (${activeRangeLabel})` : ""}. Try another booking period or All Time.`}
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr key={booking.Booking_ID} className="table-row">
                  <td className="px-4 py-3 text-charcoal dark:text-white">{booking.Booking_ID}</td>
                  <td className="px-4 py-3 text-charcoal/80 dark:text-white/80">
                    {booking.customer
                      ? `${booking.customer.First_Name} ${booking.customer.Last_Name}`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-charcoal/80 dark:text-white/80">{booking.package?.Package_Name || "-"}</td>
                  <td className="px-4 py-3 text-charcoal/80 dark:text-white/80">{booking.Booking_Date}</td>
                  <td className="px-4 py-3 text-charcoal/80 dark:text-white/80">{booking.Pickup_Time}</td>
                  <td className="px-4 py-3 text-charcoal/80 dark:text-white/80">{booking.Area || "—"}</td>
                  <td className="px-4 py-3 text-charcoal/80 dark:text-white/80">{booking.Pickup_Location}</td>
                  <td className="px-4 py-3 text-center text-charcoal/80 dark:text-white/80">{booking.No_of_adults}</td>
                  <td className="px-4 py-3 text-center text-charcoal/80 dark:text-white/80">{booking.No_of_child}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-bold text-charcoal dark:text-white">$ {booking.Payment}</div>
                    <div className="mt-0.5">
                      {booking.payment?.payment_method === "Pay Later" ? (
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                          Pay Later
                        </span>
                      ) : (
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                          {booking.payment?.payment_method || "Online"}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold inline-block ${
                        booking.Status?.toLowerCase() === "confirmed"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                          : booking.Status?.toLowerCase() === "pending"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                          : booking.Status?.toLowerCase() === "cancelled"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300"
                          : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {booking.Status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const assigned = getAssignedVehicles(booking);
                      const required = calculateRequiredVehicles(booking);
                      const fullyAssigned = assigned.length >= required;

                      return (
                        <div className="min-w-[11rem] space-y-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {assigned.length === 0 ? (
                              <span className="text-sm text-muted">Not assigned</span>
                            ) : (
                              assigned.map((vehicle) => (
                                <span
                                  key={vehicle.Vehicle_ID}
                                  className="rounded-full bg-sacramento/10 px-2 py-0.5 text-xs font-semibold text-sacramento dark:bg-sacramento/20 dark:text-sacramento-300"
                                >
                                  {vehicle.Vehicle_No}
                                </span>
                              ))
                            )}
                            <span
                              className={`text-xs font-bold ${
                                fullyAssigned
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-amber-600 dark:text-amber-400"
                              }`}
                            >
                              {assigned.length}/{required}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => openAssignModal(booking)}
                            className="text-sm font-medium text-sacramento hover:underline"
                            aria-label={`Assign vehicles for booking ${booking.Booking_ID}`}
                          >
                            Assign vehicles
                          </button>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3 text-charcoal/80 dark:text-white/80">
                    {(() => {
                      const driverNames = getAssignedVehicles(booking)
                        .map((vehicle) => vehicle?.driver?.Driver_Name)
                        .filter(Boolean);

                      return driverNames.length > 0 ? driverNames.join(", ") : "—";
                    })()}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    {booking.Status?.toLowerCase() === "pending" && (
                      <button
                        type="button"
                        onClick={() => handleCollectPayment(booking)}
                        className="mr-3 font-semibold text-xs px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm cursor-pointer"
                        title="Collect payment and confirm booking"
                      >
                        Collect Payment
                      </button>
                    )}
                    <button onClick={() => handleEdit(booking)} className="text-sacramento hover:underline">
                      Edit
                    </button>
                    <button onClick={() => openCancelPolicy(booking)} className="ml-3 text-red-600 hover:underline dark:text-red-400">
                      Cancel
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
