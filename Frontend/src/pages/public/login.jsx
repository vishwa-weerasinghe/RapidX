import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/login",
        {
          Email,
          Password,
        }
      );

      console.log("LOGIN RESPONSE:", response.data);

      const data = response.data;

      const user = data.user;
      const token = data.token;

      if (!user || !token) {
        setErrors({ general: "Invalid login response from server" });
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Check if there is a pending cart item
      const pendingCartStr = localStorage.getItem("pending_cart");
      if (pendingCartStr) {
        try {
          const pendingCart = JSON.parse(pendingCartStr);
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const dateStr = tomorrow.toISOString().split("T")[0];

          const payload = {
            Booking_Date: pendingCart.Booking_Date || dateStr,
            Pickup_Time: pendingCart.Pickup_Time || "06:00",
            Pickup_Location: pendingCart.Pickup_Location || "Hotel Pickup",
            No_of_adults: pendingCart.No_of_adults || 1,
            No_of_child: pendingCart.No_of_child || 0,
            Package_ID: pendingCart.Package_ID,
            Payment: pendingCart.Payment || 0,
            Customer_ID: user.Customer_ID,
          };

          await axios.post("http://127.0.0.1:8000/api/cart", payload, {
            headers: { Authorization: `Bearer ${token}` },
          });
          localStorage.removeItem("pending_cart");
          alert("Safari added to your dashboard cart successfully! 🎉");
        } catch (cartErr) {
          console.error("Failed to auto-add pending cart item on login:", cartErr);
        }
      }

      const role = `${user?.role ?? user?.Role ?? user?.user_type ?? "customer"}`.toLowerCase();
      const destination = ["admin", "administrator", "superadmin"].includes(role)
        ? "/admin/dashboard"
        : "/user/dashboard";

      navigate(destination);

    } catch (err) {
      console.log("LOGIN ERROR:", err.response?.data);

      setErrors({
        general:
          err.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  return (

    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 relative"
      style={{
        backgroundImage: `url('https://minneriyawildjeepsafari.com/wp-content/uploads/2024/05/Udawalawe-National-Park-4.jpg')`,
      }}
    >
      {/* Dark overlay backdrop to match Screenshot (64)_2.jpg */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

      {/* Balanced login form container sizing */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
            Welcome Back
          </h2>
          <p className="text-xs font-semibold tracking-widest text-castleton-300 uppercase mt-1">
            — JOIN THE ADVENTURE —
          </p>
        </div>

        {errors.general && (
          <div className="mt-4 rounded-lg bg-red-500/20 border border-red-500/40 p-3 text-sm text-red-200 text-center">
            {errors.general}
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleLogin}>
          {/* Email / Username field */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-300">
                {/* Mail Icon matching Register layout */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <input
                type="email"
                name="Email"
                required
                className="block w-full rounded-lg border border-white/20 bg-white/10 py-2.5 pl-10 pr-3 text-white placeholder-gray-400 backdrop-blur-sm transition focus:border-castleton-300 focus:outline-none focus:ring-1 focus:ring-castleton-300 sm:text-sm"
                placeholder="john@email.com"
                value={Email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {errors.Email && (
              <p className="mt-1 text-xs text-red-300 font-medium">
                {errors.Email[0]}
              </p>
            )}
          </div>

          {/* Password field */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-300">
                {/* Lock Icon matching Register layout */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                type="password"
                name="Password"
                required
                className="block w-full rounded-lg border border-white/20 bg-white/10 py-2.5 pl-10 pr-3 text-white placeholder-gray-400 backdrop-blur-sm transition focus:border-castleton-300 focus:outline-none focus:ring-1 focus:ring-castleton-300 sm:text-sm"
                placeholder="••••••••"
                value={Password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {errors.Password && (
              <p className="mt-1 text-xs text-red-300 font-medium">
                {errors.Password[0]}
              </p>
            )}
          </div>

          <a
            href="#"
            className="text-xs text-castleton-300 hover:underline text-right block transition"
          >
            Forgot Password?
          </a>

          {/* Submit Button with matching background gradient and tracking text */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center rounded-lg bg-gradient-to-r from-sacramento to-castleton px-4 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition hover:from-sacramento-600 hover:to-castleton-600 disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In →"}
            </button>
          </div>
        </form>

        {/* Alternate Navigation */}
        <p className="mt-6 text-center text-sm text-gray-300">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-bold text-castleton-300 hover:text-castleton-200 transition underline"
          >
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
}