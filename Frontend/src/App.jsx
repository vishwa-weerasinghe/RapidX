import React, { useState, useEffect, useRef } from "react";
import SEO from "./components/SEO";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Users,
  Search,
  LayoutDashboard,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";
import ThemeToggle from "./components/ThemeToggle";
import { useTheme } from "./context/ThemeContext";
import api from "./axios";
import PublicReviewSection from "./pages/public/Review.jsx";
import homepageImg from "./assets/homepage.png";
import logoImg from "./assets/logo.jpg";
import awordImg from "./assets/TA-Aword.jpg";
import aboutUsImg from "./assets/aboutUs.png";
import minneriyaImg from "./assets/minneriya.jpg";
import kaudullaImg from "./assets/kaudulla.jpg";
import wasgamuwaImg from "./assets/wasgamuwa.jpg";
import huruluImg from "./assets/hurulu.jpg";
import {
  PackageCardSkeleton,
  ReviewCardSkeleton,
} from "./components/Skeletons";
import { getStaticBlogPackageSection } from "./constants/staticBlogPackages";

export default function App() {
  // --- CONSUME SYSTEM THEME ---
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const user = (() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  })();

  const isGuestUser = !user && !localStorage.getItem("token");

  const dashboardLink = (() => {
    if (!user) return "/login";
    const role =
      `${user?.role ?? user?.Role ?? user?.user_type ?? "customer"}`.toLowerCase();
    return ["admin", "administrator", "superadmin"].includes(role)
      ? "/admin/dashboard"
      : "/user/dashboard";
  })();

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
    if (pkg && (pkg.id || pkg.Package_ID)) {
      navigate(`/booking`, { state: { packageId: pkg.id || pkg.Package_ID } });
    } else {
      navigate(`/booking`);
    }
  };

  const handleAddToCart = async (pkg) => {
    if (user && user.Customer_ID) {
      navigate(`/addtocart/${pkg.id || pkg.Package_ID}`);
    } else {
      localStorage.setItem(
        "pending_cart",
        JSON.stringify({
          Package_ID: pkg.id || pkg.Package_ID,
          Payment:
            parseFloat(String(pkg.price || "0").replace(/[^0-9.]/g, "")) || 0,
        }),
      );
      alert("Please login to add this package to your cart.");
      navigate("/login");
    }
  };

  // --- STATE MANAGEMENT ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  const [isBlogMenuOpen, setIsBlogMenuOpen] = useState(false);
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  const [isMobileBlogOpen, setIsMobileBlogOpen] = useState(false);
  const [isMobileHelpOpen, setIsMobileHelpOpen] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);
  const blogMenuRef = useRef(null);
  const helpMenuRef = useRef(null);

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
    { label: "Dambulla Cultural & Safari Tour", path: "/blog#dambulla-safari", description: "Cave Temple, Economic Center & Evening Safari" },
    { label: "Village Tour", path: "/blog#hiriwadunna-village-tour", description: "Experience Authentic Sri Lankan Rural Life" },
    { label: "Polonnaruwa Ruins & Safari Tour", path: "/blog#polonnaruwa-safari", description: "Medieval Capital & Evening Safari" },
    { label: "Sigiriya / Pidurangala & Safari Tour", path: "/blog#sigiriya-pidurangala-safari", description: "Majestic Rock Hiking & Evening Safari" },
    { label: "Sigiriya Village Tour", path: "/blog#sigiriya-village-tour", description: "Experience Authentic Sri Lankan Rural Life" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (blogMenuRef.current && !blogMenuRef.current.contains(event.target)) {
        setIsBlogMenuOpen(false);
      }
      if (helpMenuRef.current && !helpMenuRef.current.contains(event.target)) {
        setIsHelpMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [activeSection, setActiveSection] = useState("home");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [notification, setNotification] = useState(null);

  // Widget States for quick booking overlay
  const [selectedPark, setSelectedPark] = useState("minneriya");
  const [bookingDate, setBookingDate] = useState("");
  const [adultsCount, setAdultsCount] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);




  const handleWidgetSubmit = (e) => {
    e.preventDefault();
    const matchedPkg =
      packages.find((p) =>
        (p.title || "").toLowerCase().includes(selectedPark.toLowerCase()),
      ) || packages[0];

    if (matchedPkg?.id) {
      localStorage.setItem(
        "prefilled_booking",
        JSON.stringify({
          Booking_Date: bookingDate,
          No_of_adults: adultsCount,
          No_of_child: childrenCount,
        }),
      );
      navigate(`/booking/${matchedPkg.id}`);
    } else {
      scrollToSection("packages");
    }
  };

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
  const heroSlides = [homepageImg];

  const safariLocations = [
    {
      id: "minneriya",
      title: "Minneriya National Park",
      desc: "Famous for the world's largest wild elephant gathering during the dry season.",
      img: minneriyaImg,
    },
    {
      id: "kaudulla",
      title: "Kaudulla National Park",
      desc: "Spectacular elephant herds and diverse wildlife in pristine natural habitat.",
      img: kaudullaImg,
    },
    {
      id: "wasgamuwa",
      title: "Wasgamuwa National Park",
      desc: "Hidden gem offering intimate wildlife encounters in untouched wilderness.",
      img: wasgamuwaImg,
    },
    {
      id: "hurulu",
      title: "Hurulu Eco Park",
      desc: "Eco-friendly park with diverse ecosystems and abundant wildlife.",
      img: huruluImg,
    },
  ];

  const [packages, setPackages] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch Packages from DB
    api
      .get("/packages")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const backendUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : "http://127.0.0.1:8000";
          const fallbackImage =
            "https://images.unsplash.com/photo-1549366021-9f761d450615?q=80&w=2012&auto=format&fit=crop";

          const maxBookings = Math.max(
            0,
            ...res.data.map((pkg) => Number(pkg.bookings_count || 0)),
          );

          const mapped = res.data.map((pkg) => {
            const oneAdult = Number(pkg.price_one_adult) || 0;
            const moreAdult = Number(pkg.price_more_adult) || 0;

            return {
              id: pkg.id,
              related_package: pkg.related_package,
              title: pkg.Package_Name,
              desc: pkg.Description,
              // "Starting from" shows the lowest available adult rate.
              price:
                oneAdult > 0 && moreAdult > 0
                  ? Math.min(oneAdult, moreAdult)
                  : oneAdult || moreAdult,
              img: pkg.Image
                ? pkg.Image.startsWith("http")
                  ? pkg.Image
                  : `${backendUrl}/storage/${pkg.Image}`
                : fallbackImage,
              popular:
                Number(pkg.bookings_count || 0) === maxBookings &&
                maxBookings > 0,
              price_one_adult: oneAdult,
              price_more_adult: moreAdult,
              price_child: Number(pkg.price_child) || 0,
              Package_Name: pkg.Package_Name,
            };
          });
          setPackages(mapped);
        }
      })
      .catch((err) => console.error("Error loading packages:", err))
      .finally(() => setPackagesLoading(false));

    // 2. Fetch Media Gallery from DB
    api
      .get("/media")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const mapped = res.data.map((item) => {
            const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : "http://127.0.0.1:8000";
            const src = item.file_path.startsWith("http")
              ? item.file_path
              : `${baseUrl}${item.file_path}`;
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

      const headerHeight =
        document.querySelector("header")?.offsetHeight || 120;

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

      let nearestSection = "home";
      let nearestDistance = Number.POSITIVE_INFINITY;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (!el) continue;

        const rect = el.getBoundingClientRect();
        const distance = Math.abs(rect.top - headerHeight);

        if (rect.bottom > headerHeight && rect.top <= headerHeight + 160) {
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestSection = sectionId;
          }
        }
      }

      setActiveSection((prev) => (prev !== nearestSection ? nearestSection : prev));
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
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

  // --- ACTION SUBMISSIONS ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.post("/contact", formData);
      setNotification({
        text:
          response.data.message ||
          "Thank you! Your safari booking request inquiry has been sent successfully.",
        type: "success",
      });
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      console.error(err);
      const errMsg =
        err.response?.data?.message ||
        "Failed to send message. Please try again later.";
      setNotification({
        text: errMsg,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const scrollToSection = (id) => {
    setActiveSection(id);
    setIsMobileMenuOpen(false);
    setIsMobileBlogOpen(false);
    setIsMobileHelpOpen(false);
    setIsHelpMenuOpen(false);
    setIsBlogMenuOpen(false);

    const target = document.getElementById(id);
    if (target) {
      // Calculate accurate position regardless of parent positioning
      const elementPosition =
        target.getBoundingClientRect().top + window.scrollY;

      // Use a consistent offset height since the sticky header shrinks upon scrolling
      // Assuming the sticky header is roughly 80-90px tall when scrolled
      const headerOffset = 90;

      window.scrollTo({
        top: elementPosition - headerOffset,
        behavior: "smooth",
      });
    }
  };

  const [reviews, setReviews] = useState([]);
  const [tripadvisorReviews, setTripadvisorReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [tripadvisorLoading, setTripadvisorLoading] = useState(true);
  const [showAllTripadvisorReviews, setShowAllTripadvisorReviews] =
    useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const tripadvisorUrl =
    "https://www.tripadvisor.com/Attraction_Review-g304133-d15640558-Reviews-Minneriya_Wild_Jeep_Safari-Dambulla_Central_Province.html";

  const isTripAdvisorReview = (review) => {
    const searchable = [
      review?.source,
      review?.Source,
      review?.name,
      review?.title,
      review?.Title,
      review?.text,
      review?.Description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchable.includes("tripadvisor");
  };

  const getStoredGuestReviews = () => {
    try {
      const storedReviews = localStorage.getItem("guestReviews");
      if (!storedReviews) return [];
      const parsedReviews = JSON.parse(storedReviews);
      return Array.isArray(parsedReviews) ? parsedReviews : [];
    } catch (err) {
      console.error("Error loading guest reviews:", err);
      return [];
    }
  };

  const fetchReviews = () => {
    const storedGuestReviews = getStoredGuestReviews();

    // Fetch TripAdvisor location reviews from API endpoint (Minneriya Location ID: 15640558)
    const tripadvisorLocationId = "15640558";
    api
      .get(`/locations/${tripadvisorLocationId}/reviews`)
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setTripadvisorReviews(res.data);
        }
      })
      .catch((err) => console.error("Error loading TripAdvisor reviews:", err))
      .finally(() => setTripadvisorLoading(false));

    api
      .get("/reviews")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const fetchedTaReviews = [];
          const fetchedSystemReviews = [];

          res.data.forEach((rev) => {
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

            const formatted = {
              initials,
              name,
              date: "Recently",
              title,
              text: rev.Description,
              rate: rev.Rate || 5,
              source: rev.Source || rev.source || "Verified",
            };

            if (isTripAdvisorReview(rev) || isTripAdvisorReview(formatted)) {
              fetchedTaReviews.push({
                ...formatted,
                initials: "TA",
                source: "TripAdvisor",
              });
            } else {
              fetchedSystemReviews.push(formatted);
            }
          });

          if (fetchedTaReviews.length > 0) {
            setTripadvisorReviews((prev) => {
              const existingTexts = new Set(prev.map((r) => r.text));
              const newItems = fetchedTaReviews.filter(
                (r) => !existingTexts.has(r.text),
              );
              return newItems.length > 0 ? [...newItems, ...prev] : prev;
            });
          }

          setReviews(
            [...storedGuestReviews, ...fetchedSystemReviews].filter(
              (review) => !isTripAdvisorReview(review),
            ),
          );
        } else if (storedGuestReviews.length > 0) {
          setReviews(
            [...storedGuestReviews].filter(
              (review) => !isTripAdvisorReview(review),
            ),
          );
        } else {
          setReviews([]);
        }
      })
      .catch((err) => console.error("Error loading reviews:", err))
      .finally(() => setReviewsLoading(false));
  };

  useEffect(() => {
    fetchReviews();

    const interval = setInterval(fetchReviews, 3000);
    window.addEventListener("focus", fetchReviews);
    window.addEventListener("storage", fetchReviews);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", fetchReviews);
      window.removeEventListener("storage", fetchReviews);
    };
  }, []);

  const tripadvisorVisibleReviews = showAllTripadvisorReviews
    ? tripadvisorReviews
    : tripadvisorReviews.slice(0, 6);
  const systemReviews = reviews
    .filter((review) => !isTripAdvisorReview(review))
    .sort((a, b) => (b.rate || 0) - (a.rate || 0));
  const systemVisibleReviews = showAllReviews
    ? systemReviews
    : systemReviews.slice(0, 6);

  const renderReviewCard = (rev, index) => (
    <div
      key={`${rev.source || "review"}-${index}`}
      className={`review-card p-6 rounded-2xl shadow-md border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${theme === "dark"
        ? "bg-neutral-900 border-neutral-800"
        : "bg-white border-neutral-100"
        }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-sacramento to-castleton text-white font-bold text-xs rounded-full flex items-center justify-center">
            {rev.initials}
          </div>
          <div>
            <h4 className="text-sm font-bold leading-tight">{rev.name}</h4>
            <span className="text-amber-400 text-xs">
              {"★".repeat(rev.rate || 5)}
              {"☆".repeat(5 - (rev.rate || 5))}
            </span>
          </div>
        </div>
        <span className="text-neutral-400 text-xs">{rev.date}</span>
      </div>
      <h3 className="text-base font-bold mb-2 line-clamp-1">"{rev.title}"</h3>
      <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-5">
        {rev.text}
      </p>
      <span
        className={`font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider ${rev.isGuest
          ? "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-400"
          : rev.source === "TripAdvisor"
            ? "bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300"
            : "bg-castleton-50 dark:bg-castleton-900/80 text-castleton dark:text-castleton-300"
          }`}
      >
        {rev.source || (rev.isGuest ? "Guest" : "Verified")}
      </span>
    </div>
  );

  return (
    <>
      <SEO
        title="Online Safari Booking Sri Lanka | Minneriya, Kaudulla & Wasgamuwa Jeep Safari Tours"
        description="Book trusted Sri Lanka jeep safaris online. Experience the famous Minneriya Elephant Gathering, Kaudulla & Wasgamuwa with experienced local drivers. Instant booking & best rates."
        canonical="https://www.minneriyawildjeepsafari.com"
      />
      <div
        className={`font-sans antialiased overflow-x-hidden selection:bg-[var(--primary)] selection:text-white transition-colors duration-200 ${theme === "dark"
          ? "bg-[#101813] text-[#F5F5F5]"
          : "bg-[#F8F6F0] text-[#263238]"
          }`}
      >
        {/* Toast Notification Alert Box */}
        {notification && (
          <div
            className={`fixed top-24 right-5 p-5 rounded-xl shadow-2xl z-[9999] border-l-4 ${notification.type === "error" ? "border-red-500" : "border-sacramento"} max-w-sm animate-fade-in-left ${theme === "dark"
              ? "bg-neutral-900 text-white"
              : "bg-white text-neutral-800"
              }`}
          >
            <p className="text-sm font-medium">{notification.text}</p>
          </div>
        )}

        {/* Backdrop overlay for mobile menu */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Synchronized Header & Navbar */}
        <header
          className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled ? "px-3 pt-3 md:px-8" : "px-0 pt-0"
            }`}
        >
          {/* Subtle dark gradient overlay for nav readability */}
          {!isScrolled && (
            <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-black/70 to-transparent pointer-events-none -z-10"></div>
          )}
          <div
            className={`max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between transition-all duration-500 relative ${isScrolled
              ? "bg-[var(--page-bg)]/90 dark:bg-[var(--surface)]/90 backdrop-blur-xl rounded-full shadow-lg border border-[var(--border)]/40 py-2.5"
              : "bg-[#0c2f1f]/90 backdrop-blur-lg py-5 border border-[#d6bb70]/60 shadow-[0_8px_22px_rgba(0,0,0,0.2)] rounded-full"
              }`}
          >
            {/* Logo & Brand Name */}
            <div
              className="cursor-pointer flex items-center gap-2 sm:gap-3 group"
              onClick={() => scrollToSection("home")}
            >
              <div className="relative flex items-center justify-center transition-all duration-500 group-hover:scale-105 rounded-full">
                <img
                  src={logoImg}
                  alt="Minneriya Wild Jeep Safari"
                  className="h-11 w-11 sm:h-12 sm:w-12 md:h-14 md:w-14 object-cover rounded-full border border-white/15 shadow-sm"
                />
              </div>
              <span
                className={`text-base sm:text-lg md:text-xl font-bold tracking-tight transition-all duration-500 ${isScrolled
                  ? "text-[#153827] dark:text-[#f5f0e8]"
                  : "text-[#f8f4ee] drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                  }`}
              >
                Wild Jeep Safari
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-2">
              <ul className="flex items-center gap-1 lg:gap-2">
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
                      className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeSection === section
                        ? "bg-[#2E7D32] text-white shadow shadow-green-700/25"
                        : isScrolled
                          ? "text-[#153827] dark:text-[#f5f0e8] hover:text-[#0b2419] dark:hover:text-white hover:bg-[#2e7d32]/15 dark:hover:bg-white/10"
                          : "text-[#f8f4ee] hover:text-white hover:bg-white/10"
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
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${isHelpMenuOpen
                      ? "bg-[#2E7D32] text-white shadow shadow-green-700/25"
                      : isScrolled
                        ? "text-[#153827] dark:text-[#f5f0e8] hover:text-[#0b2419] dark:hover:text-white hover:bg-[#2e7d32]/15 dark:hover:bg-white/10"
                        : "text-[#f8f4ee] hover:text-white hover:bg-white/10"
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
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${isBlogMenuOpen
                      ? "bg-[#2E7D32] text-white shadow shadow-green-700/25"
                      : isScrolled
                        ? "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                        : "text-[#f8f4ee] hover:text-white hover:bg-white/10"
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

            {/* Auth & Theme Actions Panel */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-1.5">
                {user ? (
                  <Link
                    to={dashboardLink}
                    className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-2 border rounded-full transition-all duration-300 ${isScrolled
                      ? "text-[#153827] border-[#153827]/20 bg-white/85 hover:bg-[#f3f7f4] dark:text-slate-200 dark:border-slate-700 dark:bg-slate-900/70 dark:hover:bg-slate-800"
                      : "text-[#153827] border-[#153827]/30 bg-white/85 hover:bg-[#f3f7f4]"
                      }`}
                  >
                    <LayoutDashboard size={13} />
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className={`inline-flex items-center justify-center text-[11px] font-bold px-3 py-2 border rounded-full transition-all duration-300 ${isScrolled
                        ? "text-[#153827] border-[#153827]/20 bg-white/80 hover:bg-[#f0f7f2] dark:text-slate-200 dark:border-slate-700 dark:bg-slate-900/70 dark:hover:bg-slate-800"
                        : "text-[#f8f4ee] border-[#f8f4ee]/40 bg-[#1f4d3b]/60 hover:bg-[#1f4d3b]/80"
                        }`}
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      className={`inline-flex items-center justify-center text-[11px] font-bold px-3 py-2 rounded-full shadow transition-all duration-300 ${isScrolled
                        ? "bg-[#2E7D32] text-white hover:bg-[#236a2a]"
                        : "bg-[#2E7D32] text-white hover:bg-[#236a2a]"
                        }`}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>

              <div className="h-6 w-[1px] bg-slate-200/60 dark:bg-slate-800 hidden sm:block" />

              <ThemeToggle />

              {/* Simple Modern Mobile Menu Toggle Button */}
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

            {/* Simple Modern Mobile Navigation Dropdown Menu */}
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
                      onClick={() => scrollToSection(section)}
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
                    <div className="rounded-2xl border border-[#dfe8dc] bg-[#fffdf9] p-2.5 shadow-lg backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900 flex flex-col gap-1">
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

                  {/* Blog Button in mobile nav grid just like desktop nav bar */}
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

                {/* Blog Dropdown Menu (only appears when Blog is toggled, matching desktop) */}
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

                {/* Mobile Auth Actions */}
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

        {/* --- HERO SECTION --- */}
        <section
          id="home"
          className="relative min-h-[100svh] sm:h-screen sm:min-h-[650px] flex items-center overflow-hidden pt-28 sm:pt-32 md:pt-36"
        >
          {/* Background Slides */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            {heroSlides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
              >
                <img
                  src={slide}
                  alt="Elephant Gathering Scene"
                  className="w-full h-full object-cover object-[65%_center] sm:object-[center_80%] lg:object-right transition-all duration-500 dark:brightness-[0.88]"
                />
              </div>
            ))}
          </div>

          {/* Balanced Overlay for Optimal Text Readability & Image Visibility */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/60 via-black/35 to-transparent dark:from-black/75 dark:via-black/50 dark:to-black/20 pointer-events-none transition-colors duration-500" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent dark:from-black/50 dark:to-transparent pointer-events-none z-[1]" />

          {/* Content */}
          <div className="max-w-7xl mx-auto px-4 md:px-6 w-full relative z-20">
            <div className="max-w-2xl text-white ml-0 md:ml-8 lg:ml-12 mt-12 md:mt-0">
                <span className="inline-block text-amber-400 font-semibold uppercase tracking-widest text-sm sm:text-base mb-3 drop-shadow-md dark:text-amber-200 dark:drop-shadow-[0_2px_8px_rgba(245,193,66,0.7)]">
                Explore Sri Lanka's Wildlife
                </span>

              {/* Title */}
              <h1 className="font-serif text-[2.5rem] leading-[1.1] sm:text-5xl md:text-6xl font-bold mb-6 text-white drop-shadow-2xl">
                Witness Sri Lanka's Legendary{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-emerald-300 to-teal-200 dark:from-amber-300 dark:via-emerald-400 dark:to-teal-300">
                  Wild Elephant Gathering
                </span>
              </h1>

              {/* Description */}
              <p className="text-neutral-100 dark:text-neutral-300 font-medium tracking-wide text-sm sm:text-base mb-8 drop-shadow-md max-w-xl leading-relaxed">
                Experience unforgettable close-up encounters with majestic
                elephants in Minneriya and Kaudulla National Parks.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10">
                <button
                  onClick={() => handleBookNow()}
                  className="bg-[#2E7D32] hover:bg-[#1B5E20] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-center px-8 py-3.5 rounded-full shadow-lg shadow-emerald-950/40 hover:shadow-xl hover:shadow-emerald-900/60 transition-all duration-300 transform hover:-translate-y-[2px] active:translate-y-0"
                >
                  Book Now
                </button>
                <button
                  onClick={() => scrollToSection("packages")}
                  className="bg-white/10 dark:bg-neutral-900/60 backdrop-blur-md border border-white/40 dark:border-neutral-700/80 text-white font-semibold text-center px-8 sm:px-10 py-3.5 rounded-full shadow-sm hover:bg-white/20 dark:hover:bg-neutral-800/80 hover:border-white dark:hover:border-neutral-500 transition-all duration-300 transform hover:-translate-y-[2px]"
                >
                  Explore Safari Packages
                </button>
              </div>

              {/* Glassmorphic Stats Grid */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-6 border-t border-white/20 dark:border-white/10 max-w-lg">
                <div className="rounded-2xl p-3 bg-black/25 dark:bg-neutral-900/60 backdrop-blur-md border border-white/10 dark:border-white/5 transition-all">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white dark:text-emerald-400 block tracking-tight">
                    2,500 +
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-300 dark:text-neutral-400 mt-1 block">
                    Happy Travelers
                  </span>
                </div>
                <div className="rounded-2xl p-3 bg-black/25 dark:bg-neutral-900/60 backdrop-blur-md border border-white/10 dark:border-white/5 transition-all">
                  <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 dark:text-amber-400 block tracking-tight">
                    5.0 / 5.0
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-300 dark:text-neutral-400 mt-1 block">
                    TripAdvisor
                  </span>
                </div>
                <div className="rounded-2xl p-3 bg-black/25 dark:bg-neutral-900/60 backdrop-blur-md border border-white/10 dark:border-white/5 transition-all">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white dark:text-teal-300 block tracking-tight">
                    24 / 7
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-300 dark:text-neutral-400 mt-1 block">
                    Support
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- ABOUT SECTION --- */}
        <section id="about" className="py-20 md:py-32 overflow-hidden bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              {/* Image Side with Modern Overlap effect */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gray-50 rounded-[2rem] transform -rotate-3 z-0"></div>
                <div className="relative z-10 rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                  <img
                    src={aboutUsImg}
                    alt="Elephant Gathering"
                    className="w-full h-[400px] lg:h-[550px] object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute bottom-6 left-6 bg-[#fffaf0]/95 dark:bg-[#fffaf0]/95 backdrop-blur-sm px-6 py-4 rounded-xl shadow-[0_12px_30px_rgba(8,20,15,0.22)] border border-[#d4a017]/35 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#0b2419] text-[#d4a017] rounded-full flex items-center justify-center font-bold text-xl">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <span className="block !text-[#153827] font-bold text-lg leading-none">
                        Since 2020
                      </span>
                      <span className="!text-[#2e7d32] text-sm font-semibold">
                        Trusted Safari
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Side */}
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 text-castleton text-xs font-bold uppercase tracking-widest mb-6 border border-gray-100">
                  <span className="w-2 h-2 rounded-full bg-castleton"></span>
                  About Us
                </div>

                <h2 className="font-outfit text-4xl sm:text-5xl font-bold mb-6 text-gray-900 leading-[1.15]">
                  Witness the World's Largest <br />
                  <span className="text-castleton">Elephant Gathering</span>
                </h2>

                <p className="text-gray-500 text-lg leading-relaxed mb-10">
                  Experience the world-famous gathering at Minneriya and Kaudulla
                  National Parks. Join our expert-guided jeep safaris for
                  unforgettable, close-up encounters with hundreds of majestic
                  elephants in their natural habitat.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
                  <div className="flex flex-col gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 text-castleton flex items-center justify-center border border-gray-100 shadow-sm">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg">
                      Trusted Guides
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Local experts with deep knowledge of wildlife and safe
                      terrains.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 text-castleton flex items-center justify-center border border-gray-100 shadow-sm">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg">
                      Personalized Tours
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Tailored experiences, private jeeps, and flexible safari
                      schedules.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => scrollToSection("contact")}
                  className="inline-flex items-center gap-2 bg-castleton text-white font-bold px-8 py-4 rounded-xl hover:bg-opacity-90 shadow-lg shadow-castleton/30 transition-all duration-300 hover:-translate-y-1"
                >
                  Contact Us
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* --- WHY CHOOSE US SECTION --- */}
        <section className="py-20 md:py-28 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center max-w-xl mx-auto mb-16">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 text-castleton text-xs font-bold uppercase tracking-widest mb-6 border border-gray-100">
                <span className="w-2 h-2 rounded-full bg-castleton"></span>
                Why Choose Us
              </span>
              <h2 className="font-outfit text-3xl sm:text-5xl font-bold text-gray-900">
                What Makes Us Special
              </h2>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8">
              {[
                {
                  title: "Local Experts",
                  desc: "Deeply rooted in Habarana & Minneriya with intimate knowledge of the best safari routes.",
                  icon: (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Flexible Tours",
                  desc: "Customized safari experiences with the flexibility to adapt to your schedule.",
                  icon: (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Safe & Secure",
                  desc: "Transparent pricing and easy, safe payments with absolutely no hidden fees.",
                  icon: (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Expert Drivers",
                  desc: "Fully certified and highly experienced safari drivers dedicated to your safety.",
                  icon: (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                  ),
                },
              ].map((reason, idx) => (
                <div
                  key={idx}
                  className="p-12 rounded-3xl text-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-gray-50 border border-gray-100 group"
                >
                  <div className="w-20 h-20 bg-white text-castleton border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    {reason.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">
                    {reason.title}
                  </h3>
                  <p className="text-gray-500 text-base leading-relaxed">
                    {reason.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- SAFARI LOCATIONS --- */}
        <section id="safaris" className="py-20 md:py-28 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center max-w-xl mx-auto mb-16">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-castleton text-xs font-bold uppercase tracking-widest mb-6 border border-gray-200 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-castleton"></span>
                Explore Safari Locations
              </span>
              <h2 className="font-outfit text-3xl sm:text-5xl font-bold text-gray-900">
                Beautiful Places Around Sri Lanka
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {safariLocations.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => navigate(`/blog#${loc.id}`)}
                  className="rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-neutral-800 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group bg-white dark:bg-neutral-900 flex flex-col cursor-pointer"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={loc.img}
                      alt={loc.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Subtle translucent background overlay so the photo appears clearly while providing contrast */}
                    <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors duration-300 flex items-center justify-center">
                      {/* Centered Liquid Glass Learn More Button (No Arrow) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/blog#${loc.id}`);
                        }}
                        className="relative px-6 py-2.5 rounded-full text-sm font-bold text-white bg-white/20 hover:bg-white/30 active:scale-95 backdrop-blur-sm border border-white/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_0_rgba(46,125,50,0.4)] hover:border-white/60 hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden tracking-wide"
                      >
                        {/* Specular glass reflection layer */}
                        <span className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/10 to-transparent opacity-75 pointer-events-none rounded-full" />
                        <span className="relative drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
                          Learn More
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold mb-2 text-gray-900">
                      {loc.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-1">
                      {loc.desc}
                    </p>
                    <div className="flex gap-4 text-gray-400 text-xs font-semibold border-t pt-4 border-gray-100 uppercase tracking-wide">
                      <span className="flex items-center gap-1.5">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                        Anytime
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                        6 Pax
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
          className="py-20 bg-white border-t border-gray-100"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            {/* Section Header */}
            <div className="text-center max-w-xl mx-auto mb-14">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 text-castleton text-xs font-bold uppercase tracking-widest border border-gray-100">
                <span className="w-2 h-2 rounded-full bg-castleton"></span>
                Tour Packages
              </span>

              <h2 className="mt-5 font-outfit text-3xl sm:text-5xl font-bold text-gray-900">
                Choose Your Adventure
              </h2>

              <p className="mt-4 text-gray-500">
                Discover unforgettable safari experiences with expert guides,
                comfortable jeeps, and affordable prices.
              </p>
            </div>

            {/* Cards Grid: 2 per row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto">
              {packagesLoading && packages.length === 0 ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <PackageCardSkeleton key={`pkg-skeleton-${idx}`} />
                ))
              ) : packages.length > 0 ? (
                packages.map((pkg, idx) => {
                  const relatedSection = getStaticBlogPackageSection(
                    pkg.related_package
                  );

                  return (
                    <div
                      key={idx}
                      className="w-full bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden border border-gray-200 dark:border-neutral-800 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col"
                    >
                      {/* Image */}
                      <div className="relative h-64 sm:h-72 overflow-hidden bg-gray-50 dark:bg-neutral-800">
                        <img
                          src={pkg.img}
                          alt={pkg.title}
                          loading="lazy"
                          className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                        />

                        {pkg.popular && (
                          <span className="absolute top-4 right-4 bg-pink-600 text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full border border-pink-500 shadow-md hover:scale-105 transition-all duration-300">
                            Popular
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 sm:p-7 flex flex-col flex-grow">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {pkg.title}
                        </h3>

                        <div className="mb-4 max-h-32 overflow-auto">
                          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-line break-words">
                            {pkg.desc}
                          </p>
                        </div>

                        {/* Features */}
                        <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                          <li className="flex items-center gap-2">
                            <span className="text-green-600 shrink-0">✓</span>
                            <span>Professional Driver</span>
                          </li>

                          <li className="flex items-center gap-2">
                            <span className="text-green-600 shrink-0">✓</span>
                            <span>Comfortable Jeep</span>
                          </li>

                          <li className="flex items-center gap-2">
                            <span className="text-green-600 shrink-0">✓</span>
                            <span>Reasonable Prices</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-green-600 shrink-0">✓</span>
                            <span>Entrance Ticket</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-green-600 shrink-0">✓</span>
                            <span>Water Bottle</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-green-600 shrink-0">✓</span>
                            <span>Binoculars</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-green-600 shrink-0">✓</span>
                            <span>Pick-Up & Drop-Off</span>
                          </li>
                        </ul>

                        {/* Price */}
                        <div className="flex items-center justify-between border-t border-gray-100 dark:border-neutral-800 pt-4 mb-4">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Starting From</span>

                          <div className="text-right">
                            <div className="text-2xl font-bold text-castleton dark:text-emerald-400">$ {pkg.price.toLocaleString()}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">per adult</div>
                          </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 mt-auto">
                          <button
                            onClick={() => handleBookNow(pkg)}
                            className="flex-1 bg-[#2E7D32] text-white font-bold text-center py-3 rounded-xl shadow-md hover:bg-[#1B5E20] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-[2px] cursor-pointer"
                          >
                            Book Now
                          </button>

                          <button
                            onClick={() => handleAddToCart(pkg)}
                            className="flex-1 border-2 border-sacramento text-sacramento dark:text-emerald-400 dark:border-emerald-500/40 py-3 rounded-xl font-semibold hover:bg-sacramento/10 transition-colors cursor-pointer"
                          >
                            Add to Cart
                          </button>
                        </div>

                        {relatedSection && (
                          <Link
                            to={`/blog#${relatedSection}`}
                            className="mt-3 inline-flex items-center justify-center gap-1 text-sacramento dark:text-emerald-400 font-bold hover:underline transition-colors"
                          >
                            Read More
                            <span className="text-xs">→</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-gray-500">
                  No packages available at the moment.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* --- REVIEW SECTION --- */}
        <section
          id="reviews"
          className="py-20 md:py-28 overflow-hidden bg-gray-50 border-t border-gray-100"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center max-w-xl mx-auto mb-16">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-castleton text-xs font-bold uppercase tracking-widest mb-6 border border-gray-200 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-castleton"></span>
                Reviews
              </span>
              <h2 className="font-outfit text-3xl sm:text-5xl font-bold text-gray-900 mb-4">
                Their Journey. Their Words.
              </h2>
              <p className="text-sm sm:text-base text-gray-500 mb-6">
                Explore genuine guest experiences and trusted TripAdvisor reviews
                from travelers who chose us.
              </p>
              <img
                src={awordImg}
                alt="TripAdvisor"
                className="h-24 sm:h-32 mx-auto object-contain"
              />
            </div>

            <div className="mb-14 rounded-3xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
                <div>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 text-castleton text-xs font-bold uppercase tracking-widest mb-4 border border-gray-100">
                    TripAdvisor Reviews
                  </span>
                  <h3 className="font-outfit text-2xl sm:text-3xl font-bold text-gray-900">
                    What our Trip Advisor guests say
                  </h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={tripadvisorUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-sacramento text-white font-semibold px-6 py-3 rounded-full hover:bg-opacity-90 shadow transition duration-300 text-sm"
                  >
                    Explore in TripAdvisor
                  </a>
                  {tripadvisorReviews.length > 6 && (
                    <button
                      type="button"
                      onClick={() =>
                        setShowAllTripadvisorReviews((prev) => !prev)
                      }
                      className="border border-gray-200 bg-white text-gray-700 font-semibold px-6 py-3 rounded-full hover:bg-gray-50 transition duration-300 text-sm"
                    >
                      {showAllTripadvisorReviews ? "Show Less" : "Show More"}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                {tripadvisorLoading && tripadvisorVisibleReviews.length === 0 ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <ReviewCardSkeleton key={`ta-skeleton-${index}`} />
                  ))
                ) : tripadvisorVisibleReviews.length > 0 ? (
                  tripadvisorVisibleReviews.map((rev, index) =>
                    renderReviewCard(rev, index),
                  )
                ) : (
                  <div className="col-span-full py-8 text-center text-gray-500 text-sm">
                    Loading online TripAdvisor reviews... You can also{" "}
                    <a
                      href={tripadvisorUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sacramento font-bold underline"
                    >
                      explore all verified reviews directly on TripAdvisor
                    </a>
                    .
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
                <div>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 text-castleton text-xs font-bold uppercase tracking-widest mb-4 border border-gray-100">
                    Our Guests
                  </span>
                  <h3 className="font-outfit text-2xl sm:text-3xl font-bold text-gray-900">
                    What our guests say
                  </h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {systemReviews.length > 6 && (
                    <button
                      type="button"
                      onClick={() => setShowAllReviews((prev) => !prev)}
                      className="border border-gray-200 bg-white text-gray-700 font-semibold px-6 py-3 rounded-full hover:bg-gray-50 transition duration-300 text-sm"
                    >
                      {showAllReviews ? "Show Less" : "More Reviews"}
                    </button>
                  )}
                </div>
              </div>

              <PublicReviewSection
                reviews={systemVisibleReviews}
                renderReviewCard={renderReviewCard}
                loading={reviewsLoading}
              />
            </div>
          </div>
        </section>

        {/* --- PHOTO GALLERY --- */}
        <section
          id="gallery"
          className="py-20 md:py-28 bg-white border-t border-gray-100"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center max-w-xl mx-auto mb-16">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 text-castleton text-xs font-bold uppercase tracking-widest mb-6 border border-gray-100">
                <span className="w-2 h-2 rounded-full bg-castleton"></span>
                Photo Gallery
              </span>
              <h2 className="font-outfit text-3xl sm:text-5xl font-bold text-gray-900">
                Captured Moments
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryImages.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setLightboxImage(img)}
                  className="relative h-64 sm:h-72 rounded-3xl overflow-hidden cursor-pointer group shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 text-castleton">
                    <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                        />
                      </svg>
                    </div>
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
        <section className="py-16 md:py-20 bg-gradient-to-br from-sacramento to-castleton text-white text-center">
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            <h2 className="font-serif text-2xl sm:text-4xl font-bold mb-4">
              Ready To Minneriya Elephant Gathering Safari
            </h2>
            <p className="text-neutral-200 text-base sm:text-lg mb-8 max-w-md mx-auto">
              Your Dream Safari Experience Awaits
            </p>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold mb-4">
              Contact Us:
            </h2>
            <a
              href="mailto:info@minneriyawildjeepsafari.com"
              className="bg-[#2E7D32] text-white font-bold text-center px-8 py-3.5 rounded-full shadow-md hover:bg-[#1B5E20] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-[2px]"
            >
              info@minneriyawildjeepsafari.com
            </a>
          </div>
        </section>

        {/* --- CONTACT SECTION --- */}
        <section id="contact" className="relative py-20 md:py-32 overflow-hidden">
          {/* Decorative background blur */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-castleton/10 blur-[100px]"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-teal-500/10 blur-[120px]"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left Column - Contact Info */}
              <div className="space-y-8">
                <div>
                  <span className="inline-block py-1.5 px-4 rounded-full bg-castleton-50 dark:bg-castleton-900/30 text-castleton dark:text-castleton-300 text-xs font-bold uppercase tracking-widest mb-4">
                    Get In Touch
                  </span>
                  <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-neutral-900 dark:text-white leading-tight">
                    Let's Plan Your <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-castleton to-teal-500">
                      Wild Adventure
                    </span>
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400 text-lg max-w-md">
                    Ready to experience the adventure of a lifetime? Our team is
                    here to help you craft the perfect safari itinerary.
                  </p>
                </div>

                <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
                  {/* Contact Card 1 */}
                  <div className="flex items-start gap-5 p-4 rounded-2xl hover:bg-white dark:hover:bg-neutral-800/50 transition duration-300 shadow-sm border border-transparent hover:border-neutral-100 dark:hover:border-neutral-800">
                    <div className="w-12 h-12 rounded-full bg-castleton-50 dark:bg-castleton-900/40 flex items-center justify-center text-castleton dark:text-castleton-300 shrink-0">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        ></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-1">
                        Phone
                      </h4>
                      <a
                        href="tel:+94778902811"
                        className="hover:text-castleton transition block"
                      >
                        (+94) 77 890 2811
                      </a>
                    </div>
                  </div>

                  {/* Contact Card 2 */}
                  <div className="flex items-start gap-5 p-4 rounded-2xl hover:bg-white dark:hover:bg-neutral-800/50 transition duration-300 shadow-sm border border-transparent hover:border-neutral-100 dark:hover:border-neutral-800">
                    <div className="w-12 h-12 rounded-full bg-castleton-50 dark:bg-castleton-900/40 flex items-center justify-center text-castleton dark:text-castleton-300 shrink-0">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        ></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-1">
                        Email
                      </h4>
                      <a
                        href="mailto:info@minneriyawildjeepsafari.com"
                        className="hover:text-castleton transition block"
                      >
                        info@minneriyawildjeepsafari.com
                      </a>
                    </div>
                  </div>

                  {/* Contact Card 3 */}
                  <div className="flex items-start gap-5 p-4 rounded-2xl hover:bg-white dark:hover:bg-neutral-800/50 transition duration-300 shadow-sm border border-transparent hover:border-neutral-100 dark:hover:border-neutral-800">
                    <div className="w-12 h-12 rounded-full bg-castleton-50 dark:bg-castleton-900/40 flex items-center justify-center text-castleton dark:text-castleton-300 shrink-0">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        ></path>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-1">
                        Location
                      </h4>
                      <span className="block">
                        423, Kiralagolla, Dambulu Oya, Dambulla
                      </span>
                    </div>
                  </div>
                </div>

                {/* Social Network Actions */}
                <div className="pt-6">
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">
                    Follow Our Journey
                  </h4>
                  <div className="flex gap-4">
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
                        className="w-12 h-12 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-white hover:bg-sacramento dark:hover:bg-sacramento hover:border-sacramento rounded-full flex items-center justify-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-sacramento/30"
                        aria-label={soc.label}
                      >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d={soc.icon} />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Glassmorphism Form */}
              <div className="relative z-10">
                {/* Form Card */}
                <div className="p-8 sm:p-10 rounded-3xl border border-gray-200 bg-white shadow-xl">
                  <h3 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white">
                    Send a Message
                  </h3>
                  <form onSubmit={handleFormSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide ml-1">
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleFormChange}
                          placeholder="John Doe"
                          required
                          className="w-full px-5 py-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-castleton/50 transition-all bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide ml-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleFormChange}
                          placeholder="john@example.com"
                          required
                          className="w-full px-5 py-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-castleton/50 transition-all bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide ml-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleFormChange}
                          placeholder="+94 77 123 4567"
                          className="w-full px-5 py-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-castleton/50 transition-all bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide ml-1">
                          Safari Type
                        </label>
                        <div className="relative">
                          <select
                            name="subject"
                            value={formData.subject}
                            onChange={handleFormChange}
                            required
                            className="w-full px-5 py-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-castleton/50 transition-all appearance-none cursor-pointer bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white"
                          >
                            <option
                              value=""
                              disabled
                              className="text-neutral-400"
                            >
                              Select Destination...
                            </option>
                            <option value="minneriya">Minneriya Safari</option>
                            <option value="kaudulla">Kaudulla Safari</option>
                            <option value="wasgamuwa">Wasgamuwa Safari</option>
                            <option value="hurulu">Hurulu Eco Park</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-castleton">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7"
                              ></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide ml-1">
                        Message
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleFormChange}
                        rows="4"
                        placeholder="Tell us about your dream safari..."
                        required
                        className="w-full px-5 py-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-castleton/50 transition-all resize-y bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-sacramento to-castleton text-white font-bold text-sm py-4 rounded-xl hover:from-sacramento-600 hover:to-castleton-600 transition-all duration-300 shadow-[0_8px_20px_rgba(4,57,39,0.3)] hover:shadow-[0_10px_25px_rgba(4,57,39,0.4)] hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <svg
                            className="w-4 h-4 ml-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            ></path>
                          </svg>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="bg-gray-50 pt-16 pb-8 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div
                    className="cursor-pointer flex items-center gap-2 sm:gap-3"
                    onClick={() => scrollToSection("home")}
                  >
                    <div className="relative flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_8px_30px_-4px_rgba(46,125,50,0.3)] rounded-full">
                      <img
                        src={logoImg}
                        alt="Minneriya Wild Jeep Safari"
                        className="h-14 sm:h-16 md:h-20 w-auto object-contain rounded-full"
                      />
                    </div>
                  </div>
                  <span className="font-outfit font-bold text-xl text-gray-900 tracking-wide">
                    Wild Jeep Safari
                  </span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">
                  We offer unforgettable wildlife experiences in Sri Lanka with
                  expert-guided jeep safaris and memorable adventures.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold tracking-wider mb-6 uppercase text-gray-900">
                  Quick Links
                </h4>
                <ul className="space-y-3 text-sm text-gray-500 font-medium">
                  {["home", "about", "safaris", "packages", "reviews"].map(
                    (sect) => (
                      <li key={sect}>
                        <button
                          onClick={() => scrollToSection(sect)}
                          className="hover:text-castleton hover:translate-x-1 transition-all duration-300 capitalize flex items-center gap-2"
                        >
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          {sect}
                        </button>
                      </li>
                    ),
                  )}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-bold tracking-wider mb-6 uppercase text-gray-900">
                  Safari Parks
                </h4>
                <ul className="space-y-3 text-sm text-gray-500 font-medium">
                  {[
                    "Minneriya Park",
                    "Kaudulla Park",
                    "Wasgamuwa Park",
                    "Hurulu Eco Park",
                  ].map((park, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => scrollToSection("packages")}
                        className="hover:text-castleton hover:translate-x-1 transition-all duration-300 flex items-center gap-2"
                      >
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        {park}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-bold tracking-wider mb-6 uppercase text-gray-900">
                  Help
                </h4>
                <ul className="space-y-3 text-sm text-gray-500 font-medium">
                  {[
                    { label: "Frequently", path: "/help/frequently" },
                    { label: "Privacy Policy", path: "/privacy-policy" },
                    { label: "Terms and Conditions", path: "/terms-and-conditions" },
                    { label: "Return & Refund Policy", path: "/return-refund-policy" },
                  ].map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className="group flex items-center gap-2 rounded-lg px-2 transition-all duration-300 hover:bg-[#e8f3eb] hover:text-[#1b5d3d]"
                      >
                        <span className="w-1 h-1 rounded-full bg-gray-300 transition-transform duration-300 group-hover:scale-125"></span>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </footer>

        {/* Floating Action Buttons */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={`fixed bottom-6 right-6 w-11 h-11 bg-sacramento hover:bg-sacramento-600 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-xl z-50 transform ${showScrollTop ? "scale-100 opacity-100" : "scale-75 opacity-0 pointer-events-none"}`}
          aria-label="Scroll back up to top"
        >
          ↑
        </button>
      </div>
    </>
  );
}
