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
  const cardClass = isDark
    ? "rounded-3xl border border-[#2F4437] bg-[#1D2B22] p-6 shadow-sm"
    : "rounded-3xl border border-[#E6E2D8] bg-[#FFFFFF] p-6 shadow-sm";
  const iconBoxClass = isDark
    ? "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#43A047] to-[#66BB6A] text-white"
    : "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] text-white";
  const titleClass = isDark
    ? "text-xl font-semibold text-[#F5F5F5] font-serif"
    : "text-xl font-semibold text-[#263238] font-serif";
  const counterClass = isDark
    ? "flex h-8 w-8 items-center justify-center rounded-full bg-[#2F4437] text-sm font-bold text-[#F5F5F5]"
    : "flex h-8 w-8 items-center justify-center rounded-full bg-[#E6E2D8] text-sm font-bold text-[#2E7D32]";
  const mutedTextClass = isDark ? "text-[#C7D0CB]" : "text-[#6B7280]";
  const fieldTextClass = isDark ? "text-[#F5F5F5]" : "text-[#263238]";
  const borderLineClass = isDark ? "border-[#2F4437]" : "border-[#E6E2D8]";
  const summaryClass = isDark
    ? "rounded-xl border border-[#2F4437] bg-[#101813] p-4"
    : "rounded-xl border border-[#E6E2D8] bg-[#F8F6F0] p-4";
  const summaryTextClass = isDark ? "text-[#E6C15A]" : "text-[#1B5E20]";
  const summaryLabelClass = isDark ? "text-[#F5F5F5]" : "text-[#2E7D32]";

  if (loading) {
    return (
      <div className={cardClass}>
        <div className="mb-5 flex items-center gap-2.5">
          <div className={iconBoxClass}><ShoppingCart size={18} /></div>
          <h2 className={titleClass}>Your Cart</h2>
        </div>
        <p className={`py-4 text-center text-sm ${mutedTextClass}`}>
          <span className="mr-2 inline-block h-5 w-5 align-middle rounded-full border-[3px] border-[#2E7D32] border-t-transparent animate-spin dark:border-[#43A047]"></span>
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
        <div className="px-4 py-8 text-center">
          <div className="mb-3 text-5xl">🛒</div>
          <p className={`text-[15px] font-medium ${mutedTextClass}`}>Your cart is empty</p>
          <p className={isDark ? "mt-1 text-sm text-[#A3A3A3]" : "mt-1 text-sm text-[#6B7280]"}>Add some safari adventures to get started!</p>
        </div>
      ) : (
        <>
          <div className="mb-5 flex max-h-[400px] flex-col gap-4 overflow-y-auto">
            {cartItems.map((item) => {
              const booking = item.booking;
              const pkg = booking?.package;

              return (
                <div key={item.Cart_ID} className={isDark ? "rounded-2xl border border-[#2F4437] bg-[#101813] p-4" : "rounded-2xl border border-[#E6E2D8] bg-[#F8F6F0] p-4"}>
                  <div className="mb-3 flex items-start justify-between">
                    <h4 className={`text-[16px] font-bold ${isDark ? "text-[#F5F5F5]" : "text-[#263238]"}`}>
                      {pkg?.Package_Name || "Unknown Safari"}
                    </h4>
                    <button
                      onClick={() => handleRemove(booking?.Booking_ID)}
                      className="ml-2 flex shrink-0 items-center justify-center rounded-lg bg-transparent p-1 text-[#2E7D32] transition-colors hover:bg-[#E8F5E9] hover:text-[#1B5E20] dark:text-[#43A047] dark:hover:bg-[#2F4437] dark:hover:text-[#66BB6A]"
                      title="Remove from cart"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className={`mb-3 grid grid-cols-2 gap-2 text-sm ${fieldTextClass}`}>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays size={14} className={isDark ? "text-[#43A047]" : "text-[#2E7D32]"} />
                      <span>{booking?.Booking_Date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className={isDark ? "text-[#43A047]" : "text-[#2E7D32]"} />
                      <span>{booking?.Pickup_Time}</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-1.5">
                      <MapPin size={14} className={isDark ? "text-[#43A047]" : "text-[#2E7D32]"} />
                      <span className="truncate">{booking?.Pickup_Location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className={isDark ? "text-[#43A047]" : "text-[#2E7D32]"} />
                      <span>{booking?.No_of_adults} {booking?.No_of_adults === 1 ? "Adult" : "Adults"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Baby size={14} className={isDark ? "text-[#43A047]" : "text-[#2E7D32]"} />
                      <span>{booking?.No_of_child} {booking?.No_of_child === 1 ? "Child" : "Children"}</span>
                    </div>
                  </div>

                  <div className={`flex items-center justify-between border-t pt-3 ${borderLineClass}`}>
                    <span className={`text-xs ${mutedTextClass}`}>Booking Total</span>
                    <span className={`text-[16px] font-bold ${summaryTextClass}`}>
                      Rs. {Number(booking?.Payment || 0).toLocaleString()}
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
                Rs. {getCartTotal().toLocaleString()}
              </span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={() => window.location.href = "/user/cart"}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-0 px-4 py-3 text-[15px] font-semibold text-white shadow-sm transition-colors bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] hover:from-[#1B5E20] hover:to-[#2E7D32] dark:bg-gradient-to-r dark:from-[#43A047] dark:to-[#66BB6A] dark:hover:from-[#66BB6A] dark:hover:to-[#43A047]"
          >
            <ShoppingCart size={18} />
            View Full Cart & Checkout
          </button>
        </>
      )}
    </div>
  );
}