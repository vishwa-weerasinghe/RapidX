import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../axios";

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Vehicles</h1>
        <button
          onClick={() => navigate("/admin/vehicles/create")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          + Add Vehicle
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : vehicles.length === 0 ? (
        <p className="text-gray-500">No vehicles found.</p>
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
              {vehicles.map((vehicle) => (
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
