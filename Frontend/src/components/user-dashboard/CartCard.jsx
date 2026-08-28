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
      await api.delete(`/cart/${bookingId}`, {
        params: { Customer_ID: customerId },
      });
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
  const summaryClass = isDark
    ? "rounded-xl border border-border-dark bg-surface p-4"
    : "rounded-xl border border-border-light bg-surface-2 p-4";
  const summaryTextClass = isDark ? "text-gold" : "text-sacramento-600";
  const summaryLabelClass = isDark ? "text-white" : "text-sacramento";

  if (loading) {
    return (
      <div className={cardClass}>
        <div className="mb-5 flex items-center gap-2.5">
          <div className={iconBoxClass}><ShoppingCart size={18} /></div>
          <h2 className={titleClass}>Your Cart</h2>
        </div>
        <p className={`py-4 text-center text-sm ${mutedTextClass}`}>
          <span className="mr-2 inline-block h-5 w-5 align-middle rounded-full border-[3px] border-sacramento border-t-transparent animate-spin"></span>
          Loading cart...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cardClass}>
        <div className="mb-5 flex items-center gap-2.5">
          <div className={iconBoxClass}><ShoppingCart size={18} /></div>
          <h2 className={titleClass}>Your Cart</h2>
        </div>
        <p className="text-center text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={iconBoxClass}><ShoppingCart size={18} /></div>
          <h2 className={titleClass}>Your Cart</h2>
        </div>
        <div className={counterClass}>{cartItems.length}</div>
      </div>

      {cartItems.length === 0 ? (
        <div className="px-4 py-6 sm:py-8 text-center">
          <div className="mb-3 text-5xl">🛒</div>
          <p className={`text-[15px] font-medium ${mutedTextClass}`}>Your cart is empty</p>
          <p className={`mt-1 text-sm ${mutedTextClass}`}>Add some safari adventures to get started!</p>
        </div>
      ) : (
        <>
          <div className="mb-5 flex max-h-[400px] flex-col gap-4 overflow-y-auto">
            {cartItems.map((item) => {
              const booking = item.booking;
              const pkg = booking?.package;

              return (
                <div key={item.Cart_ID} className={isDark ? "rounded-2xl border border-border-dark bg-surface p-3 sm:p-4" : "rounded-2xl border border-border-light bg-surface-2 p-3 sm:p-4"}>
                  <div className="mb-3 flex items-start justify-between">
                    <h4 className={`text-[16px] font-bold ${isDark ? "text-white" : "text-charcoal"}`}>
                      {pkg?.Package_Name || "Unknown Safari"}
                    </h4>
                    <button
                      onClick={() => handleRemove(booking?.Booking_ID)}
                      className="ml-2 flex shrink-0 items-center justify-center rounded-lg bg-transparent p-1 text-sacramento transition-colors hover:bg-sacramento/10 hover:text-sacramento-600 dark:text-sacramento-300 dark:hover:bg-border-dark dark:hover:text-sacramento-300"
                      title="Remove from cart"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className={`mb-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm ${fieldTextClass}`}>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays size={14} className={isDark ? "text-sacramento-300" : "text-sacramento"} />
                      <span>{booking?.Booking_Date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className={isDark ? "text-sacramento-300" : "text-sacramento"} />
                      <span>{booking?.Pickup_Time}</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-1.5">
                      <MapPin size={14} className={isDark ? "text-sacramento-300" : "text-sacramento"} />
                      <span className="truncate">{booking?.Pickup_Location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className={isDark ? "text-sacramento-300" : "text-sacramento"} />
                      <span>{booking?.No_of_adults} {booking?.No_of_adults === 1 ? "Adult" : "Adults"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Baby size={14} className={isDark ? "text-sacramento-300" : "text-sacramento"} />
                      <span>{booking?.No_of_child} {booking?.No_of_child === 1 ? "Child" : "Children"}</span>
                    </div>
                  </div>

                  <div className={`flex items-center justify-between border-t pt-3 ${borderLineClass}`}>
                    <span className={`text-xs ${mutedTextClass}`}>Booking Total</span>
                    <span className={`text-[16px] font-bold ${summaryTextClass}`}>
                      $ {Number(booking?.Payment || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Summary */}
          <div className={`${summaryClass} mb-4`}>
              <div className="flex items-center justify-between">
              <span className={`text-sm font-semibold ${summaryLabelClass}`}>
                Cart Total ({cartItems.length} {cartItems.length === 1 ? "item" : "items"})
              </span>
              <span className={`text-xl font-bold ${summaryTextClass}`}>
                $ {getCartTotal().toLocaleString()}
              </span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={() => window.location.href = "/user/cart"}
            className="btn-primary w-full py-3"
          >
            <ShoppingCart size={18} />
            View Full Cart & Checkout
          </button>
        </>
      )}
    </div>
  );
}