import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Users,
  Search,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import ThemeToggle from "./components/ThemeToggle";
import { useTheme } from "./context/ThemeContext";
import api from "./axios";

const tripadvisorReviews = [
  {
    initials: "TA",
    name: "TripAdvisor Traveler",
    date: "Jul 2026",
    title: "Incredible Minneriya Elephant Safari Experience",
    text: "Seeing so many elephants in one place was absolutely amazing. We watched large herds moving freely across the open fields, while several baby elephants played close to their mothers.",
    rate: 5,
    source: "TripAdvisor",
  },
  {
    initials: "TA",
    name: "TripAdvisor Traveler",
    date: "Jun 2026",
    title: "Amazing Elephants And Friendly Driver",
    text: "Our Minneriya Safari was an unforgettable wildlife experience. The highlight of the trip was seeing so many elephants in their natural habitat.",
    rate: 5,
    source: "TripAdvisor",
  },
  {
    initials: "TA",
    name: "TripAdvisor Traveler",
    date: "Jun 2026",
    title: "Memorable Elephant Safari Adventure",
    text: "Booking the Minneriya Safari was quick and easy, and everything went smoothly from the start. The safari itself was adventurous and memorable.",
    rate: 5,
    source: "TripAdvisor",
  },
  {
    initials: "TA",
    name: "TripAdvisor Traveler",
    date: "Jun 2026",
    title: "Unforgettable Elephant Safari Experience",
    text: "Visiting Minneriya National Park was a fantastic experience, especially because of the incredible number of elephants we were able to see.",
    rate: 5,
    source: "TripAdvisor",
  },
  {
    initials: "TA",
    name: "TripAdvisor Traveler",
    date: "Jun 2026",
    title: "Amazing Wildlife Experience At Minneriya",
    text: "I recently visited Minneriya National Park for a safari, and it was an incredible experience. The park was filled with beautiful scenery and an amazing variety of wildlife.",
    rate: 5,
    source: "TripAdvisor",
  },
  {
    initials: "TA",
    name: "TripAdvisor Traveler",
    date: "Jun 2026",
    title: "Memorable Family Safari with Responsible Wildlife Viewing",
    text: "Our family recently enjoyed a wonderful safari experience in Minneriya, and it exceeded our expectations. The trip felt educational, peaceful, and enjoyable for the whole family.",
    rate: 5,
    source: "TripAdvisor",
  },
  {
    initials: "TA",
    name: "TripAdvisor Traveler",
    date: "Jun 2026",
    title: "Amazing Safari Experience for Couples",
    text: "My partner and I had an unforgettable safari experience in Minneriya. The beautiful scenery, incredible wildlife sightings, and professional guidance made this safari truly memorable.",
    rate: 5,
    source: "TripAdvisor",
  },
];

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
      navigate(`/booking/${pkg.id || pkg.Package_ID}`);
    } else {
      navigate(`/booking`);
    }
  };

  const handleAddToCart = async (pkg) => {
    if (user && user.Customer_ID) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split("T")[0];

      const payload = {
        Booking_Date: dateStr,
        Pickup_Time: "06:00",
        Pickup_Location: "Hotel Pickup",
        No_of_adults: 1,
        No_of_child: 0,
        Package_ID: pkg.id || pkg.Package_ID,
        Payment: parseFloat((pkg.price || "0").replace(/[^0-9.]/g, "")) || 0,
        Customer_ID: user.Customer_ID,
      };

      try {
        const token = localStorage.getItem("token");
        await api.post("/cart", payload, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        alert("Package added to cart successfully! 🎉");
      } catch (err) {
        console.error(err);
        alert("Failed to add package to cart. Please try again.");
      }
      navigate("/user/dashboard");
    } else {
      localStorage.setItem(
        "pending_cart",
        JSON.stringify({
          Package_ID: pkg.id || pkg.Package_ID,
          Payment: parseFloat((pkg.price || "0").replace(/[^0-9.]/g, "")) || 0,
        }),
      );
      alert("Please login to add this package to your cart.");
      navigate("/login");
    }
  };

  // --- STATE MANAGEMENT ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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
  const heroSlides = ["src/assets/homepage.png"];

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
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    // 1. Fetch Packages from DB
    api
      .get("/packages")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const backendUrl = "http://127.0.0.1:8000";
          const fallbackImage =
            "https://images.unsplash.com/photo-1549366021-9f761d450615?q=80&w=2012&auto=format&fit=crop";

          const mapped = res.data.map((pkg, idx) => {
            const nameLower = (pkg.Package_Name || "").toLowerCase();

            return {
              id: pkg.id,
              title: pkg.Package_Name,
              desc: pkg.Description,
              price: Number(pkg.Price_for_adult) || 0,
              img: pkg.Image
                ? `${backendUrl}/storage/${pkg.Image}`
                : fallbackImage,
              popular:
                idx === 0 ||
                nameLower.includes("morning") ||
                nameLower.includes("popular"),
              Price_for_adult: pkg.Price_for_adult,
              Price_for_child: pkg.Price_for_child,
              Package_Name: pkg.Package_Name,
            };
          });
          setPackages(mapped);
        }
      })
      .catch((err) => console.error("Error loading packages:", err));

    // 2. Fetch Media Gallery from DB
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
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop - headerHeight;
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
    setIsMobileMenuOpen(false);
    const target = document.getElementById(id);
    if (target) {
      // Calculate accurate position regardless of parent positioning
      const elementPosition = target.getBoundingClientRect().top + window.scrollY;

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
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    email: "",
    rating: 5,
    message: "",
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [showAllTripadvisorReviews, setShowAllTripadvisorReviews] =
    useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviewNotification, setReviewNotification] = useState(null);

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

  useEffect(() => {
    const storedGuestReviews = getStoredGuestReviews();

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
              initials,
              name,
              date: "Recently",
              title,
              text: rev.Description,
              rate: rev.Rate || 5,
              source: "Verified",
            };
          });

          setReviews(
            [...storedGuestReviews, ...mapped].filter(
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
      .catch((err) => console.error("Error loading reviews:", err));
  }, []);

  const tripadvisorVisibleReviews = showAllTripadvisorReviews
    ? tripadvisorReviews
    : tripadvisorReviews.slice(0, 6);
  const systemReviews = reviews.filter(
    (review) => !isTripAdvisorReview(review),
  );
  const systemVisibleReviews = showAllReviews
    ? systemReviews
    : systemReviews.slice(0, 6);

  const handleReviewFormChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuestReviewSubmit = (e) => {
    e.preventDefault();

    if (!reviewForm.message.trim()) {
      setReviewNotification({
        text: "Please share a few words about your experience.",
        type: "error",
      });
      setTimeout(() => setReviewNotification(null), 4000);
      return;
    }

    setReviewSubmitting(true);

    const name = reviewForm.name.trim() || "Guest User";
    const initials =
      name
        .split(" ")
        .map((word) => word[0] || "")
        .join("")
        .slice(0, 2)
        .toUpperCase() || "G";

    const newReview = {
      initials,
      name,
      date: "Just now",
      title:
        reviewForm.message.trim().split(" ").slice(0, 4).join(" ") +
        (reviewForm.message.trim().split(" ").length > 4 ? "..." : ""),
      text: reviewForm.message.trim(),
      rate: Number(reviewForm.rating) || 5,
      isGuest: true,
      source: "Guest",
    };

    setReviews((prev) => {
      const updatedReviews = [newReview, ...prev];
      try {
        const storedGuestReviews = getStoredGuestReviews();
        localStorage.setItem(
          "guestReviews",
          JSON.stringify([newReview, ...storedGuestReviews]),
        );
      } catch (err) {
        console.error("Error saving guest review:", err);
      }
      return updatedReviews;
    });
    setReviewForm({ name: "", email: "", rating: 5, message: "" });
    setShowReviewForm(false);
    setReviewNotification({
      text: "Thank you for your review! It has been added to this page.",
      type: "success",
    });
    setTimeout(() => setReviewNotification(null), 4000);
    setReviewSubmitting(false);
  };

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
            : "bg-transparent py-5 border-b border-white/10"
            }`}
        >
          {/* Logo & Brand Name */}
          <div
            className="cursor-pointer flex items-center gap-2 sm:gap-3"
            onClick={() => scrollToSection("home")}
          >
            <div className="bg-white p-1.5 sm:p-2 rounded-xl shadow-md border border-white/20 flex items-center justify-center transition-transform hover:scale-105 duration-300">
              <img
                src="https://minneriyawildjeepsafari.com/wp-content/uploads/2025/08/lgo.jpg"
                alt="Minneriya Wild Jeep Safari"
                className="h-7 sm:h-9 md:h-11 w-auto object-contain rounded-md"
              />
            </div>
            <span
              className={`text-base sm:text-lg md:text-xl font-bold tracking-wide transition-colors duration-300 ${isScrolled ? "text-sacramento dark:text-white" : "text-white drop-shadow-md"
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
            </ul>
          </nav>

          {/* Auth & Theme Actions Panel */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2">
              {user ? (
                <Link
                  to={dashboardLink}
                  className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 border rounded-full hover:shadow transition-all duration-300 ${isScrolled
                    ? "text-sacramento border-sacramento/25 hover:bg-sacramento/5 dark:text-white dark:border-neutral-800 dark:hover:bg-neutral-800"
                    : "text-white border-white/20 hover:bg-white/10"
                    }`}
                >
                  <LayoutDashboard size={14} />
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

            {/* Simple Modern Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
            <div className="absolute top-full left-0 right-0 mt-3 p-4 rounded-3xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-neutral-800/80 shadow-2xl transition-all duration-300 md:hidden z-50 flex flex-col gap-3">
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
              </div>

              <div className="h-[1px] bg-slate-200/80 dark:bg-neutral-800 my-1" />

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
        className="relative min-h-[100svh] sm:h-screen sm:min-h-[650px] flex items-center overflow-hidden pt-16"
      >
        <div className="absolute inset-0 z-0 overflow-hidden">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
            >
              <img
                src={slide}
                alt="Elephant Gathering Scene"
                className="w-full h-full object-cover object-[65%_center] sm:object-[center_80%] lg:object-right"
              />
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 w-full relative z-20">
          <div className="max-w-2xl text-white ml-0 md:ml-8 lg:ml-12 mt-12 md:mt-0">
            <span className="text-amber-400 font-semibold uppercase tracking-widest text-sm sm:text-base block mb-3 drop-shadow-md">
              Explore Sri Lanka's Wildlife
            </span>
            <h1 className="font-serif text-[2.5rem] leading-[1.1] sm:text-5xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">
              Witness Sri Lanka's Legendary Wild Elephant Gathering
            </h1>
            <p className="text-gray-100 font-medium tracking-wide text-sm sm:text-base block mb-8 drop-shadow-md max-w-xl leading-relaxed">
              Experience unforgettable close-up encounters with majestic
              elephants in Minneriya and Kaudulla National Parks
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-12">
              <button
                onClick={() => handleBookNow()}
                className="bg-[#2E7D32] text-white font-bold text-center px-8 py-3.5 rounded-full shadow-md hover:bg-[#1B5E20] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-[2px]"
              >
                Book Now
              </button>
              <button
                onClick={() => scrollToSection("packages")}
                className="bg-white/10 backdrop-blur-sm border border-white/50 text-white font-semibold text-center px-10 py-3.5 rounded-full shadow-sm hover:bg-white/20 hover:border-white transition-all duration-300 transform hover:-translate-y-[2px]"
              >
                Explore Safari Packages
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/20 max-w-md">
              <div>
                <span className="text-2xl sm:text-3xl font-bold text-white block">
                  2,500+
                </span>
                <span className="text-s sm:text-sm font-bold text-neutral-300">
                  Happy Travelers
                </span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-bold text-white-400 block">
                  5.0/5.0
                </span>
                <span className="text-s sm:text-sm font-bold text-neutral-300">
                  TripAdvisor Rating
                </span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-bold text-white-400 block">
                  24/7
                </span>
                <span className="text-s sm:text-sm font-bold text-neutral-300">
                  Available
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
                  src="https://minneriyawildjeepsafari.com/wp-content/uploads/2025/08/WhatsApp-Image-2025-08-20-at-12.11.05-1024x683.jpeg"
                  alt="Elephant Gathering"
                  className="w-full h-[400px] lg:h-[550px] object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-xl shadow-md border border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 text-castleton rounded-full flex items-center justify-center font-bold text-xl">
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
                    <span className="block text-gray-800 font-bold text-lg leading-none">
                      Since 2020
                    </span>
                    <span className="text-gray-500 text-sm">
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
                More About Us
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Local Experts",
                desc: "Deeply rooted in Habarana & Minneriya with intimate knowledge of the best safari routes.",
                icon: (
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
                    className="w-6 h-6"
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
                    className="w-6 h-6"
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
                    className="w-6 h-6"
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
                className="p-8 rounded-3xl text-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-gray-50 border border-gray-100 group"
              >
                <div className="w-16 h-16 bg-white text-castleton border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  {reason.icon}
                </div>
                <h3 className="text-lg font-bold mb-3 text-gray-900">
                  {reason.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
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
                className="rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group bg-white flex flex-col"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={loc.img}
                    alt={loc.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={() => scrollToSection("packages")}
                      className="bg-castleton text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-opacity-90 transition duration-300 shadow-lg transform translate-y-4 group-hover:translate-y-0"
                    >
                      Learn More
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

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {packages.map((pkg, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={pkg.img}
                    alt={pkg.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />

                  {pkg.popular && (
                    <span className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Popular
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow">

                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {pkg.title}
                  </h3>

                  <p className="text-sm text-gray-500 leading-relaxed mb-4">
                    {pkg.desc}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 text-sm text-gray-600 mb-4">
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      Professional Guide
                    </li>

                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      Comfortable Jeep
                    </li>

                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      Reasonable Prices
                    </li>
                  </ul>

                  {/* Price */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4 mb-4">
                    <span className="text-sm text-gray-500">
                      Starting From
                    </span>

                    <span className="text-xl font-bold text-castleton">
                      LKR {pkg.price.toLocaleString()}
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 mt-auto">
                    <button
                      onClick={() => handleBookNow(pkg)}
                      className="flex-1 bg-sacramento text-white py-2.5 rounded-xl font-semibold hover:bg-castleton transition"
                    >
                      Book Now
                    </button>

                    <button
                      onClick={() => handleAddToCart(pkg)}
                      className="flex-1 border border-sacramento text-sacramento py-2.5 rounded-xl font-semibold hover:bg-sacramento hover:text-white transition"
                    >
                      Add to Cart
                    </button>
                  </div>

                </div>
              </div>
            ))}
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
              src="https://minneriyawildjeepsafari.com/wp-content/uploads/2025/08/TC25-logo.jpg"
              alt="TripAdvisor"
              className="h-24 sm:h-32 mx-auto object-contain"
            />
          </div>

          {reviewNotification && (
            <div
              className={`mx-auto mb-6 max-w-md rounded-xl border px-4 py-3 text-sm ${reviewNotification.type === "error" ? "border-red-500 text-red-600 bg-red-50" : "border-castleton text-castleton bg-castleton-50"}`}
            >
              {reviewNotification.text}
            </div>
          )}

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

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {tripadvisorVisibleReviews.map((rev, index) =>
                renderReviewCard(rev, index),
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

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 lg:items-start">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {systemVisibleReviews.map((rev, index) =>
                  renderReviewCard(rev, index),
                )}
              </div>

              <form
                onSubmit={handleGuestReviewSubmit}
                className="rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-sm lg:sticky lg:top-24"
              >
                <div className="mb-7">
                  <h4 className="font-outfit text-xl font-bold text-gray-900">
                    Write Review
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Tell us about the moments that made your adventure
                    unforgettable. Your experience helps inspire future
                    explorers.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Your name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={reviewForm.name}
                      onChange={handleReviewFormChange}
                      placeholder="Enter your name"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-castleton"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Your email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={reviewForm.email}
                      onChange={handleReviewFormChange}
                      placeholder="Enter your email"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-castleton"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Rating
                    </label>
                    <select
                      name="rating"
                      value={reviewForm.rating}
                      onChange={handleReviewFormChange}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-castleton"
                    >
                      {[
                        { value: 5, label: "Excellent" },
                        { value: 4, label: "Very Good" },
                        { value: 3, label: "Good" },
                        { value: 2, label: "Fair" },
                        { value: 1, label: "Poor" },
                      ].map(({ value, label }) => (
                        <option key={value} value={value}>
                          {"⭐".repeat(value)} - {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Your review
                    </label>
                    <textarea
                      name="message"
                      value={reviewForm.message}
                      onChange={handleReviewFormChange}
                      rows="4"
                      placeholder="Share your safari story"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-castleton resize-none"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="bg-sacramento text-white font-semibold px-6 py-3 rounded-full hover:bg-opacity-90 disabled:opacity-70 transition duration-300 w-full"
                  >
                    {reviewSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            </div>
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
          <a
            href="mailto:info@minneriyawildjeepsafari.com"
            className="bg-[#2E7D32] text-white font-bold text-center px-8 py-3.5 rounded-full shadow-md hover:bg-[#1B5E20] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-[2px]"
          >
            Contact Us: info@minneriyawildjeepsafari.com
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
                  <div className="bg-white p-1.5 sm:p-2 rounded-xl shadow-md border border-white/20 flex items-center justify-center transition-transform hover:scale-105 duration-300">
                    <img
                      src="https://minneriyawildjeepsafari.com/wp-content/uploads/2025/08/lgo.jpg"
                      alt="Minneriya Wild Jeep Safari"
                      className="h-7 sm:h-9 md:h-11 w-auto object-contain rounded-md"
                    />
                  </div>
                </div>
                <span className="font-outfit font-bold text-xl text-gray-900 tracking-wide">
                  Wild Jeep Safari
                </span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Minneriya wild jeep safari is a leading Sri Lanka jeep safari
                company offering unforgettable wildlife experiences.
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
                Legal
              </h4>
              <ul className="space-y-3 text-sm text-gray-500 font-medium">
                {["Privacy Policy", "Terms & Conditions", "FAQs"].map(
                  (item, idx) => (
                    <li key={idx}>
                      <a
                        href="#"
                        className="hover:text-castleton hover:translate-x-1 transition-all duration-300 flex items-center gap-2"
                      >
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        {item}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-gray-200 text-gray-400 text-sm font-medium">
            <p>
              &copy; {new Date().getFullYear()} Minneriyawildjeepsafari.com. All
              Rights Reserved.
            </p>
            <div className="flex gap-4 mt-4 sm:mt-0">
              <a
                href="https://facebook.com/share/1AmhHo7Cg2/"
                className="hover:text-castleton transition-colors"
              >
                Facebook
              </a>
              <a
                href="https://www.instagram.com/minneriyawildjeepsafari"
                className="hover:text-castleton transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://www.tripadvisor.com/Attraction_Review-g304133-d15640558-Reviews-Minneriya_Wild_Jeep_Safari-Dambulla_Central_Province.html"
                className="hover:text-castleton transition-colors"
              >
                TripAdvisor
              </a>
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
  );
}
