import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import api from "../../axios";
import { generateAnnualEarningsPdf } from "../../utils/generateAnnualEarningsPdf";
import { generateMonthlyEarningsPdf } from "../../utils/generateMonthlyEarningsPdf";

export default function EarningReports() {
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [month, setMonth] = useState(`${year}-${String(new Date().getMonth() + 1).padStart(2, "0")}`);
  const [reportView, setReportView] = useState("annual");
  const [report, setReport] = useState(null);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, index) => String(current - index));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([
      api.get("/appointments/annual-report", { params: { year } }),
      api.get("/appointments/summary", { params: { month } }),
      api.get("/appointments", { params: { month } }),
    ])
      .then(([reportResponse, summaryResponse, bookingsResponse]) => {
        setReport(reportResponse.data || null);
        setMonthlySummary(summaryResponse.data || null);
        setBookings(bookingsResponse.data || []);
      })
      .catch(() => setError("Failed to load earning reports."))
      .finally(() => setLoading(false));
  }, [year, month]);

  const handleYearChange = (value) => {
    setYear(value);
    setMonth(`${value}-01`);
  };

  const packageRows = useMemo(() => {
    const packages = new Map();
    bookings.forEach((booking) => {
      const packageName = booking.Package_Name || "Unnamed Package";
      const row = packages.get(packageName) || {
        packageName,
        confirmed: 0,
        unconfirmed: 0,
        refund: 0,
        total: 0,
      };
      const status = String(booking.Status || "").toLowerCase();
      const payment = Number(booking.Payment || 0);
      if (status === "confirmed") {
        row.confirmed += payment;
      } else if (status === "cancelled") {
        if (booking.Payment_Status === "Success") row.refund += payment;
      } else {
        row.unconfirmed += payment;
      }
      row.total = row.confirmed + row.unconfirmed - row.refund;
      packages.set(packageName, row);
    });
    return [...packages.values()];
  }, [bookings]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/admin/earnings-and-reports" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-sacramento"><ArrowLeft size={16} /> Back to Earnings and Reports</Link>
          <h1 className="text-3xl font-black text-[#29AB87] dark:text-white">Earning Reports</h1>
          <p className="mt-1 text-sm text-muted">Check your earnings and download the report as PDF.</p>
        </div>
        <div className="flex items-end gap-3">
          <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
            Report
            <select value={reportView} onChange={(event) => setReportView(event.target.value)} className="form-input w-48 py-2 text-sm" title="Select report">
              <option value="monthly">Monthly Earnings</option>
              <option value="annual">Annual Earnings</option>
            </select>
          </label>
          <select value={year} onChange={(event) => handleYearChange(event.target.value)} className="form-input w-24 py-2 text-sm" title="Select report year">
            {years.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <button type="button" onClick={() => report && generateAnnualEarningsPdf(report)} disabled={!report} className="inline-flex items-center gap-2 rounded-full card px-4 py-2 text-sm font-semibold disabled:opacity-50" title="Download annual earnings report as PDF">
            <Download size={16} /> Download Annual PDF
          </button>
          <button type="button" onClick={() => monthlySummary && generateMonthlyEarningsPdf(packageRows, month)} disabled={!monthlySummary} className="inline-flex items-center gap-2 rounded-full card px-4 py-2 text-sm font-semibold disabled:opacity-50" title="Download monthly earnings report as PDF">
            <Download size={16} /> Download Monthly PDF
          </button>
        </div>
      </div>

      {loading ? <p className="text-muted">Loading earnings...</p> : error ? <p className="text-red-500">{error}</p> : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="card flex flex-col p-5"><p className="text-xs uppercase tracking-wide text-muted">Confirmed Earnings</p><p className="mt-auto pt-2 text-2xl font-bold text-sacramento">$ {Number(report?.totals?.earnings_confirmed || 0).toLocaleString()}</p></div>
            <div className="card flex flex-col p-5"><p className="text-xs uppercase tracking-wide text-muted">Unconfirmed Earnings</p><p className="mt-auto pt-2 text-2xl font-bold">$ {Number(report?.totals?.earnings_unconfirmed || 0).toLocaleString()}</p></div>
            <div className="card flex flex-col p-5"><p className="text-xs uppercase tracking-wide text-muted">Refund</p><p className="mt-auto pt-2 text-2xl font-bold text-red-600">$ {Number(report?.totals?.refunds || 0).toLocaleString()}</p></div>
            <div className="card flex flex-col p-5"><p className="text-xs uppercase tracking-wide text-muted">Total Earnings</p><p className="mt-auto pt-2 text-2xl font-bold text-sacramento">$ {Number((Number(report?.totals?.earnings_confirmed || 0) - Number(report?.totals?.refunds || 0))).toLocaleString()}</p></div>
          </div>

          {reportView === "monthly" && <div className="card p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-charcoal dark:text-white">Monthly Earnings</h2><p className="text-sm text-muted">Earnings grouped by package for {month}.</p></div><input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="form-input py-2 text-sm" /></div>
            <div className="overflow-x-auto rounded-lg border border-border-light dark:border-border-dark"><table className="min-w-full bg-surface text-sm"><thead className="bg-[#29AB87] text-xs uppercase text-white"><tr><th className="px-4 py-3 text-left">Package</th><th className="px-4 py-3 text-right">Confirmed Earnings</th><th className="px-4 py-3 text-right">Unconfirmed Earnings</th><th className="px-4 py-3 text-right">Refund</th><th className="px-4 py-3 text-right">Total</th></tr></thead><tbody className="divide-y divide-border-light dark:divide-border-dark">{packageRows.length === 0 ? <tr><td colSpan="5" className="px-4 py-6 text-center text-muted">No bookings for this month.</td></tr> : packageRows.map((row) => <tr key={row.packageName}><td className="px-4 py-3 font-medium">{row.packageName}</td><td className="px-4 py-3 text-right font-mono text-sacramento">$ {row.confirmed.toLocaleString()}</td><td className="px-4 py-3 text-right font-mono">$ {row.unconfirmed.toLocaleString()}</td><td className={`px-4 py-3 text-right font-mono ${row.refund !== 0 ? "text-red-600" : "text-charcoal dark:text-white"}`}>$ {row.refund.toLocaleString()}</td><td className="px-4 py-3 text-right font-mono font-bold text-sacramento">$ {row.total.toLocaleString()}</td></tr>)}</tbody></table></div>
          </div>}

          {reportView === "annual" && <div className="card p-4"><h2 className="mb-4 text-lg font-bold text-charcoal dark:text-white">Annual Earnings</h2><div className="overflow-x-auto rounded-lg border border-border-light dark:border-border-dark"><table className="min-w-full bg-surface text-sm"><thead className="bg-[#29AB87] text-xs uppercase text-white"><tr><th className="px-4 py-3 text-left">Month</th><th className="px-4 py-3 text-right">Confirmed Earnings</th><th className="px-4 py-3 text-right">Unconfirmed Earnings</th><th className="px-4 py-3 text-right">Refund</th><th className="px-4 py-3 text-right">Total</th></tr></thead><tbody className="divide-y divide-border-light dark:divide-border-dark">{report.rows.map((row) => <tr key={row.month}><td className="px-4 py-2">{row.label}</td><td className="px-4 py-2 text-right font-mono text-sacramento">$ {Number(row.earnings_confirmed).toLocaleString()}</td><td className="px-4 py-2 text-right font-mono">$ {Number(row.earnings_unconfirmed).toLocaleString()}</td><td className={`px-4 py-2 text-right font-mono ${Number(row.refunds) !== 0 ? "text-red-600" : "text-charcoal dark:text-white"}`}>$ {Number(row.refunds).toLocaleString()}</td><td className="px-4 py-2 text-right font-mono font-bold text-sacramento">$ {Number(row.total).toLocaleString()}</td></tr>)}</tbody><tfoot className="bg-offwhite-100 font-bold dark:bg-surface-2"><tr><td className="px-4 py-3">Entire Year ({report.year})</td><td className="px-4 py-3 text-right">$ {Number(report.totals.earnings_confirmed).toLocaleString()}</td><td className="px-4 py-3 text-right">$ {Number(report.totals.earnings_unconfirmed).toLocaleString()}</td><td className={`px-4 py-3 text-right ${Number(report.totals.refunds) !== 0 ? "text-red-600" : "text-charcoal dark:text-white"}`}>$ {Number(report.totals.refunds).toLocaleString()}</td><td className="px-4 py-3 text-right text-sacramento">$ {Number(report.totals.total).toLocaleString()}</td></tr></tfoot></table></div></div>}
        </>
      )}
    </div>
  );
}
