import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import api from "../../axios";
import { generateAnnualReportPdf } from "../../utils/generateAnnualReportPdf";
import { generateMonthlySummaryPdf } from "../../utils/generateMonthlySummaryPdf";

export default function BookingSummary() {
  const currentYear = new Date().getFullYear();
  const currentMonth = `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState(currentMonth);
  const [reportView, setReportView] = useState("monthly");
  const [report, setReport] = useState(null);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [monthlyBookings, setMonthlyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([
      api.get("/appointments/annual-report", { params: { year } }),
      api.get("/appointments/summary", { params: { month } }),
      api.get("/appointments", { params: { month } }),
    ])
      .then(([annualResponse, monthlyResponse, bookingsResponse]) => {
        setReport(annualResponse.data || null);
        setMonthlySummary(monthlyResponse.data || null);
        setMonthlyBookings(bookingsResponse.data || []);
      })
      .catch(() => setError("Failed to load booking summary."))
      .finally(() => setLoading(false));
  }, [year, month]);

  const years = Array.from({ length: 6 }, (_, index) => String(currentYear - index));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/admin/earnings-and-reports" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-sacramento"><ArrowLeft size={16} /> Back to Earnings and Reports</Link>
          <h1 className="text-3xl font-black text-[#29AB87] dark:text-white">Booking Summary</h1>
          <p className="mt-1 text-sm text-muted">Check your annual summary and monthly salary.</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs font-semibold text-muted">Report<select value={reportView} onChange={(event) => setReportView(event.target.value)} className="form-input w-48 py-2 text-sm" title="Select report"><option value="monthly">Monthly Bookings</option><option value="annual">Annual Booking Summary</option></select></label>
          <select value={year} onChange={(event) => setYear(event.target.value)} className="form-input py-2 text-sm" title="Select summary year">{years.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <button type="button" onClick={() => report && generateAnnualReportPdf(report)} disabled={!report} className="inline-flex items-center gap-2 rounded-full card px-4 py-2 text-sm font-semibold disabled:opacity-50" title="Download annual booking summary as PDF"><Download size={16} /> Download Annual PDF</button>
          <button type="button" onClick={() => monthlySummary && generateMonthlySummaryPdf(monthlySummary, monthlyBookings, month)} disabled={!monthlySummary} className="inline-flex items-center gap-2 rounded-full card px-4 py-2 text-sm font-semibold disabled:opacity-50" title="Download monthly booking summary as PDF"><Download size={16} /> Download Monthly PDF</button>
        </div>
      </div>

      {loading ? <p className="text-muted">Loading booking summary...</p> : error ? <p className="text-red-500">{error}</p> : report && (
        <>
          {reportView === "monthly" && <section className="card p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold text-charcoal dark:text-white">Monthly</h2><p className="text-sm text-muted">Booking totals and confirmed earnings for the selected month.</p></div><input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="form-input py-2 text-sm" /></div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <div><p className="text-xs uppercase text-muted">Confirmed</p><p className="mt-1 text-2xl font-bold">{monthlySummary?.total_confirmed || 0}</p></div>
              <div><p className="text-xs uppercase text-muted">In Cart</p><p className="mt-1 text-2xl font-bold">{monthlySummary?.total_unconfirmed || 0}</p></div>
              <div><p className="text-xs uppercase text-muted">Confirmed Earnings</p><p className="mt-1 text-2xl font-bold text-sacramento">$ {Number(monthlySummary?.total_earnings_confirmed || 0).toLocaleString()}</p></div>
              <div><p className="text-xs uppercase text-muted">Unconfirmed Earnings</p><p className="mt-1 text-2xl font-bold">$ {Number(monthlySummary?.total_earnings_unconfirmed || 0).toLocaleString()}</p></div>
              <div><p className="text-xs uppercase text-muted">Total Earnings</p><p className="mt-1 text-2xl font-bold text-sacramento">$ {Number(monthlySummary?.total_earnings_confirmed || 0).toLocaleString()}</p></div>
            </div>
            <div className="mt-6 overflow-x-auto rounded-lg border border-border-light dark:border-border-dark"><table className="min-w-full bg-surface text-sm"><thead className="bg-[#29AB87] text-xs uppercase text-white"><tr><th className="px-4 py-3 text-left">Booking ID</th><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Package</th><th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-right">Price</th></tr></thead><tbody className="divide-y divide-border-light dark:divide-border-dark">{monthlyBookings.length === 0 ? <tr><td colSpan="5" className="px-4 py-6 text-center text-muted">No bookings for this month.</td></tr> : monthlyBookings.map((booking) => <tr key={booking.Booking_ID}><td className="px-4 py-3 font-mono">#{booking.Booking_ID}</td><td className="px-4 py-3 font-medium">{booking.First_Name} {booking.Last_Name}</td><td className="px-4 py-3">{booking.Package_Name || "Booking"}</td><td className="px-4 py-3">{booking.Booking_Date}</td><td className="px-4 py-3 text-right font-mono">$ {Number(booking.Payment || 0).toLocaleString()}</td></tr>)}</tbody></table></div>
          </section>}

          {reportView === "annual" && <section className="card p-4"><h2 className="mb-4 text-xl font-bold text-charcoal dark:text-white">Annual Booking Summary</h2><div className="overflow-x-auto rounded-lg border border-border-light dark:border-border-dark"><table className="min-w-full bg-surface text-sm"><thead className="bg-[#29AB87] text-xs uppercase text-white"><tr><th className="px-4 py-3 text-left">Month</th><th className="px-4 py-3 text-center">Confirmed</th><th className="px-4 py-3 text-center">In Cart</th><th className="px-4 py-3 text-center">Pending</th><th className="px-4 py-3 text-center">Cancel</th><th className="px-4 py-3 text-center">Total</th></tr></thead><tbody className="divide-y divide-border-light dark:divide-border-dark">{report.rows.map((row) => <tr key={row.month}><td className="px-4 py-2 font-medium">{row.label}</td><td className="px-4 py-2 text-center">{row.total_confirmed}</td><td className="px-4 py-2 text-center">{row.total_in_cart}</td><td className="px-4 py-2 text-center">{row.total_pending}</td><td className="px-4 py-2 text-center">{row.total_cancelled}</td><td className="px-4 py-2 text-center font-bold">{row.total_confirmed + row.total_in_cart + row.total_pending + row.total_cancelled}</td></tr>)}</tbody><tfoot className="bg-offwhite-100 font-bold dark:bg-surface-2"><tr><td className="px-4 py-3">Entire Year ({report.year})</td><td className="px-4 py-3 text-center">{report.totals.total_confirmed}</td><td className="px-4 py-3 text-center">{report.totals.total_in_cart}</td><td className="px-4 py-3 text-center">{report.totals.total_pending}</td><td className="px-4 py-3 text-center">{report.totals.total_cancelled}</td><td className="px-4 py-3 text-center">{report.totals.total_confirmed + report.totals.total_in_cart + report.totals.total_pending + report.totals.total_cancelled}</td></tr></tfoot></table></div></section>}
        </>
      )}
    </div>
  );
}
