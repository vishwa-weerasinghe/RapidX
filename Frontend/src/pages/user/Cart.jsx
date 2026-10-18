import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  ShoppingBag,
  Calendar,
  Clock,
  MapPin,
  Users,
  Baby,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Clock3,
  Info,
} from "lucide-react";
import api from "../../axios";
import { useTheme } from "../../context/ThemeContext";
import { startPayHerePayment } from "../../utils/payhere";

export default function Cart() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const user = JSON.parse(localStorage.getItem("user"));
  const guestCustomer = JSON.parse(localStorage.getItem("guest_customer"));
  const activeCustomer = user || guestCustomer;

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [validPromoCode, setValidPromoCode] = useState("");
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("PayHere");

  useEffect(() => {
    if (!activeCustomer) {
      navigate("/login");
      return;
    }
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/cart/${activeCustomer.Customer_ID}`);
      setCartItems(res.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load your booking cart.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (bookingId) => {
    if (
      !confirm("Are you sure you want to remove this safari from your cart?")
    ) {
      return;
    }

    try {
      await api.delete(`/cart/${bookingId}`, {
        params: { Customer_ID: activeCustomer.Customer_ID },
      });
      setCartItems(cartItems.filter((item) => item.Booking_ID !== bookingId));
    } catch (err) {
      console.error(err);
      alert("Failed to remove item. Please try again.");
    }
  };

  const handleCheckout = async () => {
    try {
      setCheckingOut(true);
      const res = await api.post("/payhere/initiate", {
        checkout_type: "cart",
        Customer_ID: activeCustomer.Customer_ID,
        promotion_code: validPromoCode || undefined,
        payment_method: paymentMethod,
      });

      if (res.data?.payment_method === "Pay Later" || paymentMethod === "Pay Later") {
        navigate(`/payment/success?order_id=${res.data.order_id}`);
        return;
      }

      const { payhere_params } = res.data;

      if (payhere_params) {
        startPayHerePayment(payhere_params, {
          onCompleted: (completedOrderId) => {
            navigate(`/payment/success?order_id=${completedOrderId}`);
          },
          onDismissed: () => {
            setCheckingOut(false);
          },
          onError: (error) => {
            setCheckingOut(false);
            alert("Payment Error: " + error);
          },
        });
      } else {
        setCheckingOut(false);
      }
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message || "Checkout failed. Please try again."
      );
      setCheckingOut(false);
    }
  };

  const getCartTotal = () => {
    const total = cartItems.reduce((sum, item) => {
      // payment column contains cost
      return sum + Number(item.booking?.Payment || 0);
    }, 0);

    if (promoDiscount) {
      return Math.max(0, total - (total * (promoDiscount.discount_value / 100)));
    }
    return total;
  };

  const validatePromoCode = async () => {
    if (!promoCode.trim()) return;
    try {
      setValidatingPromo(true);
      setPromoError("");
      const res = await api.post("/promotion-codes/validate", { code: promoCode });
      setPromoDiscount(res.data.promotion);
      setValidPromoCode(promoCode);
    } catch (err) {
      console.error(err);
      setPromoError(err.response?.data?.message || "Invalid promotion code");
      setPromoDiscount(null);
      setValidPromoCode("");
    } finally {
      setValidatingPromo(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-screen transition-colors duration-300 ${theme === "dark" ? "bg-bg-dark" : "bg-offwhite"}`}>
        <div className="w-14 h-14 border-[5px] border-sacramento border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-6 sm:py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${theme === "dark" ? "bg-bg-dark text-white" : "bg-slate-50/50 text-charcoal"}`}>
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Modern Header Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-border-light dark:border-border-dark/60 bg-white dark:bg-[#16231c] p-6 sm:p-8 shadow-sm">
          <div className="absolute -top-14 -right-14 w-48 h-48 bg-sacramento/10 dark:bg-sacramento-900/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-sacramento text-white rounded-2xl shadow-sm shrink-0">
                <ShoppingBag size={24} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  My Booking Cart
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Review your selected safaris and apply vouchers before checkout.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-surface-2 border border-slate-200/80 dark:border-border-dark text-xs font-bold text-slate-700 dark:text-slate-300 self-start sm:self-auto">
              <span>{cartItems.length} {cartItems.length === 1 ? "Adventure" : "Adventures"} queued</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-900/30 dark:text-red-400 rounded-2xl p-4 text-center text-sm font-semibold">
            {error}
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="card rounded-3xl p-12 text-center border border-border-light dark:border-border-dark/60 shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-surface-2 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <ShoppingBag size={28} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
              Your Cart is Empty
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mb-6">
              You haven't added any safari adventures to your cart yet.
            </p>
            <button
              onClick={() => navigate("/user/packages")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sacramento hover:bg-sacramento-600 text-white font-bold text-sm shadow-sm transition active:scale-95"
            >
              <span>Explore Safari Packages</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-5">
              {cartItems.map((item) => {
                const booking = item.booking;
                const pkg = booking?.package;
                if (!booking || !pkg) return null;

                return (
                  <div
                    key={item.Cart_ID}
                    className="relative overflow-hidden rounded-3xl border border-border-light dark:border-border-dark/60 bg-white dark:bg-[#16231c] p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center"
                  >
                    {/* Booking Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-sacramento/10 dark:bg-sacramento-900/40 text-sacramento dark:text-castleton-300 border border-sacramento/20">
                          Safari Tour
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                          Ref #{booking.Booking_ID}
                        </span>
                      </div>

                      <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {pkg.Package_Name}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-surface-2/60 border border-slate-100 dark:border-border-dark/40">
                          <Calendar size={15} className="text-sacramento dark:text-castleton-300 shrink-0" />
                          <span className="font-semibold">{booking.Booking_Date}</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-surface-2/60 border border-slate-100 dark:border-border-dark/40">
                          <Clock size={15} className="text-sacramento dark:text-castleton-300 shrink-0" />
                          <span className="font-semibold">{booking.Pickup_Time}</span>
                        </div>
                        <div className="flex items-center gap-2 sm:col-span-2 p-2 rounded-xl bg-slate-50 dark:bg-surface-2/60 border border-slate-100 dark:border-border-dark/40">
                          <MapPin size={15} className="text-sacramento dark:text-castleton-300 shrink-0" />
                          <span className="font-medium truncate">{booking.Pickup_Location || "Pickup to be confirmed"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <span className="inline-flex items-center gap-1.5">
                          <Users size={14} className="text-sacramento dark:text-castleton-300" />
                          {booking.No_of_adults} Adults
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Baby size={14} className="text-sacramento dark:text-castleton-300" />
                          {booking.No_of_child} Children
                        </span>
                      </div>
                    </div>

                    {/* Price and Action */}
                    <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-border-dark/60 gap-4">
                      <div className="text-left md:text-right">
                        <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">
                          Total Price
                        </span>
                        <span className="text-2xl font-black text-sacramento dark:text-castleton-300">
                          ${Number(booking.Payment).toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRemove(booking.Booking_ID)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-500 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:text-white rounded-xl transition duration-200 text-xs font-bold border border-red-200 dark:border-red-900/40 cursor-pointer shadow-sm active:scale-95"
                        title="Remove booking"
                      >
                        <Trash2 size={15} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary */}
            <div className="rounded-3xl border border-border-light dark:border-border-dark/60 bg-white dark:bg-[#16231c] p-6 sm:p-7 shadow-sm space-y-6 h-fit sticky top-24">
              <div className="border-b border-slate-100 dark:border-border-dark/60 pb-4">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Booking Summary
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review payment breakdown and options
                </p>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <div className="flex justify-between items-center">
                  <span>Safari Adventures</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {cartItems.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Taxes & Park Entrance</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Included</span>
                </div>

                {/* Promo Code Input */}
                <div className="pt-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo Code"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-surface-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sacramento/30 focus:border-sacramento transition"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <button
                      onClick={validatePromoCode}
                      disabled={validatingPromo || !promoCode.trim()}
                      className="px-4 py-2.5 bg-sacramento hover:bg-sacramento-600 text-white text-xs sm:text-sm font-bold rounded-xl disabled:opacity-50 transition cursor-pointer shadow-sm active:scale-95"
                    >
                      {validatingPromo ? "..." : "Apply"}
                    </button>
                  </div>
                  {promoError && <p className="text-red-500 text-xs mt-1.5 font-medium">{promoError}</p>}
                  {promoDiscount && (
                    <p className="text-emerald-600 dark:text-emerald-400 text-xs mt-1.5 font-bold flex items-center gap-1">
                      ✓ Promo applied! {promoDiscount.discount_value}% discount
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-border-dark/60 font-bold text-base text-slate-900 dark:text-white">
                  <div>
                    <span className="block text-sm font-bold">Total Amount</span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/80 px-2 py-0.5 rounded-full mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Guaranteed Rate
                    </span>
                  </div>
                  <span className="text-2xl font-black text-sacramento dark:text-castleton-300">
                    ${getCartTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="pt-2 space-y-2.5 border-t border-slate-100 dark:border-border-dark/60">
                <span className="text-xs font-bold uppercase tracking-wider block text-slate-500 dark:text-slate-400">
                  Payment Method
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("PayHere")}
                    className={`p-3.5 rounded-2xl border text-left transition text-xs flex flex-col justify-between cursor-pointer ${
                      paymentMethod === "PayHere"
                        ? "border-sacramento bg-sacramento/10 text-sacramento font-bold ring-2 ring-sacramento/20"
                        : "border-slate-200 dark:border-border-dark text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <CreditCard size={18} className="text-sacramento" />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "PayHere" ? "border-sacramento" : "border-slate-300 dark:border-slate-600"}`}>
                        {paymentMethod === "PayHere" && <div className="w-2 h-2 rounded-full bg-sacramento"></div>}
                      </div>
                    </div>
                    <span className="font-bold">Pay Online</span>
                    <span className="text-[10px] font-normal opacity-75 mt-0.5">Card / PayHere</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("Pay Later")}
                    className={`p-3.5 rounded-2xl border text-left transition text-xs flex flex-col justify-between cursor-pointer ${
                      paymentMethod === "Pay Later"
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-bold ring-2 ring-amber-500/20"
                        : "border-slate-200 dark:border-border-dark text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <Clock3 size={18} className="text-amber-500" />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "Pay Later" ? "border-amber-500" : "border-slate-300 dark:border-slate-600"}`}>
                        {paymentMethod === "Pay Later" && <div className="w-2 h-2 rounded-full bg-amber-500"></div>}
                      </div>
                    </div>
                    <span className="font-bold">Pay Later</span>
                    <span className="text-[10px] font-normal opacity-75 mt-0.5">Reserve Now</span>
                  </button>
                </div>
              </div>

              {paymentMethod === "Pay Later" ? (
                <div className="p-3.5 rounded-2xl flex items-start gap-2.5 text-xs leading-relaxed bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                  <Info size={18} className="shrink-0 mt-0.5" />
                  <span>
                    Your bookings will be placed with <strong>Pending</strong> status, and confirmation emails will be sent immediately. Payment will be collected by our admin near the tour date.
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl flex flex-col gap-2.5 text-xs leading-relaxed bg-sacramento/10 text-sacramento border border-sacramento/20">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck size={18} className="shrink-0 mt-0.5" />
                    <span>
                      Pay securely online using PayHere payment gateway. Instant booking confirmation is provided.
                    </span>
                  </div>
                  <img
                    src="/payhere-cards.png"
                    alt="Accepted Cards: LankaPay, Visa, Mastercard, American Express, Discover, Diners Club"
                    className="w-full max-w-[260px] h-auto object-contain rounded"
                  />
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-md active:scale-98 ${
                  paymentMethod === "Pay Later"
                    ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20"
                    : "bg-sacramento hover:bg-sacramento-600 text-white shadow-sacramento/20"
                }`}
              >
                {checkingOut ? (
                  <div className="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{paymentMethod === "Pay Later" ? "Confirm & Reserve (Pay Later)" : "Pay Online & Confirm"}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}