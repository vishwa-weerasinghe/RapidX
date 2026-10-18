import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Compass,
  Sparkles,
  CalendarCheck,
  ShoppingCart,
  Star,
  ArrowUpRight,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { BookingProvider } from "../../context/BookingContext";
import { BookingCard } from "../../components/user-dashboard/BookingCard";
import { CartCard } from "../../components/user-dashboard/CartCard";
import { CancellationMessage } from "../../components/user-dashboard/Cancellation_Message";
import { PromoCode } from "../../components/user-dashboard/Promo-code";
import { HeroCountdown } from "../../components/user-dashboard/Upcoming-safari";
import SummaryStats from "../../components/user-dashboard/Summary-Card";
import { CompletedSafari } from "../../components/user-dashboard/Completed_safari";

export default function CustomerDashboard({ user: propUser }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : propUser;
    } catch {
      return propUser;
    }
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const userName = currentUser?.User_Name || currentUser?.name || "Explorer";

  return (
    <BookingProvider>
      <div className="min-h-screen bg-slate-50/50 dark:bg-bg-dark text-charcoal dark:text-white transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
          {/* ── Modern Hero Welcome Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl border border-border-light dark:border-border-dark/60 bg-white dark:bg-[#16231c] p-6 sm:p-8 shadow-sm"
          >
            {/* Ambient Background Glows */}
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-sacramento/10 dark:bg-sacramento-900/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-amber-500/10 dark:bg-amber-900/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                {/* Explorer Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sacramento/10 dark:bg-sacramento-900/40 text-sacramento dark:text-sacramento-300 text-xs font-bold mb-3 border border-sacramento/20">
                  <Compass size={13} className="animate-spin-slow" />
                  <span>Wild Safari Explorer Portal</span>
                  <span className="w-1 h-1 rounded-full bg-sacramento dark:bg-sacramento-400" />
                  <span className="text-[11px] font-semibold opacity-90">Live Status</span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {getGreeting()},{" "}
                  <span className="bg-gradient-to-r from-sacramento to-castleton-500 dark:from-sacramento-300 dark:to-emerald-400 bg-clip-text text-transparent">
                    {userName}
                  </span>
                </h1>

                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  Track your booked wildlife safaris, inspect active reservations, and prepare for your next breathtaking journey through Sri Lanka's premier national parks.
                </p>
              </div>

              {/* Quick Action Navigation Pills */}
              <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
                <Link
                  to="/user/packages"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sacramento hover:bg-sacramento-600 dark:bg-castleton-500 dark:hover:bg-castleton-600 text-white font-bold text-xs shadow-sm hover:shadow transition-all active:scale-95"
                >
                  <Compass size={14} />
                  <span>Browse Safaris</span>
                  <ArrowUpRight size={13} className="opacity-80" />
                </Link>

                <Link
                  to="/user/cart"
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-surface-2 border border-slate-200 dark:border-border-dark text-slate-700 dark:text-slate-300 hover:text-sacramento dark:hover:text-sacramento-300 hover:border-sacramento/30 transition-all text-xs font-bold shadow-sm"
                >
                  <ShoppingCart size={14} />
                  <span>View Cart</span>
                </Link>

                <Link
                  to="/user/reviews"
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-surface-2 border border-slate-200 dark:border-border-dark text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-300 transition-all text-xs font-bold shadow-sm"
                >
                  <Star size={14} />
                  <span>Feedback</span>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* ── Summary & Preparation Row ── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full"
          >
            <SummaryStats />
          </motion.div>

          {/* ── Upcoming & Completed Safari Showcase ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-full"
            >
              <HeroCountdown user={currentUser} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="h-full"
            >
              <CompletedSafari />
            </motion.div>
          </div>

          {/* ── Two-Column Bento Grid of Active Operations ── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8"
          >
            <BookingCard user={currentUser} />
            <CartCard user={currentUser} />
            <CancellationMessage user={currentUser} />
            <PromoCode />
          </motion.div>
        </div>
      </div>
    </BookingProvider>
  );
}