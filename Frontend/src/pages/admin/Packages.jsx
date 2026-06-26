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
    <div className="p-6 transition-colors duration-300">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-900">
          Packages
        </h1>

        <button
          onClick={() => navigate("/admin/packages/create")}
          className="
            bg-blue-600 dark:bg-slate-700
            hover:bg-blue-700 dark:hover:bg-slate-600
            text-white px-4 py-2 rounded-lg text-sm font-medium
            transition
          "
        >
          + Add Package
        </button>
      </div>

      {/* Loading / Empty */}
      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      ) : packages.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No packages found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">

          <table className="min-w-full text-sm bg-white dark:bg-gray-900">

            {/* Header */}
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Adult Price</th>
                <th className="px-4 py-3 text-left">Child Price</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">

              {packages.map((pkg) => (
                <tr
                  key={pkg.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">
                    {pkg.Package_Name}
                  </td>

                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-xs truncate">
                    {pkg.Description}
                  </td>

                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    Rs. {Number(pkg.Price_for_adult).toFixed(2)}
                  </td>

                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    Rs. {Number(pkg.Price_for_child).toFixed(2)}
                  </td>

                  <td className="px-4 py-3 text-right space-x-3">
                    <Link
                      to={`/admin/packages/${pkg.id}/edit`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className="text-red-600 dark:text-red-400 hover:underline"
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