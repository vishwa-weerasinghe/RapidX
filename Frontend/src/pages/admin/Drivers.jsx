import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../axios";

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/drivers");
      setDrivers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this driver?")) return;
    try {
      await api.delete(`/drivers/${id}`);
      setDrivers((prev) => prev.filter((d) => d.Driver_ID !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete driver.");
    }
  };

  const filteredDrivers = drivers.filter((driver) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return String(driver.Driver_Name || "").toLowerCase().includes(q);
  });

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-charcoal dark:text-white">Drivers</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35m1.35-5.4a6.75 6.75 0 11-13.5 0 6.75 6.75 0 0113.5 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by driver name..."
              className="form-input w-full sm:w-64 pl-9"
            />
          </div>
          <button
            onClick={() => navigate("/admin/drivers/create")}
            className="btn-primary"
          >
            + Add Driver
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : drivers.length === 0 ? (
        <p className="text-muted">No drivers found.</p>
      ) : filteredDrivers.length === 0 ? (
        <p className="text-muted">
          No drivers match your search for "{search.trim()}".
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border-light dark:border-border-dark">
          <table className="min-w-full bg-surface text-sm">
            <thead className="bg-[#29AB87] text-white uppercase text-xs dark:bg-[#29AB87]">
              <tr>
                <th className="px-4 py-3 text-left">Driver ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Phone Number</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {filteredDrivers.map((driver) => (
                <tr key={driver.Driver_ID} className="hover:bg-offwhite-100 dark:hover:bg-surface-2">
                  <td className="px-4 py-3 font-medium text-charcoal dark:text-white">
                    #{driver.Driver_ID}
                  </td>
                  <td className="px-4 py-3 text-charcoal dark:text-white font-medium">
                    {driver.Driver_Name}
                  </td>
                  <td className="px-4 py-3 text-muted font-mono">
                    {driver.Phone_Number}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {driver.Email}
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <Link
                      to={`/admin/drivers/${driver.Driver_ID}/edit`}
                      className="text-sacramento hover:underline font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(driver.Driver_ID)}
                      className="text-red-600 hover:underline font-medium dark:text-red-400"
                    >
                      Delete
                    </button>
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