import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../axios";

import {
  LayoutDashboard,
  Package,
  Users,
  Car,
  CalendarCheck,
  Image,
  Star,
  ShoppingCart,
  Truck,
  LogOut,
} from "lucide-react";

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/packages", label: "Packages", icon: Package },
  { to: "/admin/drivers", label: "Drivers", icon: Users },
  { to: "/admin/vehicles", label: "Vehicles", icon: Car },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/admin/media", label: "Media Gallery", icon: Image },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  {
    to: "/admin/appointments",
    label: "Appointments",
    icon: CalendarCheck,
  },
];

const customerLinks = [
  { to: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/user/packages", label: "Packages", icon: Package },
  { to: "/user/bookings", label: "My Bookings", icon: CalendarCheck },
  { to: "/user/cart", label: "Cart", icon: ShoppingCart },
  { to: "/user/vehicle", label: "My Vehicle", icon: Truck },
  { to: "/user/reviews", label: "Reviews", icon: Star },
];

export default function Sidebar({ role = "admin" }) {
  const links = role === "customer" ? customerLinks : adminLinks;

  const title =
    role === "customer"
      ? "Safari Customer"
      : "Safari Admin";

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);


  return (
    <aside
      className="
        w-72
        min-h-screen
        flex
        flex-col
        justify-between

        bg-gradient-to-b
        from-lime-500
        via-emerald-600
        to-green-700

        dark:from-emerald-950
        dark:via-slate-900
        dark:to-black

        text-white

        shadow-2xl

        border-r
        border-emerald-600
        dark:border-slate-800

        transition-all
        duration-300
      "
    >
      {/* HEADER */}

      <div>

        <div className="p-6 border-b border-white/20">

          <div className="flex flex-col items-center">

            <img
              src="https://minneriyawildjeepsafari.com/wp-content/uploads/2025/08/lgo.jpg"
              alt="Wild Safari"
              className="
                h-20
                w-20
                rounded-full
                object-cover
                border-4
                border-white
                shadow-xl
                bg-white
              "
            />

            <h2 className="mt-4 text-2xl font-bold tracking-wide">
              Wild Safari
            </h2>

            <p className="text-sm text-green-100">
              Safari Management System
            </p>

          </div>

        </div>

        {/* MENU */}

        <nav className="mt-6 px-4 space-y-2">

          {links.map((link) => {

            const Icon = link.icon;

            return (

              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `
                  flex
                  items-center
                  gap-4

                  px-4
                  py-3

                  rounded-xl

                  transition-all
                  duration-300

                  ${isActive
                    ? `
                      bg-white
                      text-green-700

                      dark:bg-slate-800
                      dark:text-green-400

                      shadow-lg

                      border-l-4
                      border-green-600
                    `
                    : `
                      text-white

                      hover:bg-white/15

                      dark:hover:bg-slate-800

                      hover:translate-x-1

                      hover:shadow-md
                    `
                  }
                `
                }
              >
                <Icon
                  size={20}
                  className="transition-transform duration-300 group-hover:scale-110"
                />

                <span className="font-medium">
                  {link.label}
                </span>

              </NavLink>

            );

          })}

        </nav>

      </div>

    </aside>
  );
}