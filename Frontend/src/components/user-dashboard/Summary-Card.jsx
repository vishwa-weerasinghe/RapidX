import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, Clock, LayoutDashboard, ShoppingCart, Sparkles } from "lucide-react";
import api from "../../axios";
import { useTheme } from "../../context/ThemeContext";
import { ChecklistCard } from "./Checklist_card";
import summaryImg from "../../assets/summary.jpg";

export default function SummaryStats() {
  const [customerId, setCustomerId] = useState(null);
  const [booked, setBooked] = useState(0);
  const [pending, setPending] = useState(0);
  const [inCart, setInCart] = useState(0);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      const guestStr = localStorage.getItem("guest_customer");
      const activeCustomer = JSON.parse(userStr) || JSON.parse(guestStr) || null;
      setCustomerId(activeCustomer?.Customer_ID ?? null);
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!customerId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    Promise.all([
      api.get(`/user-bookings/${customerId}`),
      api.get(`/cart/${customerId}`),
    ])
      .then(([bookingsRes, cartRes]) => {
        if (cancelled) return;
        const bookings = bookingsRes.data || [];
        setBooked(
          bookings.filter(
            (b) => b.Status === "Confirmed" || b.Status === "Completed"
          ).length
        );
        setPending(bookings.filter((b) => b.Status === "Pending").length);
        setInCart((cartRes.data || []).length);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Summary stats fetch error:", err);
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [customerId]);

  const cardClass = "card relative isolate overflow-hidden p-4 sm:p-6";
  const titleIconBoxClass = isDark
    ? "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sacramento-400 to-sacramento-300 text-white"
    : "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sacramento to-sacramento-600 text-white";
  const titleClass = isDark
    ? "text-xl font-semibold text-white font-serif"
    : "text-xl font-semibold text-charcoal font-serif";
  const rowIconBoxClass = isDark
    ? "flex h-9 w-9 items-center justify-center rounded-xl bg-border-dark text-white"
    : "flex h-9 w-9 items-center justify-center rounded-xl bg-border-light text-sacramento";
  const labelClass = isDark
    ? "text-[15px] font-medium text-white/90"
    : "text-[15px] font-medium text-charcoal";
  const countClass = isDark
    ? "text-xl font-bold text-white"
    : "text-xl font-bold text-sacramento";
  const borderLineClass = isDark ? "divide-border-dark" : "divide-border-light";

  const rows = [
    { icon: <CalendarCheck size={18} />, label: "Trips Booked", count: booked },
    { icon: <Clock size={18} />, label: "Pending Safari", count: pending },
    { icon: <ShoppingCart size={18} />, label: "In Cart", count: inCart },
  ];

  return (
    <div className={cardClass}>
      <div className="absolute inset-0 z-0 h-full w-full">
        <img
          src={summaryImg}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-center"
        />
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-bg-dark/75"
              : "bg-offwhite/75"
          }`}
        />
      </div>

      <div className="relative z-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className={titleIconBoxClass}>
            <LayoutDashboard size={18} />
          </div>
          <h2 className={titleClass}>Safari Summary</h2>
        </div>
        <button
          type="button"
          onClick={() => navigate("/user/packages")}
          className="btn-primary flex shrink-0 items-center justify-center gap-2 rounded-xl py-2.5 text-[14px] font-semibold"
        >
          <Sparkles size={16} className="shrink-0" />
          See recommended safaris
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <ul className={`h-full divide-y ${borderLineClass}`}>
          {rows.map((row) => (
            <li
              key={row.label}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <div className={rowIconBoxClass}>{row.icon}</div>
                <span className={labelClass}>{row.label}</span>
              </div>
              <span className={countClass}>{loading ? "…" : row.count}</span>
            </li>
          ))}
        </ul>

        <div className="h-full [&_>_div]:mt-0 [&_>_div]:max-w-none">
          <ChecklistCard />
        </div>
      </div>
      </div>
    </div>
  );
}
