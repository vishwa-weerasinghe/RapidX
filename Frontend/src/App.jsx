import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "./components/ThemeToggle";
import { useTheme } from "./context/ThemeContext";
import api from "./axios";

export default function App() {
  // --- CONSUME SYSTEM THEME ---
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#packages") {
      const element = document.getElementById("packages");
      if (element) {
        setTimeout(() => {
          window.scrollTo({ top: element.offsetTop - 80, behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);

  const handleBookNow = (pkg) => {
    if (pkg?.id) {
      navigate(`/booking/${pkg.id}`);
    } else if (packages.length > 0) {
      navigate(`/booking/${packages[0].id}`);
    } else {
      scrollToSection("packages");
    }
  };

  // --- STATE MANAGEMENT ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [notification, setNotification] = useState(null);

  // Contact Form Handling State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- REFS & DATA ---
  const reviewsSliderRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const heroSlides = [
    "https://minneriyawildjeepsafari.com/wp-content/uploads/2025/08/WhatsApp-Image-2025-08-20-at-12.11.05-1024x683.jpeg",
  ];

  const safariLocations = [
    {
      id: "minneriya",
      title: "Minneriya National Park",
      desc: "Famous for the world's largest wild elephant gathering during the dry season.",
      img: "https://minneriyawildjeepsafari.com/wp-content/uploads/2025/08/WhatsApp-Image-2025-08-20-at-12.11.05-1024x683.jpeg",
    },
    {
      id: "kaudulla",
      title: "Kaudulla National Park",
      desc: "Spectacular elephant herds and diverse wildlife in pristine natural habitat.",
      img: "https://minneriyawildjeepsafari.com/wp-content/uploads/2024/05/cb-1.jpg",
    },
    {
      id: "wasgamuwa",
      title: "Wasgamuwa National Park",
      desc: "Hidden gem offering intimate wildlife encounters in untouched wilderness.",
      img: "https://minneriyawildjeepsafari.com/wp-content/uploads/2024/05/WhatsApp-Image-2025-08-20-at-12.11.13-1.jpeg",
    },
    {
      id: "hurulu",
      title: "Hurulu Eco Park",
      desc: "Eco-friendly park with diverse ecosystems and abundant wildlife.",
      img: "https://minneriyawildjeepsafari.com/wp-content/uploads/2024/05/Udawalawe-National-Park-4.jpg",
    },
  ];

  const [packages, setPackages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    // 1. Fetch Packages from DB
    api
      .get("/packages")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const mapped = res.data.map((pkg, idx) => {
            const nameLower = (pkg.Package_Name || "").toLowerCase();
            let img =
              "https://minneriyawildjeepsafari.com/wp-content/uploads/2025/08/WhatsApp-Image-2025-08-20-at-12.11.05-1024x683.jpeg";
            if (nameLower.includes("minneriya")) {
              img =
                "https://minneriyawildjeepsafari.com/wp-content/uploads/2025/08/WhatsApp-Image-2025-08-20-at-12.11.05-1024x683.jpeg";
            } else if (nameLower.includes("kaudulla")) {
              img =
                "https://minneriyawildjeepsafari.com/wp-content/uploads/2024/05/cb-1.jpg";
            } else if (nameLower.includes("wasgamuwa")) {
              img =
                "https://minneriyawildjeepsafari.com/wp-content/uploads/2024/05/WhatsApp-Image-2025-08-20-at-12.11.13-1.jpeg";
            } else if (nameLower.includes("hurulu")) {
              img =
                "https://minneriyawildjeepsafari.com/wp-content/uploads/2024/05/Udawalawe-National-Park-4.jpg";
            }

            return {
              id: pkg.id,
              title: pkg.Package_Name,
              desc: pkg.Description,
              price: `$${parseFloat(pkg.Price_for_adult || 0).toFixed(0)}`,
              img: img,
              popular:
                idx === 0 ||
                nameLower.includes("morning") ||
                nameLower.includes("popular"),
            };
          });
          setPackages(mapped);
        }
      })
      .catch((err) => console.error("Error loading packages:", err));

    // 2. Fetch Reviews from DB
    api
      .get("/reviews")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const mapped = res.data.map((rev) => {
            const firstName = rev.customer?.First_Name || "";
            const lastName = rev.customer?.Last_Name || "";
            const initials =
              `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "G";
            const name = `${firstName} ${lastName}`.trim() || "Guest User";
            const words = (rev.Description || "").split(" ");
            const title =
              words.length > 0
                ? words.slice(0, 4).join(" ") + (words.length > 4 ? "..." : "")
                : "Excellent Safari";

            return {
              initials: initials,
              name: name,
              date: "Recently",
              title: title,
              text: rev.Description,
              rate: rev.Rate || 5,
            };
          });
          setReviews(mapped);
        }
      })
      .catch((err) => console.error("Error loading reviews:", err));

    // 3. Fetch Media Gallery from DB
    api
      .get("/media")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const mapped = res.data.map((item) => {
            const src = item.file_path.startsWith("http")
              ? item.file_path
              : `http://127.0.0.1:8000${item.file_path}`;
            return {
              src: src,
              alt: item.title || "Safari Photo",
            };
          });
          setGalleryImages(mapped);
        }
      })
      .catch((err) => console.error("Error loading media:", err));
  }, []);

  // --- WINDOW LIFECYCLE LISTENERS ---
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
      setShowScrollTop(window.scrollY > 300);

      // Active Section Navigation Tracker Spying Logic
      const sections = [
        "home",
        "about",
        "safaris",
        "packages",
        "reviews",
        "gallery",
        "contact",
      ];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop - 120;
          const height = el.offsetHeight;
          if (window.scrollY >= top && window.scrollY < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Escape key global listener for Modal Lightbox exit hook actions
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setLightboxImage(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // --- AUTOMATED SLIDERS CONTROLS ---
  useEffect(() => {
    if (heroSlides.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [heroSlides.length]);

  const handleReviewNext = () =>
    setReviewIndex((prev) => Math.min(reviews.length - 1, prev + 1));
  const handleReviewPrev = () =>
    setReviewIndex((prev) => Math.max(0, prev - 1));

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };
  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].screenX;
    if (touchEndX.current < touchStartX.current - 50) handleReviewNext();
    if (touchEndX.current > touchStartX.current + 50) handleReviewPrev();
  };

  const getReviewTransformStyle = () => {
    if (
      typeof window !== "undefined" &&
      window.innerWidth <= 768 &&
      reviewsSliderRef.current
    ) {
      const card = reviewsSliderRef.current.querySelector(".review-card");
      const cardWidth = card ? card.offsetWidth : 0;
      return { transform: `translateX(-${reviewIndex * (cardWidth + 32)}px)` };
    }
    return {};
  };

  // --- ACTION SUBMISSIONS ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setNotification({
        text: "Thank you! Your safari booking request inquiry has been sent successfully.",
        type: "success",
      });
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setIsSubmitting(false);
      setTimeout(() => setNotification(null), 5000);
    }, 1500);
  };

  const scrollToSection = (id) => {
    setIsMobileMenuOpen(false);
    const target = document.getElementById(id);
    if (target) {
      window.scrollTo({ top: target.offsetTop - 80, behavior: "smooth" });
    }
  };

  return (
    <div
      className={`font-sans antialiased overflow-x-hidden selection:bg-emerald-700 selection:text-white transition-colors duration-200 ${
        theme === "dark"
          ? "bg-neutral-950 text-white"
          : "bg-white text-neutral-800"
      }`}
    >
      {/* Toast Notification Alert Box */}
      {notification && (
        <div
          className={`fixed top-24 right-5 p-5 rounded-xl shadow-2xl z-[9999] border-l-4 border-emerald-700 max-w-sm animate-fade-in-left ${
            theme === "dark"
              ? "bg-neutral-900 text-white"
              : "bg-white text-neutral-800"
          }`}
        >
          <p className="text-sm font-medium">{notification.text}</p>
        </div>
      )}

      {/* Synchronized Header & Navbar */}
      <header
        className={`fixed top-0 left-0 w-full z-50 backdrop-blur-md border-b transition-all duration-300 ${
          isScrolled ? "shadow-md py-2" : "shadow-sm py-4"
        } ${
          theme === "dark"
            ? "bg-neutral-900/85 border-neutral-800"
            : "bg-white/85 border-neutral-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
          <div
            className="cursor-pointer flex items-center gap-2"
            onClick={() => scrollToSection("home")}
          >
            <img
              src="https://minneriyawildjeepsafari.com/wp-content/uploads/2025/08/lgo.jpg"
              alt="Minneriya Wild Jeep Safari"
              className="h-12 md:h-14 w-auto object-contain"
            />
            <span className="text-lg font-bold tracking-wide text-[#1B4332] dark:text-green-400 hidden sm:inline-block">
              Wild Safari
            </span>
          </div>

          {/* Navigation Links Container */}
          <ul
            className={`fixed md:relative top-[65px] md:top-0 ${isMobileMenuOpen ? "left-0" : "-left-full md:left-0"} w-full md:w-auto h-[calc(100vh-65px)] md:h-auto flex flex-col md:flex-row gap-6 md:gap-8 items-center pt-10 md:pt-0 transition-all duration-300 z-40 shadow-xl md:shadow-none ${
              theme === "dark"
                ? "bg-neutral-900 md:bg-transparent"
                : "bg-white md:bg-transparent"
            }`}
          >
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
                  onClick={() => scrollToSection(section)}
                  className={`font-semibold capitalize text-sm relative transition-colors pb-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-emerald-600 after:transition-all ${
                    activeSection === section
                      ? "text-emerald-600 dark:text-green-400 after:w-full"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-green-400 after:w-0 hover:after:w-full"
                  }`}
                >
                  {section}
                </button>
              </li>
            ))}
          </ul>

          {/* Auth & Theme Actions Panel */}
          <div className="flex items-center gap-3">
            <Link
              to="/register"
              className="text-xs font-semibold px-4 py-2 rounded-lg transition bg-[#6F4E37] dark:bg-green-700 text-white hover:bg-[#5a3d2b] dark:hover:bg-green-600 hidden sm:inline-block"
            >
              Register
            </Link>
            <Link
              to="/login"
              className="text-xs font-semibold px-4 py-2 rounded-lg border transition text-[#2d6e32] dark:text-green-400 border-[#6F4E37] dark:border-green-500 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hidden sm:inline-block"
            >
              Log in
            </Link>

            <ThemeToggle />

            {/* Mobile Navigation Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex flex-col gap-[5px] cursor-pointer md:hidden p-2"
              aria-label="Toggle navigation interface"
            >
              <span
                className={`w-5 h-[2px] rounded transition-all duration-300 ${theme === "dark" ? "bg-white" : "bg-neutral-800"} ${isMobileMenuOpen ? "transform rotate-45 translate-y-[7px]" : ""}`}
              ></span>
              <span
                className={`w-5 h-[2px] rounded transition-all duration-300 ${theme === "dark" ? "bg-white" : "bg-neutral-800"} ${isMobileMenuOpen ? "opacity-0" : ""}`}
              ></span>
              <span
                className={`w-5 h-[2px] rounded transition-all duration-300 ${theme === "dark" ? "bg-white" : "bg-neutral-800"} ${isMobileMenuOpen ? "transform -rotate-45 -translate-y-[7px]" : ""}`}
              ></span>
            </button>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section
        id="home"
        className="relative h-screen min-h-[650px] flex items-center overflow-hidden pt-16"
      >
        <div className="absolute top-0 left-0 w-full h-full z-0">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute w-full h-full transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
            >
              <img
                src={slide}
                alt="Elephant Gathering Scene"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-950/85 to-emerald-900/65 z-10"></div>
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 w-full relative z-20">
          <div className="max-w-2xl text-white">
            <span className="text-amber-400 font-semibold uppercase tracking-widest text-sm block mb-3">
              Explore Sri Lanka's Wildlife
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4 text-white">
              Witness the World's Largest Wild Elephant Gathering
            </h1>
            <p className="text-neutral-200 text-base sm:text-lg mb-8 max-w-xl">
              Experience unforgettable close-up encounters with majestic
              elephants in Minneriya and Kaudulla National Parks
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button
                onClick={() => handleBookNow(packages[0])}
                className="bg-emerald-700 text-white font-semibold text-center px-8 py-4 rounded-full hover:bg-emerald-800 shadow-md transition duration-300 transform hover:-translate-y-0.5"
              >
                Book Now
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="bg-transparent border-2 border-white text-white font-semibold text-center px-8 py-4 rounded-full hover:bg-white hover:text-emerald-800 transition duration-300"
              >
                Learn More
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/20 max-w-md">
              <div>
                <span className="text-2xl sm:text-3xl font-bold text-amber-400 block">
                  2,500+
                </span>
                <span className="text-xs sm:text-sm text-neutral-300">
                  Happy Travelers
                </span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-bold text-amber-400 block">
                  4.9/5
                </span>
                <span className="text-xs sm:text-sm text-neutral-300">
                  TripAdvisor Rating
                </span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-bold text-amber-400 block">
                  24/7
                </span>
                <span className="text-xs sm:text-sm text-neutral-300">
                  Available
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- ABOUT SECTION --- */}
      <section id="about" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative group rounded-2xl overflow-hidden shadow-xl">
              <img
                src="https://minneriyawildjeepsafari.com/wp-content/uploads/2025/08/WhatsApp-Image-2025-08-20-at-12.11.05-1024x683.jpeg"
                alt="Elephant Gathering"
                className="w-full h-[350px] sm:h-[450px] lg:h-[500px] object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-5 right-5 bg-amber-400 text-neutral-950 font-bold px-6 py-3 rounded-full shadow-md text-sm">
                Since 2020
              </div>
            </div>

            <div>
              <span className="text-emerald-600 dark:text-green-400 font-semibold uppercase tracking-wider text-xs block mb-2">
                About Us
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-6">
                Minneriya & Kaudulla Largest Wild Elephant Gathering
              </h2>
              <p
                className={`mb-8 leading-relaxed text-sm sm:text-base ${theme === "dark" ? "text-neutral-400" : "text-neutral-606"}`}
              >
                Experience the world-famous largest wild elephant gathering at
                Minneriya and Kaudulla National Parks in Sri Lanka. Join our
                expert-guided jeep safaris for unforgettable close-up encounters
                with hundreds of majestic elephants in their natural habitat.
              </p>

              <div className="space-y-6 mb-8">
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center">
                    🐾
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">
                      Trusted Travel Guide
                    </h3>
                    <p className="text-neutral-400 text-sm">
                      Expert advice, personalized itineraries, and local
                      insights for safe, memorable experiences
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center">
                    🗺️
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">
                      Personalized Safari
                    </h3>
                    <p className="text-neutral-400 text-sm">
                      Tailored experiences with expert guides, private jeeps,
                      and flexible schedules
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => scrollToSection("contact")}
                className="bg-emerald-700 text-white font-semibold px-6 py-3 rounded-full hover:bg-emerald-800 shadow transition duration-300"
              >
                More About Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- WHY CHOOSE US SECTION --- */}
      <section
        className={`py-16 md:py-24 ${theme === "dark" ? "bg-neutral-900/40" : "bg-neutral-50"}`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-emerald-600 dark:text-green-400 font-semibold uppercase tracking-wider text-xs block mb-2">
              Why Choose Us
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold">
              What Makes Us Special
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Local Experts",
                desc: "We are locals living in Habarana & Minneriya with deep knowledge of the area",
                icon: "🪵",
              },
              {
                title: "Flexible Tours",
                desc: "Customized safaris with flexibility to change based on your preferences",
                icon: "🔄",
              },
              {
                title: "Safe & Secure",
                desc: "Easy & safe payments with no hidden fees - great value for money",
                icon: "🛡️",
              },
              {
                title: "Professional Drivers",
                desc: "Certified safari drivers with extensive experience",
                icon: "🛞",
              },
            ].map((reason, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-2xl text-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-neutral-900 border border-neutral-800"
                    : "bg-white"
                }`}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-700 to-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl shadow">
                  {reason.icon}
                </div>
                <h3 className="text-base font-bold mb-3">{reason.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  {reason.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SAFARI LOCATIONS --- */}
      <section id="safaris" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-emerald-600 dark:text-green-400 font-semibold uppercase tracking-wider text-xs block mb-2">
              Explore Safari Locations
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold">
              Beautiful Places Around Sri Lanka
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {safariLocations.map((loc) => (
              <div
                key={loc.id}
                className={`rounded-2xl overflow-hidden shadow-md border hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group ${
                  theme === "dark"
                    ? "bg-neutral-900 border-neutral-800"
                    : "bg-white border-neutral-100"
                }`}
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={loc.img}
                    alt={loc.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-0 left-0 w-full h-full bg-emerald-900/75 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => scrollToSection("packages")}
                      className="bg-white text-emerald-800 font-bold text-xs px-5 py-2.5 rounded-full hover:bg-emerald-700 hover:text-white transition duration-300 shadow-md"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold mb-2">{loc.title}</h3>
                  <p className="text-neutral-400 text-xs sm:text-sm mb-4 line-clamp-2">
                    {loc.desc}
                  </p>
                  <div className="flex gap-4 text-neutral-400 text-xs font-medium border-t pt-3 border-neutral-100 dark:border-neutral-800">
                    <span className="flex items-center gap-1">
                      🌅 Morning & Evening
                    </span>
                    <span className="flex items-center gap-1">
                      👥 6 Persons
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TOUR PACKAGES --- */}
      <section
        id="packages"
        className={`py-16 md:py-24 ${theme === "dark" ? "bg-neutral-900/40" : "bg-neutral-50"}`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-emerald-600 dark:text-green-400 font-semibold uppercase tracking-wider text-xs block mb-2">
              Tour Packages
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold">
              Choose Your Adventure
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, idx) => (
              <div
                key={idx}
                className={`rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between border relative ${
                  theme === "dark"
                    ? "bg-neutral-900 border-neutral-800"
                    : "bg-white border-neutral-100"
                }`}
              >
                <div>
                  <div className="relative h-60 overflow-hidden">
                    <img
                      src={pkg.img}
                      alt={pkg.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    {pkg.popular && (
                      <span className="absolute top-4 right-4 bg-rose-500 text-white font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider shadow">
                        Popular
                      </span>
                    )}
                  </div>

                  <div className="p-6 sm:p-8">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold mb-1">{pkg.title}</h3>
                      <div className="flex items-center gap-1">
                        <span className="text-amber-400 text-sm">★★★★★</span>
                        <span className="text-neutral-400 text-xs font-medium">
                          (3 Reviews)
                        </span>
                      </div>
                    </div>

                    <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
                      {pkg.desc}
                    </p>

                    <ul className="space-y-2.5 mb-6 text-neutral-500 dark:text-neutral-400 text-sm">
                      <li>✓ Professional Guide</li>
                      <li>✓ Comfortable Jeep</li>
                      <li>✓ Refreshments</li>
                      <li>✓ 6 Persons Max</li>
                    </ul>
                  </div>
                </div>

                <div
                  className={`p-6 sm:p-8 border-t flex items-center justify-between ${
                    theme === "dark"
                      ? "bg-neutral-950/40 border-neutral-800"
                      : "bg-neutral-50 border-neutral-100"
                  }`}
                >
                  <div>
                    <span className="text-xs text-neutral-400 block font-medium">
                      From
                    </span>
                    <span className="text-2xl font-extrabold text-emerald-600 dark:text-green-400">
                      {pkg.price}
                    </span>
                  </div>
                  <button
                    onClick={() => handleBookNow(pkg)}
                    className="bg-emerald-700 text-white font-bold text-sm px-5 py-3 rounded-full hover:bg-emerald-800 transition duration-300 shadow"
                  >
                    Book Now
                  </button>
                  <button
                   // onClick={() => handleBookNow(pkg)}
                    className="bg-emerald-700 text-white font-bold text-sm px-5 py-3 rounded-full hover:bg-emerald-800 transition duration-300 shadow"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- REVIEWS SECTION --- */}
      <section id="reviews" className="py-16 md:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-emerald-600 dark:text-green-400 font-semibold uppercase tracking-wider text-xs block mb-2">
              Customer Reviews
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
              What Our Guests Say
            </h2>
            <img
              src="https://minneriyawildjeepsafari.com/wp-content/uploads/2025/08/TC25-logo.jpg"
              alt="TripAdvisor"
              className="h-16 mx-auto object-contain"
            />
          </div>

          <div className="relative max-w-5xl mx-auto px-2">
            <div
              className="md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 flex transition-transform duration-300 ease-out"
              ref={reviewsSliderRef}
              style={getReviewTransformStyle()}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {reviews.map((rev, index) => (
                <div
                  key={index}
                  className={`review-card p-6 rounded-2xl shadow-md border min-w-[85vw] sm:min-w-[45vw] md:min-w-0 flex-shrink-0 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
                    theme === "dark"
                      ? "bg-neutral-900 border-neutral-800"
                      : "bg-white border-neutral-100"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-700 to-emerald-500 text-white font-bold text-xs rounded-full flex items-center justify-center">
                        {rev.initials}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold leading-tight">
                          {rev.name}
                        </h4>
                        <span className="text-amber-400 text-xs">
                          {"★".repeat(rev.rate || 5)}
                          {"☆".repeat(5 - (rev.rate || 5))}
                        </span>
                      </div>
                    </div>
                    <span className="text-neutral-400 text-xs">{rev.date}</span>
                  </div>
                  <h3 className="text-base font-bold mb-2 line-clamp-1">
                    "{rev.title}"
                  </h3>
                  <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-5">
                    {rev.text}
                  </p>
                  <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Verified
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-3 mt-8 md:hidden">
              <button
                onClick={handleReviewPrev}
                className="w-10 h-10 bg-emerald-700 text-white rounded-full flex items-center justify-center transition shadow-md"
              >
                ←
              </button>
              <button
                onClick={handleReviewNext}
                className="w-10 h-10 bg-emerald-700 text-white rounded-full flex items-center justify-center transition shadow-md"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- PHOTO GALLERY --- */}
      <section
        id="gallery"
        className={`py-16 md:py-24 ${theme === "dark" ? "bg-neutral-900/40" : "bg-neutral-50"}`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-emerald-600 dark:text-green-400 font-semibold uppercase tracking-wider text-xs block mb-2">
              Photo Gallery
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold">
              Captured Moments
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setLightboxImage(img)}
                className="relative h-64 sm:h-72 rounded-2xl overflow-hidden cursor-pointer group shadow-md"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-0 left-0 w-full h-full bg-emerald-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 text-white text-xl">
                  🔍
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Overlay Lightbox */}
      {lightboxImage && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-neutral-950/95 z-[99999] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 text-white text-3xl hover:scale-110 transition cursor-pointer"
            >
              &times;
            </button>
            <img
              src={lightboxImage.src}
              alt={lightboxImage.alt}
              className="max-w-full max-h-[80vh] rounded-lg object-contain shadow-2xl"
            />
            <p className="text-center text-neutral-400 text-sm mt-3 font-medium">
              {lightboxImage.alt}
            </p>
          </div>
        </div>
      )}

      {/* --- CTA BANNER --- */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-emerald-950 to-emerald-800 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <h2 className="font-serif text-2xl sm:text-4xl font-bold mb-4">
            Ready To Minneriya Elephant Gathering Safari
          </h2>
          <p className="text-neutral-200 text-base sm:text-lg mb-8 max-w-md mx-auto">
            Your Dream Safari Experience Awaits
          </p>
          <a
            href="mailto:info@minneriyawildjeepsafari.com"
            className="bg-white text-emerald-900 font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-full hover:bg-emerald-700 hover:text-white transition duration-300 inline-block shadow-lg text-sm sm:text-base break-all max-w-full"
          >
            Contact Us: info@minneriyawildjeepsafari.com
          </a>
        </div>
      </section>

      {/* --- CONTACT SECTION --- */}
      <section id="contact" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div>
              <h2 className="font-serif text-3xl font-bold mb-2">
                Get In Touch
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base mb-8">
                Ready to experience the adventure of a lifetime? Contact us
                today!
              </p>

              <div className="space-y-6 mb-8 text-neutral-500 dark:text-neutral-400 text-sm">
                <p>
                  📞{" "}
                  <a
                    href="tel:+94778902811"
                    className="hover:text-emerald-600 ml-2"
                  >
                    (+94) 778902811
                  </a>
                </p>
                <p>
                  ✉️{" "}
                  <a
                    href="mailto:info@minneriyawildjeepsafari.com"
                    className="hover:text-emerald-600 ml-2"
                  >
                    info@minneriyawildjeepsafari.com
                  </a>
                </p>
                <p>
                  📍{" "}
                  <span className="ml-2">
                    423, Kiralagolla, Dambulu Oya, Dambulla
                  </span>
                </p>
                <p>
                  ⏰ <span className="ml-2">24 hours Open</span>
                </p>
              </div>

              {/* Social Network Actions */}
              <div className="flex gap-3">
                {[
                  {
                    label: "Facebook",
                    href: "https://facebook.com/share/1AmhHo7Cg2/",
                    icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
                  },
                  {
                    label: "Instagram",
                    href: "https://www.instagram.com/minneriyawildjeepsafari",
                    icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
                  },
                  {
                    label: "YouTube",
                    href: "https://www.youtube.com/@minneriyawildjeepsafari",
                    icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
                  },
                ].map((soc, sIdx) => (
                  <a
                    key={sIdx}
                    href={soc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full flex items-center justify-center shadow transition-all hover:-translate-y-1"
                    aria-label={soc.label}
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d={soc.icon} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Input Form Module Wrapper */}
            <div
              className={`p-6 sm:p-10 rounded-2xl border shadow-sm ${
                theme === "dark"
                  ? "bg-neutral-900 border-neutral-800"
                  : "bg-neutral-50 border-neutral-100"
              }`}
            >
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Your Name"
                  required
                  className={`w-full p-4 border rounded-lg text-sm focus:outline-none focus:border-emerald-700 transition ${
                    theme === "dark"
                      ? "bg-neutral-950 border-neutral-800 text-white"
                      : "bg-white border-neutral-200"
                  }`}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="Your Email"
                  required
                  className={`w-full p-4 border rounded-lg text-sm focus:outline-none focus:border-emerald-700 transition ${
                    theme === "dark"
                      ? "bg-neutral-950 border-neutral-800 text-white"
                      : "bg-white border-neutral-200"
                  }`}
                />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  placeholder="Your Phone"
                  className={`w-full p-4 border rounded-lg text-sm focus:outline-none focus:border-emerald-700 transition ${
                    theme === "dark"
                      ? "bg-neutral-950 border-neutral-800 text-white"
                      : "bg-white border-neutral-200"
                  }`}
                />
                <div className="relative">
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleFormChange}
                    required
                    className={`w-full p-4 border rounded-lg text-sm focus:outline-none focus:border-emerald-700 transition appearance-none text-neutral-400 ${
                      theme === "dark"
                        ? "bg-neutral-950 border-neutral-800"
                        : "bg-white border-neutral-200"
                    }`}
                  >
                    <option value="">Select Safari Type</option>
                    <option value="minneriya">Minneriya Safari</option>
                    <option value="kaudulla">Kaudulla Safari</option>
                    <option value="wasgamuwa">Wasgamuwa Safari</option>
                    <option value="hurulu">Hurulu Eco Park</option>
                  </select>
                </div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleFormChange}
                  rows="4"
                  placeholder="Your Message"
                  required
                  className={`w-full p-4 border rounded-lg text-sm focus:outline-none focus:border-emerald-700 transition resize-y ${
                    theme === "dark"
                      ? "bg-neutral-950 border-neutral-800 text-white"
                      : "bg-white border-neutral-200"
                  }`}
                ></textarea>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-700 text-white font-bold text-sm py-4 rounded-lg hover:bg-emerald-800 transition shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-neutral-900 text-white pt-16 pb-8 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <span className="text-lg font-bold block mb-4">
                🌿 Wild Safari
              </span>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Minneriyawildjeepsafari is a leading Sri Lanka jeep safari
                company offering unforgettable wildlife experiences.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold tracking-wider mb-4 uppercase text-neutral-300">
                Quick Links
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-400">
                {["home", "about", "safaris", "packages", "reviews"].map(
                  (sect) => (
                    <li key={sect}>
                      <button
                        onClick={() => scrollToSection(sect)}
                        className="hover:text-amber-400 transition-colors capitalize"
                      >
                        {sect}
                      </button>
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold tracking-wider mb-4 uppercase text-neutral-300">
                Safari Parks
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-400">
                {[
                  "Minneriya Park",
                  "Kaudulla Park",
                  "Wasgamuwa Park",
                  "Hurulu Eco Park",
                ].map((park, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => scrollToSection("packages")}
                      className="hover:text-amber-400 transition-colors"
                    >
                      {park}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold tracking-wider mb-4 uppercase text-neutral-300">
                Legal
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-400">
                {["Privacy Policy", "Terms & Conditions", "FAQs"].map(
                  (item, idx) => (
                    <li key={idx}>
                      <a
                        href="#"
                        className="hover:text-amber-400 transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>

          <div className="text-center pt-6 border-t border-neutral-800 text-neutral-500 text-xs sm:text-sm">
            <p>
              &copy; {new Date().getFullYear()} Minneriyawildjeepsafari.com. All
              Rights Reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Action Buttons */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-6 right-6 w-11 h-11 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-xl z-50 transform ${showScrollTop ? "scale-100 opacity-100" : "scale-75 opacity-0 pointer-events-none"}`}
        aria-label="Scroll back up to top"
      >
        ↑
      </button>

      <a
        href="https://wa.me/94778902811"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-6 w-11 h-11 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-xl z-50 hover:scale-110 transition animate-pulse"
        aria-label="Contact us on WhatsApp"
      >
        💬
      </a>
    </div>
  );
}
