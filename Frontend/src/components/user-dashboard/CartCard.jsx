import React, { useEffect, useState } from "react";
import { ShoppingCart, Trash2, CalendarDays, Clock, MapPin, Users, Baby } from "lucide-react";
import api from "../../axios";
import { useTheme } from "../../context/ThemeContext";

export function CartCard() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [customerId, setCustomerId] = useState(null);
  const { theme } = useTheme();

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
    api.get(`/cart/${customerId}`)
      .then((res) => {
        setCartItems(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Cart fetch error:", err);
        setError("Failed to load cart.");
        setLoading(false);
      });
  }, [customerId]);

  const handleRemove = async (bookingId) => {
    if (!confirm("Are you sure you want to remove this item from your cart?")) return;
    try {
      await api.delete(`/cart/${bookingId}`);
      setCartItems((prev) => prev.filter((item) => item.Booking_ID !== bookingId));
    } catch (err) {
      console.error(err);
      alert("Failed to remove item.");
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + Number(item.booking?.Payment || 0), 0);
  };

  const isDark = theme === "dark";

  // Shared color tokens
  const colors = {
    bg: isDark ? "#000000" : "#ffffff",
    bgItem: isDark ? "#1a1a1a" : "#f0fdf4",
    bgItemAlt: isDark ? "#1a1a1a" : "#ecfdf5",
    border: isDark ? "#333333" : "#d1d5db",
    borderItem: isDark ? "#333333" : "#bbf7d0",
    primary: isDark ? "#eab308" : "#059669",
    primaryDark: isDark ? "#facc15" : "#10b981",
    accent: isDark ? "#eab308" : "#059669",
    accentDark: isDark ? "#facc15" : "#10b981",
    text: isDark ? "#e7e5e4" : "#1c1917",
    textMuted: isDark ? "#a8a29e" : "#6b7280",
    title: isDark ? "#facc15" : "#064e3b",
    iconBg: isDark ? "rgba(234, 179, 8, 0.2)" : "rgba(5, 150, 105, 0.1)",
    summary: isDark ? "#1a1a1a" : "#f0fdf4",
    summaryBorder: isDark ? "#333333" : "#bbf7d0",
    summaryText: isDark ? "#fde047" : "#166534",
    summaryTitle: isDark ? "#fde047" : "#065f46",
  };

  const cardStyle = { background: colors.bg, borderRadius: "24px", padding: "24px", border: `1px solid ${colors.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" };
  const iconBoxStyle = { width: "36px", height: "36px", borderRadius: "10px", background: `linear-gradient(135deg, ${colors.primary}, ${isDark ? '#ca8a04' : '#047857'})`, display: "flex", alignItems: "center", justifyContent: "center", color: "white" };
  const titleStyle = { fontSize: "20px", fontWeight: 600, color: colors.title, fontFamily: "serif" };
  const counterStyle = { width: "32px", height: "32px", borderRadius: "50%", background: colors.iconBg, display: "flex", alignItems: "center", justifyContent: "center", color: colors.primary, fontWeight: 700, fontSize: "14px" };

  if (loading) {
    return (
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={iconBoxStyle}><ShoppingCart size={18} /></div>
          <h2 style={titleStyle}>Your Cart</h2>
        </div>
        <p style={{ color: colors.textMuted, fontSize: "14px", textAlign: "center", padding: "16px 0" }}>
          <span style={{ display: "inline-block", width: "20px", height: "20px", border: `3px solid ${colors.primary}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", marginRight: "8px", verticalAlign: "middle" }}></span>
          Loading cart...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={iconBoxStyle}><ShoppingCart size={18} /></div>
          <h2 style={titleStyle}>Your Cart</h2>
        </div>
        <p style={{ color: "#dc2626", fontSize: "14px", textAlign: "center" }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={iconBoxStyle}><ShoppingCart size={18} /></div>
          <h2 style={titleStyle}>Your Cart</h2>
        </div>
        <div style={counterStyle}>{cartItems.length}</div>
      </div>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 16px" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🛒</div>
          <p style={{ color: colors.textMuted, fontSize: "15px", fontWeight: 500 }}>Your cart is empty</p>
          <p style={{ color: isDark ? "#78716c" : "#9ca3af", fontSize: "13px", marginTop: "4px" }}>Add some safari adventures to get started!</p>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px", maxHeight: "400px", overflowY: "auto" }}>
            {cartItems.map((item) => {
              const booking = item.booking;
              const pkg = booking?.package;

              return (
                <div key={item.Cart_ID} style={{ background: colors.bgItem, borderRadius: "16px", padding: "16px", border: `1px solid ${colors.borderItem}` }}>
                  {/* Header Row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <h4 style={{ fontWeight: 700, color: colors.title, fontSize: "16px" }}>
                      {pkg?.Package_Name || "Unknown Safari"}
                    </h4>
                    <button
                      onClick={() => handleRemove(booking?.Booking_ID)}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: colors.accent, padding: "4px", borderRadius: "8px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, marginLeft: "8px"
                      }}
                      title="Remove from cart"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Details Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "13px", color: colors.text, marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <CalendarDays size={14} color={colors.accent} />
                      <span>{booking?.Booking_Date}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Clock size={14} color={colors.accent} />
                      <span>{booking?.Pickup_Time}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", gridColumn: "span 2" }}>
                      <MapPin size={14} color={colors.accent} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{booking?.Pickup_Location}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Users size={14} color={colors.accent} />
                      <span>{booking?.No_of_adults} {booking?.No_of_adults === 1 ? "Adult" : "Adults"}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Baby size={14} color={colors.accent} />
                      <span>{booking?.No_of_child} {booking?.No_of_child === 1 ? "Child" : "Children"}</span>
                    </div>
                  </div>

                  {/* Price Row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: `1px solid ${colors.borderItem}` }}>
                    <span style={{ fontSize: "12px", color: colors.textMuted }}>Booking Total</span>
                    <span style={{ fontWeight: 700, color: colors.accentDark, fontSize: "16px" }}>
                      Rs. {Number(booking?.Payment || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Summary */}
          <div style={{
            padding: "16px", borderRadius: "12px",
            background: colors.summary, border: `1px solid ${colors.summaryBorder}`,
            marginBottom: "16px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: colors.summaryText }}>
                Cart Total ({cartItems.length} {cartItems.length === 1 ? "item" : "items"})
              </span>
              <span style={{ fontWeight: 700, color: colors.summaryTitle, fontSize: "20px" }}>
                Rs. {getCartTotal().toLocaleString()}
              </span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={() => window.location.href = "/user/cart"}
            style={{
              width: "100%",
              background: `linear-gradient(135deg, ${colors.primary}, ${isDark ? '#ca8a04' : '#047857'})`,
              color: "white", fontWeight: 600, padding: "14px 16px", borderRadius: "12px",
              border: "none", cursor: "pointer", fontSize: "15px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              boxShadow: `0 2px 8px ${isDark ? 'rgba(234,179,8,0.3)' : 'rgba(5,150,105,0.3)'}`
            }}
          >
            <ShoppingCart size={18} />
            View Full Cart & Checkout
          </button>
        </>
      )}
    </div>
  );
}