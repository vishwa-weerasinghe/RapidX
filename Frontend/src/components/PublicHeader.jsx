import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LayoutDashboard } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import logoImg from "../assets/logo.jpg";

export default function PublicHeader({ activeSection, onNavigate, forceGlass = false }) {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(forceGlass);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  const [isBlogMenuOpen, setIsBlogMenuOpen] = useState(false);
  const [isMobileHelpOpen, setIsMobileHelpOpen] = useState(false);
  const [isMobileBlogOpen, setIsMobileBlogOpen] = useState(false);

  const helpMenuRef = useRef(null);
  const blogMenuRef = useRef(null);

  const user = (() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  })();

  const dashboardLink = user?.role === "admin" ? "/admin/dashboard" : "/user/dashboard";

  const helpLinks = [
    { label: "Frequently", path: "/help/frequently" },
    { label: "Privacy Policy", path: "/privacy-policy" },
    { label: "Terms and Conditions", path: "/terms-and-conditions" },
    { label: "Return & Refund Policy", path: "/return-refund-policy" },
  ];

  const blogLinks = [
    { label: "Minneriya National Park", path: "/blog#minneriya", description: "The Great Elephant Gathering" },
    { label: "Kaudulla National Park", path: "/blog#kaudulla", description: "The Pristine Wildlife Corridor" },
    { label: "Wasgamuwa National Park", path: "/blog#wasgamuwa", description: "The Gathering Place of Bears" },
    { label: "Hurulu Eco Park", path: "/blog#hurulu", description: "The Vital Elephant Corridor" },
    { label: "Full Day Safari Experience", path: "/blog#full-day-safari", description: "Hurulu Eco Park & Minneriya or Kaudulla" },
  ];

  useEffect(() => {
    if (forceGlass) return;
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (helpMenuRef.current && !helpMenuRef.current.contains(event.target)) setIsHelpMenuOpen(false);
      if (blogMenuRef.current && !blogMenuRef.current.contains(event.target)) setIsBlogMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavClick = (section) => {
    setIsMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(section);
    } else {
      navigate(`/#${section}`);
    }
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled ? "px-3 pt-3 md:px-8" : "px-0 pt-0"}`}
      >
        {!isScrolled && (
          <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-black/70 to-transparent pointer-events-none -z-10"></div>
        )}
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between transition-all duration-500 relative ${isScrolled
            ? "bg-[var(--page-bg)]/90 dark:bg-[var(--surface)]/90 backdrop-blur-xl rounded-full shadow-lg border border-[var(--border)]/40 py-2.5"
            : "bg-transparent py-5 border-b border-white/10"
            }`}
        >
          <div
            className="cursor-pointer flex items-center gap-2 sm:gap-3 group"
            onClick={() => handleNavClick("home")}
          >
            <div className="relative flex items-center justify-center transition-all duration-500 group-hover:scale-105 rounded-full">
              <img
                src={logoImg}
                alt="Minneriya Wild Jeep Safari"
                className="h-11 w-11 sm:h-12 sm:w-12 md:h-14 md:w-14 object-cover rounded-full border border-white/15 shadow-sm"
              />
            </div>
            <span
              className={`font-outfit text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight transition-all duration-500 ${isScrolled
                ? "bg-clip-text text-transparent bg-gradient-to-r from-sacramento to-castleton dark:from-white dark:to-gray-400"
                : "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
                }`}
            >
              Wild Jeep Safari
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
            <ul className="flex items-center gap-0.5 lg:gap-1">
              {[
                "home",
                "about",
                "safaris",
                "packages",
                "reviews",
                "gallery",
                "contact",
              ].map((section) => (
                <li key={section}>
                  <button
                    onClick={() => handleNavClick(section)}
                    className={`px-2 lg:px-2.5 py-1 sm:py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-300 ${activeSection === section
                      ? "bg-sacramento text-white shadow shadow-sacramento/25"
                      : isScrolled
                        ? "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                      }`}
                  >
                    {section}
                  </button>
                </li>
              ))}

              <li className="relative" ref={helpMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsHelpMenuOpen((prev) => !prev);
                    setIsBlogMenuOpen(false);
                  }}
                  className={`flex items-center gap-1 px-2 lg:px-2.5 py-1 sm:py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-300 ${isHelpMenuOpen
                    ? "bg-sacramento text-white shadow shadow-sacramento/25"
                    : isScrolled
                      ? "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                >
                  Help
                  <span className={`text-[10px] transition-transform duration-200 ${isHelpMenuOpen ? "rotate-180" : ""}`}>
                    ▾
                  </span>
                </button>

                {isHelpMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-3 w-72 rounded-2xl border border-[#dfe8dc] bg-[#fffdf9] p-2.5 shadow-[0_20px_40px_rgba(20,52,38,0.15)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900 flex flex-col">
                    {helpLinks.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsHelpMenuOpen(false)}
                        className="rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 transition-all hover:bg-[#edf7ef] hover:text-[#1b5d3d] dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </li>

              <li className="relative" ref={blogMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsBlogMenuOpen((prev) => !prev)}
                  className={`flex items-center gap-1 px-2 lg:px-2.5 py-1 sm:py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-300 ${isBlogMenuOpen
                    ? "bg-sacramento text-white shadow shadow-sacramento/25"
                    : isScrolled
                      ? "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                >
                  Blog
                  <span className={`text-[10px] transition-transform duration-200 ${isBlogMenuOpen ? "rotate-180" : ""}`}>
                    ▾
                  </span>
                </button>

                {isBlogMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-3 w-80 sm:w-88 rounded-2xl border border-[#dfe8dc] bg-[#fffdf9] p-2.5 shadow-[0_20px_40px_rgba(20,52,38,0.15)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900 flex flex-col max-h-[75vh]">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1 flex items-center justify-between shrink-0">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        Safari Travel Guides
                      </p>
                      <Link
                        to="/blog"
                        onClick={() => setIsBlogMenuOpen(false)}
                        className="text-[11px] font-bold text-sacramento hover:underline dark:text-castleton-300 flex items-center gap-1"
                      >
                        View All
                        <span className="text-xs">→</span>
                      </Link>
                    </div>
                    <div className="overflow-y-auto pr-1 space-y-0.5">
                      {blogLinks.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsBlogMenuOpen(false)}
                          className="group flex flex-col rounded-xl px-3 py-2 text-left transition-all hover:bg-[#edf7ef] dark:hover:bg-slate-800"
                        >
                          <span className="text-xs font-bold text-[#1d4334] group-hover:text-[#1b5d3d] dark:text-slate-200 dark:group-hover:text-white flex items-center justify-between">
                            {item.label}
                            <span className="text-xs text-castleton opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                          </span>
                          {item.description && (
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1">
                              {item.description}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                    <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800 shrink-0">
                      <Link
                        to="/blog"
                        onClick={() => setIsBlogMenuOpen(false)}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-sacramento hover:bg-[#edf7ef] dark:text-emerald-400 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span>View All Guides & Tours</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                )}
              </li>
            </ul>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5">
              {user ? (
                <Link
                  to={dashboardLink}
                  className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 border rounded-full hover:shadow transition-all duration-300 ${isScrolled
                    ? "text-sacramento border-sacramento/25 hover:bg-sacramento/5 dark:text-white dark:border-neutral-800 dark:hover:bg-neutral-800"
                    : "text-white border-white/20 hover:bg-white/10"
                    }`}
                >
                  <LayoutDashboard size={13} />
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`text-xs font-bold px-4 py-2 border rounded-full hover:shadow transition-all duration-300 ${isScrolled
                      ? "text-slate-700 dark:text-slate-350 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850"
                      : "text-white border-white/20 hover:bg-white/10"
                      }`}
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="text-xs font-bold px-4 py-2 bg-sacramento hover:bg-sacramento-600 text-white rounded-full shadow"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            <div className="h-6 w-[1px] bg-slate-200/60 dark:bg-slate-800 hidden sm:block" />

            <ThemeToggle />

            <button
              onClick={() => {
                setIsMobileMenuOpen((prev) => !prev);
                setIsMobileBlogOpen(false);
                setIsMobileHelpOpen(false);
              }}
              className={`md:hidden flex items-center justify-center p-2.5 rounded-full transition-all duration-300 active:scale-95 ${isMobileMenuOpen
                ? "bg-sacramento text-white shadow-md"
                : isScrolled
                  ? "bg-slate-100 dark:bg-neutral-800 text-slate-800 dark:text-white"
                  : "bg-white/20 text-white backdrop-blur-md"
                }`}
              aria-label="Toggle navigation interface"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-3 p-4 rounded-3xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-neutral-800/80 shadow-2xl transition-all duration-300 md:hidden z-50 flex flex-col gap-2.5">
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  "home",
                  "about",
                  "safaris",
                  "packages",
                  "reviews",
                  "gallery",
                  "contact",
                ].map((section) => (
                  <button
                    key={section}
                    onClick={() => handleNavClick(section)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold capitalize tracking-wide transition-all duration-200 text-left ${activeSection === section
                      ? "bg-sacramento text-white shadow-md shadow-sacramento/30"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800"
                      }`}
                  >
                    {section}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileHelpOpen((prev) => !prev);
                    setIsMobileBlogOpen(false);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold capitalize tracking-wide transition-all duration-200 text-left flex items-center justify-between ${isMobileHelpOpen
                    ? "bg-sacramento text-white shadow-md shadow-sacramento/30"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800"
                    }`}
                >
                  <span>Help</span>
                  <span className={`text-[10px] transition-transform duration-200 ${isMobileHelpOpen ? "rotate-180" : ""}`}>
                    ▾
                  </span>
                </button>

                {isMobileHelpOpen && (
                  <div className="rounded-2xl border border-[#dfe8dc] bg-[#fffdf9] p-2.5 shadow-lg backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900 flex flex-col gap-1 col-span-2">
                    {helpLinks.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 transition-all hover:bg-[#edf7ef] hover:text-[#1b5d3d] dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileBlogOpen((prev) => !prev);
                    setIsMobileHelpOpen(false);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold capitalize tracking-wide transition-all duration-200 text-left flex items-center justify-between ${isMobileBlogOpen
                    ? "bg-sacramento text-white shadow-md shadow-sacramento/30"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800"
                    }`}
                >
                  <span>Blog</span>
                  <span className={`text-[10px] transition-transform duration-200 ${isMobileBlogOpen ? "rotate-180" : ""}`}>
                    ▾
                  </span>
                </button>
              </div>

              {isMobileBlogOpen && (
                <div className="rounded-2xl border border-[#dfe8dc] bg-[#fffdf9] p-2.5 shadow-lg backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900 flex flex-col max-h-64 transition-all">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1 flex items-center justify-between shrink-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Safari Travel Guides
                    </p>
                    <Link
                      to="/blog"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsMobileBlogOpen(false);
                      }}
                      className="text-[11px] font-bold text-sacramento hover:underline dark:text-castleton-300 flex items-center gap-1"
                    >
                      View All
                      <span className="text-xs">→</span>
                    </Link>
                  </div>
                  <div className="overflow-y-auto pr-1 space-y-0.5">
                    {blogLinks.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsMobileBlogOpen(false);
                        }}
                        className="group flex flex-col rounded-xl px-3 py-2 text-left transition-all hover:bg-[#edf7ef] dark:hover:bg-slate-800"
                      >
                        <span className="text-xs font-bold text-[#1d4334] group-hover:text-[#1b5d3d] dark:text-slate-200 dark:group-hover:text-white flex items-center justify-between">
                          {item.label}
                          <span className="text-xs text-castleton opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        </span>
                        {item.description && (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1">
                            {item.description}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                  <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800 shrink-0">
                    <Link
                      to="/blog"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsMobileBlogOpen(false);
                      }}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold text-sacramento hover:bg-[#edf7ef] dark:text-emerald-400 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span>View All Guides & Tours</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              )}

              <div>
                {user ? (
                  <Link
                    to={dashboardLink}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-2.5 text-center rounded-xl text-xs font-bold bg-sacramento text-white hover:bg-sacramento-600 shadow flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-2.5 text-center rounded-xl text-xs font-bold border border-slate-300 dark:border-neutral-700 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-2.5 text-center rounded-xl text-xs font-bold bg-sacramento text-white hover:bg-sacramento-600 shadow transition-colors"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
