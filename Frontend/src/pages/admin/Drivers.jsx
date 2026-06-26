import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../axios";

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Drivers</h1>
        <button
          onClick={() => navigate("/admin/drivers/create")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          + Add Driver
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : drivers.length === 0 ? (
        <p className="text-gray-500">No drivers found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Driver ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Phone Number</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {drivers.map((driver) => (
                <tr key={driver.Driver_ID} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    #{driver.Driver_ID}
                  </td>
                  <td className="px-4 py-3 text-gray-800 font-medium">
                    {driver.Driver_Name}
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono">
                    {driver.Phone_Number}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {driver.Email}
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <Link
                      to={`/admin/drivers/${driver.Driver_ID}/edit`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(driver.Driver_ID)}
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
