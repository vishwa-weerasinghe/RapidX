
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../axios";

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await api.get("/packages");
      setPackages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this package?")) return;
    try {
      await api.delete(`/packages/${id}`);
      setPackages((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete package.");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Packages</h1>
        <button
          onClick={() => navigate("/admin/packages/create")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          + Add Package
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : packages.length === 0 ? (
        <p className="text-gray-500">No packages found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Adult Price</th>
                <th className="px-4 py-3 text-left">Child Price</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
           <tbody className="divide-y divide-gray-100">
                {packages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">
                        {pkg.Package_Name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                        {pkg.Description}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                        Rs. {Number(pkg.Price_for_adult).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                        Rs. {Number(pkg.Price_for_child).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                        <Link
                        to={`/admin/packages/${pkg.id}/edit`}
                        className="text-blue-600 hover:underline"
                        >
                        Edit
                        </Link>
                        <button
                        onClick={() => handleDelete(pkg.id)}
                        className="text-red-600 hover:underline"
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