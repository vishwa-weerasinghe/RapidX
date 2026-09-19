import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../axios";

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [search, setSearch] = useState("");
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

  const filteredPackages = packages.filter((pkg) => {
    const query = search.trim().toLowerCase();

    return (
      pkg.Package_Name?.toLowerCase().includes(query) ||
      pkg.Description?.toLowerCase().includes(query) ||
      String(pkg.price_one_adult ?? "").includes(query) ||
      String(pkg.price_more_adult ?? "").includes(query) ||
      String(pkg.price_child ?? "").includes(query)
    );
  });

  return (
    <div className="p-6 transition-colors duration-300">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl md:text-4xl font-black text-[#29AB87] dark:text-white tracking-tight">
          Packages
        </h1>

        <button
          onClick={() => navigate("/admin/packages/create")}
          className="btn-primary"
        >
          + Add Package
        </button>
      </div>

      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by package name, description, or price..."
        aria-label="Search packages"
        className="form-input w-full max-w-xl mb-6"
      />

      {/* Loading / Empty */}
      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : packages.length === 0 ? (
        <p className="text-muted">No packages found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border-light dark:border-border-dark">

          <table className="min-w-full text-sm bg-surface">

            {/* Header */}
            <thead className="bg-[#29AB87] text-white uppercase text-xs dark:bg-[#29AB87]">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Price (1 Adult)</th>
                <th className="px-4 py-3 text-left">Price (Per Adult 2+)</th>
                <th className="px-4 py-3 text-left">Child Price</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-border-light dark:divide-border-dark">

              {filteredPackages.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-muted">
                    No packages match your search.
                  </td>
                </tr>
              )}

              {filteredPackages.map((pkg) => (
                <tr
                  key={pkg.id}
                  className="hover:bg-offwhite-100 dark:hover:bg-surface-2 transition"
                >
                  <td className="px-4 py-3 font-medium text-charcoal dark:text-white">
                    {pkg.Package_Name}
                  </td>

                  <td className="px-4 py-3 text-muted max-w-xs truncate">
                    {pkg.Description}
                  </td>

                  <td className="px-4 py-3 text-charcoal/80 dark:text-white/80">
                    $ {Number(pkg.price_one_adult).toFixed(2)}
                  </td>

                  <td className="px-4 py-3 text-charcoal/80 dark:text-white/80">
                    $ {Number(pkg.price_more_adult).toFixed(2)}
                  </td>

                  <td className="px-4 py-3 text-charcoal/80 dark:text-white/80">
                    $ {Number(pkg.price_child).toFixed(2)}
                  </td>

                  <td className="px-4 py-3 text-right space-x-3">
                    <Link
                      to={`/admin/packages/${pkg.id}/edit`}
                      className="text-sacramento hover:underline"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className="text-red-600 hover:underline dark:text-red-400"
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