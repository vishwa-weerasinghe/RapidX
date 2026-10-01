import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../axios";

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [vehicleResults, setVehicleResults] = useState([]);
  const [showVehicleResults, setShowVehicleResults] = useState(false);
  const navigate = useNavigate();

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get("/vehicles");
      setVehicles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this vehicle?")) return;
    try {
      await api.delete(`/vehicles/${id}`);
      setVehicles((prev) => prev.filter((v) => v.Vehicle_ID !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete vehicle.");
    }
  };

  const handleSeeVehicle = async () => {
    try {
      const driverResponse = await api.get("/drivers");
      const drivers = driverResponse.data || [];
      const driverMap = new Map(
        drivers.map((driver) => [Number(driver.Driver_ID), driver]),
      );

      const uniqueVehicles = Array.from(
        new Map(
          filteredVehicles.map((vehicle) => [Number(vehicle.Vehicle_ID), vehicle]),
        ).values(),
      );

      const matches = uniqueVehicles.map((vehicle) => ({
        ...vehicle,
        driver: driverMap.get(Number(vehicle.Driver_ID)) || null,
      }));

      setVehicleResults(matches);
      setShowVehicleResults(true);
    } catch (err) {
      console.error(err);
      const uniqueVehicles = Array.from(
        new Map(
          filteredVehicles.map((vehicle) => [Number(vehicle.Vehicle_ID), vehicle]),
        ).values(),
      );
      setVehicleResults(uniqueVehicles);
      setShowVehicleResults(true);
    }
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      String(vehicle.Vehicle_No || "").toLowerCase().includes(q) ||
      String(vehicle.Vehicle_Type || "").toLowerCase().includes(q) ||
      String(vehicle.Vehicle_ID || "").includes(q)
    );
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-black text-[#29AB87] dark:text-white tracking-tight">Vehicles</h1>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
                placeholder="Search by number or type..."
                className="form-input w-full sm:w-64 pl-9"
              />
            </div>
            <button
              type="button"
              onClick={handleSeeVehicle}
              className="btn-secondary"
              aria-label="See vehicle"
            >
              {filteredVehicles.length > 0 ? `See Vehicle (${filteredVehicles.length})` : "See Vehicle"}
            </button>
          </div>
          <button onClick={() => navigate("/admin/vehicles/create")} className="btn-primary">
            + Add Vehicle
          </button>
        </div>
      </div>

      {showVehicleResults && (
        <div className="mb-6 rounded-[18px] border border-[#d9e8df] bg-[#f7f3eb] p-4 shadow-[0_8px_18px_rgba(0,0,0,0.05)] dark:border-border-dark dark:bg-bg-dark">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-[15px] font-black text-[#1f3d36] dark:text-white">Matched vehicles</h2>
            <button
              type="button"
              onClick={() => setShowVehicleResults(false)}
              className="rounded-md px-2 py-1 text-lg leading-none text-[#3d4c44] hover:bg-[#e9e1d3] dark:text-white dark:hover:bg-surface-2"
              aria-label="Close vehicle results"
            >
              ×
            </button>
          </div>

          {vehicleResults.length === 0 ? (
            <p className="text-sm text-muted">No vehicles found for the current search.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {vehicleResults.map((vehicle) => (
                <div
                  key={vehicle.Vehicle_ID}
                  className="rounded-[14px] border border-[#d6e4d9] bg-[#edf6f0] p-4 shadow-sm"
                >
                  <p className="text-[12px] font-black uppercase tracking-wide text-[#2f7a6d]">
                    Vehicle #{vehicle.Vehicle_ID}
                  </p>
                  <p className="mt-2 text-[22px] font-extrabold leading-tight text-[#1f3d36]">
                    {vehicle.Vehicle_No}
                  </p>
                  <p className="mt-2 text-[15px] text-[#33463f]">Type: {vehicle.Vehicle_Type}</p>
                  <p className="text-[15px] text-[#33463f]">Seats: {vehicle.No_of_Seats}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : vehicles.length === 0 ? (
        <p className="text-muted">No vehicles found.</p>
      ) : filteredVehicles.length === 0 ? (
        <p className="text-muted">
          No vehicles match your search for "{search.trim()}".
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border-light dark:border-border-dark">
          <table className="min-w-full bg-surface text-sm">
           <thead className="bg-[#29AB87] text-white uppercase text-xs dark:bg-[#29AB87]">
              <tr>
                <th className="px-4 py-3 text-left">Vehicle ID</th>
                <th className="px-4 py-3 text-left">Vehicle Number</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-center">Seats</th>
                <th className="px-4 py-3 text-left">Driver ID</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.Vehicle_ID} className="hover:bg-offwhite-100 dark:hover:bg-surface-2">
                  <td className="px-4 py-3 font-medium text-charcoal dark:text-white">
                    #{vehicle.Vehicle_ID}
                  </td>
                  <td className="px-4 py-3 text-charcoal dark:text-white font-medium">
                    {vehicle.Vehicle_No}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {vehicle.Vehicle_Type}
                  </td>
                  <td className="px-4 py-3 text-center text-muted">
                    {vehicle.No_of_Seats}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    #{vehicle.Driver_ID}
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <Link
                      to={`/admin/vehicles/${vehicle.Vehicle_ID}/edit`}
                      className="text-sacramento hover:underline font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(vehicle.Vehicle_ID)}
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
