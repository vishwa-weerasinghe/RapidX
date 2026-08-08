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
} from "lucide-react";
import api from "../../axios";
import { useTheme } from "../../context/ThemeContext";

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
      await api.delete(`/cart/${bookingId}`);
      setCartItems(cartItems.filter((item) => item.Booking_ID !== bookingId));
    } catch (err) {
      console.error(err);
      alert("Failed to remove item. Please try again.");
    }
  };

  const handleCheckout = async () => {
    try {
      setCheckingOut(true);
      await api.post("/cart/checkout", {
        Customer_ID: activeCustomer.Customer_ID,
      });
      alert("Checkout Successful! 🎉 Your bookings are now confirmed.");
      if (user) {
        navigate("/user/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message || "Checkout failed. Please try again.",
      );
    } finally {
      setCheckingOut(false);
    }
  };

  // Calculate overall cart total
  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => {
      // payment column contains cost
      return sum + Number(item.booking?.Payment || 0);
    }, 0);
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
                          Rs. {Number(booking.Payment).toLocaleString()}
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
                <div className={`flex justify-between items-center pt-3 border-t font-bold text-base border-border-light dark:border-border-dark ${theme === "dark" ? "text-white" : "text-charcoal"}`}>
                  <span>Total Amount</span>
                  <span className={`text-xl ${theme === "dark" ? "text-castleton-300" : "text-sacramento"}`}>
                    Rs. {getCartTotal().toLocaleString()}
                  </span>
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl flex items-start gap-2.5 text-xs leading-relaxed bg-sacramento/10 text-sacramento`}>
                <ShieldCheck size={18} className="flex-shrink-0 mt-0.5" />
                <span>
                  By confirming, your bookings will be placed as{" "}
                  <strong>Confirmed</strong>, ready for guide/vehicle allocation by
                  our admins. No immediate payment is required.
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="btn-primary w-full py-3.5 rounded-full"
              >
                {checkingOut ? (
                  <div className="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Confirm & Place Bookings
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