import { NavLink } from "react-router-dom";

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/packages", label: "Packages" },
  { to: "/admin/drivers", label: "Drivers" },
  { to: "/admin/appointments", label: "Appointments" },

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

  return (
    <aside className="w-64 min-h-screen bg-green-900 dark:bg-gray-900 text-white dark:text-gray-200 transition-colors duration-300">
      <div className="p-5 border-b border-green-700 dark:border-gray-700">
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>

      <nav className="p-4 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to + link.label}
            to={link.to}
            className={({ isActive }) =>
              `block p-3 rounded-lg transition ${
                isActive
                  ? "bg-green-600 dark:bg-slate-700"
                  : "hover:bg-green-800 dark:hover:bg-slate-800"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}