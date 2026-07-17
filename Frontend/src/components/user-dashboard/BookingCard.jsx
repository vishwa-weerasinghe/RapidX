import React, { useEffect, useState } from "react";
import { CalendarDays, MapPin, Clock, Users, Baby, Truck } from "lucide-react";
import api from "../../axios";

export function BookingCard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [customerId, setCustomerId] = useState(null);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme") || "light";
      setTheme(savedTheme);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      const guestStr = localStorage.getItem("guest_customer");
      const activeCustomer = JSON.parse(userStr) || JSON.parse(guestStr) || null;
      if (activeCustomer?.Customer_ID) {
        setCustomerId(activeCustomer.Customer_ID);
      } else {
        setLoading(false);
        setError("No customer ID found. Please log in.");
      }
    } catch { setLoading(false); setError("Failed to read user data."); }
  }, []);

  useEffect(() => {
    if (!customerId) return;
    api.get(`/user-bookings/${customerId}`)
      .then((res) => {
        const confirmed = res.data.filter(
          (b) => b.Status === "Confirmed" || b.Status === "Completed"
        );
        setBookings(confirmed);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Bookings fetch error:", err);
        setError("Failed to load bookings.");
        setLoading(false);
      });
  }, [customerId]);

  const isDark = theme === "dark";

  // Shared color tokens
  const colors = {
    bg: isDark ? "#1c1917" : "#ffffff",
    bgItem: isDark ? "#292524" : "#f0fdf4",
    bgItemAlt: isDark ? "#292524" : "#ecfdf5",
    border: isDark ? "#44403c" : "#d1d5db",
    borderItem: isDark ? "#57534e" : "#bbf7d0",
    primary: "#059669",
    primaryDark: "#10b981",
    accent: "#ea580c",
    accentDark: "#f97316",
    text: isDark ? "#e7e5e4" : "#1c1917",
    textMuted: isDark ? "#a8a29e" : "#6b7280",
    title: isDark ? "#10b981" : "#064e3b",
    iconBg: isDark ? "rgba(5, 150, 105, 0.2)" : "rgba(5, 150, 105, 0.1)",
    badgeConfirmed: isDark ? "#064e3b" : "#dcfce7",
    badgeCompleted: isDark ? "#1e3a5f" : "#dbeafe",
    badgeConfirmedText: isDark ? "#6ee7b7" : "#166534",
    badgeCompletedText: isDark ? "#93c5fd" : "#1e40af",
  };

  const cardStyle = { background: colors.bg, borderRadius: "24px", padding: "24px", border: `1px solid ${colors.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" };
  const iconBoxStyle = { width: "36px", height: "36px", borderRadius: "10px", background: `linear-gradient(135deg, ${colors.primary}, #047857)`, display: "flex", alignItems: "center", justifyContent: "center", color: "white" };
  const titleStyle = { fontSize: "20px", fontWeight: 600, color: colors.title, fontFamily: "serif" };
  const counterStyle = { width: "32px", height: "32px", borderRadius: "50%", background: colors.iconBg, display: "flex", alignItems: "center", justifyContent: "center", color: colors.primary, fontWeight: 700, fontSize: "14px" };

  if (loading) {
    return (
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={iconBoxStyle}><CalendarDays size={18} /></div>
          <h2 style={titleStyle}>My Safari Bookings</h2>
        </div>
        <p style={{ color: colors.textMuted, fontSize: "14px", textAlign: "center", padding: "16px 0" }}>
          <span style={{ display: "inline-block", width: "20px", height: "20px", border: `3px solid ${colors.primary}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", marginRight: "8px", verticalAlign: "middle" }}></span>
          Loading your adventures...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={iconBoxStyle}><CalendarDays size={18} /></div>
          <h2 style={titleStyle}>My Safari Bookings</h2>
        </div>
        <p style={{ color: "#dc2626", fontSize: "14px", textAlign: "center" }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={iconBoxStyle}><CalendarDays size={18} /></div>
          <h2 style={titleStyle}>My Safari Bookings</h2>
        </div>
        <div style={counterStyle}>{bookings.length}</div>
      </div>

      {bookings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 16px" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🦁</div>
          <p style={{ color: colors.textMuted, fontSize: "15px", fontWeight: 500 }}>No safari adventures booked yet!</p>
          <p style={{ color: isDark ? "#78716c" : "#9ca3af", fontSize: "13px", marginTop: "4px" }}>Explore our packages and start your journey.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "500px", overflowY: "auto" }}>
          {bookings.map((booking) => {
            const pkg = booking.package;
            return (
              <div key={booking.Booking_ID} style={{ background: colors.bgItem, borderRadius: "16px", padding: "16px", border: `1px solid ${colors.borderItem}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <h4 style={{ fontWeight: 700, color: colors.title, fontSize: "16px" }}>{pkg?.Package_Name || "Unknown Safari"}</h4>
                  <span style={{
                    fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "9999px",
                    textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap", marginLeft: "8px",
                    background: booking.Status === "Completed" ? colors.badgeCompleted : colors.badgeConfirmed,
                    color: booking.Status === "Completed" ? colors.badgeCompletedText : colors.badgeConfirmedText
                  }}>
                    {booking.Status === "Completed" ? "✓ Completed" : "● Confirmed"}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "13px", color: colors.text, marginBottom: "12px" }}>
                  <DateField Icon={CalendarDays} value={booking.Booking_Date} color={colors.primary} />
                  <DateField Icon={Clock} value={booking.Pickup_Time} color={colors.primary} />
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", gridColumn: "span 2" }}>
                    <MapPin size={14} color={colors.primary} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{booking.Pickup_Location}</span>
                  </div>
                  <DateField Icon={Users} value={`${booking.No_of_adults} ${booking.No_of_adults === 1 ? "Adult" : "Adults"}`} color={colors.primary} />
                  <DateField Icon={Baby} value={`${booking.No_of_child} ${booking.No_of_child === 1 ? "Child" : "Children"}`} color={colors.primary} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: `1px solid ${colors.borderItem}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: colors.textMuted }}>
                    <Truck size={14} color={colors.primary} />
                    <span>{booking.vehicle ? booking.vehicle.Registration_No || "Assigned" : "Awaiting vehicle"}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "11px", color: colors.textMuted, display: "block" }}>Total</span>
                    <span style={{ fontWeight: 700, color: colors.primaryDark || colors.primary, fontSize: "16px" }}>Rs. {Number(booking.Payment || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DateField({ Icon, value, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <Icon size={14} color={color} />
      <span>{value}</span>
    </div>
  );
}