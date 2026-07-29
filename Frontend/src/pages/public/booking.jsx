import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../axios";
import { useTheme } from "../../context/ThemeContext";
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
    ChevronLeft,
    Info,
    Compass,
} from "lucide-react";

export default function Booking() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();

    const user = JSON.parse(localStorage.getItem("user") || "null");
    const guestCustomer = JSON.parse(localStorage.getItem("guest_customer") || "null");
    const activeCustomer = user || guestCustomer;

    const [packagesList, setPackagesList] = useState([]);
    const [selectedPackageId, setSelectedPackageId] = useState(id || "");
    const [pkg, setPkg] = useState(null);

    const [form, setForm] = useState({
        Booking_Date: "",
        Pickup_Time: "",
        Pickup_Location: "",
        No_of_adults: 1,
        No_of_child: 0,
        First_Name: "",
        Last_Name: "",
        Email: "",
        Phone_No: "",
        NIC: "",
        Country: "",
    });

    // Load packages and set initial selected package
    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const res = await api.get("/packages");
            setPackagesList(res.data);

            const initialId = id || (res.data[0]?.Package_ID || res.data[0]?.id || "");
            setSelectedPackageId(initialId);

            const foundPkg = res.data.find(
                (p) => String(p.Package_ID || p.id) === String(initialId)
            );
            if (foundPkg) {
                setPkg(foundPkg);
            } else if (res.data.length > 0) {
                setPkg(res.data[0]);
            }
        } catch (err) {
            console.log(err);
        }
    };

    // Load customer profile details if logged in (or guest session exists)
    useEffect(() => {
        if (user) {
            api.get('/customer-profile')
                .then((res) => {
                    if (res.data) {
                        setForm((prev) => ({
                            ...prev,
                            First_Name: res.data.First_Name || "",
                            Last_Name: res.data.Last_Name || "",
                            Email: res.data.Email || "",
                            Phone_No: res.data.Phone_No || "",
                            NIC: res.data.NIC || "",
                            Country: res.data.Country || "",
                        }));
                    }
                })
                .catch((err) => console.error("Error loading customer profile:", err));
        } else if (guestCustomer) {
            setForm((prev) => ({
                ...prev,
                First_Name: guestCustomer.First_Name || "",
                Last_Name: guestCustomer.Last_Name || "",
                Email: guestCustomer.Email || "",
                Phone_No: guestCustomer.Phone_No || "",
                NIC: guestCustomer.NIC || "",
                Country: guestCustomer.Country || "",
            }));
        }
    }, [user, guestCustomer]);

    const handlePackageChange = (e) => {
        const pkgId = e.target.value;
        setSelectedPackageId(pkgId);
        const foundPkg = packagesList.find(
            (p) => String(p.Package_ID || p.id) === String(pkgId)
        );
        if (foundPkg) {
            setPkg(foundPkg);
        }
    };

    // handle input change
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    // calculate total price
    const getTotal = () => {
        if (!pkg) return 0;
        const adultTotal = form.No_of_adults * pkg.Price_for_adult;
        const childTotal = form.No_of_child * pkg.Price_for_child;
        return adultTotal + childTotal;
    };

    // submit booking
    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            Booking_Date: form.Booking_Date,
            Pickup_Time: form.Pickup_Time,
            Pickup_Location: form.Pickup_Location,
            No_of_adults: form.No_of_adults,
            No_of_child: form.No_of_child,
            Package_ID: selectedPackageId,
            Payment: getTotal(),
        };

        if (activeCustomer?.Customer_ID) {
            payload.Customer_ID = activeCustomer.Customer_ID;
        } else {
            payload.First_Name = form.First_Name;
            payload.Last_Name = form.Last_Name;
            payload.Email = form.Email;
            payload.Phone_No = form.Phone_No;
            payload.NIC = form.NIC;
            payload.Country = form.Country;
        }

        try {
            await api.post("/bookings", payload);
            alert("Booking placed successfully! 🎉");
            if (activeCustomer?.Customer_ID) {
                navigate("/user/bookings");
            } else {
                navigate("/");
            }
        } catch (err) {
            console.log(err);
            alert(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to complete booking"
            );
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f4eb] dark:bg-[#050505] text-[#1f2b20] dark:text-[#f5f7f2] py-12 px-4 md:px-6 transition-colors duration-300">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Navigation Action */}
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
                >
                    <ChevronLeft size={16} />
                    Back to Home
                </button>

                <div className="flex justify-center">
                    <div className="w-full max-w-2xl bg-[#fcfaf5] dark:bg-[#0d0d0d] border border-[#dce8d7] dark:border-[#15311f] rounded-3xl shadow-xl p-6 md:p-8 space-y-8">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                Book Your Adventure
                            </h2>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                Customize your package selection and fill schedule details below.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Section 0: Package Selector */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-slate-50 dark:border-slate-800/40">
                                    <Compass size={16} className="text-emerald-500" />
                                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                                        Choose Safari Package
                                    </h4>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                        Available Packages
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedPackageId}
                                            onChange={handlePackageChange}
                                            className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-bold py-3.5 px-4 rounded-xl border border-slate-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="" disabled>-- Select a tour package --</option>
                                            {packagesList.map((p) => (
                                                <option key={p.Package_ID || p.id} value={p.Package_ID || p.id}>
                                                    {p.Package_Name} - Rs. {p.Price_for_adult} (Adult) / Rs. {p.Price_for_child} (Child)
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                                            <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 1: Schedule */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-slate-50 dark:border-slate-800/40">
                                    <Calendar size={16} className="text-emerald-500" />
                                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                                        1. Safari Schedule
                                    </h4>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                            className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-bold py-3 px-4 rounded-xl border border-slate-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                            required
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                            Pickup Time
                                        </label>
                                        <input
                                            type="time"
                                            name="Pickup_Time"
                                            value={form.Pickup_Time}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-bold py-3 px-4 rounded-xl border border-slate-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                        Pickup Location / Hotel Name
                                    </label>
                                    <div className="relative flex items-center">
                                        <MapPin size={14} className="absolute left-4 text-slate-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            name="Pickup_Location"
                                            placeholder="e.g. Cinnamon Lodge Habarana"
                                            value={form.Pickup_Location}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-bold py-3 pl-10 pr-4 rounded-xl border border-slate-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Guest Details / Traveler Info */}
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center gap-2 pb-2 border-b border-slate-50 dark:border-slate-800/40">
                                    <User size={16} className="text-emerald-500" />
                                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                                        2. Traveler Information
                                    </h4>
                                </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-bold py-3 px-4 rounded-xl border border-slate-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
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
                                                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-bold py-3 px-4 rounded-xl border border-slate-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                                Email Address
                                            </label>
                                            <div className="relative flex items-center">
                                                <Mail size={14} className="absolute left-4 text-slate-400 pointer-events-none" />
                                                <input
                                                    type="email"
                                                    name="Email"
                                                    placeholder="john@example.com"
                                                    value={form.Email}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-bold py-3 pl-10 pr-4 rounded-xl border border-slate-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                                Phone Number
                                            </label>
                                            <div className="relative flex items-center">
                                                <Phone size={14} className="absolute left-4 text-slate-400 pointer-events-none" />
                                                <input
                                                    type="text"
                                                    name="Phone_No"
                                                    placeholder="+94 77 123 4567"
                                                    value={form.Phone_No}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-bold py-3 pl-10 pr-4 rounded-xl border border-slate-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                                NIC / Passport Number
                                            </label>
                                            <div className="relative flex items-center">
                                                <FileText size={14} className="absolute left-4 text-slate-400 pointer-events-none" />
                                                <input
                                                    type="text"
                                                    name="NIC"
                                                    placeholder="e.g. 199512345678"
                                                    value={form.NIC}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-bold py-3 pl-10 pr-4 rounded-xl border border-slate-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                                Country
                                            </label>
                                            <div className="relative flex items-center">
                                                <Globe size={14} className="absolute left-4 text-slate-400 pointer-events-none" />
                                                <input
                                                    type="text"
                                                    name="Country"
                                                    placeholder="e.g. Sri Lanka"
                                                    value={form.Country}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-bold py-3 pl-10 pr-4 rounded-xl border border-slate-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            {/* Section 3: Travelers Count */}
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center gap-2 pb-2 border-b border-slate-50 dark:border-slate-800/40">
                                    <Users size={16} className="text-emerald-500" />
                                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                                        3. Travelers Configuration
                                    </h4>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                            Adult Guests
                                        </label>
                                        <input
                                            type="number"
                                            name="No_of_adults"
                                            min="1"
                                            max="30"
                                            value={form.No_of_adults}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-bold py-3 px-4 rounded-xl border border-slate-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                            Child Guests (under 12)
                                        </label>
                                        <input
                                            type="number"
                                            name="No_of_child"
                                            min="0"
                                            max="30"
                                            value={form.No_of_child}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-bold py-3 px-4 rounded-xl border border-slate-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Bill Details Summary */}
                            {pkg && (
                                <div className="bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/20 dark:border-emerald-500/10 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                            <Info size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                                                Total Reservation Cost
                                            </p>
                                            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight">
                                                Rs. {new Intl.NumberFormat().format(getTotal())}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right text-[11px] font-bold text-slate-400 dark:text-slate-500">
                                        <p>{form.No_of_adults} Adult(s) × Rs {pkg.Price_for_adult}</p>
                                        {form.No_of_child > 0 && (
                                            <p className="mt-0.5">{form.No_of_child} Child(ren) × Rs {pkg.Price_for_child}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Submit & Cart Action */}
                            <button
                                type="submit"
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm uppercase py-4 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group"
                            >
                                <ShoppingCart size={16} />
                                Book Now
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
