import { useState } from "react";
import api from "../../axios";
import { Link, useParams, useSearchParams } from "react-router-dom";
import loginBg from "../../assets/login_register.png";

export default function ResetPassword() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const emailQuery = searchParams.get("email") || "";

  const [Email, setEmail] = useState(emailQuery);
  const [Password, setPassword] = useState("");
  const [Password_confirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (Password !== Password_confirmation) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/reset-password", {
        token,
        Email,
        Password,
        Password_confirmation,
      });

      setMessage(response.data.message || "Password has been reset successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to reset password. Token may be invalid."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 relative"
      style={{
        backgroundImage: `url(${loginBg})`,
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

      <div className="relative w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
            Reset Password
          </h2>
          <p className="text-xs font-semibold tracking-widest text-castleton-300 uppercase mt-2">
            — Choose a new password —
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-500/20 border border-red-500/40 p-3 text-sm text-red-200 text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-4 rounded-lg bg-green-500/20 border border-green-500/40 p-3 text-sm text-green-200 text-center">
            {message}
          </div>
        )}

        {!message ? (
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative mt-1">
                <input
                  type="email"
                  required
                  className="block w-full rounded-lg border border-white/20 bg-white/10 py-2.5 px-3 text-white placeholder-gray-400 backdrop-blur-sm transition focus:border-castleton-300 focus:outline-none focus:ring-1 focus:ring-castleton-300 sm:text-sm"
                  placeholder="john@email.com"
                  value={Email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={!!emailQuery}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative mt-1">
                <input
                  type="password"
                  required
                  className="block w-full rounded-lg border border-white/20 bg-white/10 py-2.5 px-3 text-white placeholder-gray-400 backdrop-blur-sm transition focus:border-castleton-300 focus:outline-none focus:ring-1 focus:ring-castleton-300 sm:text-sm"
                  placeholder="••••••••"
                  value={Password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <input
                  type="password"
                  required
                  className="block w-full rounded-lg border border-white/20 bg-white/10 py-2.5 px-3 text-white placeholder-gray-400 backdrop-blur-sm transition focus:border-castleton-300 focus:outline-none focus:ring-1 focus:ring-castleton-300 sm:text-sm"
                  placeholder="••••••••"
                  value={Password_confirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center rounded-lg bg-gradient-to-r from-sacramento to-castleton px-4 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition hover:from-sacramento-600 hover:to-castleton-600 disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 text-center">
             <Link
              to="/login"
              className="inline-block rounded-lg bg-gradient-to-r from-sacramento to-castleton px-6 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition hover:from-sacramento-600 hover:to-castleton-600"
            >
              Go to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
