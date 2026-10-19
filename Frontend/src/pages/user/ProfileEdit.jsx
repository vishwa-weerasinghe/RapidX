import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, User, Mail, Phone, Shield, Globe, CheckCircle2 } from "lucide-react";
import api from "../../axios";

export default function ProfileEdit() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    First_Name: "",
    Last_Name: "",
    Email: "",
    Phone_No: "",
    NIC: "",
    Country: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/customer-profile");
        setForm({
          First_Name: res.data?.First_Name || "",
          Last_Name: res.data?.Last_Name || "",
          Email: res.data?.Email || "",
          Phone_No: res.data?.Phone_No || "",
          NIC: res.data?.NIC || "",
          Country: res.data?.Country || "",
        });
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setFetching(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await api.put("/customer-profile", form);
      const updatedUser = JSON.parse(localStorage.getItem("user") || "null");
      const mergedUser = {
        ...(updatedUser || {}),
        ...response.data,
        User_Name: `${form.First_Name || ""} ${form.Last_Name || ""}`.trim() || updatedUser?.User_Name || "Customer",
      };
      localStorage.setItem("user", JSON.stringify(mergedUser));
      navigate("/user/dashboard");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(error.response?.data?.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-3 bg-slate-50 dark:bg-bg-dark">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-100 dark:border-emerald-950/40 border-t-sacramento dark:border-t-sacramento-300 animate-spin" />
        <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 animate-pulse">Loading profile...</p>
      </div>
    );
  }

  const userInitial = (form.First_Name || "E").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen py-6 sm:py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300 bg-slate-50/50 dark:bg-bg-dark text-slate-800 dark:text-white">
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/user/dashboard")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-[#16231c] text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-surface-2 transition shadow-xs active:scale-95"
          >
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </button>
        </div>

        {/* Hero Card Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-border-light dark:border-border-dark/60 bg-white dark:bg-[#16231c] p-6 sm:p-8 shadow-sm">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-sacramento/10 dark:bg-sacramento-900/30 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-sacramento text-white flex items-center justify-center text-2xl font-black shadow-md shrink-0">
              {userInitial}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Profile Settings
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Update your contact details and safari credentials for swift booking confirmations.
              </p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="rounded-3xl border border-border-light dark:border-border-dark/60 bg-white dark:bg-[#16231c] p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                  <User size={14} className="text-sacramento dark:text-castleton-300" />
                  <span>First Name</span>
                </label>
                <input
                  type="text"
                  name="First_Name"
                  value={form.First_Name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-surface-2 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sacramento/30 focus:border-sacramento transition"
                  placeholder="e.g. John"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                  <User size={14} className="text-sacramento dark:text-castleton-300" />
                  <span>Last Name</span>
                </label>
                <input
                  type="text"
                  name="Last_Name"
                  value={form.Last_Name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-surface-2 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sacramento/30 focus:border-sacramento transition"
                  placeholder="e.g. Doe"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                  <Mail size={14} className="text-sacramento dark:text-castleton-300" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  name="Email"
                  value={form.Email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-surface-2 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sacramento/30 focus:border-sacramento transition"
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                  <Phone size={14} className="text-sacramento dark:text-castleton-300" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="tel"
                  name="Phone_No"
                  value={form.Phone_No}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-surface-2 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sacramento/30 focus:border-sacramento transition"
                  placeholder="+94 77 123 4567"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                  <Shield size={14} className="text-sacramento dark:text-castleton-300" />
                  <span>NIC / Passport</span>
                </label>
                <input
                  type="text"
                  name="NIC"
                  value={form.NIC}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-surface-2 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sacramento/30 focus:border-sacramento transition"
                  placeholder="Passport or ID Number"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                  <Globe size={14} className="text-sacramento dark:text-castleton-300" />
                  <span>Country</span>
                </label>
                <input
                  type="text"
                  name="Country"
                  value={form.Country}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-surface-2 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sacramento/30 focus:border-sacramento transition"
                  placeholder="e.g. Sri Lanka, United Kingdom"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-border-dark/60">
              <button
                type="button"
                onClick={() => navigate("/user/dashboard")}
                className="px-5 py-3 rounded-2xl border border-slate-200 dark:border-border-dark text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-surface-2 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sacramento hover:bg-sacramento-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-sacramento/20 transition cursor-pointer active:scale-95 disabled:opacity-60"
              >
                <Save size={16} />
                <span>{loading ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
