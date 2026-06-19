import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [First_Name, setFirstName] = useState("");
  const [Last_Name, setLastName] = useState("");
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [Password_Confirmation, setPasswordConfirmation] = useState("");
  const [Phone_No, setPhone_No] = useState("");
  const [NIC, setNIC] = useState("");
  const [Country, setCountry] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/register", {
        First_Name: First_Name,
        Last_Name: Last_Name,
        Email: Email,
        Phone_No: Phone_No,
        NIC: NIC,
        Country: Country,
        Password: Password,
        Password_confirmation: Password_Confirmation,
      });

      // Automatically log them in by saving the token
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Redirect to the dashboard
      navigate("/dashboard");
    } catch (err) {
      if (err.response && err.response.data.errors) {
        // Capture specific validation errors from Laravel (e.g., email already taken)
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: "Something went wrong. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=2068&auto=format&fit=crop')`,
      }}
    >
      {/* Dark overlay to make the glass card pop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>

      {/* Glassmorphic Container with crisp, solid borders */}
      <div className="relative w-full max-w-lg rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-md">
        {/* Header / Brand Logo */}
        <div className="text-center">
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
            Create Your Account
          </h2>
          <p className="text-xs font-semibold tracking-widest text-emerald-300 uppercase mt-1">
            — Join the Adventure—
          </p>
        </div>

        {/* Error Notification */}
        {errors.general && (
          <div className="mt-4 rounded-lg bg-red-500/20 border border-red-500/40 p-3 text-sm text-red-200 backdrop-blur-sm">
            {errors.general}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleRegister}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* First Name Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                First Name
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-300">
                  {/* SVG User Icon */}
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
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  type="text"
                  required
                  className="block w-full rounded-lg border border-white/20 bg-white/10 py-2.5 pl-10 pr-3 text-white placeholder-gray-400 backdrop-blur-sm transition focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 sm:text-sm"
                  placeholder="John"
                  value={First_Name}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              {errors.First_Name && (
                <p className="mt-1 text-xs text-red-300 font-medium">
                  {errors.First_Name[0]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Last Name
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-300">
                  {/* SVG User Icon */}
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
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  type="text"
                  required
                  className="block w-full rounded-lg border border-white/20 bg-white/10 py-2.5 pl-10 pr-3 text-white placeholder-gray-400 backdrop-blur-sm transition focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 sm:text-sm"
                  placeholder="Doe"
                  value={Last_Name}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              {errors.Last_Name && (
                <p className="mt-1 text-xs text-red-300 font-medium">
                  {errors.Last_Name[0]}
                </p>
              )}
            </div>
          </div>

          {/* Email Address Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-300">
                {/* SVG Mail Icon */}
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
                required
                className="block w-full rounded-lg border border-white/20 bg-white/10 py-2.5 pl-10 pr-3 text-white placeholder-gray-400 backdrop-blur-sm transition focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 sm:text-sm"
                placeholder="johndoe@gmail.com"
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Phone No
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-300">
                  {/* SVG Phone Icon */}
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
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <input
                  type="text"
                  required
                  className="block w-full rounded-lg border border-white/20 bg-white/10 py-2.5 pl-10 pr-3 text-white placeholder-gray-400 backdrop-blur-sm transition focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 sm:text-sm"
                  placeholder="+94 77 123 4567"
                  value={Phone_No}
                  onChange={(e) => setPhone_No(e.target.value)}
                />
              </div>
              {errors.Phone_No && (
                <p className="mt-1 text-xs text-red-300 font-medium">
                  {errors.Phone_No[0]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Country
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-300">
                  {/* SVG Globe Icon */}
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
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </span>
                <input
                  type="text"
                  required
                  className="block w-full rounded-lg border border-white/20 bg-white/10 py-2.5 pl-10 pr-3 text-white placeholder-gray-400 backdrop-blur-sm transition focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 sm:text-sm"
                  placeholder="Sri Lanka"
                  value={Country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
              {errors.Country && (
                <p className="mt-1 text-xs text-red-300 font-medium">
                  {errors.Country[0]}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
              NIC / Passport
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-300">
                {/* SVG ID Card / Badge Icon */}
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
                  <path d="M16 22H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2z" />
                  <path d="M22 6h-4M22 10h-4M22 14h-4" />
                  <circle cx="10" cy="8" r="2" />
                  <path d="M14 16a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v1" />
                </svg>
              </span>
              <input
                type="text"
                required
                className="block w-full rounded-lg border border-white/20 bg-white/10 py-2.5 pl-10 pr-3 text-white placeholder-gray-400 backdrop-blur-sm transition focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 sm:text-sm"
                placeholder="199512345678 or N1234567"
                value={NIC}
                onChange={(e) => setNIC(e.target.value)}
              />
            </div>
            {errors.NIC && (
              <p className="mt-1 text-xs text-red-300 font-medium">
                {errors.NIC[0]}
              </p>
            )}
          </div>

          {/* Password Inputs Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Password
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-300">
                  {/* SVG Lock Icon */}
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
                  required
                  className="block w-full rounded-lg border border-white/20 bg-white/10 py-2.5 pl-10 pr-3 text-white placeholder-gray-400 backdrop-blur-sm transition focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 sm:text-sm"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-300">
                  {/* SVG Lock Icon */}
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
                  required
                  className="block w-full rounded-lg border border-white/20 bg-white/10 py-2.5 pl-10 pr-3 text-white placeholder-gray-400 backdrop-blur-sm transition focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 sm:text-sm"
                  placeholder="••••••••"
                  value={Password_Confirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center rounded-lg bg-gradient-to-r from-emerald-400 to-teal-500 px-4 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition hover:from-emerald-500 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
            >
              {loading ? "Registering Now..." : "Register Now →"}
            </button>
          </div>
        </form>

        {/* Navigation Link to Login */}
        <p className="mt-6 text-center text-sm text-gray-300">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-emerald-400 hover:text-emerald-300 transition underline underline-offset-4"
          >
            Sign In
          </Link>
        </p>

        {/* Terms footer notice */}
        <p className="mt-4 text-center text-[11px] text-gray-400">
          By signing up, you agree to our{" "}
          <span className="text-emerald-400/80 cursor-pointer">
            Terms of Service
          </span>
          .
        </p>
      </div>
    </div>
  );
}
