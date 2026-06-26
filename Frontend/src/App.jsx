import { Link } from "react-router-dom";
import ThemeToggle from "./components/ThemeToggle";
import { useTheme } from "./context/ThemeContext";

export default function App() {
  const { theme } = useTheme();

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=2068&auto=format&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Navbar */}
      <header
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700"
        style={{
          backgroundColor:
            theme === "dark"
              ? "rgba(17, 24, 39, 0.85)"
              : "rgba(255, 255, 255, 0.85)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="text-lg font-bold tracking-wide text-[#1B4332] dark:text-green-400">
              Wild Safari
            </span>
          </div>

          {/* Auth Buttons (REVERSED ORDER) */}
          <div className="flex items-center gap-3">

            {/* Register FIRST */}
            <Link
              to="/register"
              className="text-sm font-semibold px-5 py-2 rounded-lg transition
                bg-[#6F4E37] dark:bg-green-700
                text-white
                hover:bg-[#5a3d2b] dark:hover:bg-green-600"
            >
              Register
            </Link>

            {/* Login SECOND */}
            <Link
              to="/login"
              className="text-sm font-semibold px-5 py-2 rounded-lg border transition
                text-[#2d6e32] dark:text-green-400
                border-[#6F4E37] dark:border-green-500
                bg-white dark:bg-gray-800
                hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Log in
            </Link>

            {/* Theme Toggle LAST */}
            <ThemeToggle />

          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-col items-center justify-center min-h-screen text-center px-6">
        <h1
          className="text-4xl md:text-6xl font-extrabold mb-4"
          style={{ color: "#ffffff", textShadow: "2px 2px 8px rgba(0,0,0,0.7)" }}
        >
          Into the Wild
        </h1>

        <p
          className="text-lg max-w-md"
          style={{ color: "#ffffff", textShadow: "1px 1px 6px rgba(0,0,0,0.7)" }}
        >
          Your gateway to unforgettable safari adventures.
        </p>
      </main>
    </div>
  );
}