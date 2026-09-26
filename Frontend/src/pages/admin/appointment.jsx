import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../axios";
import { useTheme } from "../../context/ThemeContext";
import PackagePopularityChart from "../../components/admin-dashboard/PackagePopularityChart";

export default function Appointments() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [appointments, setAppointments] = useState([]);
  const [summary, setSummary] = useState({
    total_confirmed: 0,
    total_unconfirmed: 0,
    total_earnings_confirmed: 0,
    total_earnings_unconfirmed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newAppointmentIds, setNewAppointmentIds] = useState(new Set());
  const [notificationAppointmentIds, setNotificationAppointmentIds] = useState(new Set());
  const [showNewOnly, setShowNewOnly] = useState(false);
  const appointmentsRef = useRef(appointments);

  const getAppointmentId = (a) => Number(a?.Booking_ID || 0);

  useEffect(() => {
    appointmentsRef.current = appointments;
  }, [appointments]);

  const currentMonth = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const params = { month: currentMonth() };
      const [appRes, sumRes] = await Promise.all([
        api.get("/appointments", { params }),
        api.get("/appointments/summary", { params }),
      ]);
      const data = appRes.data || [];
      setAppointments(data);
      setSummary(sumRes.data || {
        total_confirmed: 0,
        total_unconfirmed: 0,
        total_earnings_confirmed: 0,
        total_earnings_unconfirmed: 0,
      });

      const storedLastId = parseInt(localStorage.getItem("lastSeenAppointmentId") || "0", 10);
      const unseenIds = new Set(
        data.filter((a) => getAppointmentId(a) > storedLastId).map((a) => getAppointmentId(a))
      );
      setNewAppointmentIds(unseenIds);
    } catch (err) {
      console.error(err);
      setError("Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      api
        .get("/appointments", { params: { month: currentMonth() } })
        .then((res) => {
          const latest = res.data || [];
          const currentMaxId =
            appointmentsRef.current.length > 0
              ? Math.max(...appointmentsRef.current.map((a) => getAppointmentId(a)))
              : 0;
          const latestMaxId =
            latest.length > 0 ? Math.max(...latest.map((a) => getAppointmentId(a))) : 0;

          if (latestMaxId > currentMaxId) {
            setAppointments(latest);
          }

          const storedLastId = parseInt(localStorage.getItem("lastSeenAppointmentId") || "0", 10);
          const unseenIds = new Set(
            latest.filter((a) => getAppointmentId(a) > storedLastId).map((a) => getAppointmentId(a))
          );
          setNewAppointmentIds(unseenIds);
        })
        .catch(() => { });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleBellClick = () => {
    if (showNewOnly) {
      setShowNewOnly(false);
      setNotificationAppointmentIds(new Set());
      return;
    }

    if (newAppointmentIds.size === 0) return;

    setNotificationAppointmentIds(new Set(newAppointmentIds));

    const maxId = appointments.length > 0
      ? Math.max(...appointments.map((a) => getAppointmentId(a)))
      : 0;
    localStorage.setItem("lastSeenAppointmentId", String(maxId));
    setNewAppointmentIds(new Set());
    setShowNewOnly(true);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-[#29AB87] dark:text-white tracking-tight">Earnings and Reports</h1>
          <p className="text-sm text-muted mt-1">You can see and download earnings,appointments,and summary report here</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleBellClick}
            className="relative rounded-full card p-2 shadow-sm hover:bg-offwhite-100 dark:hover:bg-surface-2"
            title={showNewOnly ? "Show all appointments" : "Show new appointments"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {newAppointmentIds.size > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                {newAppointmentIds.size}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div className="card p-4">
            <p className="text-xs uppercase tracking-wide text-muted">Total Confirmed Appointments</p>
            <p className="mt-1 text-2xl font-bold text-charcoal dark:text-white">{summary.total_confirmed}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs uppercase tracking-wide text-muted">Total Unconfirmed (In Cart, Pendings) Appointments</p>
            <p className="mt-1 text-2xl font-bold text-charcoal dark:text-white">{summary.total_unconfirmed}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs uppercase tracking-wide text-muted">Total Earnings (Confirmed)</p>
            <p className="mt-1 text-2xl font-bold text-sacramento">$ {Number(summary.total_earnings_confirmed).toLocaleString()}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs uppercase tracking-wide text-muted">Total Earnings (Unconfirmed)</p>
            <p className="mt-1 text-2xl font-bold text-muted">$ {Number(summary.total_earnings_unconfirmed).toLocaleString()}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs uppercase tracking-wide text-muted">Total Refunds</p>
            <p className="mt-1 text-2xl font-bold text-muted">$ {Number(summary.total_refunds || 0).toLocaleString()}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs uppercase tracking-wide text-muted">Total Estimated Earnings</p>
            <p className="mt-1 text-2xl font-bold text-sacramento">
              $ {Number(Number(summary.total_earnings_confirmed) + Number(summary.total_earnings_unconfirmed)).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <PackagePopularityChart appointments={appointments} isDark={isDark} />
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 mb-6">
          <Link to="/admin/earning-reports" className="card block p-6 transition hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-charcoal dark:text-white">Earning Reports</h2>
              <p className="text-sm text-muted mt-0.5">Check your earnings and download the report as PDF.</p>
            </div>
          </Link>

          <Link to="/admin/booking-summary" className="card block p-6 transition hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-charcoal dark:text-white">Booking Summary</h2>
              <p className="text-sm text-muted mt-0.5">Check your annual summary and monthly salary.</p>
            </div>
          </Link>
        </div>
      )}

      {loading && <p className="text-muted">Loading...</p>}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 dark:bg-red-950/30 dark:border-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}