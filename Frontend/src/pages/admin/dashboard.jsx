import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../axios";
import {
  CalendarCheck,
  Package,
  Users,
  Car,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  ArrowUpRight,
  Activity,
  ChevronRight,
  TrendingDown,
  Sparkles,
  RefreshCw,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────
const fmtMoney = (n) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(n ?? 0);

const statusStyles = (status) => {
  switch ((status ?? "").toLowerCase()) {
    case "confirmed":
      return {
        bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/25",
        dot: "bg-emerald-500",
      };
    case "cancelled":
      return {
        bg: "bg-rose-500/10 text-rose-500 border-rose-500/25",
        dot: "bg-rose-500",
      };
    case "pending":
      return {
        bg: "bg-amber-500/10 text-amber-500 border-amber-500/25",
        dot: "bg-amber-500",
      };
    case "completed":
      return {
        bg: "bg-blue-500/10 text-blue-500 border-blue-500/25",
        dot: "bg-blue-500",
      };
    default:
      return {
        bg: "bg-slate-500/10 text-slate-500 border-slate-500/25",
        dot: "bg-slate-500",
      };
  }
};

// ─── Premium SVG Area & Line Chart ──────────────────────────
function InteractiveAreaChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
        No monthly trend data available.
      </div>
    );
  }

  const counts = data.map((d) => d.count);
  const maxVal = Math.max(...counts, 1);
  const chartHeight = 160;
  const chartWidth = 500;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const width = chartWidth - paddingLeft - paddingRight;
  const height = chartHeight - paddingTop - paddingBottom;

  const points = data.map((d, i) => {
    const x = paddingLeft + (i / (data.length - 1 || 1)) * width;
    const y = chartHeight - paddingBottom - (d.count / maxVal) * height;
    return { x, y, count: d.count, month: d.month };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`
      : "";

  return (
    <div className="relative w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-auto overflow-visible"
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Y Axis Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const yVal = chartHeight - paddingBottom - ratio * height;
          return (
            <g key={index} className="opacity-20 dark:opacity-10">
              <line
                x1={paddingLeft}
                y1={yVal}
                x2={chartWidth - paddingRight}
                y2={yVal}
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 10}
                y={yVal + 4}
                textAnchor="end"
                className="text-[9px] fill-slate-500 dark:fill-slate-400 font-medium"
              >
                {Math.round(ratio * maxVal)}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <motion.path
          d={areaD}
          fill="url(#areaGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />

        {/* Stroke Line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth={3}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        {/* Interactive Dots and Labels */}
        {points.map((p, i) => {
          const label = p.month
            ? new Date(p.month + "-01").toLocaleDateString("en-US", {
              month: "short",
            })
            : "";

          return (
            <g key={i} className="group cursor-pointer">
              {/* Vertical hover guide */}
              <line
                x1={p.x}
                y1={paddingTop}
                x2={p.x}
                y2={chartHeight - paddingBottom}
                stroke="#10b981"
                strokeWidth={1.5}
                className="opacity-0 group-hover:opacity-30 transition-opacity"
              />

              {/* Glowing Outer Circle */}
              <circle
                cx={p.x}
                cy={p.y}
                r={6}
                fill="#10b981"
                className="opacity-0 group-hover:opacity-40 transition-all duration-200"
              />

              {/* Point Dot */}
              <circle
                cx={p.x}
                cy={p.y}
                r={3.5}
                fill="#ffffff"
                stroke="#10b981"
                strokeWidth={2}
                className="transition-transform duration-200 group-hover:scale-125"
              />

              {/* X Axis Labels */}
              <text
                x={p.x}
                y={chartHeight - 10}
                textAnchor="middle"
                className="text-[9px] fill-slate-500 dark:fill-slate-400 font-semibold"
              >
                {label}
              </text>

              {/* Dynamic Tooltip bubble on hover */}
              <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <rect
                  x={p.x - 22}
                  y={p.y - 28}
                  width={44}
                  height={18}
                  rx={4}
                  fill="#0f172a"
                  className="shadow-md"
                />
                <text
                  x={p.x}
                  y={p.y - 16}
                  textAnchor="middle"
                  className="text-[9px] fill-white font-bold"
                >
                  {p.count} Bkgs
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Stars Renderer ─────────────────────────────────────────
function Stars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          viewBox="0 0 20 20"
          fill={n <= rating ? "#f59e0b" : "#cbd5e1"}
          className="w-3.5 h-3.5 transition-colors duration-300 dark:fill-slate-700 dark:data-[active=true]:fill-amber-500"
          data-active={n <= rating}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ─── Stat Card Component ─────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, link, index }) {
  const colorMap = {
    emerald: {
      bg: "from-emerald-500 to-teal-500",
      light: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
      ring: "ring-emerald-100 dark:ring-emerald-950/20",
    },
    blue: {
      bg: "from-blue-500 to-indigo-500",
      light: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
      ring: "ring-blue-100 dark:ring-blue-950/20",
    },
    rose: {
      bg: "from-rose-500 to-pink-500",
      light: "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400",
      ring: "ring-rose-100 dark:ring-rose-950/20",
    },
  };

  const c = colorMap[color] ?? colorMap.emerald;

  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 flex flex-col gap-4 group cursor-pointer shadow-sm hover:shadow-xl dark:hover:shadow-emerald-950/10 hover:-translate-y-1 transition-all duration-300 ring-1 ${c.ring}`}
    >
      {/* Decorative background glow */}
      <div className={`absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-gradient-to-br ${c.bg} opacity-[0.03] dark:opacity-[0.06] rounded-full blur-xl group-hover:scale-150 transition-transform duration-500`} />

      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl ${c.light} ring-4 ring-slate-50 dark:ring-slate-950 shadow-inner`}>
          <Icon size={20} strokeWidth={2.2} />
        </div>
        {link && (
          <span className={`p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 ${c.light} opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100`}>
            <ArrowUpRight size={14} />
          </span>
        )}
      </div>

      <div>
        <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
          {value}
        </p>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2">
          {label}
        </p>
        {sub && (
          <div className="flex items-center gap-1 mt-2">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
              {sub}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );

  return link ? <Link to={link} className="block">{cardContent}</Link> : cardContent;
}

// ─── Main Component ─────────────────────────────────────────
export default function AdminDashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-emerald-100 dark:border-slate-800 border-t-emerald-500 dark:border-t-emerald-400 animate-spin" />
          <Activity size={24} className="absolute text-emerald-500 dark:text-emerald-400 animate-pulse" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-semibold tracking-wide animate-pulse">
          Syncing system overview…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 dark:bg-red-950/10 border border-red-200/50 dark:border-red-900/30 text-red-700 dark:text-red-400 rounded-3xl p-8 text-center max-w-md shadow-xl backdrop-blur-md"
        >
          <XCircle size={48} className="mx-auto mb-4 text-red-400 dark:text-red-500" />
          <h3 className="font-extrabold text-xl mb-2">Sync Error</h3>
          <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-6">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchStats();
            }}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 dark:bg-red-900/50 dark:hover:bg-red-900/80 text-white rounded-xl font-bold transition-all shadow-md active:scale-95"
          >
            Retry Sync
          </button>
        </motion.div>
      </div>
    );
  }

  const {
    total_bookings,
    total_reviews,
    total_revenue,
    avg_rating,
    bookings_by_status,
    recent_bookings,
    bookings_per_month,
    recent_reviews,
  } = stats;

  const statusEntries = Object.entries(bookings_by_status ?? {});
  const statusTotal = statusEntries.reduce((a, [, v]) => a + v, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-4 md:p-8 space-y-8 transition-colors duration-300">
      {/* ── Header Area ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-bold tracking-wider uppercase mb-1">
            <Sparkles size={14} className="animate-spin-slow" />
            Live Operations Control
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Welcome back,{" "}
            <span className="font-extrabold text-slate-800 dark:text-slate-200">
              {user?.User_Name ?? "Admin"}
            </span>{" "}
            • Monitoring active bookings and statistics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh Action */}
          <button
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:shadow active:scale-95 transition-all"
            title="Refresh Statistics"
          >
            <RefreshCw size={16} className={`${refreshing ? "animate-spin" : ""}`} />
          </button>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-4 py-2.5 shadow-sm text-sm text-slate-600 dark:text-slate-300 font-semibold">
            <Clock size={15} className="text-emerald-500 dark:text-emerald-400" />
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* ── Key Performance Indicators ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={CalendarCheck}
          label="Total Booking Units"
          value={total_bookings}
          sub="Accumulated packages and guest tickets"
          color="emerald"
          link="/admin/bookings"
          index={0}
        />
        <StatCard
          icon={DollarSign}
          label="Gross Revenue"
          value={fmtMoney(total_revenue)}
          sub="Aggregated checkout values"
          color="blue"
          index={1}
        />
        <StatCard
          icon={Star}
          label="Average Customer Rating"
          value={`${avg_rating} / 5`}
          sub={`${total_reviews} feedback submissions`}
          color="rose"
          link="/admin/reviews"
          index={2}
        />
      </div>

      {/* ── Trends & Analytics Row ── */}
      <div className="w-full">
        {/* SVG Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Booking Velocity
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Monthly trend for the last 6 months
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full">
                <TrendingUp size={13} />
                Volume Rate
              </div>
            </div>
            <InteractiveAreaChart data={bookings_per_month} />
          </div>
        </motion.div>
      </div>

      {/* ── Operational Records & Feed ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Bookings Feed */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="xl:col-span-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Recent Booking Feed
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Latest 5 reservations created
                </p>
              </div>
              <Link
                to="/admin/bookings"
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1 group"
              >
                Detailed Ledger
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {recent_bookings && recent_bookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/20 text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                      <th className="px-6 py-3.5 text-left">Customer</th>
                      <th className="px-6 py-3.5 text-left">Package Details</th>
                      <th className="px-6 py-3.5 text-left">Target Date</th>
                      <th className="px-6 py-3.5 text-left">Status</th>
                      <th className="px-6 py-3.5 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {recent_bookings.map((b) => {
                      const pill = statusStyles(b.status);
                      return (
                        <tr
                          key={b.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold ring-2 ring-slate-200/50 dark:ring-slate-700/50">
                                {b.customer?.[0] ?? "?"}
                              </div>
                              <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                                {b.customer}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium truncate max-w-[130px]">
                            {b.package}
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap font-medium">
                            {new Date(b.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${pill.bg}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${pill.dot}`} />
                              {b.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-slate-800 dark:text-slate-200">
                            {fmtMoney(b.payment)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-sm">
                No active reservation entries found.
              </div>
            )}
          </div>
        </motion.div>

        {/* Reviews Feed */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Recent Guest Feedback
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Latest customer ratings submitted
                </p>
              </div>
              <Link
                to="/admin/reviews"
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1 group"
              >
                All Feedback
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {recent_reviews && recent_reviews.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {recent_reviews.map((r) => (
                  <div
                    key={r.id}
                    className="p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                          U
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                          User #{r.customer_id ?? "Guest"}
                        </span>
                      </div>
                      <Stars rating={r.rating} />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium line-clamp-2">
                      "{r.description}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-sm">
                No feedback logs generated yet.
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Navigation Shortcuts ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm p-6"
      >
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Control Panel Quick links
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              to: "/admin/packages",
              icon: Package,
              label: "Manage Packages",
              desc: "Adjust tour parameters",
              color: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100/50 dark:border-emerald-900/30",
            },
            {
              to: "/admin/bookings",
              icon: CalendarCheck,
              label: "View Bookings",
              desc: "Manage tickets",
              color: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100/50 dark:border-blue-900/30",
            },
            {
              to: "/admin/drivers",
              icon: Users,
              label: "Manage Drivers",
              desc: "Driver crew assignments",
              color: "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100/50 dark:border-amber-900/30",
            },
            {
              to: "/admin/vehicles",
              icon: Car,
              label: "Manage Vehicles",
              desc: "Jeep configurations",
              color: "bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 border-cyan-100/50 dark:border-cyan-900/30",
            },
          ].map(({ to, icon: Icon, label, desc, color }) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-start p-5 rounded-2xl border ${color} hover:shadow-lg hover:-translate-y-0.5 active:scale-98 transition-all duration-300 group`}
            >
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 shadow-sm group-hover:scale-110 transition-transform duration-300 mb-4">
                <Icon size={18} strokeWidth={2.2} />
              </div>
              <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                {label}
              </span>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-1">
                {desc}
              </span>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}