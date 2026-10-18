import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Car, Search, Plus, Edit3, Trash2, X, RefreshCw, Eye, Users } from "lucide-react";
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
      setVehicles(Array.isArray(res.data) ? res.data : []);
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
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await api.delete(`/vehicles/${id}`);
      setVehicles((prev) => prev.filter((v) => v.Vehicle_ID !== id));
      if (showVehicleResults) {
        setVehicleResults((prev) => prev.filter((v) => v.Vehicle_ID !== id));
      }
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
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Header Area */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-sacramento/10 dark:bg-sacramento-900/40 text-sacramento dark:text-sacramento-300">
            <Car size={24} strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Safari Fleet Vehicles
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Inspect jeep models, passenger seating capacities, and assigned drivers.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/admin/vehicles/create")}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sacramento hover:bg-sacramento-600 dark:bg-castleton-500 dark:hover:bg-castleton-600 text-white font-bold text-sm shadow-sm transition-all active:scale-95"
        >
          <Plus size={16} />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#16231c] p-3.5 sm:p-4 rounded-2xl border border-border-light dark:border-border-dark/60 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by vehicle number, type, ID..."
              className="w-full pl-10 pr-9 py-2 rounded-xl text-sm bg-slate-50 dark:bg-surface-2 border border-slate-200/80 dark:border-border-dark text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sacramento/30"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={14} />
              </button>
            )}
          </div>

        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>
            {loading ? "Syncing..." : `${filteredVehicles.length} of ${vehicles.length} vehicles`}
          </span>
          <button
            type="button"
            onClick={fetchVehicles}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-2 text-slate-500 hover:text-sacramento transition-colors"
            title="Refresh List"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Matched Vehicles Modal / Card Container */}
      {showVehicleResults && (
        <div className="rounded-3xl border border-amber-200/80 bg-amber-50/40 p-5 sm:p-6 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                Matched Fleet Overview
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowVehicleResults(false)}
              aria-label="Close vehicle results"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {vehicleResults.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">No vehicles match the current filter criteria.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {vehicleResults.map((vehicle) => (
                <div
                  key={vehicle.Vehicle_ID}
                  className="rounded-2xl border border-border-light dark:border-border-dark/60 bg-white dark:bg-[#16231c] p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sacramento dark:text-sacramento-300 bg-sacramento/10 dark:bg-sacramento-900/40 px-2 py-0.5 rounded-md">
                      #{vehicle.Vehicle_ID}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {vehicle.No_of_Seats} Seats
                    </span>
                  </div>
                  <p className="text-lg font-black text-slate-900 dark:text-white">
                    {vehicle.Vehicle_No}
                  </p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    Type: <span className="text-slate-700 dark:text-slate-200">{vehicle.Vehicle_Type}</span>
                  </p>
                  {vehicle.driver ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <Users size={12} className="text-sacramento" />
                      <span>{vehicle.driver.Driver_Name}</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Driver: #{vehicle.Driver_ID || "Unassigned"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full border-3 border-emerald-100 border-t-sacramento animate-spin" />
          <p className="text-sm font-semibold text-slate-400 animate-pulse">Loading fleet vehicles...</p>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="bg-white dark:bg-[#16231c] rounded-3xl border border-border-light dark:border-border-dark/60 p-12 text-center">
          <Car size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">No Vehicles Registered</h3>
          <p className="text-xs text-slate-400 mb-5">Add safari jeeps and vehicles to configure operations.</p>
          <button
            onClick={() => navigate("/admin/vehicles/create")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sacramento text-white text-xs font-bold"
          >
            <Plus size={14} /> Add First Vehicle
          </button>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="bg-white dark:bg-[#16231c] rounded-3xl border border-border-light dark:border-border-dark/60 p-10 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No vehicles match your search &quot;<span className="font-semibold">{search}</span>&quot;.
          </p>
          <button
            onClick={() => setSearch("")}
            className="mt-3 text-xs font-bold text-sacramento dark:text-sacramento-300 underline"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <>
          {/* Mobile Card View (visible on < sm screens) */}
          <div className="grid grid-cols-1 gap-3.5 sm:hidden">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.Vehicle_ID}
                className="bg-white dark:bg-[#16231c] p-4 rounded-2xl border border-border-light dark:border-border-dark/60 shadow-sm flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-sacramento/10 text-sacramento dark:text-sacramento-300">
                      <Car size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {vehicle.Vehicle_No}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-400">
                        ID: #{vehicle.Vehicle_ID}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/admin/vehicles/${vehicle.Vehicle_ID}/edit`}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-surface-2 text-slate-600 dark:text-slate-300 hover:text-sacramento transition-colors"
                      title="Edit Vehicle"
                    >
                      <Edit3 size={15} />
                    </Link>
                    <button
                      onClick={() => handleDelete(vehicle.Vehicle_ID)}
                      className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                      title="Delete Vehicle"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-light/60 dark:border-border-dark/40 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-surface-2/60 text-center">
                    <span className="block text-[10px] text-slate-400 font-semibold">Type</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                      {vehicle.Vehicle_Type}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-surface-2/60 text-center">
                    <span className="block text-[10px] text-slate-400 font-semibold">Capacity</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {vehicle.No_of_Seats} Seats
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-surface-2/60 text-center">
                    <span className="block text-[10px] text-slate-400 font-semibold">Driver</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      #{vehicle.Driver_ID}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop & Tablet Table (visible on sm and larger screens) */}
          <div className="hidden sm:block overflow-hidden rounded-3xl bg-white dark:bg-[#16231c] border border-border-light dark:border-border-dark/60 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-surface-2/40 text-[11px] text-slate-400 dark:text-slate-200 font-bold uppercase tracking-wider border-b border-border-light/60 dark:border-border-dark/40">
                    <th className="px-5 py-3.5 text-left">Vehicle ID</th>
                    <th className="px-5 py-3.5 text-left">Vehicle Number</th>
                    <th className="px-5 py-3.5 text-left">Model / Type</th>
                    <th className="px-5 py-3.5 text-center">Capacity</th>
                    <th className="px-5 py-3.5 text-left">Assigned Driver</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light/60 dark:divide-border-dark/40">
                  {filteredVehicles.map((vehicle) => (
                    <tr
                      key={vehicle.Vehicle_ID}
                      className="hover:bg-slate-50/60 dark:hover:bg-surface-2/20 transition-colors"
                    >
                      <td className="px-5 py-4 font-mono font-semibold text-xs text-slate-500 dark:text-slate-400">
                        #{vehicle.Vehicle_ID}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-sacramento/10 text-sacramento dark:text-sacramento-300">
                            <Car size={16} />
                          </div>
                          <span className="font-extrabold text-slate-900 dark:text-white">
                            {vehicle.Vehicle_No}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300 font-medium">
                        {vehicle.Vehicle_Type}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-surface-2 text-slate-700 dark:text-slate-300">
                          {vehicle.No_of_Seats} Seats
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300 font-mono text-xs">
                        #{vehicle.Driver_ID}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            to={`/admin/vehicles/${vehicle.Vehicle_ID}/edit`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sacramento hover:bg-slate-100 dark:hover:bg-surface-2 transition-colors"
                            title="Edit Vehicle"
                          >
                            <Edit3 size={15} />
                          </Link>
                          <button
                            onClick={() => handleDelete(vehicle.Vehicle_ID)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Delete Vehicle"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
