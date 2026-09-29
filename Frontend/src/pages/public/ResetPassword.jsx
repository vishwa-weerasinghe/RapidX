import { useState, useEffect } from "react";
import api from "../../axios";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import SEO from "../../components/SEO";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import loginBg from "../../assets/login_register.png";

export default function ResetPassword() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const navigate = useNavigate();

  const [Email, setEmail] = useState(emailParam);
  const [Password, setPassword] = useState("");
  const [Password_confirmation, setPasswordConfirmation] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(null);

  // Synchronize search param email if changed
  useEffect(() => {
    if (emailParam && !Email) {
      setEmail(emailParam);
    }
  }, [emailParam, Email]);

  // Calculate Password Strength Score (0 to 4)
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "", color: "bg-gray-600" };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500" };
    if (score === 2 || score === 3) return { score: score, label: "Medium", color: "bg-amber-500" };
    return { score: 4, label: "Strong", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength(Password);

  // Auto redirect countdown on success
  useEffect(() => {
    if (redirectCountdown === null) return;
    if (redirectCountdown <= 0) {
      navigate("/login");
      return;
    }
    const timer = setTimeout(() => {
      setRedirectCountdown((prev) => (prev !== null ? prev - 1 : 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [redirectCountdown, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!Email.trim()) {
      setError("Please specify a valid email address.");
      return;
    }

    if (Password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (Password !== Password_confirmation) {
      setError("Passwords do not match. Please verify both fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/reset-password", {
        token,
        Email: Email.trim(),
        Password,
        Password_confirmation,
      });

      const successMsg =
        response.data.message ||
        "Your password has been successfully reset! Redirecting to login...";
      setMessage(successMsg);
      setRedirectCountdown(4);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password. The reset link may be invalid or expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Reset Password | Minneriya Wild Jeep Safari"
        description="Choose a new password for your Minneriya Wild Jeep Safari account."
        canonical="https://www.minneriyawildjeepsafari.com/reset-password"
        robots="noindex, follow"
      />
      <div
        className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 relative py-12"
        style={{
          backgroundImage: `url(${loginBg})`,
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[3px]"></div>

        <div className="relative w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-md transition-all duration-300">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
              Reset Password
            </h2>
            <p className="text-xs font-semibold tracking-widest text-emerald-400 uppercase mt-2">
              — Secure Your Account —
            </p>
          </div>

          {error && (
            <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-red-500/20 border border-red-500/40 p-3.5 text-sm text-red-200 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mt-5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 p-4 text-center text-emerald-200 animate-fade-in">
              <div className="flex justify-center mb-2">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="font-bold text-base">{message}</p>
              {redirectCountdown !== null && (
                <p className="text-xs text-emerald-300 mt-2 font-medium">
                  Redirecting to Sign In page in <span className="font-bold text-white text-sm">{redirectCountdown}s</span>...
                </p>
              )}
            </div>
          )}

          {!message ? (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="email"
                    required
                    className="block w-full rounded-xl border border-white/20 bg-white/10 py-3 px-4 text-white placeholder-gray-400 backdrop-blur-sm transition focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 sm:text-sm read-only:opacity-75"
                    placeholder="john@email.com"
                    value={Email}
                    onChange={(e) => setEmail(e.target.value)}
                    readOnly={!!emailParam}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative mt-1.5">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    className="block w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-11 pr-11 text-white placeholder-gray-400 backdrop-blur-sm transition focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 sm:text-sm"
                    placeholder="Minimum 8 characters"
                    value={Password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-white transition"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {Password && (
                  <div className="mt-2.5 space-y-1">
                    <div className="flex justify-between items-center text-[11px] font-medium text-gray-300">
                      <span>Password Strength:</span>
                      <span className="font-bold">{strength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden flex gap-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`h-full flex-1 transition-all duration-300 ${
                            step <= strength.score ? strength.color : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative mt-1.5">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className="block w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-11 pr-11 text-white placeholder-gray-400 backdrop-blur-sm transition focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 sm:text-sm"
                    placeholder="Re-enter new password"
                    value={Password_confirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-white transition"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Match Status */}
                {Password_confirmation && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium">
                    {Password === Password_confirmation ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition duration-300 hover:from-emerald-500 hover:to-teal-600 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      Update Password
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition hover:from-emerald-500 hover:to-teal-600"
              >
                Go to Sign In
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-gray-300">
            Remembered your password?{" "}
            <Link
              to="/login"
              className="font-bold text-emerald-400 hover:text-emerald-300 transition underline underline-offset-4"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
