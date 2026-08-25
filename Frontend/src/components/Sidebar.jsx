import { useEffect, useState } from "react";
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
  { to: "/user/reviews", label: "Reviews", icon: Star },
];

export default function Sidebar({ role = "admin", isOpen, setIsOpen }) {
  const normalizedRole = role?.toLowerCase();
  const links = normalizedRole === "customer" ? customerLinks : adminLinks;

  const title =
    normalizedRole === "customer"
      ? "Safari Customer"
      : "Safari Admin";

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [unreadBookings, setUnreadBookings] = useState(0);
  const [unreadReviews, setUnreadReviews] = useState(0);
  const [unreadAppointments, setUnreadAppointments] = useState(0);

  useEffect(() => {
    if (normalizedRole !== "admin") return;

    const fetchUnreadBookings = async () => {
      try {
        const response = await api.get("/admin/bookings/unread-count");
        setUnreadBookings(response.data.count);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUnreadBookings();
    const interval = setInterval(fetchUnreadBookings, 5000);

    return () => clearInterval(interval);
  }, [normalizedRole]);

  useEffect(() => {
    if (normalizedRole !== "admin") return;

    const fetchUnreadReviews = async () => {
      try {
        const response = await api.get("/reviews");
        const reviews = response.data || [];
        const storedLastId = parseInt(localStorage.getItem("lastSeenReviewId") || "0", 10);
        const unseenCount = reviews.filter((review) => review.Review_ID > storedLastId).length;
        setUnreadReviews(unseenCount);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUnreadReviews();
    const interval = setInterval(fetchUnreadReviews, 5000);

    return () => clearInterval(interval);
  }, [normalizedRole]);

  useEffect(() => {
    if (normalizedRole !== "admin") return;

    const currentMonth = () => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    };

    const fetchUnreadAppointments = async () => {
      try {
        const response = await api.get("/appointments", { params: { month: currentMonth() } });
        const appointments = response.data || [];
        const storedLastId = parseInt(localStorage.getItem("lastSeenAppointmentId") || "0", 10);
        const unseenCount = appointments.filter((a) => a.Booking_ID > storedLastId).length;
        setUnreadAppointments(unseenCount);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUnreadAppointments();
    const interval = setInterval(fetchUnreadAppointments, 5000);

    return () => clearInterval(interval);
  }, [normalizedRole]);


  const handleBookingsClick = async () => {
    await api.post("/admin/bookings/mark-seen");
    setUnreadBookings(0);
  };

  return (
    <aside
      className={`
        fixed md:sticky
        top-0 left-0
        z-50
        w-72
        h-screen
        overflow-y-auto
        flex
        flex-col
        justify-between
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0

        bg-gradient-to-b
        from-sacramento-500
        via-sacramento
        to-castleton

        dark:from-sacramento-900
        dark:via-slate-900
        dark:to-black

        text-white

        shadow-2xl

        border-r
        border-sacramento
        dark:border-slate-800

        transition-all
        duration-300
      `}
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
                object-contain

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
                onClick={
                  link.label === "Bookings"
                    ? handleBookingsClick
                    : undefined
                }
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
                      text-sacramento

                      dark:bg-slate-800
                      dark:text-castleton-300

                      shadow-lg

                      border-l-4
                      border-sacramento
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

                {link.label === "Bookings" && unreadBookings > 0 && (
                  <span className="ml-auto min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-xs font-bold text-white">
                    {unreadBookings}
                  </span>
                )}

                {link.label === "Reviews" && normalizedRole === "admin" && unreadReviews > 0 && (
                  <span className="ml-auto min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-xs font-bold text-white">
                    {unreadReviews}
                  </span>
                )}

                {link.label === "Appointments" && normalizedRole === "admin" && unreadAppointments > 0 && (
                  <span className="ml-auto min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-xs font-bold text-white">
                    {unreadAppointments}
                  </span>
                )}

              </NavLink>

            );

          })}

        </nav>

      </div>

    </aside>
  );
}
