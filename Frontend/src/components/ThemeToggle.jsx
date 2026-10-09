import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-castleton/50"
    >
      <span
        className={`
          w-14 h-7
          rounded-full
          flex items-center
          p-1
          transition-all duration-300
          ${
            theme === "dark"
              ? "bg-[var(--primary)] justify-end"
              : "bg-[var(--primary)]/40 justify-start"
          }
        `}
      >
        <span className="w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center text-xs select-none">
          {theme === "dark" ? "🌙" : "☀️"}
        </span>
      </span>
    </button>
  );
}