import React from "react";
import { Check, ShieldCheck, DollarSign } from "lucide-react";

export default function ReserveNowNotice({ className = "" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald-600/30 dark:border-emerald-500/40 bg-gradient-to-br from-[#063524] via-[#04281b] to-[#011810] p-4 sm:p-6 lg:p-7 shadow-lg text-white transition-all duration-300 ${className}`}
    >
      {/* Decorative ambient glowing orbs */}
      <div className="absolute -top-10 -right-10 w-36 sm:w-48 h-36 sm:h-48 bg-emerald-400/15 rounded-full blur-2xl sm:blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-36 sm:w-48 h-36 sm:h-48 bg-teal-400/10 rounded-full blur-2xl sm:blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 lg:gap-8">
        {/* Left Side: Headline & Value Propositions */}
        <div className="w-full flex-1 text-left">
          {/* Top Guarantee Pill */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-400/15 text-emerald-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2 sm:mb-2.5 border border-emerald-400/25">
            <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
            <span>Worry-Free Safari Guarantee</span>
          </div>

          <h2 className="font-outfit text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Book Now &amp; Pay Later
          </h2>

          <p className="mt-1.5 sm:mt-2 text-emerald-100/85 text-xs sm:text-sm lg:text-base leading-relaxed max-w-xl">
            Lock in your preferred safari date and jeep today with{" "}
            <strong className="text-amber-300 font-bold">
              $0 upfront payment
            </strong>
            . Enjoy full flexibility.
          </p>
        </div>

        {/* Right Side: Responsive Illustrated Calendar Graphic */}
        <div className="w-full md:w-auto shrink-0 flex items-center justify-center pt-2 md:pt-0">
          <div className="relative w-36 sm:w-44 md:w-48 bg-white dark:bg-[#122218] rounded-2xl shadow-xl border border-white/20 dark:border-emerald-800/60 p-3.5 sm:p-4 pt-3 transition-transform duration-300 hover:scale-[1.02]">
            {/* Calendar Rings Top Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-emerald-800/40">
              <div className="flex gap-1.5">
                <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-600/40 dark:bg-emerald-400/50" />
                <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-600/40 dark:bg-emerald-400/50" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                FLEXIBLE
              </span>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              <div className="h-5 sm:h-6 rounded-md bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <Check size={12} className="stroke-[3]" />
              </div>
              <div className="h-5 sm:h-6 rounded-md bg-slate-100 dark:bg-white/5" />
              <div className="h-5 sm:h-6 rounded-md bg-slate-100 dark:bg-white/5" />
              <div className="h-5 sm:h-6 rounded-md bg-slate-100 dark:bg-white/5" />
              <div className="h-5 sm:h-6 rounded-md bg-slate-100 dark:bg-white/5" />
              <div className="h-5 sm:h-6 rounded-md bg-slate-100 dark:bg-white/5" />
              <div className="h-5 sm:h-6 rounded-md bg-slate-100 dark:bg-white/5" />
              <div className="h-5 sm:h-6 rounded-md bg-slate-100 dark:bg-white/5" />
            </div>

            {/* Floating $0 Coin Badge */}
            <div className="absolute -bottom-2 -right-2 sm:-bottom-2.5 sm:-right-2.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl bg-gradient-to-tr from-[#00563F] to-emerald-500 text-white flex items-center justify-center gap-0.5 shadow-md border-2 border-white dark:border-[#122218]">
              <DollarSign size={13} className="sm:size-[15px] stroke-[2.5] -mr-0.5" />
              <span className="font-extrabold text-xs sm:text-sm leading-none">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}