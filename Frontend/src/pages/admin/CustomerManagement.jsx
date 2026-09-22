import { useEffect, useMemo, useState } from "react";
import { Mail, Phone, RefreshCw, Search, Users } from "lucide-react";
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
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-sacramento/10 p-3 text-sacramento dark:bg-sacramento/20 dark:text-castleton-300">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-charcoal dark:text-white sm:text-3xl">
                Customer Management
              </h1>
              <p className="mt-1 text-sm text-muted">
                View registered safari customers and their contact details.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative block">
            <span className="sr-only">Search customers</span>
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customers..."
              className="form-input w-full pl-9 sm:w-64"
            />
          </label>
          <button
            type="button"
            onClick={fetchCustomers}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border-light px-4 py-2 text-sm font-semibold text-charcoal transition hover:bg-offwhite-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-border-dark dark:text-white dark:hover:bg-surface-2"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between text-sm text-muted">
        <span>
          {loading ? "Loading customers..." : `${filteredCustomers.length} customer${filteredCustomers.length === 1 ? "" : "s"}`}
        </span>
        {search && !loading && <span>Filtered by &quot;{search}&quot;</span>}
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <p>{error}</p>
          <button type="button" onClick={fetchCustomers} className="mt-3 font-semibold underline">
            Try again
          </button>
        </div>
      ) : loading ? (
        <div className="rounded-xl border border-border-light bg-surface p-8 text-center text-muted dark:border-border-dark">
          Loading registered customers...
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="rounded-xl border border-border-light bg-surface p-8 text-center text-muted dark:border-border-dark">
          {search ? "No customers match your search." : "No registered customers found."}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border-light dark:border-border-dark">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-surface text-sm">
              <thead className="bg-sacramento text-left text-xs uppercase tracking-wide text-white dark:bg-sacramento-900">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">NIC</th>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Bookings</th>
                  <th className="px-4 py-3">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.Customer_ID} className="transition-colors hover:bg-offwhite-100 dark:hover:bg-surface-2">
                    <td className="px-4 py-4 align-top">
                      <p className="font-semibold text-charcoal dark:text-white">
                        {customer.First_Name} {customer.Last_Name}
                      </p>
                      <p className="mt-1 text-xs text-muted">#{customer.Customer_ID}</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <a href={`mailto:${customer.Email}`} className="flex items-center gap-2 text-sacramento hover:underline">
                        <Mail size={14} /> {customer.Email}
                      </a>
                      <a href={`tel:${customer.Phone_No}`} className="mt-2 flex items-center gap-2 text-muted hover:text-sacramento">
                        <Phone size={14} /> {customer.Phone_No}
                      </a>
                    </td>
                    <td className="px-4 py-4 align-top font-mono text-muted">{customer.NIC || "-"}</td>
                    <td className="px-4 py-4 align-top text-charcoal dark:text-slate-200">{customer.Country || "-"}</td>
                    <td className="px-4 py-4 align-top text-charcoal dark:text-slate-200">{customer.bookings_count ?? 0}</td>
                    <td className="px-4 py-4 align-top text-muted">{formatDate(customer.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
