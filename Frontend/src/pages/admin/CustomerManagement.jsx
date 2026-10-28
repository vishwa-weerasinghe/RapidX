import { useEffect, useMemo, useState } from "react";
import { Mail, Phone, RefreshCw, Search, Users, X } from "lucide-react";
import api from "../../axios";

const formatDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/admin/customers");
      setCustomers(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      console.error(requestError);
      setError("Unable to load registered customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return customers;

    return customers.filter((customer) =>
      [
        customer.First_Name,
        customer.Last_Name,
        [customer.First_Name, customer.Last_Name].filter(Boolean).join(" "),
        customer.Email,
        customer.Phone_No,
        customer.NIC,
        customer.Country,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [customers, search]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Header Area */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-sacramento/10 dark:bg-sacramento-900/40 text-sacramento dark:text-sacramento-300">
            <Users size={24} strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Customer Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              View registered safari customers, guest contact details, and account histories.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#16231c] p-3.5 sm:p-4 rounded-2xl border border-border-light dark:border-border-dark/60 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <label className="relative block">
            <span className="sr-only">Search customers</span>
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customers by name, email, phone, NIC..."
              className="w-full pl-10 pr-9 py-2 rounded-xl text-sm bg-slate-50 dark:bg-surface-2 border border-slate-200/80 dark:border-border-dark text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sacramento/30"
            />
          </label>
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>
            {loading ? "Syncing..." : `${filteredCustomers.length} of ${customers.length} customers`}
          </span>
          <button
            type="button"
            onClick={fetchCustomers}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-2 text-slate-500 hover:text-sacramento dark:hover:text-sacramento-300 transition-colors"
            title="Refresh List"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {actionMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <span>{actionMessage}</span>
          <button
            type="button"
            onClick={() => setActionMessage("")}
            className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-200"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/20 p-4 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={fetchCustomers} className="underline font-bold">
            Try again
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full border-3 border-emerald-100 border-t-sacramento animate-spin" />
          <p className="text-sm font-semibold text-slate-400 animate-pulse">Loading customer profiles...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white dark:bg-[#16231c] rounded-3xl border border-border-light dark:border-border-dark/60 p-12 text-center">
          <Users size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">No Customers Registered</h3>
          <p className="text-xs text-slate-400">New customer registrations will appear here automatically.</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white dark:bg-[#16231c] rounded-3xl border border-border-light dark:border-border-dark/60 p-10 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No customers match your search &quot;<span className="font-semibold">{search}</span>&quot;.
          </p>
          <button
            type="button"
            onClick={() => setSearch("")}
            className="mt-3 text-xs font-bold text-sacramento dark:text-sacramento-300 underline"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl bg-white dark:bg-[#16231c] border border-border-light dark:border-border-dark/60 shadow-sm">
          <div className="overflow-x-auto">
            <table className="admin-table min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-surface-2/40 text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider border-b border-border-light/60 dark:border-border-dark/40">
                  <th className="px-5 py-3.5 text-left">Customer</th>
                  <th className="px-5 py-3.5 text-left">Contact Channels</th>
                  <th className="px-5 py-3.5 text-left">NIC / ID</th>
                  <th className="px-5 py-3.5 text-left">Country</th>
                  <th className="px-5 py-3.5 text-center">Bookings</th>
                  <th className="px-5 py-3.5 text-left">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light/60 dark:divide-border-dark/40">
                {filteredCustomers.map((customer) => {
                  const initial = (customer.First_Name?.[0] ?? "C").toUpperCase();

                  return (
                    <tr
                      key={customer.Customer_ID}
                      className="hover:bg-slate-50/60 dark:hover:bg-surface-2/20 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sacramento to-castleton-400 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
                            {initial}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">
                              {customer.First_Name} {customer.Last_Name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              #{customer.Customer_ID}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1 text-xs">
                          {customer.Email && (
                            <a
                              href={`mailto:${customer.Email}`}
                              className="flex items-center gap-1.5 text-sacramento dark:text-sacramento-300 hover:underline"
                            >
                              <Mail size={12} className="shrink-0" />
                              <span className="truncate max-w-[170px]">{customer.Email}</span>
                            </a>
                          )}
                          {customer.Phone_No && (
                            <a
                              href={`tel:${customer.Phone_No}`}
                              className="flex items-center gap-1.5 font-mono text-slate-500 dark:text-slate-400 hover:text-slate-800"
                            >
                              <Phone size={12} className="shrink-0" />
                              <span>{customer.Phone_No}</span>
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {customer.NIC || "—"}
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {customer.Country || "—"}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-sacramento/10 text-sacramento dark:text-sacramento-300">
                          {customer.bookings_count ?? 0}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        {formatDate(customer.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
