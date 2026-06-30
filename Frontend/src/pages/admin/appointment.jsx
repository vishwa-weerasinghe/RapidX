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
      setError(err?.response?.data?.message || "Failed to load appointments.");
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
          <h1 className="text-2xl font-semibold text-gray-800">Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">View customer booking details and assigned driver.</p>
        </div>

        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          type="button"
        >
          + Add Appointments
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700">
          {error}
        </div>
      ) : sorted.length === 0 ? (
        <p className="text-gray-500">No appointments found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Booking ID</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Pickup</th>
                <th className="px-4 py-3 text-left">Assigned Driver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map((a) => (
                <tr key={a.Booking_ID} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-gray-800">#{a.Booking_ID}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">
                      {a.First_Name} {a.Last_Name}
                    </div>
                    <div className="text-xs text-gray-500">{a.Customer_Type || ""}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono">{a.Phone_No}</td>
                  <td className="px-4 py-3 text-gray-600">{a.Email}</td>
                  <td className="px-4 py-3 text-gray-700">
                    <div className="font-medium">{a.Pickup_Location}</div>
                    <div className="text-xs text-gray-500">
                      {a.Booking_Date} • {a.Pickup_Time}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-800">
                    <div className="font-medium">{a.Driver_Name || "Unassigned"}</div>
                    <div className="text-xs text-gray-500">{a.Driver_Phone_Number || ""}</div>
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

