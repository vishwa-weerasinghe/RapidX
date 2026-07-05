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

export default function Cart() {
  const navigate = useNavigate();
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
      alert("Checkout Successful! 🎉 Your bookings are now pending approval.");
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
      <div className="flex justify-center items-center h-screen bg-[#F4F8F3]">
        <div className="w-14 h-14 border-[5px] border-green-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F9F3] via-[#EDF5E8] to-[#DCE9D4] py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-green-700 text-white rounded-2xl shadow-md">
            <ShoppingBag size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#1F3D2B]">
              My Booking Cart
            </h1>
            <p className="text-gray-600 text-sm">
              Review your selected safaris before final confirmation.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 rounded-xl p-4 mb-6 text-center">
            {error}
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-12 text-center border border-green-100 shadow-md">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-[#1F3D2B] mb-2">
              Your Cart is Empty
            </h2>
            <p className="text-gray-500 mb-6">
              You haven't added any safari adventures to your cart yet.
            </p>
            <button
              onClick={() => navigate("/#packages")}
              className="px-6 py-3 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl transition duration-300 inline-flex items-center gap-2"
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
                    className="group bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-md border border-green-50 hover:shadow-xl transition duration-300 relative flex flex-col md:flex-row gap-6 justify-between items-start md:items-center"
                  >
                    {/* Booking Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Safari Booked
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-green-900 group-hover:text-green-700 transition">
                        {pkg.Package_Name}
                      </h3>

                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={16} className="text-green-700" />
                          <span>{booking.Booking_Date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={16} className="text-green-700" />
                          <span>{booking.Pickup_Time}</span>
                        </div>
                        <div className="flex items-center gap-1.5 col-span-2">
                          <MapPin
                            size={16}
                            className="text-green-700 flex-shrink-0"
                          />
                          <span className="truncate">
                            {booking.Pickup_Location}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-1 border-t border-green-50 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users size={14} className="text-green-700" />
                          {booking.No_of_adults} Adults
                        </span>
                        <span className="flex items-center gap-1">
                          <Baby size={14} className="text-green-700" />
                          {booking.No_of_child} Children
                        </span>
                      </div>
                    </div>

                    {/* Price and Action */}
                    <div className="flex md:flex-col items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-green-50">
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block">
                          Total Price
                        </span>
                        <span className="text-lg font-black text-green-800">
                          Rs. {Number(booking.Payment).toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRemove(booking.Booking_ID)}
                        className="mt-2 p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition duration-300 shadow-sm"
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
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-green-100 h-fit space-y-6">
              <h2 className="text-lg font-bold text-[#1F3D2B] border-b pb-3">
                Booking Summary
              </h2>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Safari Bookings</span>
                  <span className="font-semibold text-green-950">
                    {cartItems.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & Service Fees</span>
                  <span className="font-semibold text-green-950">Included</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t font-bold text-base text-[#1F3D2B]">
                  <span>Total Amount</span>
                  <span className="text-xl text-green-700">
                    Rs. {getCartTotal().toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-green-50 rounded-2xl flex items-start gap-2.5 text-xs text-green-800 leading-relaxed">
                <ShieldCheck size={18} className="flex-shrink-0 mt-0.5" />
                <span>
                  By confirming, your bookings will be placed as{" "}
                  <strong>Pending</strong>, awaiting guide/vehicle allocation by
                  our admins. No immediate payment is required.
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-700 to-emerald-600 hover:from-emerald-600 hover:to-green-800 text-white font-bold transition duration-300 flex justify-center items-center gap-2 shadow disabled:opacity-50"
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
