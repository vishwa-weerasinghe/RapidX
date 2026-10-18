import { useEffect, useState, useRef } from "react";
import SEO from "../../components/SEO";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../axios";
import { useTheme } from "../../context/ThemeContext";
import { startPayHerePayment } from "../../utils/payhere";
import { pickupTimeOptions, getPickupTimeOptions, getDefaultPickupTime } from "../../constants/pickupTimeOptions";
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString } from "libphonenumber-js";

const countryDisplayNames = new Intl.DisplayNames(["en"], { type: "region" });
const countryOptions = getCountries()
    .map((code) => ({
        code,
        name: countryDisplayNames.of(code) || code,
        callingCode: getCountryCallingCode(code),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    User,
    Mail,
    Phone,
    FileText,
    Globe,
    ShoppingCart,
    Info,
    Compass,
    Loader2,
    CreditCard,
    Clock3,
} from "lucide-react";

export default function Booking() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();

    const [user] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
    const [guestCustomer] = useState(() => JSON.parse(localStorage.getItem("guest_customer") || "null"));
    const activeCustomer = user || guestCustomer;

    const [packagesList, setPackagesList] = useState([]);
    const [loadingPackages, setLoadingPackages] = useState(true);
    const [selectedPackageId, setSelectedPackageId] = useState(id || "");
    const [pkg, setPkg] = useState(null);
    // When true, the booking form was opened from a specific package card
    // ("Book Now"), so the package dropdown must show only that package and
    // not allow switching to another one.
    const [isPackageLocked, setIsPackageLocked] = useState(false);

    const [form, setForm] = useState({
        Booking_Date: "",
        Pickup_Time: "13:00",
        Pickup_Location: "",
        Area: "",
        No_of_adults: 1,
        No_of_child: 0,
        First_Name: "",
        Last_Name: "",
        Email: "",
        Phone_No: "",
        NIC: "",
        Country: "",
    });

    const location = useLocation();
    const bookingId = location.state?.bookingId;
    const isEditMode = Boolean(bookingId);
    const [originalForm, setOriginalForm] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("PayHere");

    // Country and phone number states matching register form
    const [countryCode, setCountryCode] = useState("");
    const [countryQuery, setCountryQuery] = useState("");
    const [showCountryMenu, setShowCountryMenu] = useState(false);
    const [phoneError, setPhoneError] = useState("");
    const [countryError, setCountryError] = useState("");
    const countryMenuRef = useRef(null);

    const selectedCountry = countryOptions.find((c) => c.code === countryCode);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (countryMenuRef.current && !countryMenuRef.current.contains(e.target)) {
                setShowCountryMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Load packages and set initial selected package
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        fetchPackages();
    }, [id, location.state]);

    const fetchPackages = async () => {
        try {
            setLoadingPackages(true);
            const res = await api.get("/packages");
            const packages = Array.isArray(res.data) ? res.data : [];
            setPackagesList(packages);

            const statePkgId = location.state?.packageId;
            const statePkgName = location.state?.packageName;
            const stateBlogId = location.state?.blogId;
            const stateSectionId = location.state?.sectionId;
            const searchParams = new URLSearchParams(location.search);
            const queryPkgId = searchParams.get("packageId") || searchParams.get("package");
            const queryPkgName = searchParams.get("name") || searchParams.get("packageName");

            let targetId = id || queryPkgId || statePkgId;
            let foundPkg = null;

            if (targetId) {
                foundPkg = packages.find(
                    (p) => String(p.Package_ID || p.id) === String(targetId)
                );
            }

            const targetName = statePkgName || queryPkgName;
            if (!foundPkg && targetName) {
                const targetLower = targetName.toLowerCase().trim();
                foundPkg = packages.find(
                    (p) => (p.Package_Name || p.title || "").toLowerCase().trim() === targetLower
                );
                if (!foundPkg) {
                    foundPkg = packages.find((p) => {
                        const pName = (p.Package_Name || p.title || "").toLowerCase();
                        return pName.includes(targetLower) || targetLower.includes(pName);
                    });
                }
            }

            // Lock the package dropdown whenever the booking form was opened
            // with an explicit package (e.g. "Book Now" from a package card,
            // a package URL, or a specific park/blog page). Skip locking in
            // edit mode so admins can still change the package when editing.
            const explicitPackageRequested = Boolean(
                targetId ||
                statePkgName ||
                queryPkgName
            );

            if (foundPkg) {
                const resolvedId = foundPkg.Package_ID || foundPkg.id;
                setSelectedPackageId(resolvedId);
                setPkg(foundPkg);
                setIsPackageLocked(!isEditMode && explicitPackageRequested);

                const available = getPickupTimeOptions(foundPkg);
                const requestedTime = location.state?.pickupTime;
                if (requestedTime && available.some((opt) => opt.value === requestedTime)) {
                    setForm((prev) => ({ ...prev, Pickup_Time: requestedTime }));
                } else if (!available.some((opt) => opt.value === form.Pickup_Time)) {
                    setForm((prev) => ({ ...prev, Pickup_Time: getDefaultPickupTime(foundPkg) }));
                }
            } else {
                // Do not auto-select any package when none was explicitly requested
                setSelectedPackageId("");
                setPkg(null);
                setIsPackageLocked(false);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoadingPackages(false);
        }
    };

    useEffect(() => {
        if (!bookingId) return;

        api.get(`/bookings/${bookingId}`)
            .then((res) => {
                const data = res.data;
                const rawCountry = data.customer?.Country || "";
                const prefilledCountry = countryOptions.find(
                    (c) => c.name.toLowerCase() === rawCountry.toLowerCase() || c.code.toLowerCase() === rawCountry.toLowerCase()
                );
                if (prefilledCountry) {
                    setCountryCode(prefilledCountry.code);
                }
                let rawPhone = data.customer?.Phone_No || "";
                if (rawPhone && prefilledCountry) {
                    const parsed = parsePhoneNumberFromString(rawPhone, prefilledCountry.code);
                    if (parsed?.nationalNumber) {
                        rawPhone = parsed.nationalNumber;
                    }
                }

                const bookingForm = {
                    Booking_Date: data.Booking_Date || "",
                    Pickup_Time: data.Pickup_Time || "13:00",
                    Pickup_Location: data.Pickup_Location || "",
                    Area: data.Area || "",
                    No_of_adults: data.No_of_adults || 1,
                    No_of_child: data.No_of_child || 0,
                    First_Name: data.customer?.First_Name || "",
                    Last_Name: data.customer?.Last_Name || "",
                    Email: data.customer?.Email || "",
                    Phone_No: rawPhone,
                    NIC: data.customer?.NIC || "",
                    Country: prefilledCountry?.name || rawCountry,
                };

                setForm(bookingForm);
                setOriginalForm(bookingForm);
                setSelectedPackageId(data.Package_ID || data.package?.id || "");
                setPkg(data.package || null);
            })
            .catch((err) => console.error("Error loading booking:", err));
    }, [bookingId]);

    // Load customer profile details if logged in (or guest session exists)
    useEffect(() => {
        if (isEditMode) return;

        if (user) {
            api.get('/customer-profile')
                .then((res) => {
                    if (res.data) {
                        const rawCountry = res.data.Country || "";
                        const prefilledCountry = countryOptions.find(
                            (c) => c.name.toLowerCase() === rawCountry.toLowerCase() || c.code.toLowerCase() === rawCountry.toLowerCase()
                        );
                        if (prefilledCountry) {
                            setCountryCode(prefilledCountry.code);
                        }
                        let rawPhone = res.data.Phone_No || "";
                        if (rawPhone && prefilledCountry) {
                            const parsed = parsePhoneNumberFromString(rawPhone, prefilledCountry.code);
                            if (parsed?.nationalNumber) {
                                rawPhone = parsed.nationalNumber;
                            }
                        }

                        setForm((prev) => ({
                            ...prev,
                            First_Name: res.data.First_Name || "",
                            Last_Name: res.data.Last_Name || "",
                            Email: res.data.Email || "",
                            Phone_No: rawPhone,
                            NIC: res.data.NIC || "",
                            Country: prefilledCountry?.name || rawCountry,
                        }));
                    }
                })
                .catch((err) => console.error("Error loading customer profile:", err));
        } else if (guestCustomer) {
            const rawCountry = guestCustomer.Country || "";
            const prefilledCountry = countryOptions.find(
                (c) => c.name.toLowerCase() === rawCountry.toLowerCase() || c.code.toLowerCase() === rawCountry.toLowerCase()
            );
            if (prefilledCountry) {
                setCountryCode(prefilledCountry.code);
            }
            let rawPhone = guestCustomer.Phone_No || "";
            if (rawPhone && prefilledCountry) {
                const parsed = parsePhoneNumberFromString(rawPhone, prefilledCountry.code);
                if (parsed?.nationalNumber) {
                    rawPhone = parsed.nationalNumber;
                }
            }

            setForm((prev) => ({
                ...prev,
                First_Name: guestCustomer.First_Name || "",
                Last_Name: guestCustomer.Last_Name || "",
                Email: guestCustomer.Email || "",
                Phone_No: rawPhone,
                NIC: guestCustomer.NIC || "",
                Country: prefilledCountry?.name || rawCountry,
            }));
        }
    }, [user, guestCustomer]);

    const handlePackageChange = (e) => {
        const pkgId = e.target.value;
        setSelectedPackageId(pkgId);
        const foundPkg = packagesList.find(
            (p) => String(p.Package_ID || p.id) === String(pkgId)
        );
        setPkg(foundPkg || null);

        if (foundPkg) {
            const available = getPickupTimeOptions(foundPkg);
            if (!available.some((opt) => opt.value === form.Pickup_Time)) {
                setForm((prev) => ({
                    ...prev,
                    Pickup_Time: getDefaultPickupTime(foundPkg),
                }));
            }
        }
    };

    // handle input change
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    // calculate total price (base without area extra)
    const getTotal = () => {
        if (!pkg) return 0;
        const adultRate = Number(form.No_of_adults) <= 1 ? pkg.price_one_adult : pkg.price_more_adult;
        const adultTotal = Number(form.No_of_adults) * Number(adultRate || 0);
        const childTotal = Number(form.No_of_child) * Number(pkg.price_child || 0);
        return adultTotal + childTotal;
    };

    // area extras (amounts added to final payment)
    const areaExtraMap = {
        Dambulla: 12,
        Sigiriya: 10,
        Habarana: 3,
        Kandalama: 16,
    };

    const getAreaExtra = () => {
        return areaExtraMap[form.Area] || 0;
    };

    const formatAreaExtra = (n) => {
        const abs = Math.abs(Number(n || 0));
        const formatted = abs.toFixed(2);
        return (n >= 0 ? "+" : "-") + `$${formatted}`;
    };

    const getFinalTotal = () => {
        return getTotal() + getAreaExtra();
    };

    // submit booking
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        if (!selectedPackageId || !pkg) {
            alert("Please select a tour package to proceed with your booking.");
            return;
        }

        const payload = {
            Booking_Date: form.Booking_Date,
            Pickup_Time: form.Pickup_Time,
            Pickup_Location: form.Pickup_Location,
            Area: form.Area,
            No_of_adults: form.No_of_adults,
            No_of_child: form.No_of_child,
            Package_ID: selectedPackageId,
            Payment: getFinalTotal(),
        };

        const role = String(user?.role || user?.Role || "").toLowerCase();
        if (["admin", "administrator", "superadmin"].includes(role)) {
            payload.Created_By_Admin = true;
        }

        if (isEditMode) {
            setIsSubmitting(true);
            try {
                await api.put(`/bookings/${bookingId}`, {
                    Booking_Date: form.Booking_Date,
                    Pickup_Time: form.Pickup_Time,
                    Area: form.Area,
                    Pickup_Location: form.Pickup_Location,
                    No_of_adults: form.No_of_adults,
                    No_of_child: form.No_of_child,
                    Package_ID: selectedPackageId,
                    Payment: getFinalTotal(),
                });
                alert("Booking updated successfully!");
                navigate("/admin/bookings");
            } catch (err) {
                console.log(err);
                alert(err.response?.data?.message || "Failed to update booking");
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        let fullPhone = form.Phone_No;
        if (!user?.Customer_ID) {
            if (!form.Country || !countryCode) {
                setCountryError("Please select a country.");
                alert("Please select a country.");
                return;
            }
            const parsedPhone = parsePhoneNumberFromString(form.Phone_No, countryCode);
            if (!parsedPhone || !parsedPhone.isValid()) {
                setPhoneError("Enter a valid phone number for the selected country.");
                alert("Enter a valid phone number for the selected country.");
                return;
            }
            fullPhone = parsedPhone.format("E.164");
            payload.First_Name = form.First_Name;
            payload.Last_Name = form.Last_Name;
            payload.Email = form.Email;
            payload.Phone_No = fullPhone;
            payload.NIC = form.NIC;
            payload.Country = form.Country;
        } else {
            payload.Customer_ID = user.Customer_ID;
            if (countryCode && form.Phone_No) {
                const parsedPhone = parsePhoneNumberFromString(form.Phone_No, countryCode);
                if (parsedPhone && parsedPhone.isValid()) {
                    fullPhone = parsedPhone.format("E.164");
                }
            }
            payload.Phone_No = fullPhone;
        }

        payload.payment_method = paymentMethod;

        setIsSubmitting(true);

        try {
            const res = await api.post("/payhere/initiate", payload);

            if (res.data?.payment_method === "Pay Later" || paymentMethod === "Pay Later") {
                navigate(`/payment/success?order_id=${res.data.order_id}`);
                return;
            }

            const { payhere_params } = res.data;

            if (payhere_params) {
                startPayHerePayment(payhere_params, {
                    onCompleted: (completedOrderId) => {
                        navigate(`/payment/success?order_id=${completedOrderId}`);
                    },
                    onDismissed: () => {
                        console.log("PayHere payment modal closed by user");
                        setIsSubmitting(false);
                    },
                    onError: (error) => {
                        setIsSubmitting(false);
                        alert("PayHere Error: " + error);
                    },
                });
            } else {
                setIsSubmitting(false);
            }
        } catch (err) {
            console.log(err);
            setIsSubmitting(false);
            alert(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to complete booking"
            );
        }
    };

    const handleReset = () => {
        if (originalForm) {
            setForm({ ...originalForm });
        }
    };

    return (
        <>
            <SEO
                title="Book Your Sri Lanka Jeep Safari | Minneriya, Kaudulla & Wasgamuwa"
                description="Instantly book a jeep safari in Minneriya, Kaudulla or Wasgamuwa National Park. Choose your package, date, and number of guests. Best rates guaranteed."
                canonical="https://www.minneriyawildjeepsafari.com/booking"
            />
            <div className="min-h-screen bg-offwhite dark:bg-[#050505] text-[#1f2b20] dark:text-[#f5f7f2] py-6 sm:py-12 px-3 sm:px-4 md:px-6 transition-colors duration-300">
                <div className="max-w-2xl mx-auto">
                    <div className="w-full bg-[#fcfaf5] dark:bg-[#0d0d0d] border border-[#dce8d7] dark:border-[#15311f] rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                {isEditMode ? "Edit Booking" : "Book Your Adventure"}
                            </h2>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                Customize your package selection and fill schedule details below.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                            {/* Section 0: Package Selector */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/60">
                                    <div className="flex items-center gap-2">
                                        <Compass size={16} className="text-castleton shrink-0" />
                                        <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-600 dark:text-slate-300">
                                            Choose Safari Package
                                        </h4>
                                    </div>
                                    {!selectedPackageId && (
                                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/40 shrink-0">
                                            Required
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                        {isPackageLocked && pkg ? (
                                            <>
                                                Selected Safari Tour Package
                                            </>
                                        ) : (
                                            <>
                                                Select Safari Tour Package <span className="text-red-500">*</span>
                                            </>
                                        )}
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedPackageId}
                                            onChange={handlePackageChange}
                                            disabled={isPackageLocked}
                                            className={`w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs sm:text-sm font-bold py-3 pl-3.5 sm:pl-4 rounded-xl border transition-all appearance-none truncate min-h-[44px] ${!selectedPackageId
                                                ? "border-amber-400/80 dark:border-amber-500/60 ring-2 ring-amber-400/20"
                                                : "border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-castleton"
                                                } ${isPackageLocked ? "pr-3.5 cursor-not-allowed opacity-100" : "pr-10 cursor-pointer"}`}
                                            required
                                        >
                                            {isPackageLocked && pkg ? (
                                                <option
                                                    value={selectedPackageId}
                                                    className="py-2 text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900"
                                                >
                                                    {pkg.Package_Name} (1 Adult: ${pkg.price_one_adult} | 2+ Adults: ${pkg.price_more_adult} | Child: ${pkg.price_child})
                                                </option>
                                            ) : (
                                                <>
                                                    <option value="" disabled className="text-slate-400 font-normal">
                                                        {loadingPackages ? "Loading packages..." : "-- Select a tour package --"}
                                                    </option>
                                                    {Array.isArray(packagesList) && packagesList.map((p) => (
                                                        <option
                                                            key={p.Package_ID || p.id}
                                                            value={p.Package_ID || p.id}
                                                            className="py-2 text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900"
                                                        >
                                                            {p.Package_Name} (1 Adult: ${p.price_one_adult}/person | 2+ Adults: ${p.price_more_adult}/person | Child: ${p.price_child})
                                                        </option>
                                                    ))}
                                                </>
                                            )}
                                        </select>
                                        {!isPackageLocked && (
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                {loadingPackages ? (
                                                    <Loader2 size={16} className="animate-spin text-castleton dark:text-emerald-400" />
                                                ) : (
                                                    <svg className="h-4 w-4 fill-current text-slate-400" viewBox="0 0 20 20">
                                                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                                    </svg>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Section 1: Schedule */}
                            <div className="space-y-3.5 sm:space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/40">
                                    <Calendar size={16} className="text-castleton shrink-0" />
                                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                                        1. Safari Schedule
                                    </h4>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                            Booking Date
                                        </label>
                                        <input
                                            type="date"
                                            name="Booking_Date"
                                            value={form.Booking_Date}
                                            min={new Date().toISOString().split("T")[0]}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs sm:text-sm font-bold py-3 px-3.5 sm:px-4 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-castleton transition-all min-h-[44px]"
                                            required
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                            Pickup Time
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="Pickup_Time"
                                                value={form.Pickup_Time}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs sm:text-sm font-bold py-3 pl-3.5 sm:pl-4 pr-10 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-castleton transition-all min-h-[44px] appearance-none cursor-pointer"
                                                required
                                            >
                                                {getPickupTimeOptions(pkg).map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                                                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                        Pickup Area
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="Area"
                                            value={form.Area}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs sm:text-sm font-bold py-3 pl-3.5 sm:pl-4 pr-10 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-castleton transition-all min-h-[44px] appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="">-- Select area --</option>
                                            <option value="Dambulla">Dambulla (+ $12.00)</option>
                                            <option value="Sigiriya">Sigiriya (+ $10.00)</option>
                                            <option value="Habarana">Habarana (+ $3.00)</option>
                                            <option value="Kandalama">Kandalama (+ $16.00)</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                                            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                        Pickup Location / Hotel Name
                                    </label>
                                    <div className="relative flex items-center">
                                        <MapPin size={14} className="absolute left-3.5 text-slate-400 pointer-events-none shrink-0" />
                                        <input
                                            type="text"
                                            name="Pickup_Location"
                                            placeholder="e.g. Cinnamon Lodge Habarana"
                                            value={form.Pickup_Location}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs sm:text-sm font-bold py-3 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-castleton transition-all min-h-[44px]"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Guest Details / Traveler Info */}
                            <div className="space-y-3.5 sm:space-y-4 pt-1 sm:pt-2">
                                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/40">
                                    <User size={16} className="text-castleton shrink-0" />
                                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                                        2. Traveler Information
                                    </h4>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            name="First_Name"
                                            placeholder="John"
                                            value={form.First_Name}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs sm:text-sm font-bold py-3 px-3.5 sm:px-4 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-castleton transition-all min-h-[44px]"
                                            required
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            name="Last_Name"
                                            placeholder="Doe"
                                            value={form.Last_Name}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs sm:text-sm font-bold py-3 px-3.5 sm:px-4 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-castleton transition-all min-h-[44px]"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                            Email Address
                                        </label>
                                        <div className="relative flex items-center">
                                            <Mail size={14} className="absolute left-3.5 text-slate-400 pointer-events-none shrink-0" />
                                            <input
                                                type="email"
                                                name="Email"
                                                placeholder="john@example.com"
                                                value={form.Email}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs sm:text-sm font-bold py-3 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-castleton transition-all min-h-[44px]"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                            NIC / Passport Number
                                        </label>
                                        <div className="relative flex items-center">
                                            <FileText size={14} className="absolute left-3.5 text-slate-400 pointer-events-none shrink-0" />
                                            <input
                                                type="text"
                                                name="NIC"
                                                placeholder="e.g. 199512345678"
                                                value={form.NIC}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs sm:text-sm font-bold py-3 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-castleton transition-all min-h-[44px]"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    {/* Country Selector */}
                                    <div className="flex flex-col gap-1.5" ref={countryMenuRef}>
                                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                            Country
                                        </label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setShowCountryMenu((open) => !open)}
                                                className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs sm:text-sm font-bold py-3 px-3.5 sm:px-4 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-castleton transition-all min-h-[44px]"
                                                aria-expanded={showCountryMenu}
                                                aria-haspopup="listbox"
                                            >
                                                <span className="flex items-center gap-2 truncate">
                                                    {selectedCountry ? (
                                                        <>
                                                            <img
                                                                src={`https://flagcdn.com/w20/${selectedCountry.code.toLowerCase()}.png`}
                                                                srcSet={`https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png 2x`}
                                                                width="20"
                                                                alt={selectedCountry.name}
                                                                className="rounded-[2px] shadow-sm shrink-0"
                                                            />
                                                            <span className="truncate">{selectedCountry.name}</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-slate-400 font-normal">Select a country</span>
                                                    )}
                                                </span>
                                                <span className="text-xs font-semibold text-slate-400 shrink-0 ml-2">
                                                    {selectedCountry ? `+${selectedCountry.callingCode}` : "Required"}
                                                </span>
                                            </button>

                                            {showCountryMenu && (
                                                <div className="absolute z-50 left-0 right-0 top-full mt-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl">
                                                    <input
                                                        type="search"
                                                        aria-label="Search countries"
                                                        autoFocus
                                                        placeholder="Search countries..."
                                                        value={countryQuery}
                                                        onChange={(e) => setCountryQuery(e.target.value)}
                                                        className="mb-2 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs sm:text-sm text-slate-800 dark:text-white outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-castleton font-normal"
                                                    />
                                                    <div className="max-h-52 overflow-y-auto space-y-0.5" role="listbox">
                                                        {countryOptions
                                                            .filter(
                                                                (c) =>
                                                                    c.name.toLowerCase().includes(countryQuery.toLowerCase()) ||
                                                                    c.callingCode.includes(countryQuery)
                                                            )
                                                            .map((c) => (
                                                                <button
                                                                    type="button"
                                                                    role="option"
                                                                    aria-selected={c.code === countryCode}
                                                                    key={c.code}
                                                                    onClick={() => {
                                                                        setCountryCode(c.code);
                                                                        setForm((prev) => ({ ...prev, Country: c.name, Phone_No: "" }));
                                                                        setPhoneError("");
                                                                        setCountryError("");
                                                                        setCountryQuery("");
                                                                        setShowCountryMenu(false);
                                                                    }}
                                                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs sm:text-sm transition-colors ${c.code === countryCode
                                                                        ? "bg-castleton/10 text-castleton font-bold"
                                                                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                                        }`}
                                                                >
                                                                    <span className="flex items-center gap-2 truncate">
                                                                        <img
                                                                            src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`}
                                                                            srcSet={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png 2x`}
                                                                            width="20"
                                                                            alt={c.name}
                                                                            className="rounded-[2px] shadow-sm shrink-0"
                                                                        />
                                                                        <span className="truncate">{c.name}</span>
                                                                    </span>
                                                                    <span className="text-slate-400 font-semibold shrink-0 ml-2">
                                                                        +{c.callingCode}
                                                                    </span>
                                                                </button>
                                                            ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {countryError && (
                                            <p className="text-[11px] font-semibold text-rose-500 mt-0.5">{countryError}</p>
                                        )}
                                    </div>

                                    {/* Phone Number Input */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                            Phone Number
                                        </label>
                                        <div className="relative flex items-center">
                                            <span className="absolute inset-y-0 left-0 z-10 flex items-center justify-center px-3 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 rounded-l-xl select-none min-w-[54px]">
                                                {selectedCountry ? `+${selectedCountry.callingCode}` : "--"}
                                            </span>
                                            <input
                                                type="tel"
                                                name="Phone_No"
                                                autoComplete="tel"
                                                required
                                                disabled={!countryCode}
                                                placeholder={
                                                    !countryCode
                                                        ? "Select country first"
                                                        : countryCode === "LK"
                                                            ? "77 123 4567"
                                                            : "Enter phone number"
                                                }
                                                value={form.Phone_No}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setForm((prev) => ({ ...prev, Phone_No: val }));
                                                    if (phoneError) setPhoneError("");
                                                }}
                                                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs sm:text-sm font-bold py-3 pl-20 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-castleton transition-all min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                                            />
                                        </div>
                                        {phoneError && (
                                            <p className="text-[11px] font-semibold text-rose-500 mt-0.5">{phoneError}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Travelers Count */}
                            <div className="space-y-3.5 sm:space-y-4 pt-1 sm:pt-2">
                                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/40">
                                    <Users size={16} className="text-castleton shrink-0" />
                                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                                        3. Travelers Configuration
                                    </h4>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                            Adult Guests (11+ yrs)
                                        </label>
                                        <input
                                            type="number"
                                            name="No_of_adults"
                                            min="1"
                                            max="30"
                                            value={form.No_of_adults}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs sm:text-sm font-bold py-3 px-3.5 sm:px-4 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-castleton transition-all min-h-[44px]"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                            Child Guests (6-11 yrs)
                                        </label>
                                        <input
                                            type="number"
                                            name="No_of_child"
                                            min="0"
                                            max="30"
                                            value={form.No_of_child}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs sm:text-sm font-bold py-3 px-3.5 sm:px-4 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-castleton transition-all min-h-[44px]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Payment Method Selection */}
                            {!isEditMode && (
                                <div className="space-y-3.5 sm:space-y-4 pt-1 sm:pt-2">
                                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/40">
                                        <CreditCard size={16} className="text-castleton shrink-0" />
                                        <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                                            4. Payment Method
                                        </h4>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        {/* Pay Online with PayHere */}
                                        <div
                                            onClick={() => setPaymentMethod("PayHere")}
                                            className={`cursor-pointer rounded-2xl p-4 border-2 transition-all duration-200 relative ${paymentMethod === "PayHere"
                                                    ? "border-sacramento bg-sacramento/5 dark:bg-sacramento/10 shadow-sm"
                                                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`p-2 rounded-xl ${paymentMethod === "PayHere" ? "bg-sacramento text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>
                                                        <CreditCard size={18} />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                                                            Pay Online
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                                            Card / PayHere Gateway
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "PayHere" ? "border-sacramento" : "border-slate-300 dark:border-slate-600"}`}>
                                                    {paymentMethod === "PayHere" && <div className="w-2 h-2 rounded-full bg-sacramento"></div>}
                                                </div>
                                            </div>
                                            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                                Instant online confirmation. Pay securely via Visa, MasterCard, or online banking.
                                            </p>
                                            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                                                <img
                                                    src="/payhere-cards.png"
                                                    alt="Accepted Cards: LankaPay, Visa, Mastercard, American Express, Discover, Diners Club"
                                                    className="w-full max-w-[290px] h-auto object-contain rounded-md"
                                                />
                                            </div>
                                        </div>

                                        {/* Pay Later */}
                                        <div
                                            onClick={() => setPaymentMethod("Pay Later")}
                                            className={`cursor-pointer rounded-2xl p-4 border-2 transition-all duration-200 relative ${paymentMethod === "Pay Later"
                                                    ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm"
                                                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`p-2 rounded-xl ${paymentMethod === "Pay Later" ? "bg-amber-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>
                                                        <Clock3 size={18} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                                                                Pay Later
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                                            Pay near tour date
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "Pay Later" ? "border-amber-500" : "border-slate-300 dark:border-slate-600"}`}>
                                                    {paymentMethod === "Pay Later" && <div className="w-2 h-2 rounded-full bg-amber-500"></div>}
                                                </div>
                                            </div>
                                            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                                Reserve now without paying upfront. Our admin will collect payment near the tour date.
                                            </p>
                                        </div>
                                    </div>

                                    {paymentMethod === "Pay Later" && (
                                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed flex items-start gap-2">
                                            <Info size={15} className="shrink-0 mt-0.5" />
                                            <span>
                                                Confirmation emails with reservation details will be sent immediately. Booking status will be set to <strong>Pending</strong>, and our admin will take payment at the near date on your tour.
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Bill Details Summary */}
                            {pkg && (
                                <div className="bg-castleton/5 dark:bg-sacramento-900/10 border border-castleton/20 dark:border-castleton/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-castleton/10 text-castleton dark:text-castleton-300 shrink-0">
                                            <Info size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                                                {paymentMethod === "Pay Later" ? "Total Due on Tour Date" : "Total Reservation Cost"}
                                            </p>
                                            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight">
                                                $ {new Intl.NumberFormat().format(getFinalTotal())}
                                            </p>
                                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/80 px-2.5 py-0.5 rounded-full mt-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                No Hidden Charges
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-castleton/10 dark:border-castleton/20 text-left sm:text-right text-[11px] font-bold text-slate-500 dark:text-slate-400 space-y-0.5">
                                        <p>{form.No_of_adults} Adult{Number(form.No_of_adults) > 1 ? "s" : ""} × $ {Number(form.No_of_adults) <= 1 ? pkg.price_one_adult : pkg.price_more_adult}</p>
                                        {form.No_of_child > 0 && (
                                            <p>{form.No_of_child} Child(ren) × $ {pkg.price_child}</p>
                                        )}
                                        {form.Area && (
                                            <p>{form.Area} surcharge: $ {new Intl.NumberFormat().format(getAreaExtra())}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Submit & Cart Action */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full min-h-[48px] ${paymentMethod === "Pay Later" && !isEditMode
                                        ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20"
                                        : "bg-sacramento hover:bg-sacramento-600 shadow-sacramento/20"
                                    } disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold text-xs sm:text-sm uppercase py-3.5 sm:py-4 px-4 rounded-xl shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 group cursor-pointer`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin shrink-0" />
                                        <span className="truncate">Please Wait...</span>
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart size={16} className="shrink-0" />
                                        <span className="truncate">
                                            {isEditMode
                                                ? "Update Booking"
                                                : pkg
                                                    ? paymentMethod === "Pay Later"
                                                        ? `Confirm & Reserve (Pay Later) • $ ${new Intl.NumberFormat().format(getFinalTotal())}`
                                                        : `Confirm & Pay • $ ${new Intl.NumberFormat().format(getFinalTotal())}`
                                                    : paymentMethod === "Pay Later"
                                                        ? "Select a Package to Reserve (Pay Later)"
                                                        : "Select a Package to Continue"}
                                        </span>
                                    </>
                                )}
                            </button>
                            {isEditMode && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="w-full min-h-[44px] border border-slate-300 text-slate-600 font-bold text-xs sm:text-sm uppercase py-3 px-4 rounded-xl hover:bg-slate-50 transition-all dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900 cursor-pointer"
                                >
                                    Reset Changes
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
