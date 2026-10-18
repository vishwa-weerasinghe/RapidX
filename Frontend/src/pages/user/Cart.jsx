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
    <div className={`min-h-screen py-12 px-6 transition-colors duration-300 ${theme === "dark" ? "bg-bg-dark text-white" : "bg-offwhite text-charcoal"}`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-sacramento text-white rounded-2xl shadow-md">
            <ShoppingBag size={28} />
          </div>
          <div>
            <h1 className={`text-3xl font-black ${theme === "dark" ? "text-white" : "text-sacramento"}`}>
              My Booking Cart
            </h1>
            <p className={`text-sm ${theme === "dark" ? "text-muted" : "text-muted"}`}>
              Review your selected safaris before final confirmation.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-900/30 dark:text-red-400 rounded-xl p-4 mb-6 text-center">
            {error}
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className={`card p-12 text-center border shadow-md backdrop-blur-md`}>
            <div className="text-6xl mb-4">🛒</div>
            <h2 className={`text-2xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-sacramento"}`}>
              Your Cart is Empty
            </h2>
            <p className={`mb-6 ${theme === "dark" ? "text-muted" : "text-muted"}`}>
              You haven't added any safari adventures to your cart yet.
            </p>
            <button
              onClick={() => navigate("/#packages")}
              className="btn-primary px-6 py-3 rounded-full"
            >
              Explore Safari Packages
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item) => {
                const booking = item.booking;
                const pkg = booking?.package;
                if (!booking || !pkg) return null;

                return (
                  <div
                    key={item.Cart_ID}
                    className={`card p-6 shadow-md border hover:shadow-xl transition duration-300 relative flex flex-col md:flex-row gap-6 justify-between items-start md:items-center`}
                  >
                    {/* Booking Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-sacramento/10 text-sacramento`}>
                          Safari Booked
                        </span>
                      </div>

                      <h3 className={`text-xl font-bold transition ${theme === "dark" ? "text-white" : "text-sacramento"}`}>
                        {pkg.Package_Name}
                      </h3>

                      <div className={`grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-muted`}>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={16} className="text-sacramento dark:text-castleton-300" />
                          <span>{booking.Booking_Date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={16} className="text-sacramento dark:text-castleton-300" />
                          <span>{booking.Pickup_Time}</span>
                        </div>
                        <div className="flex items-center gap-1.5 col-span-2">
                          <MapPin
                            size={16}
                            className="text-sacramento dark:text-castleton-300 flex-shrink-0"
                          />
                          <span className="truncate">
                            {booking.Pickup_Location}
                          </span>
                        </div>
                      </div>

                      <div className={`flex gap-4 pt-1 border-t text-xs text-muted border-border-light dark:border-border-dark`}>
                        <span className="flex items-center gap-1">
                          <Users size={14} className="text-sacramento dark:text-castleton-300" />
                          {booking.No_of_adults} Adults
                        </span>
                        <span className="flex items-center gap-1">
                          <Baby size={14} className="text-sacramento dark:text-castleton-300" />
                          {booking.No_of_child} Children
                        </span>
                      </div>
                    </div>

                    {/* Price and Action */}
                    <div className="flex md:flex-col items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-border-light dark:border-border-dark">
                      <div className="text-right">
                        <span className={`text-xs block text-muted`}>
                          Total Price
                        </span>
                        <span className={`text-lg font-black ${theme === "dark" ? "text-castleton-300" : "text-sacramento"}`}>
                          $ {Number(booking.Payment).toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRemove(booking.Booking_ID)}
                        className="mt-2 p-2 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-300 hover:bg-red-600 hover:text-white rounded-xl transition duration-300 shadow-sm"
                        title="Remove booking"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary */}
            <div className={`card rounded-3xl p-6 shadow-lg border h-fit space-y-6`}>
              <h2 className={`text-lg font-bold border-b pb-3 border-border-light dark:border-border-dark ${theme === "dark" ? "text-white" : "text-sacramento"}`}>
                Booking Summary
              </h2>

              <div className={`space-y-3 text-sm text-muted`}>
                <div className="flex justify-between">
                  <span>Safari Bookings</span>
                  <span className={`font-semibold ${theme === "dark" ? "text-castleton-300" : "text-sacramento"}`}>
                    {cartItems.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & Service Fees</span>
                  <span className={`font-semibold ${theme === "dark" ? "text-castleton-300" : "text-sacramento"}`}>Included</span>
                </div>

                {/* Promo Code Input */}
                <div className="pt-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo Code"
                      className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sacramento/50 ${theme === "dark" ? "bg-bg-dark border-border-dark text-white" : "bg-white border-border-light text-charcoal"}`}
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <button
                      onClick={validatePromoCode}
                      disabled={validatingPromo || !promoCode.trim()}
                      className="px-4 py-2 bg-sacramento text-white text-sm font-semibold rounded-lg disabled:opacity-50"
                    >
                      {validatingPromo ? "..." : "Apply"}
                    </button>
                  </div>
                  {promoError && <p className="text-red-500 text-xs mt-1">{promoError}</p>}
                  {promoDiscount && (
                    <p className="text-green-500 text-xs mt-1">
                      Code applied! {promoDiscount.discount_value}% off
                    </p>
                  )}
                </div>

                <div className={`flex justify-between items-center pt-3 border-t font-bold text-base border-border-light dark:border-border-dark ${theme === "dark" ? "text-white" : "text-charcoal"}`}>
                  <div>
                    <span className="block">Total Amount</span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/80 px-2 py-0.5 rounded-full mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      No Hidden Charges
                    </span>
                  </div>
                  <span className={`text-xl ${theme === "dark" ? "text-castleton-300" : "text-sacramento"}`}>
                    $ {getCartTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="pt-2 space-y-2 border-t border-border-light dark:border-border-dark">
                <span className={`text-xs font-bold uppercase tracking-wider block ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                  Payment Method
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("PayHere")}
                    className={`p-3 rounded-xl border text-left transition text-xs flex flex-col justify-between cursor-pointer ${paymentMethod === "PayHere"
                      ? "border-sacramento bg-sacramento/10 text-sacramento font-bold ring-1 ring-sacramento"
                      : "border-border-light dark:border-border-dark text-muted hover:border-slate-400"
                      }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <CreditCard size={16} className="text-sacramento" />
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${paymentMethod === "PayHere" ? "border-sacramento" : "border-slate-400"}`}>
                        {paymentMethod === "PayHere" && <div className="w-2 h-2 rounded-full bg-sacramento"></div>}
                      </div>
                    </div>
                    <span>Pay Online</span>
                    <span className="text-[10px] font-normal opacity-75">Card / PayHere</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("Pay Later")}
                    className={`p-3 rounded-xl border text-left transition text-xs flex flex-col justify-between cursor-pointer ${paymentMethod === "Pay Later"
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-bold ring-1 ring-amber-500"
                      : "border-border-light dark:border-border-dark text-muted hover:border-slate-400"
                      }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <Clock3 size={16} className="text-amber-500" />
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${paymentMethod === "Pay Later" ? "border-amber-500" : "border-slate-400"}`}>
                        {paymentMethod === "Pay Later" && <div className="w-2 h-2 rounded-full bg-amber-500"></div>}
                      </div>
                    </div>
                    <span>Pay Later</span>
                  </button>
                </div>
              </div>

              {paymentMethod === "Pay Later" ? (
                <div className="p-3.5 rounded-2xl flex items-start gap-2.5 text-xs leading-relaxed bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                  <Info size={18} className="flex-shrink-0 mt-0.5" />
                  <span>
                    Your bookings will be placed with <strong>Pending</strong> status, and confirmation emails will be sent immediately. Payment will be collected by our admin near the tour date.
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl flex flex-col gap-2.5 text-xs leading-relaxed bg-sacramento/10 text-sacramento">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck size={18} className="flex-shrink-0 mt-0.5" />
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
                className={`w-full py-3.5 rounded-full font-bold flex items-center justify-center gap-2 transition duration-200 cursor-pointer ${paymentMethod === "Pay Later"
                  ? "bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20"
                  : "btn-primary"
                  }`}
              >
                {checkingOut ? (
                  <div className="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    {paymentMethod === "Pay Later" ? "Confirm & Reserve (Pay Later)" : "Pay Online & Confirm"}
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