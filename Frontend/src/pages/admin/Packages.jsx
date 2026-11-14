import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, Search, Plus, Edit3, Trash2, X, RefreshCw, DollarSign, Compass } from "lucide-react";
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
      setPackages(Array.isArray(res.data) ? res.data : []);
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
    if (!confirm("Are you sure you want to delete this safari package?")) return;
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
    if (!query) return true;
    return (
      (pkg.Package_Name || "").toLowerCase().includes(query) ||
      (pkg.Description || "").toLowerCase().includes(query) ||
      String(pkg.price_one_adult ?? "").includes(query) ||
      String(pkg.price_more_adult ?? "").includes(query) ||
      String(pkg.price_child ?? "").includes(query)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Header Area */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-sacramento/10 dark:bg-sacramento-900/40 text-sacramento dark:text-sacramento-300">
            <Package size={24} strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Safari Tour Packages
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Configure tour durations, tiered admission pricing, and descriptions.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/admin/packages/create")}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sacramento hover:bg-sacramento-600 dark:bg-castleton-500 dark:hover:bg-castleton-600 text-white font-bold text-sm shadow-sm transition-all active:scale-95"
        >
          <Plus size={16} />
          <span>Add Package</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#16231c] p-3.5 sm:p-4 rounded-2xl border border-border-light dark:border-border-dark/60 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by package name, description, price..."
            className="w-full pl-10 pr-9 py-2 rounded-xl text-sm bg-slate-50 dark:bg-surface-2 border border-slate-200/80 dark:border-border-dark text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sacramento/30"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>
            {loading ? "Syncing..." : `${filteredPackages.length} of ${packages.length} packages`}
          </span>
          <button
            onClick={fetchPackages}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-2 text-slate-500 hover:text-sacramento dark:hover:text-sacramento-300 transition-colors"
            title="Refresh List"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full border-3 border-emerald-100 border-t-sacramento animate-spin" />
          <p className="text-sm font-semibold text-slate-400 animate-pulse">Loading packages...</p>
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-white dark:bg-[#16231c] rounded-3xl border border-border-light dark:border-border-dark/60 p-12 text-center">
          <Package size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">No Packages Configured</h3>
          <p className="text-xs text-slate-400 mb-5">Create your first safari package offer to accept bookings.</p>
          <button
            onClick={() => navigate("/admin/packages/create")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sacramento text-white text-xs font-bold"
          >
            <Plus size={14} /> Add First Package
          </button>
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="bg-white dark:bg-[#16231c] rounded-3xl border border-border-light dark:border-border-dark/60 p-10 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No packages match your search &quot;<span className="font-semibold">{search}</span>&quot;.
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
            {filteredPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white dark:bg-[#16231c] p-4 rounded-2xl border border-border-light dark:border-border-dark/60 shadow-sm flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-sacramento/10 text-sacramento dark:text-sacramento-300">
                      <Compass size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {pkg.Package_Name}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-400">
                        ID: #{pkg.id}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link
                      to={`/admin/packages/${pkg.id}/edit`}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-surface-2 text-slate-600 dark:text-slate-300 hover:text-sacramento dark:hover:text-sacramento-300 transition-colors"
                      title="Edit Package"
                    >
                      <Edit3 size={15} />
                    </Link>
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                      title="Delete Package"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {pkg.Description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {pkg.Description}
                  </p>
                )}

                {/* Price Breakdown Chips */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-light/60 dark:border-border-dark/40 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-surface-2/60 text-center">
                    <span className="block text-[10px] text-slate-400 font-semibold">1 Adult</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      ${Number(pkg.price_one_adult ?? 0).toFixed(0)}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-surface-2/60 text-center">
                    <span className="block text-[10px] text-slate-400 font-semibold">2+ Adults</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      ${Number(pkg.price_more_adult ?? 0).toFixed(0)}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-surface-2/60 text-center">
                    <span className="block text-[10px] text-slate-400 font-semibold">Child</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      ${Number(pkg.price_child ?? 0).toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop & Tablet Table (visible on sm and larger screens) */}
          <div className="hidden sm:block overflow-hidden rounded-3xl bg-white dark:bg-[#16231c] border border-border-light dark:border-border-dark/60 shadow-sm">
            <div className="overflow-x-auto">
              <table className="admin-table min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-surface-2/40 text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider border-b border-border-light/60 dark:border-border-dark/40">
                    <th className="px-5 py-3.5 text-left">Package Name</th>
                    <th className="px-5 py-3.5 text-left">Description</th>
                    <th className="px-5 py-3.5 text-right">1 Adult</th>
                    <th className="px-5 py-3.5 text-right">2+ Adults</th>
                    <th className="px-5 py-3.5 text-right">Child</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light/60 dark:divide-border-dark/40">
                  {filteredPackages.map((pkg) => (
                    <tr
                      key={pkg.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-sacramento/10 text-sacramento dark:text-sacramento-300">
                            <Compass size={16} />
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">
                              {pkg.Package_Name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">#{pkg.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {pkg.Description || "—"}
                      </td>
                      <td className="px-5 py-4 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                        ${Number(pkg.price_one_adult ?? 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-4 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                        ${Number(pkg.price_more_adult ?? 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-4 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                        ${Number(pkg.price_child ?? 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            to={`/admin/packages/${pkg.id}/edit`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sacramento dark:hover:text-sacramento-300 hover:bg-slate-100 dark:hover:bg-surface-2 transition-colors"
                            title="Edit Package"
                          >
                            <Edit3 size={15} />
                          </Link>
                          <button
                            onClick={() => handleDelete(pkg.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Delete Package"
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