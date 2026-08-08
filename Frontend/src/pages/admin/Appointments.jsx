import { useEffect, useMemo, useState } from "react";
import api from "../../axios";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/appointments");
      setAppointments(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal dark:text-white">Appointments</h1>
          <p className="text-sm text-muted mt-1">View customer booking details and assigned driver.</p>
        </div>

        <button className="btn-primary" type="button">
          + Add Appointments
        </button>
      </div>

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : error ? (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 dark:bg-red-950/30 dark:border-red-900/30 dark:text-red-400">
          {error}
        </div>
      ) : sorted.length === 0 ? (
        <p className="text-muted">No appointments found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border-light dark:border-border-dark">
          <table className="min-w-full bg-surface text-sm">
           <thead className="bg-[#29AB87] text-white uppercase text-xs dark:bg-[#29AB87]">
              <tr>
                <th className="px-4 py-3 text-left">Booking ID</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Pickup</th>
                <th className="px-4 py-3 text-left">Assigned Driver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {sorted.map((a) => (
                <tr key={a.Booking_ID} className="hover:bg-offwhite-100 dark:hover:bg-surface-2">
                  <td className="px-4 py-3 font-mono text-charcoal dark:text-white">#{a.Booking_ID}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-charcoal dark:text-white">
                      {a.First_Name} {a.Last_Name}
                    </div>
                    <div className="text-xs text-muted">{a.Customer_Type || ""}</div>
                  </td>
                  <td className="px-4 py-3 text-muted font-mono">{a.Phone_No}</td>
                  <td className="px-4 py-3 text-muted">{a.Email}</td>
                  <td className="px-4 py-3 text-charcoal/80 dark:text-white/80">
                    <div className="font-medium">{a.Pickup_Location}</div>
                    <div className="text-xs text-muted">
                      {a.Booking_Date} • {a.Pickup_Time}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-charcoal dark:text-white">
                    <div className="font-medium">{a.Driver_Name || "Unassigned"}</div>
                    <div className="text-xs text-muted">{a.Driver_Phone_Number || ""}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}