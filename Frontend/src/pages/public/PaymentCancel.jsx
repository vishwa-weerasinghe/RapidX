import { Link } from "react-router-dom";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function PaymentCancel() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center transition-colors duration-300 ${
            isDark ? "bg-slate-950 text-slate-100" : "bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-100 text-slate-900"
        }`}>
            <div className={`max-w-md w-full rounded-2xl p-8 sm:p-10 shadow-2xl border transition-all text-center ${
                isDark 
                    ? "bg-slate-900/90 border-slate-800 backdrop-blur-xl" 
                    : "bg-white/95 border-amber-100 backdrop-blur-xl"
            }`}>
                {/* Warning / Cancel Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mb-6 shadow-inner ring-8 ring-amber-50 dark:ring-amber-900/20">
                    <AlertCircle className="w-12 h-12" />
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                    Payment Cancelled
                </h1>
                
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    Your payment was not completed and no money was charged to your card or account.
                </p>

                <div className={`mt-6 p-4 rounded-xl text-xs text-left border ${
                    isDark ? "bg-slate-800/60 border-slate-700 text-slate-300" : "bg-amber-50/60 border-amber-200 text-amber-900"
                }`}>
                    <p className="font-semibold mb-1">Need help with your booking?</p>
                    <p className="text-slate-500 dark:text-slate-400">
                        You can retry paying with a different card, mobile wallet, or contact our 24/7 safari support team.
                    </p>
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        to="/booking"
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Try Booking Again</span>
                    </Link>

                    <Link
                        to="/"
                        className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold border flex items-center justify-center gap-2 transition ${
                            isDark 
                                ? "border-slate-700 hover:bg-slate-800 text-slate-300" 
                                : "border-slate-300 hover:bg-slate-50 text-slate-700"
                        }`}
                    >
                        <Home className="w-4 h-4" />
                        <span>Home</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
