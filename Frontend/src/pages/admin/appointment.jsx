import { useEffect, useMemo, useState } from "react";
import api from "../../axios";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [summary, setSummary] = useState({
    total_confirmed: 0,
    total_unconfirmed: 0,
    total_earnings_confirmed: 0,
    total_earnings_unconfirmed: 0,
  });
  const [month, setMonth] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async (selectedMonth) => {
    try {
      setLoading(true);
      setError("");
      const params = selectedMonth ? { month: selectedMonth } : {};
      const [appRes, sumRes] = await Promise.all([
        api.get("/appointments", { params }),
        api.get("/appointments/summary", { params }),
      ]);
      setAppointments(appRes.data || []);
      setSummary(sumRes.data || {
        total_confirmed: 0,
        total_unconfirmed: 0,
        total_earnings_confirmed: 0,
        total_earnings_unconfirmed: 0,
      });
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

  const handleMonthChange = (e) => {
    const value = e.target.value;
    setMonth(value);
    fetchData(value);
  };

  const sorted = useMemo(() => {
    return [...appointments].sort((a, b) => {
      const ad = a.Booking_Date || "";
      const bd = b.Booking_Date || "";
      if (ad === bd) return (a.Pickup_Time || "").localeCompare(b.Pickup_Time || "");
      return ad.localeCompare(bd);
    });
  }, [appointments]);

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-charcoal dark:text-white">Appointments</h1>
          <p className="text-sm text-muted mt-1">View customer booking details and assigned driver.</p>
        </div>

        <label className="flex items-center gap-2 text-sm text-muted">
          <span>Filter by month:</span>
          <input
            type="month"
            value={month}
            onChange={handleMonthChange}
            className="form-input max-w-[180px]"
          />
          {month && (
            <button
              type="button"
              onClick={() => {
                setMonth("");
                fetchData("");
              }}
              className="btn-secondary text-sm"
            >
              Clear
            </button>
          )}
        </label>
      </div>

      {/* Summary Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <p className="text-xs uppercase tracking-wide text-muted">Total Confirmed Appointments</p>
            <p className="mt-1 text-2xl font-bold text-charcoal dark:text-white">{summary.total_confirmed}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs uppercase tracking-wide text-muted">Total Unconfirmed Appointments</p>
            <p className="mt-1 text-2xl font-bold text-charcoal dark:text-white">{summary.total_unconfirmed}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs uppercase tracking-wide text-muted">Total Earnings (Confirmed)</p>
            <p className="mt-1 text-2xl font-bold text-sacramento">LKR {Number(summary.total_earnings_confirmed).toLocaleString()}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs uppercase tracking-wide text-muted">Total Earnings (Unconfirmed)</p>
            <p className="mt-1 text-2xl font-bold text-muted">LKR {Number(summary.total_earnings_unconfirmed).toLocaleString()}</p>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : error ? (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 dark:bg-red-950/30 dark:border-red-900/30 dark:text-red-400">
          {error}
        </div>
      ) : sorted.length === 0 ? (
        <p className="text-muted">
          {month ? "No appointments found for the selected month." : "No appointments found."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border-light dark:border-border-dark">
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
                return (
                  <tr key={a.Booking_ID} className="hover:bg-offwhite-100 dark:hover:bg-surface-2">
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
                    <td className="px-4 py-3 font-mono text-charcoal dark:text-white">LKR {Number(a.Payment || 0).toLocaleString()}</td>
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
    </div>
  );
}