import { useEffect, useState, useMemo } from "react";
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
  CheckCircle2,
  XCircle,
  DollarSign,
  ArrowUpRight,
  Activity,
  ChevronRight,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  ArrowRight,
  Tag,
  Image,
  UserRound,
  Compass,
  Trash2,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────
const fmtMoney = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n ?? 0);

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const statusStyles = (status) => {
  switch ((status ?? "").toLowerCase()) {
    case "confirmed":
      return {
        bg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
        dot: "bg-emerald-500",
        pulse: true,
      };
    case "cancelled":
      return {
        bg: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25",
        dot: "bg-rose-500",
        pulse: false,
      };
    case "pending":
      return {
        bg: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25",
        dot: "bg-amber-500",
        pulse: true,
      };
    case "completed":
      return {
        bg: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25",
        dot: "bg-sky-500",
        pulse: false,
      };
    default:
      return {
        bg: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/25",
        dot: "bg-slate-400",
        pulse: false,
      };
  }
};

// ─── Smooth SVG Curved Area & Line Chart ────────────────────
function createSmoothPath(points) {
  if (!points || points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cx = (p0.x + p1.x) / 2;
    d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

function ModernInteractiveChart({ data }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-sm gap-2">
        <Activity size={28} className="opacity-40 animate-pulse text-sacramento dark:text-emerald-400" />
        <span>No monthly booking volume recorded yet</span>
      </div>
    );
  }

  const counts = data.map((d) => d.count);
  const maxVal = Math.max(...counts, 4);
  const chartHeight = 200;
  const chartWidth = 620;
  const paddingLeft = 36;
  const paddingRight = 24;
  const paddingTop = 24;
  const paddingBottom = 34;

  const width = chartWidth - paddingLeft - paddingRight;
  const height = chartHeight - paddingTop - paddingBottom;

  const points = data.map((d, i) => {
    const x = paddingLeft + (i / (data.length - 1 || 1)) * width;
    const y = chartHeight - paddingBottom - (d.count / maxVal) * height;
    return { x, y, count: d.count, month: d.month };
  });

  const pathD = createSmoothPath(points);
  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`
      : "";

  const totalPeriodBookings = counts.reduce((acc, c) => acc + c, 0);

  return (
    <div className="w-full">
      {/* Chart Top Summary Callout */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {totalPeriodBookings}
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Bookings in last 6 months
          </span>
        </div>
        {hoveredIdx !== null && points[hoveredIdx] && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3 py-1 bg-sacramento/10 dark:bg-sacramento-900/40 border border-sacramento/20 rounded-full text-xs font-bold text-sacramento dark:text-sacramento-300"
          >
            <span>
              {new Date(points[hoveredIdx].month + "-01").toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
              :
            </span>
            <span className="text-sacramento-600 dark:text-sacramento-200 font-extrabold">
              {points[hoveredIdx].count} bookings
            </span>
          </motion.div>
        )}
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="areaGradientModern" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.32" />
              <stop offset="60%" stopColor="#10b981" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="lineGradientModern" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>

            <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#10b981" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((ratio, index) => {
            const yVal = chartHeight - paddingBottom - ratio * height;
            return (
              <g key={index} className="opacity-40 dark:opacity-60">
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
                  x={paddingLeft - 8}
                  y={yVal + 3.5}
                  textAnchor="end"
                  className="text-[10px] fill-slate-500 dark:fill-slate-300 font-semibold"
                >
                  {Math.round(ratio * maxVal)}
                </text>
              </g>
            );
          })}

          {/* Soft area under curve */}
          <motion.path
            d={areaD}
            fill="url(#areaGradientModern)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          {/* Glowing curve line */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="url(#lineGradientModern)"
            strokeWidth={3}
            strokeLinecap="round"
            filter="url(#lineGlow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
          />

          {/* Interactive points */}
          {points.map((p, i) => {
            const label = p.month
              ? new Date(p.month + "-01").toLocaleDateString("en-US", {
                  month: "short",
                })
              : "";
            const isHovered = hoveredIdx === i;

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Vertical hover guide */}
                <line
                  x1={p.x}
                  y1={paddingTop}
                  x2={p.x}
                  y2={chartHeight - paddingBottom}
                  stroke="#10b981"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  className={`transition-opacity duration-200 ${
                    isHovered ? "opacity-60" : "opacity-0"
                  }`}
                />

                {/* Outer halo */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 12 : 7}
                  fill="#10b981"
                  className={`transition-all duration-200 ${
                    isHovered ? "opacity-30" : "opacity-0"
                  }`}
                />

                {/* Point dot */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 4.5 : 3.5}
                  fill="#ffffff"
                  stroke="#059669"
                  strokeWidth={2.5}
                  className="transition-all duration-200 shadow-sm"
                />

                {/* Month label */}
                <text
                  x={p.x}
                  y={chartHeight - 12}
                  textAnchor="middle"
                  className={`text-[10px] transition-colors font-bold ${
                    isHovered
                      ? "fill-emerald-600 dark:fill-emerald-400"
                      : "fill-slate-500 dark:fill-slate-300"
                  }`}
                >
                  {label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ─── Stars Renderer ─────────────────────────────────────────
function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          viewBox="0 0 20 20"
          className={`w-3.5 h-3.5 transition-colors duration-200 ${
            n <= rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 dark:fill-slate-800 text-slate-200 dark:text-slate-800"
          }`}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ─── Modern Stat Card Component ─────────────────────────────
function StatCard({ icon: Icon, label, value, sub, badgeText, color = "emerald", link, index = 0 }) {
  const themes = {
    emerald: {
      gradient: "from-emerald-500/10 via-sacramento/5 to-transparent",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40",
      accent: "text-emerald-600 dark:text-emerald-400",
      badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    },
    blue: {
      gradient: "from-sky-500/10 via-blue-500/5 to-transparent",
      iconBg: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200/50 dark:border-sky-800/40",
      accent: "text-sky-600 dark:text-sky-400",
      badge: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
    },
    amber: {
      gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
      iconBg: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/40",
      accent: "text-amber-600 dark:text-amber-400",
      badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    },
    gold: {
      gradient: "from-yellow-500/10 via-amber-500/5 to-transparent",
      iconBg: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/40",
      accent: "text-amber-600 dark:text-amber-400",
      badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    },
  };

  const t = themes[color] ?? themes.emerald;

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      className={`relative overflow-hidden rounded-2xl bg-white dark:bg-[#16231c] border border-border-light dark:border-border-dark/60 p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 group ${
        link ? "cursor-pointer hover:-translate-y-0.5" : ""
      }`}
    >
      {/* Decorative ambient background mesh */}
      <div
        className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-br ${t.gradient} rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
      />

      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${t.iconBg} shadow-sm group-hover:scale-105 transition-transform duration-200`}>
          <Icon size={20} strokeWidth={2.2} />
        </div>
        {badgeText && (
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${t.badge}`}>
            {badgeText}
          </span>
        )}
        {link && !badgeText && (
          <span className="p-1.5 rounded-lg bg-slate-50 dark:bg-[#101813] text-slate-400 group-hover:text-sacramento dark:group-hover:text-sacramento-300 transition-colors">
            <ArrowUpRight size={15} />
          </span>
        )}
      </div>

      <div>
        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          {value}
        </p>
        <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          {label}
        </p>
        {sub && (
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-2 truncate">
            {sub}
          </p>
        )}
      </div>
    </motion.div>
  );

  return link ? (
    <Link to={link} className="block focus:outline-none focus:ring-2 focus:ring-sacramento/30 rounded-2xl">
      {content}
    </Link>
  ) : (
    content
  );
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
      setError("Failed to load dashboard statistics. Please check server connectivity.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDeleteBooking = async (id) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    try {
      await api.delete(`/bookings/${id}`);
      setStats((prev) => ({
        ...prev,
        recent_bookings: (prev?.recent_bookings || []).filter((b) => b.id !== id),
        total_bookings: Math.max(0, (prev?.total_bookings || 1) - 1),
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to delete booking.");
    }
  };

  const adminName = user?.User_Name ?? "Administrator";

  // Derive Pipeline Status Data
  const pipelineMetrics = useMemo(() => {
    if (!stats?.bookings_by_status) return { total: 0, items: [] };

    const statusMap = stats.bookings_by_status;
    const entries = Object.entries(statusMap);
    const total = entries.reduce((sum, [, count]) => sum + Number(count || 0), 0) || 1;

    const orderedKeys = ["Confirmed", "Pending", "Completed", "Cancelled"];
    const items = orderedKeys
      .filter((k) => statusMap[k] !== undefined || statusMap[k.toLowerCase()] !== undefined)
      .map((k) => {
        const count = statusMap[k] ?? statusMap[k.toLowerCase()] ?? 0;
        const pct = Math.round((count / total) * 100);
        return {
          key: k,
          count,
          percentage: pct,
          styles: statusStyles(k),
        };
      });

    return { total, items };
  }, [stats]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border-4 border-emerald-100 dark:border-emerald-950/40 border-t-sacramento dark:border-t-sacramento-300 animate-spin" />
          <Activity size={22} className="absolute text-sacramento dark:text-sacramento-300 animate-pulse" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm tracking-wide animate-pulse">
          Loading operational dashboard…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-[#16231c] border border-rose-200 dark:border-rose-900/40 rounded-3xl p-8 text-center max-w-md shadow-lg"
        >
          <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <XCircle size={32} />
          </div>
          <h3 className="font-extrabold text-xl text-slate-900 dark:text-white mb-2">
            Unable to Load Dashboard
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            {error}
          </p>
          <button
            onClick={() => {
              setLoading(true);
              fetchStats();
            }}
            className="px-6 py-2.5 bg-sacramento hover:bg-sacramento-600 dark:bg-castleton-500 dark:hover:bg-castleton-600 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 text-sm"
          >
            Retry Connection
          </button>
        </motion.div>
      </div>
    );
  }

  const {
    total_bookings = 0,
    total_reviews = 0,
    total_revenue = 0,
    avg_rating = 5,
    recent_bookings = [],
    bookings_per_month = [],
    recent_reviews = [],
    bookings_by_status = {},
  } = stats ?? {};

  const confirmedCount = bookings_by_status?.Confirmed ?? bookings_by_status?.confirmed ?? 0;
  const pendingCount = bookings_by_status?.Pending ?? bookings_by_status?.pending ?? 0;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-8">
      {/* ── Modern Executive Header ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-white to-emerald-50/40 dark:from-[#16231c] dark:via-[#16231c] dark:to-[#102018] border border-border-light dark:border-border-dark/60 p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-sacramento/10 dark:bg-sacramento-900/40 text-sacramento dark:text-sacramento-300 border border-sacramento/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Control Center
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 hidden sm:inline">
                • Real-time Safari Fleet Ops
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {getGreeting()},{" "}
              <span className="bg-gradient-to-r from-sacramento to-castleton-500 dark:from-sacramento-300 dark:to-emerald-400 bg-clip-text text-transparent">
                {adminName}
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Track live safari reservations, verify guest transactions, and oversee system performance.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Quick Refresh */}
            <button
              onClick={() => fetchStats(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#101813] border border-slate-200 dark:border-border-dark text-slate-600 dark:text-slate-300 hover:text-sacramento dark:hover:text-sacramento-300 hover:border-sacramento/30 dark:hover:border-sacramento-700/50 hover:shadow-sm active:scale-95 transition-all text-xs font-bold"
              title="Reload Statistics"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin text-sacramento dark:text-emerald-400" : ""} />
              <span>{refreshing ? "Updating..." : "Refresh"}</span>
            </button>

            {/* Date Indicator */}
            <div className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#101813] border border-slate-200/80 dark:border-border-dark text-xs font-bold text-slate-600 dark:text-slate-300">
              <Clock size={15} className="text-sacramento dark:text-sacramento-300" />
              <span>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* Quick Ledger Link */}
            <Link
              to="/admin/bookings"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sacramento hover:bg-sacramento-600 dark:bg-castleton-500 dark:hover:bg-castleton-600 text-white font-bold text-xs shadow-sm hover:shadow transition-all active:scale-95"
            >
              <span>View Bookings</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Ambient background accent orb */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-sacramento/5 dark:bg-sacramento-900/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ── Key Performance Indicator Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={CalendarCheck}
          label="Total Bookings"
          value={total_bookings}
          sub="Accumulated client reservations"
          badgeText="All Time"
          color="emerald"
          link="/admin/bookings"
          index={0}
        />
        <StatCard
          icon={DollarSign}
          label="Gross Revenue"
          value={fmtMoney(total_revenue)}
          sub="Confirmed & completed tours"
          badgeText="Realized"
          color="blue"
          link="/admin/earnings-and-reports"
          index={1}
        />
        <StatCard
          icon={ShieldCheck}
          label="Confirmed Tours"
          value={confirmedCount}
          sub={pendingCount > 0 ? `${pendingCount} pending confirmation` : "All reservations verified"}
          badgeText={pendingCount > 0 ? `${pendingCount} Pending` : "100% Ready"}
          color="amber"
          link="/admin/bookings"
          index={2}
        />
        <StatCard
          icon={Star}
          label="Customer Rating"
          value={`${avg_rating} / 5.0`}
          sub={`${total_reviews} verified guest reviews`}
          badgeText="Satisfaction"
          color="gold"
          link="/admin/reviews"
          index={3}
        />
      </div>

      {/* ── Analytics & Pipeline Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Booking Velocity Chart (Span 7) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="lg:col-span-7 bg-white dark:bg-[#16231c] rounded-3xl border border-border-light dark:border-border-dark/60 p-6 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sacramento/10 text-sacramento dark:text-sacramento-300">
                  <TrendingUp size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Booking Velocity Trend
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Monthly reservation intake across all parks
                  </p>
                </div>
              </div>

              <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-slate-50 dark:bg-[#101813] border border-slate-200/60 dark:border-border-dark rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300">
                <Sparkles size={12} className="text-emerald-500" />
                Live Data
              </span>
            </div>

            <ModernInteractiveChart data={bookings_per_month} />
          </div>
        </motion.div>

        {/* Booking Status Breakdown (Span 5) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25 }}
          className="lg:col-span-5 bg-white dark:bg-[#16231c] rounded-3xl border border-border-light dark:border-border-dark/60 p-6 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Reservation Pipeline
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Status distribution for active bookings
                </p>
              </div>

              <Link
                to="/admin/bookings"
                className="text-xs font-bold text-sacramento dark:text-sacramento-300 hover:underline flex items-center gap-1 group"
              >
                Inspect
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Segmented Visual Bar */}
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-[#101813] overflow-hidden flex my-4 shadow-inner">
              {pipelineMetrics.items.map((item) => (
                <div
                  key={item.key}
                  style={{ width: `${Math.max(item.percentage, 4)}%` }}
                  title={`${item.key}: ${item.count} (${item.percentage}%)`}
                  className={`${item.styles.dot} transition-all duration-500 hover:brightness-110`}
                />
              ))}
            </div>

            {/* Status Breakdown Cards */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {pipelineMetrics.items.map((item) => (
                <div
                  key={item.key}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#101813] border border-slate-200/50 dark:border-border-dark/60 flex flex-col gap-1 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${item.styles.dot}`} />
                      {item.key}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {item.percentage}%
                    </span>
                  </div>
                  <span className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>

            {/* Highlight Alert if Pending exists */}
            {pendingCount > 0 && (
              <div className="mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs font-semibold text-amber-800 dark:text-amber-300">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  {pendingCount} booking{pendingCount > 1 ? "s" : ""} awaiting your review
                </span>
                <Link
                  to="/admin/bookings"
                  className="font-bold underline hover:text-amber-900 dark:hover:text-amber-200 text-[11px]"
                >
                  Review Now
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Operational Records: Recent Bookings & Reviews ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Bookings Feed (Span 7 or 8) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="lg:col-span-7 xl:col-span-8 bg-white dark:bg-[#16231c] rounded-3xl border border-border-light dark:border-border-dark/60 shadow-sm overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between px-6 py-5 border-b border-border-light dark:border-border-dark/60">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Recent Bookings Feed
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Latest customer reservations created
                </p>
              </div>
              <Link
                to="/admin/bookings"
                className="text-xs text-sacramento dark:text-sacramento-300 hover:underline font-bold flex items-center gap-1 group"
              >
                Full Booking Ledger
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {recent_bookings && recent_bookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-[#101813] text-[11px] text-slate-600 dark:text-slate-200 font-extrabold uppercase tracking-wider border-b border-border-light dark:border-border-dark/60">
                      <th className="px-6 py-3.5 text-left text-slate-600 dark:text-slate-200">Customer</th>
                      <th className="px-6 py-3.5 text-left text-slate-600 dark:text-slate-200">Safari Tour</th>
                      <th className="px-6 py-3.5 text-left text-slate-600 dark:text-slate-200">Target Date</th>
                      <th className="px-6 py-3.5 text-left text-slate-600 dark:text-slate-200">Status</th>
                      <th className="px-6 py-3.5 text-right text-slate-600 dark:text-slate-200">Value</th>
                      <th className="px-6 py-3.5 text-right text-slate-600 dark:text-slate-200">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light/60 dark:divide-border-dark/40">
                    {recent_bookings.map((b) => {
                      const pill = statusStyles(b.status);
                      const initial = (b.customer?.[0] ?? "G").toUpperCase();
                      return (
                        <tr
                          key={b.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-[#101813]/60 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sacramento to-castleton-400 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                {initial}
                              </div>
                              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
                                {b.customer}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium truncate max-w-[150px]">
                            <div className="flex items-center gap-1.5">
                              <Compass size={14} className="text-sacramento dark:text-sacramento-300 shrink-0" />
                              <span className="truncate">{b.package}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap font-medium text-xs">
                            {new Date(b.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${pill.bg}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${pill.dot} ${
                                  pill.pulse ? "animate-pulse" : ""
                                }`}
                              />
                              {b.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-extrabold text-slate-900 dark:text-slate-100">
                            {fmtMoney(b.payment)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteBooking(b.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white border border-rose-200/80 dark:border-rose-800/40 transition-all active:scale-95 shadow-sm"
                              title="Delete Booking"
                            >
                              <Trash2 size={13} />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-sm">
                No active bookings recorded in the system.
              </div>
            )}
          </div>
        </motion.div>

        {/* Customer Feedback Feed (Span 5 or 4) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.35 }}
          className="lg:col-span-5 xl:col-span-4 bg-white dark:bg-[#16231c] rounded-3xl border border-border-light dark:border-border-dark/60 shadow-sm overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between px-6 py-5 border-b border-border-light dark:border-border-dark/60">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Guest Feedback
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Latest customer ratings submitted
                </p>
              </div>
              <Link
                to="/admin/reviews"
                className="text-xs text-sacramento dark:text-sacramento-300 hover:underline font-bold flex items-center gap-1 group"
              >
                All Reviews
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {recent_reviews && recent_reviews.length > 0 ? (
              <div className="divide-y divide-border-light/60 dark:divide-border-dark/40">
                {recent_reviews.map((r) => (
                  <div
                    key={r.id}
                    className="p-5 hover:bg-slate-50/60 dark:hover:bg-[#101813]/60 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center text-[10px] font-extrabold">
                          #{r.customer_id ?? "G"}
                        </div>
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">
                          Client #{r.customer_id ?? "Guest"}
                        </span>
                      </div>
                      <Stars rating={r.rating} />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium italic line-clamp-2">
                      "{r.description}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-sm">
                No feedback reviews logged yet.
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Executive Management Shortcuts ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.4 }}
        className="bg-white dark:bg-[#16231c] rounded-3xl border border-border-light dark:border-border-dark/60 shadow-sm p-6 sm:p-7"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Operations Control Shortcuts
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Quick access to administrative configurations and resource management
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              to: "/admin/packages",
              icon: Package,
              label: "Safari Packages",
              desc: "Manage tours & pricing",
              gradient: "hover:border-emerald-500/40 hover:bg-emerald-500/5",
              iconBg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400",
            },
            {
              to: "/admin/bookings",
              icon: CalendarCheck,
              label: "All Bookings",
              desc: "Inspect customer tickets",
              gradient: "hover:border-sky-500/40 hover:bg-sky-500/5",
              iconBg: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400",
            },
            {
              to: "/admin/drivers",
              icon: Users,
              label: "Safari Drivers",
              desc: "Guide assignments",
              gradient: "hover:border-amber-500/40 hover:bg-amber-500/5",
              iconBg: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400",
            },
            {
              to: "/admin/vehicles",
              icon: Car,
              label: "Fleet Vehicles",
              desc: "Jeep configurations",
              gradient: "hover:border-teal-500/40 hover:bg-teal-500/5",
              iconBg: "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400",
            },
          ].map(({ to, icon: Icon, label, desc, gradient, iconBg }) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-start p-5 rounded-2xl border border-border-light dark:border-border-dark/60 bg-white dark:bg-[#101813]/60 ${gradient} hover:shadow-md hover:-translate-y-0.5 active:scale-98 transition-all duration-300 group`}
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div className={`p-2.5 rounded-xl ${iconBg} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={18} strokeWidth={2.2} />
                </div>
                <ArrowUpRight size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-sacramento dark:group-hover:text-sacramento-300 transition-colors" />
              </div>
              <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-sacramento dark:group-hover:text-sacramento-300 transition-colors">
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