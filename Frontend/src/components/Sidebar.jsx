import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../axios";

const adminLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/admin/packages", label: "Packages" },
  { to: "/admin/drivers", label: "Drivers" },
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/media", label: "Media Gallery" },
  { to: "/admin/reviews", label: "Reviews" },
];

const customerLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/dashboard", label: "My Bookings" },
  { to: "/reviews", label: "Reviews" },
];

export default function Sidebar({ role = "admin" }) {
  const links = role === "customer" ? customerLinks : adminLinks;
  const title = role === "customer" ? "Safari Customer" : "Safari Admin";
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await api.post(
          "/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (err) {
      console.error("Logout error on backend:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setLoading(false);
      navigate("/");
    }
  };

  return (
    <aside className="w-64 min-h-screen bg-green-900 dark:bg-gray-900 text-white dark:text-gray-200 transition-colors duration-300 flex flex-col justify-between">
      <div>
        <div className="p-5 border-b border-green-700 dark:border-gray-700">
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>

        <nav className="p-4 space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.to + link.label}
              to={link.to}
              className={({ isActive }) =>
                `block p-3 rounded-lg transition ${isActive
                  ? "bg-green-600 dark:bg-slate-700"
                  : "hover:bg-green-800 dark:hover:bg-slate-800"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-green-700 dark:border-gray-700">
        <button
          onClick={handleLogout}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg bg-red-700 hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 transition font-semibold disabled:opacity-50"
        >
          {!loading && (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          )}
          <span>{loading ? "Logging out..." : "Logout"}</span>
        </button>
      </div>
    </aside>
  );
}