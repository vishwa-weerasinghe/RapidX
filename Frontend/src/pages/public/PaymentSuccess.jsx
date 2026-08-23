import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Calendar, MapPin, Users, ArrowRight, Home, Receipt, ShieldCheck } from "lucide-react";
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

    useEffect(() => {
        if (!orderId) {
            setLoading(false);
            return;
        }

        // Poll payment status from backend
        let attempts = 0;
        const maxAttempts = 5;

        const checkStatus = async () => {
            try {
                const res = await api.get(`/payhere/status/${orderId}`);
                setPayment(res.data);
                setLoading(false);
            } catch (err) {
                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(checkStatus, 2000); // Retry after 2 seconds
                } else {
                    setError("Unable to load full receipt details, but your payment was submitted.");
                    setLoading(false);
                }
            }
        };

        checkStatus();
    }, [orderId]);

    const isDark = theme === "dark";

    return (
        <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center transition-colors duration-300 ${
            isDark ? "bg-slate-950 text-slate-100" : "bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-100 text-slate-900"
        }`}>
            <div className={`max-w-2xl w-full rounded-2xl p-8 sm:p-10 shadow-2xl border transition-all ${
                isDark 
                    ? "bg-slate-900/90 border-slate-800 backdrop-blur-xl" 
                    : "bg-white/95 border-emerald-100 backdrop-blur-xl"
            }`}>
                {/* Success Icon Header */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-6 shadow-inner ring-8 ring-emerald-50 dark:ring-emerald-900/20 animate-bounce">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        Booking & Payment Confirmed!
                    </h1>
                    <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400">
                        Thank you for booking with us. Your safari adventure is officially confirmed.
                    </p>
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
                        <div className={`rounded-xl p-5 border ${
                            isDark ? "bg-slate-800/60 border-slate-700/60" : "bg-emerald-50/50 border-emerald-100"
                        }`}>
                            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
                                <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider flex items-center gap-1.5">
                                    <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Order Reference
                                </span>
                                <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
                                    {orderId || "N/A"}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-3 text-sm">
                                <div>
                                    <span className="text-xs text-slate-500 block">Payment Method</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                        {payment?.payment_method || "PayHere"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500 block">Total Amount Paid</span>
                                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                                        {payment?.currency || "USD"} {payment?.amount ? Number(payment.amount).toFixed(2) : "Paid"}
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
                                    <div key={idx} className={`p-4 rounded-xl border flex flex-col gap-2 text-sm ${
                                        isDark ? "bg-slate-800/40 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                                    }`}>
                                        <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                                            <span>{b.package?.Package_Name || "Wild Safari Tour"}</span>
                                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium">
                                                Confirmed
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
                    {user?.Customer_ID ? (
                        <Link
                            to="/user/bookings"
                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
                        >
                            <span>View My Bookings</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    ) : (
                        <Link
                            to="/"
                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
                        >
                            <Home className="w-4 h-4" />
                            <span>Return to Home</span>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
