import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, AlertCircle, Clock, Calendar, MapPin, Users, ArrowRight, Home, Receipt, ShieldCheck, RefreshCw, ShoppingBag } from "lucide-react";
import api from "../../axios";
import { useTheme } from "../../context/ThemeContext";

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("order_id") || searchParams.get("orderId");
    const { theme } = useTheme();

    const [loading, setLoading] = useState(true);
    const [payment, setPayment] = useState(null);
    const [error, setError] = useState(null);

    const user = (() => {
        try {
            const userData = localStorage.getItem("user");
            return userData ? JSON.parse(userData) : null;
        } catch {
            return null;
        }
    })();

    const verifyAndLoadPayment = async () => {
        if (!orderId) {
            setLoading(false);
            setError("No order reference provided.");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Fetch actual payment status verified by backend
            let res = await api.get(`/payhere/status/${orderId}`);

            // If still marked as pending, confirm payment from client completion
            if (res.data?.status === "Pending") {
                try {
                    const confirmRes = await api.post("/payhere/confirm", { order_id: orderId });
                    if (confirmRes.data?.payment) {
                        setPayment(confirmRes.data.payment);
                        return;
                    }
                    // Re-fetch updated status
                    res = await api.get(`/payhere/status/${orderId}`);
                } catch (confirmErr) {
                    console.warn("Auto-confirm notice:", confirmErr);
                }
            }

            setPayment(res.data);
        } catch (err) {
            console.error("Payment status error:", err);
            setError(err.response?.data?.message || "Unable to load payment details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        verifyAndLoadPayment();
    }, [orderId]);

    const isDark = theme === "dark";
    const isSuccess = payment?.status === "Success";
    const isPending = payment?.status === "Pending";
    const isFailed = payment?.status === "Failed" || payment?.status === "Cancelled";

    return (
        <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center transition-colors duration-300 ${isDark ? "bg-slate-950 text-slate-100" : "bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-100 text-slate-900"
            }`}>
            <div className={`max-w-2xl w-full rounded-2xl p-8 sm:p-10 shadow-2xl border transition-all ${isDark
                    ? "bg-slate-900/90 border-slate-800 backdrop-blur-xl"
                    : "bg-white/95 border-emerald-100 backdrop-blur-xl"
                }`}>
                {/* Header based on status */}
                <div className="text-center">
                    {isSuccess ? (
                        <>
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-6 shadow-inner ring-8 ring-emerald-50 dark:ring-emerald-900/20 animate-bounce">
                                <CheckCircle2 className="w-12 h-12" />
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                Booking & Payment Confirmed!
                            </h1>
                            <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400">
                                Thank you for booking with us. Your safari adventure is officially confirmed.
                            </p>
                        </>
                    ) : isPending ? (
                        <>
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mb-6 shadow-inner ring-8 ring-amber-50 dark:ring-amber-900/20">
                                <Clock className="w-12 h-12 animate-pulse" />
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400">
                                Payment Verification Pending
                            </h1>
                            <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400">
                                Your payment is currently being processed. Once verified, your booking will be confirmed.
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mb-6 shadow-inner ring-8 ring-rose-50 dark:ring-rose-900/20">
                                <AlertCircle className="w-12 h-12" />
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400">
                                Payment Incomplete
                            </h1>
                            <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400">
                                The payment for this booking was not completed or was cancelled.
                            </p>
                        </>
                    )}
                </div>

                {/* Receipt Card */}
                {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-3">
                        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-slate-500">Verifying payment receipt...</p>
                    </div>
                ) : (
                    <div className="mt-8 space-y-6">
                        {/* Transaction Summary Box */}
                        <div className={`rounded-xl p-5 border ${isDark ? "bg-slate-800/60 border-slate-700/60" : "bg-emerald-50/50 border-emerald-100"
                            }`}>
                            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
                                <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider flex items-center gap-1.5">
                                    <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Order Reference
                                </span>
                                <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
                                    {orderId || "N/A"}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 text-sm">
                                <div>
                                    <span className="text-xs text-slate-500 block">Payment Method</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                        {payment?.payment_method || "PayHere"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500 block">Payment Status</span>
                                    <span className={`font-bold text-xs px-2 py-0.5 rounded-full inline-block mt-0.5 ${isSuccess
                                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                            : isPending
                                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                                : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                        }`}>
                                        {payment?.status || "Unknown"}
                                    </span>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <span className="text-xs text-slate-500 block">Total Amount</span>
                                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                                        {payment?.currency || "USD"} {payment?.amount ? Number(payment.amount).toFixed(2) : "0.00"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Bookings Details */}
                        {payment?.bookings && payment.bookings.length > 0 && (
                            <div className="space-y-3">
                                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Safari Tour Details
                                </h2>
                                {payment.bookings.map((b, idx) => (
                                    <div key={idx} className={`p-4 rounded-xl border flex flex-col gap-2 text-sm ${isDark ? "bg-slate-800/40 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                                        }`}>
                                        <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                                            <span>{b.package?.Package_Name || "Wild Safari Tour"}</span>
                                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${b.Status === "Confirmed"
                                                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                                                    : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                                                }`}>
                                                {b.Status || "Pending"}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>{b.Booking_Date} ({b.Pickup_Time})</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>{b.Area || b.Pickup_Location || "Hotel Pickup"}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Users className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>{b.No_of_adults} Adults, {b.No_of_child} Child</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {error && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 text-center">{error}</p>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-3">
                    {/* Guest bookings (no signed-in account) cannot be cancelled
                        through the site — there is no account to authenticate the
                        cancellation against — so point them at the contact
                        channels the staff monitor. */}
                    {isSuccess && !user?.Customer_ID && (
                        <div className="w-full mb-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left dark:border-amber-900/50 dark:bg-amber-950/30">
                            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                                Need to cancel this booking?
                            </p>
                            <p className="mt-1 text-xs leading-6 text-amber-800 dark:text-amber-300">
                                Guest bookings cannot be cancelled online. Please
                                contact us and our team will arrange it for you:
                                {" "}
                                <a
                                    href="tel:+94778902811"
                                    className="font-semibold underline"
                                >
                                    +94 77 890 2811
                                </a>
                                {" "}(WhatsApp / Call) or{" "}
                                <a
                                    href="mailto:info@minneriyawildjeepsafari.com"
                                    className="font-semibold underline"
                                >
                                    info@minneriyawildjeepsafari.com
                                </a>
                                . Registering an account lets you manage and
                                cancel your bookings yourself.
                            </p>
                        </div>
                    )}

                    {isSuccess && user?.Customer_ID && (
                        <Link
                            to="/user/bookings"
                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
                        >
                            <span>View My Bookings</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    )}

                    {!isSuccess && (
                        <>
                            <button
                                onClick={verifyAndLoadPayment}
                                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2 transition"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Re-check Status</span>
                            </button>
                        </>
                    )}

                    <Link
                        to="/"
                        className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center justify-center gap-2 transition"
                    >
                        <Home className="w-4 h-4" />
                        <span>Home</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

