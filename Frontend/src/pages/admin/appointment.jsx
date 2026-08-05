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
      setError(err?.response?.data?.message || "Failed to load appointments.");
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
          <h1 className="text-2xl font-semibold text-gray-800">Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">View customer booking details and assigned driver.</p>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <span>Filter by month:</span>
          <input
            type="month"
            value={month}
            onChange={handleMonthChange}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {month && (
            <button
              type="button"
              onClick={() => {
                setMonth("");
                fetchData("");
              }}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              Clear
            </button>
          )}
        </label>
      </div>

      {/* Summary Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Total Confirmed Appointments</p>
            <p className="mt-1 text-2xl font-bold text-gray-800">{summary.total_confirmed}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Total Unconfirmed Appointments</p>
            <p className="mt-1 text-2xl font-bold text-gray-800">{summary.total_unconfirmed}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Total Earnings (Confirmed)</p>
            <p className="mt-1 text-2xl font-bold text-green-600">LKR {Number(summary.total_earnings_confirmed).toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Total Earnings (Unconfirmed)</p>
            <p className="mt-1 text-2xl font-bold text-gray-600">LKR {Number(summary.total_earnings_unconfirmed).toLocaleString()}</p>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700">
          {error}
        </div>
      ) : sorted.length === 0 ? (
        <p className="text-gray-500">
          {month ? "No appointments found for the selected month." : "No appointments found."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Booking ID</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Package</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map((a) => {
                const isConfirmed = (a.Status || "").toLowerCase() === "confirmed";
                return (
                  <tr key={a.Booking_ID} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-800">#{a.Booking_ID}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">
                        {a.First_Name} {a.Last_Name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {a.Booking_Date} • {a.Pickup_Time || ""}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{a.Booking_Date}</td>
                    <td className="px-4 py-3 text-gray-700">
                      <div className="font-medium">{a.Package_Name || "—"}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-800">LKR {Number(a.Payment || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                          isConfirmed
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
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
