import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-green-900 text-white min-h-screen">
      <div className="p-5 border-b border-green-700">
        <h2 className="text-2xl font-bold">Safari Admin</h2>
      </div>

      <nav className="p-4 space-y-2">

        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `block p-3 rounded-lg ${
              isActive ? "bg-green-600" : "hover:bg-green-800"
            }`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/packages"
          className={({ isActive }) =>
            `block p-3 rounded-lg ${
              isActive ? "bg-green-600" : "hover:bg-green-800"
            }`
          }
        >
          Packages
        </NavLink>

        <NavLink
          to="/admin/bookings"
          className={({ isActive }) =>
            `block p-3 rounded-lg ${
              isActive ? "bg-green-600" : "hover:bg-green-800"
            }`
          }
        >
          Bookings
        </NavLink>

      </nav>
    </aside>
  );
}