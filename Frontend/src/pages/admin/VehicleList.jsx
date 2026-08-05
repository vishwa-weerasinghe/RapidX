import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../axios";

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Vehicles</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
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
              className="w-full sm:w-64 rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => navigate("/admin/vehicles/create")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            + Add Vehicle
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : vehicles.length === 0 ? (
        <p className="text-gray-500">No vehicles found.</p>
      ) : filteredVehicles.length === 0 ? (
        <p className="text-gray-500">
          No vehicles match your search for "{search.trim()}".
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Vehicle ID</th>
                <th className="px-4 py-3 text-left">Vehicle Number</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-center">Seats</th>
                <th className="px-4 py-3 text-left">Driver ID</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.Vehicle_ID} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    #{vehicle.Vehicle_ID}
                  </td>
                  <td className="px-4 py-3 text-gray-800 font-medium">
                    {vehicle.Vehicle_No}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {vehicle.Vehicle_Type}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {vehicle.No_of_Seats}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    #{vehicle.Driver_ID}
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <Link
                      to={`/admin/vehicles/${vehicle.Vehicle_ID}/edit`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(vehicle.Vehicle_ID)}
                      className="text-red-600 hover:underline font-medium"
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
