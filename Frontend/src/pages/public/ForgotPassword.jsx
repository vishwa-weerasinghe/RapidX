import { useState } from "react";
import api from "../../axios";
import { Link } from "react-router-dom";
import SEO from "../../components/SEO";
import { Mail, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import loginBg from "../../assets/homepage.png";

export default function ForgotPassword() {
  const [Email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!Email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/forgot-password", { Email: Email.trim() });
      setMessage(
        response.data.message ||
        "Password reset link has been sent! Please check your email inbox."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to process password reset request. Please check your email address."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Forgot Password | Minneriya Wild Jeep Safari"
        description="Reset your account password for Minneriya Wild Jeep Safari."
        canonical="https://www.minneriyawildjeepsafari.com/forgot-password"
        robots="noindex, follow"
      />
      <div
        className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 relative"
        style={{
          backgroundImage: `url(${loginBg})`,
        }}
      >
        {/* Dark overlay backdrop matching Login layout */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[3px]"></div>

        <div className="relative w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-md transition-all duration-300">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
              Forgot Password
            </h2>
            <p className="text-xs font-semibold tracking-widest text-emerald-400 uppercase mt-2">
              — Reset Account Access —
            </p>
          </div>

          {error && (
            <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-red-500/20 border border-red-500/40 p-3.5 text-sm text-red-200 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 p-3.5 text-sm text-emerald-200 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Registered Email Address
              </label>
              <div className="relative mt-1.5">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  required
                  className="block w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-11 pr-4 text-white placeholder-gray-400 backdrop-blur-sm transition focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 sm:text-sm"
                  placeholder="name@example.com"
                  value={Email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition duration-300 hover:from-emerald-500 hover:to-teal-600 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-300">
            Remembered your password?{" "}
            <Link
              to="/login"
              className="font-bold text-emerald-400 hover:text-emerald-300 transition underline underline-offset-4"
            >
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
