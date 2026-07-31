import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
        onClick={toggleTheme}
        className={`
            w-16 h-8
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
        <div className="w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
            {theme === "dark" ? "🌙" : "☀️"}
        </div>
    </button>
  );
}