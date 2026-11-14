import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../axios";
import logoImg from "../assets/logo.jpg";
import {
  ADMIN_BOOKING_NOTIFICATIONS_UPDATED,
  ADMIN_CUSTOMER_NOTIFICATIONS_UPDATED,
  ADMIN_REVIEW_NOTIFICATIONS_VIEWED,
} from "../constants/notificationEvents";

import {
  LayoutDashboard,
  Package,
  Users,
  UserRound,
  Car,
  CalendarCheck,
  Image,
  Star,
  ShoppingCart,
  LogOut,
  ArrowLeft,
  Home,
  Tag,
} from "lucide-react";

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/packages", label: "Packages", icon: Package },
  { to: "/admin/drivers", label: "Drivers", icon: Users },
  { to: "/admin/vehicles", label: "Vehicles", icon: Car },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/admin/media", label: "Media", icon: Image },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/customers", label: "Customer Management", icon: UserRound },
  {
    to: "/admin/earnings-and-reports",
    label: "Earnings and Reports",
    icon: CalendarCheck,
  },
  { to: "/admin/promotion-codes", label: "Promotion Codes", icon: Tag },
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
  const navigate = useNavigate();

  const [unreadBookings, setUnreadBookings] = useState(0);
  const [unreadReviews, setUnreadReviews] = useState(0);
  const [unreadCustomers, setUnreadCustomers] = useState(0);
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

    // Screens that clear booking notifications on the backend (e.g. the
    // notification bell on the Bookings page) dispatch this event after the
    // mark-seen request succeeds, so the badge re-syncs with the server
    // immediately instead of staying stale until the next polling cycle.
    const handleBookingNotificationsUpdated = () => {
      fetchUnreadBookings();
    };

    fetchUnreadBookings();
    const interval = setInterval(fetchUnreadBookings, 30000);
    window.addEventListener(
      ADMIN_BOOKING_NOTIFICATIONS_UPDATED,
      handleBookingNotificationsUpdated,
    );

    return () => {
      clearInterval(interval);
      window.removeEventListener(
        ADMIN_BOOKING_NOTIFICATIONS_UPDATED,
        handleBookingNotificationsUpdated,
      );
    };
  }, [normalizedRole]);

  useEffect(() => {
    if (normalizedRole !== "admin") return;

    const fetchUnreadReviews = async () => {
      try {
        const response = await api.get("/reviews");
        const reviews = response.data || [];
        const storedLastId = parseInt(localStorage.getItem("lastSeenReviewId") || "0", 10);
        const unseenCount = reviews.filter(
          (review) =>
            `${review?.source || review?.Source || ""}`.toLowerCase() !== "tripadvisor" &&
            Number(review.Review_ID) > storedLastId
        ).length;
        setUnreadReviews(unseenCount);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUnreadReviews();
    const interval = setInterval(fetchUnreadReviews, 30000);

    return () => clearInterval(interval);
  }, [normalizedRole]);

  useEffect(() => {
    if (normalizedRole !== "admin") return;

    const fetchUnreadCustomers = async () => {
      try {
        const response = await api.get("/admin/customers");
        const customers = Array.isArray(response.data) ? response.data : [];
        const storedLastId = parseInt(
          localStorage.getItem("lastSeenCustomerId") || "0",
          10,
        );
        const unseenCount = customers.filter(
          (customer) => Number(customer.Customer_ID) > storedLastId,
        ).length;
        setUnreadCustomers(unseenCount);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUnreadCustomers();
    const interval = setInterval(fetchUnreadCustomers, 30000);
    const handleCustomerNotificationsUpdated = () => {
      fetchUnreadCustomers();
    };
    window.addEventListener(
      ADMIN_CUSTOMER_NOTIFICATIONS_UPDATED,
      handleCustomerNotificationsUpdated,
    );

    return () => {
      clearInterval(interval);
      window.removeEventListener(
        ADMIN_CUSTOMER_NOTIFICATIONS_UPDATED,
        handleCustomerNotificationsUpdated,
      );
    };
  }, [normalizedRole]);

  useEffect(() => {
    if (normalizedRole !== "admin") return;

    const handleReviewNotificationsViewed = () => {
      setUnreadReviews(0);
    };

    window.addEventListener(
      ADMIN_REVIEW_NOTIFICATIONS_VIEWED,
      handleReviewNotificationsViewed,
    );

    return () => {
      window.removeEventListener(
        ADMIN_REVIEW_NOTIFICATIONS_VIEWED,
        handleReviewNotificationsViewed,
      );
    };
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
    const interval = setInterval(fetchUnreadAppointments, 30000);

    return () => clearInterval(interval);
  }, [normalizedRole]);


  return (
    <aside
      className={`
        fixed md:sticky
        top-16 md:top-0
        left-0
        z-50
        w-72
        h-[calc(100dvh-4rem)] md:h-screen
        overflow-y-auto
        overscroll-contain
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

      <div className="min-h-full">

        <div className="relative p-4 md:p-6 border-b border-white/20">

          <button
            onClick={() => {
              if (typeof setIsOpen === "function") {
                setIsOpen(false);
              }
            }}
            className="absolute left-3 top-3 md:hidden p-1.5 rounded-lg text-white/90 hover:bg-white/15 transition-colors"
            title="Close menu"
            aria-label="Close menu"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center">

            <div className="relative flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_8px_30px_-4px_rgba(46,125,50,0.3)] rounded-full">
              <img
                src={logoImg}
                alt="Minneriya Wild Jeep Safari"
                className="h-10 sm:h-12 md:h-20 w-auto object-contain rounded-full"
              />
            </div>

            <h2 className="mt-1.5 md:mt-4 text-lg md:text-2xl font-bold tracking-wide">
              Wild Safari
            </h2>

            <p className="text-xs md:text-sm text-green-100">
              Safari Management System
            </p>

          </div>

        </div>

        {/* Mobile quick nav - Home & Book Now (in header on md+, here in sidebar on mobile) */}
        {normalizedRole === "customer" && (
          <div className="md:hidden mt-1.5 px-3 pb-3 space-y-1.5 border-b border-white/20">
            <button
              type="button"
              onClick={() => {
                navigate("/");
                if (typeof setIsOpen === "function") setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white transition-all duration-300 hover:bg-white/15 hover:translate-x-1"
            >
              <Home className="w-[18px] h-[18px]" />
              <span className="font-medium">Home</span>
            </button>

            <button
              type="button"
              onClick={() => {
                navigate("/user/packages");
                if (typeof setIsOpen === "function") setIsOpen(false);
              }}
              className="w-full flex items-center justify-start gap-3 px-3 py-2 rounded-lg text-sm bg-white text-sacramento font-semibold shadow-lg transition-all duration-300 hover:bg-sacramento-100 active:scale-[0.98]"
            >
              <CalendarCheck className="w-[18px] h-[18px]" />
              <span className="font-medium">Book Now</span>
            </button>
          </div>
        )}

        {/* MENU */}

        <nav className="mt-3 px-3 space-y-1 md:mt-6 md:px-4 md:space-y-2">

          {links.map((link) => {

            const Icon = link.icon;

            return (

              <NavLink
                key={link.to}
                to={link.to}
                onClick={
                  link.label === "Reviews" && normalizedRole === "admin"
                    ? () => setUnreadReviews(0)
                    : undefined
                }
                className={({ isActive }) =>
                  `
                  flex
                  items-center
                  gap-3
                  md:gap-4

                  px-3
                  py-2
                  md:px-4
                  md:py-3

                  rounded-lg
                  md:rounded-xl

                  text-sm
                  md:text-base

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
                  size={18}
                  className="transition-transform duration-300 group-hover:scale-110 md:w-5 md:h-5"
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

                {link.label === "Customer Management" &&
                  normalizedRole === "admin" &&
                  unreadCustomers > 0 && (
                    <span className="ml-auto min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-xs font-bold text-white">
                      {unreadCustomers}
                    </span>
                  )}

                {link.label === "Earnings and Reports" && normalizedRole === "admin" && unreadAppointments > 0 && (
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
