import React, { useEffect, useState } from "react";
import { CalendarDays, Tag, Ticket, Users } from "lucide-react";
import { format } from "date-fns";
import api from "../../axios";
import { useTheme } from "../../context/ThemeContext";

export function PromoCode() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    let active = true;

    api
      .get("/promotion-codes")
      .then((res) => {
        if (!active) return;
        const list = Array.isArray(res.data) ? res.data : [];
        // Show only the promotions the admin did not hide from customers
        setPromos(list.filter((promo) => !promo.is_hidden));
      })
      .catch((err) => {
        console.error("Promotion codes fetch error:", err);
        if (active) setPromos([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const isDark = theme === "dark";
  const cardClass = "card p-4 sm:p-6";
  const iconBoxClass = isDark
    ? "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sacramento-400 to-sacramento-300 text-white"
    : "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sacramento to-sacramento-600 text-white";
  const titleClass = isDark
    ? "text-xl font-semibold text-white font-serif"
    : "text-xl font-semibold text-charcoal font-serif";
  const counterClass = isDark
    ? "flex h-8 w-8 items-center justify-center rounded-full bg-border-dark text-sm font-bold text-white"
    : "flex h-8 w-8 items-center justify-center rounded-full bg-border-light text-sm font-bold text-sacramento";
  const mutedTextClass = isDark ? "text-gray-400" : "text-muted";
  const fieldTextClass = isDark ? "text-white" : "text-charcoal";
  const borderLineClass = isDark ? "border-border-dark" : "border-border-light";
  const panelClass = isDark
    ? "rounded-2xl border border-border-dark bg-surface p-3 sm:p-4"
    : "rounded-2xl border border-border-light bg-surface-2 p-3 sm:p-4";
  const discountBadgeClass = isDark
    ? "bg-sacramento-400/15 text-sacramento-300"
    : "bg-sacramento/10 text-sacramento";
  const activeBadgeClass = isDark
    ? "bg-emerald-500/15 text-emerald-300"
    : "bg-emerald-100 text-emerald-700";
  const hiddenBadgeClass = isDark
    ? "bg-red-500/15 text-red-400"
    : "bg-red-100 text-red-600";
  const accentClass = isDark ? "text-sacramento-300" : "text-sacramento";

  const formatDate = (value) => {
    if (!value) return "No expiry";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "No expiry";
    return format(date, "MMMM do, yyyy");
  };

  const discountLabel = (promo) => {
    const value = Number(promo.discount_value || 0);
    return promo.discount_type === "fixed"
      ? `$ ${value.toLocaleString()} off`
      : `${value}% off`;
  };

  const header = (withCounter = true) => (
    <div className="mb-5 flex items-center gap-2.5">
      <div className={iconBoxClass}><Tag size={18} /></div>
      <h2 className={titleClass}>Promotions</h2>
      {withCounter && <div className={counterClass}>{promos.length}</div>}
    </div>
  );

  if (loading) {
    return (
      <div className={cardClass}>
        {header(false)}
        <p className={`py-4 text-center text-sm ${mutedTextClass}`}>
          <span className="mr-2 inline-block h-5 w-5 align-middle rounded-full border-[3px] border-sacramento border-t-transparent animate-spin"></span>
          Loading promotions...
        </p>
      </div>
    );
  }

  if (promos.length === 0) {
    return (
      <div className={cardClass}>
        {header()}
        <div className="px-4 py-6 text-center">
          <p className={`text-[15px] font-medium ${mutedTextClass}`}>
            Promotions are not currently available for you
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      {header()}

      <div className="flex max-h-[400px] sm:max-h-[500px] flex-col gap-4 overflow-y-auto">
        {promos.map((promo) => {
          const usageCount = Number(promo.usage_count || 0);
          const usageLimit = promo.usage_limit ? Number(promo.usage_limit) : null;
          const remaining =
            usageLimit === null ? null : Math.max(usageLimit - usageCount, 0);

          return (
            <div key={promo.id} className={panelClass}>
              <div className="mb-3 flex items-start justify-between gap-2">
                <h4 className={`text-[16px] font-bold ${isDark ? "text-white" : "text-charcoal"}`}>
                  {promo.code}
                </h4>
                <span className={`ml-2 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.5px] ${discountBadgeClass}`}>
                  {discountLabel(promo)}
                </span>
              </div>

              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm ${fieldTextClass}`}>
                <div className="flex items-center gap-1.5">
                  <CalendarDays size={14} className={accentClass} />
                  <span>{formatDate(promo.valid_until)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users size={14} className={accentClass} />
                  <span>
                    {usageCount} / {usageLimit === null ? "∞" : usageLimit} used
                  </span>
                </div>
              </div>

              <div className={`mt-3 flex items-center justify-between border-t pt-3 ${borderLineClass}`}>
                <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.5px] ${promo.is_hidden ? hiddenBadgeClass : activeBadgeClass}`}>
                  <Ticket size={13} />
                  {promo.is_hidden ? "Hidden" : "Active"}
                </span>
                <span className={`text-xs ${mutedTextClass}`}>
                  {remaining === null ? "Unlimited uses" : `${remaining} left`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
