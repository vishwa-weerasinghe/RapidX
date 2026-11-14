import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="group relative inline-flex h-7 w-[54px] shrink-0 cursor-pointer items-center rounded-full p-[2px] transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-castleton/50 focus-visible:ring-offset-2 select-none bg-slate-200/85 hover:bg-slate-300/80 dark:bg-slate-900/90 dark:hover:bg-slate-900 border border-slate-300/80 dark:border-slate-700/80 shadow-[inset_0_1px_3px_rgba(0,0,0,0.12)] dark:shadow-[inset_0_1px_4px_rgba(0,0,0,0.4)] backdrop-blur-md"
    >
      {/* Background track ambient icons */}
      <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-1.5 opacity-60">
        <Sun
          size={12}
          className={`text-amber-500 transition-opacity duration-200 ${
            isDark ? "opacity-35" : "opacity-0"
          }`}
          strokeWidth={2.5}
        />
        <Moon
          size={12}
          className={`text-indigo-400 transition-opacity duration-200 ${
            isDark ? "opacity-0" : "opacity-35"
          }`}
          strokeWidth={2.5}
        />
      </span>

      {/* Sliding knob with icon */}
      <span
        className={`pointer-events-none relative flex h-6 w-6 items-center justify-center rounded-full shadow-md transition-all duration-300 ease-out ${
          isDark
            ? "translate-x-[26px] bg-slate-800 text-amber-300 border border-slate-700/80 shadow-slate-950/40"
            : "translate-x-0 bg-white text-amber-500 border border-slate-200/80 shadow-slate-400/20"
        } group-hover:scale-105`}
      >
        {isDark ? (
          <Moon
            size={13}
            className="transition-transform duration-300 -rotate-12"
            strokeWidth={2.4}
          />
        ) : (
          <Sun
            size={13}
            className="transition-transform duration-300 rotate-0"
            strokeWidth={2.4}
          />
        )}
      </span>
    </button>
  );
}