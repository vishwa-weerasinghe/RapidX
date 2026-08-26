import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download } from "lucide-react";
import api from "../../axios";
import { useTheme } from "../../context/ThemeContext";
import { generateMonthlySummaryPdf } from "../../utils/generateMonthlySummaryPdf";
import { generateAnnualReportPdf } from "../../utils/generateAnnualReportPdf";
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

  const currentMonth = useCallback(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const fetchData = useCallback(async () => {
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
  }, [currentMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---------- Annual Booking Report ----------
  const [reportYear, setReportYear] = useState(String(new Date().getFullYear()));
  const [annualReport, setAnnualReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(true);

  const yearOptions = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => String(now - i));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setReportLoading(true);
    api
      .get("/appointments/annual-report", { params: { year: reportYear } })
      .then((res) => {
        if (!cancelled) setAnnualReport(res.data || null);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setAnnualReport(null);
      })
      .finally(() => {
        if (!cancelled) setReportLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reportYear]);

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
  }, [currentMonth]);

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

  const sorted = useMemo(() => {
    return [...appointments]
      .filter((a) => a.Status === "Confirmed")
      .filter((a) => {
        if (!showNewOnly) return true;
        return notificationAppointmentIds.has(getAppointmentId(a));
      })
      .sort((a, b) => {
        const ad = a.Booking_Date || "";
        const bd = b.Booking_Date || "";
        if (ad === bd) return (a.Pickup_Time || "").localeCompare(b.Pickup_Time || "");
        return ad.localeCompare(bd);
      });
  }, [appointments, showNewOnly, notificationAppointmentIds]);

  // Deterministic shades for each package name
  const packageShades = {
    light: [
      "#ffffff", // pure white
      "#faf6f0", // warm off-white
      "#f2ede3", // light warm beige
      "#e8efe4", // light sage tint
      "#dfebdd", // sage green
      "#d4e6da", // mint sage
      "#cde6dc", // light teal
      "#e6ebdf", // olive-tinted white
      "#d7e5c8", // light olive green
      "#c8e0d4", // medium sage-teal
    ],
    dark: [
      "#182a1f", // deepest green
      "#1f3527", // very dark green
      "#29402f", // dark green
      "#24423a", // dark teal
      "#2f4d3b", // forest green
      "#365844", // medium forest
      "#2c4a2c", // dark olive
      "#3d5c47", // sage dark
      "#46684e", // lighter green
      "#506b57", // moss
    ],
  };

  const getPackageShade = (packageName) => {
    const name = String(packageName || "").trim().toLowerCase();
    const shades = packageShades[isDark ? "dark" : "light"];
    if (!name) return shades[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    }
    return shades[hash % shades.length];
  };

  return (
    <div className="flex flex-col p-6">
      <div className="order-1 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal dark:text-white">Appointment of current month</h1>
          <p className="text-sm text-muted mt-1">View summarised booking details for this month.</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => generateMonthlySummaryPdf(summary, sorted, currentMonth())}
            className="inline-flex items-center gap-2 rounded-full card px-3 py-2 text-sm font-semibold shadow-sm hover:bg-offwhite-100 dark:hover:bg-surface-2"
            title="Download monthly summary as PDF"
          >
            <Download className="h-4 w-4 text-muted" />
            Monthly PDF
          </button>
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

      {!loading && !error && (
        <div className="order-2">
          <PackagePopularityChart appointments={appointments} isDark={isDark} />
        </div>
      )}

      {/* Monthly Summary */}
      {!loading && !error && (
        <div className="order-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="card p-4">
            <p className="text-xs uppercase tracking-wide text-muted">Total Confirmed Appointments</p>
            <p className="mt-1 text-2xl font-bold text-charcoal dark:text-white">{summary.total_confirmed}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs uppercase tracking-wide text-muted">Total Unconfirmed(In cart) Appointments</p>
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
            <p className="text-xs uppercase tracking-wide text-muted">Total Earnings</p>
            <p className="mt-1 text-2xl font-bold text-sacramento">
              $ {Number(Number(summary.total_earnings_confirmed) + Number(summary.total_earnings_unconfirmed)).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* ---------- Annual Booking Report ---------- */}
      {!loading && !error && (
        <div className="order-5 card p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-charcoal dark:text-white">Annual report</h2>
              <p className="text-sm text-muted mt-0.5">Month-by-month overview of every booking in the year.</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={reportYear}
                onChange={(e) => setReportYear(e.target.value)}
                className="form-input py-1.5 text-sm"
                title="Select report year"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => annualReport && generateAnnualReportPdf(annualReport)}
                disabled={!annualReport}
                className="inline-flex items-center gap-2 rounded-full card px-3 py-2 text-sm font-semibold shadow-sm hover:bg-offwhite-100 dark:hover:bg-surface-2 disabled:opacity-50"
                title="Download annual report as PDF"
              >
                <Download className="h-4 w-4 text-muted" />
                Annual PDF
              </button>
            </div>
          </div>

          {reportLoading ? (
            <p className="text-sm text-muted">Loading annual report...</p>
          ) : !annualReport ? (
            <p className="text-sm text-muted">Failed to load the annual report.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border-light dark:border-border-dark">
              <table className="min-w-full bg-surface text-sm">
                <thead className="bg-[#29AB87] text-white uppercase text-xs dark:bg-[#29AB87]">
                  <tr>
                    <th className="px-4 py-3 text-left">Month</th>
                    <th className="px-4 py-3 text-center">Total Confirmed Bookings</th>
                    <th className="px-4 py-3 text-center">Total In Cart Bookings</th>
                    <th className="px-4 py-3 text-center">Total Pending Bookings</th>
                    <th className="px-4 py-3 text-center">Total Cancelled Bookings</th>
                    <th className="px-4 py-3 text-right">Earnings from Confirmed Bookings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {annualReport.rows.map((r) => (
                    <tr key={r.month} className="hover:bg-offwhite-100 dark:hover:bg-surface-2">
                      <td className="px-4 py-2 font-medium text-charcoal dark:text-white">{r.label}</td>
                      <td className="px-4 py-2 text-center text-charcoal/80 dark:text-white/80">{r.total_confirmed}</td>
                      <td className="px-4 py-2 text-center text-charcoal/80 dark:text-white/80">{r.total_in_cart}</td>
                      <td className="px-4 py-2 text-center text-charcoal/80 dark:text-white/80">{r.total_pending}</td>
                      <td className="px-4 py-2 text-center text-charcoal/80 dark:text-white/80">{r.total_cancelled}</td>
                      <td className="px-4 py-2 text-right font-mono text-sacramento">$ {Number(r.earnings_confirmed).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-offwhite-100 dark:bg-surface-2 font-bold">
                  <tr>
                    <td className="px-4 py-3 text-charcoal dark:text-white">Entire Year ({annualReport.year})</td>
                    <td className="px-4 py-3 text-center text-charcoal dark:text-white">{annualReport.totals.total_confirmed}</td>
                    <td className="px-4 py-3 text-center text-charcoal dark:text-white">{annualReport.totals.total_in_cart}</td>
                    <td className="px-4 py-3 text-center text-charcoal dark:text-white">{annualReport.totals.total_pending}</td>
                    <td className="px-4 py-3 text-center text-charcoal dark:text-white">{annualReport.totals.total_cancelled}</td>
                    <td className="px-4 py-3 text-right font-mono text-sacramento">$ {Number(annualReport.totals.earnings_confirmed).toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <p className="order-4 text-muted">Loading...</p>
      ) : error ? (
        <div className="order-4 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 dark:bg-red-950/30 dark:border-red-900/30 dark:text-red-400">
          {error}
        </div>
      ) : sorted.length === 0 ? (
        <p className="order-4 text-muted">
          {showNewOnly ? "No new appointments." : "No confirmed appointments found for this month."}
        </p>
      ) : (
        <div className="order-4 mb-6 overflow-x-auto rounded-lg border border-border-light dark:border-border-dark">
          <table className="min-w-full bg-surface text-sm">
           <thead className="bg-[#29AB87] text-white uppercase text-xs dark:bg-[#29AB87]">
              <tr>
                <th className="px-4 py-3 text-left">Booking ID</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Package</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {sorted.map((a) => {
                const isConfirmed = (a.Status || "").toLowerCase() === "confirmed";
                const baseShade = getPackageShade(a.Package_Name);
                const isNew = newAppointmentIds.has(getAppointmentId(a)) || notificationAppointmentIds.has(getAppointmentId(a));
                return (
                  <tr
                    key={a.Booking_ID}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isDark ? "#2f4437" : "#ffffff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = baseShade;
                    }}
                    style={{ backgroundColor: baseShade, color: isDark ? "#e5e7eb" : "#1f2937" }}
                    className={isNew ? "ring-1 ring-sacramento/30" : ""}
                  >
                    <td className="px-4 py-3 font-mono text-charcoal dark:text-white">#{a.Booking_ID}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-charcoal dark:text-white">
                        {a.First_Name} {a.Last_Name}
                      </div>
                      <div className="text-xs text-muted">
                        {a.Booking_Date} • {a.Pickup_Time || ""}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-charcoal/80 dark:text-white/80">{a.Booking_Date}</td>
                    <td className="px-4 py-3 text-charcoal/80 dark:text-white/80">
                      <div className="font-medium">{a.Package_Name || "—"}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-charcoal dark:text-white">$ {Number(a.Payment || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                          isConfirmed
                            ? "bg-sacramento/10 text-sacramento"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}
                      >
                        {a.Status || "Unconfirmed"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showNewOnly && newAppointmentIds.size === 0 && !loading && (
        <p className="order-4 mt-2 text-sm text-muted">No new appointments to show.</p>
      )}
    </div>
  );
}
