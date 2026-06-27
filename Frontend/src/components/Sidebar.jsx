import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-green-900 dark:bg-gray-900 text-white dark:text-gray-200 transition-colors duration-300">

      {/* Header */}
      <div className="p-5 border-b border-green-700 dark:border-gray-700">
        <h2 className="text-2xl font-bold">Safari Admin</h2>
      </div>

      {/* Nav */}
      <nav className="p-4 space-y-2">

        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `block p-3 rounded-lg transition ${
              isActive
                ? "bg-green-600 dark:bg-slate-700"
                : "hover:bg-green-800 dark:hover:bg-slate-800"
            }`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/packages"
          className={({ isActive }) =>
            `block p-3 rounded-lg transition ${
              isActive
                ? "bg-green-600 dark:bg-slate-700"
                : "hover:bg-green-800 dark:hover:bg-slate-800"
            }`
          }
        >
          Packages
        </NavLink>

        <NavLink
          to="/admin/drivers"
          className={({ isActive }) =>
            `block p-3 rounded-lg transition ${
              isActive
                ? "bg-green-600 dark:bg-slate-700"
                : "hover:bg-green-800 dark:hover:bg-slate-800"
            }`
          }
        >
          Drivers
        </NavLink>

        <NavLink
          to="/admin/bookings"
          className={({ isActive }) =>
            `block p-3 rounded-lg transition ${
              isActive
                ? "bg-green-600 dark:bg-slate-700"
                : "hover:bg-green-800 dark:hover:bg-slate-800"
            }`
          }
        >
          Bookings
        </NavLink>

        <NavLink
          to="/admin/media"
          className={({ isActive }) =>
            `block p-3 rounded-lg transition ${
              isActive
                ? "bg-green-600 dark:bg-slate-700"
                : "hover:bg-green-800 dark:hover:bg-slate-800"
            }`
          }
        >
          Media Gallery
        </NavLink>

      </nav>
    </aside>
  );
}