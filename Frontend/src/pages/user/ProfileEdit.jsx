import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, UserCircle } from "lucide-react";
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
      const mergedUser = { ...(updatedUser || {}), ...response.data, User_Name: `${form.First_Name || ""} ${form.Last_Name || ""}`.trim() || updatedUser?.User_Name || "Customer" };
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
      <div className="min-h-screen bg-offwhite p-6 text-charcoal dark:bg-bg-dark dark:text-white">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border-light bg-white p-8 shadow-sm dark:border-border-dark dark:bg-surface-2">
          <p className="text-lg font-semibold">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite px-4 py-8 text-charcoal dark:bg-bg-dark dark:text-white">
      <div className="mx-auto max-w-3xl rounded-[28px] border border-border-light bg-white p-5 shadow-sm dark:border-border-dark dark:bg-surface-2 sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate("/user/dashboard")}
            className="inline-flex items-center gap-2 rounded-full border border-border-light px-3 py-2 text-sm font-semibold text-charcoal hover:bg-offwhite-100 dark:border-border-dark dark:text-white dark:hover:bg-surface-3"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="flex items-center gap-2 text-sacramento dark:text-amber-400">
            <UserCircle size={22} />
            <span className="text-lg font-bold">Edit Profile</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-semibold">
              <span className="mb-2 block text-charcoal dark:text-white">First Name</span>
              <input
                type="text"
                name="First_Name"
                value={form.First_Name}
                onChange={handleChange}
                className="w-full rounded-xl border border-border-light bg-offwhite px-3 py-2.5 text-charcoal outline-none ring-0 transition focus:border-sacramento dark:border-border-dark dark:bg-bg-dark dark:text-white"
              />
            </label>

            <label className="block text-sm font-semibold">
              <span className="mb-2 block text-charcoal dark:text-white">Last Name</span>
              <input
                type="text"
                name="Last_Name"
                value={form.Last_Name}
                onChange={handleChange}
                className="w-full rounded-xl border border-border-light bg-offwhite px-3 py-2.5 text-charcoal outline-none ring-0 transition focus:border-sacramento dark:border-border-dark dark:bg-bg-dark dark:text-white"
              />
            </label>

            <label className="block text-sm font-semibold sm:col-span-2">
              <span className="mb-2 block text-charcoal dark:text-white">Email</span>
              <input
                type="email"
                name="Email"
                value={form.Email}
                onChange={handleChange}
                className="w-full rounded-xl border border-border-light bg-offwhite px-3 py-2.5 text-charcoal outline-none ring-0 transition focus:border-sacramento dark:border-border-dark dark:bg-bg-dark dark:text-white"
              />
            </label>

            <label className="block text-sm font-semibold sm:col-span-2">
              <span className="mb-2 block text-charcoal dark:text-white">Phone Number</span>
              <input
                type="tel"
                name="Phone_No"
                value={form.Phone_No}
                onChange={handleChange}
                className="w-full rounded-xl border border-border-light bg-offwhite px-3 py-2.5 text-charcoal outline-none ring-0 transition focus:border-sacramento dark:border-border-dark dark:bg-bg-dark dark:text-white"
              />
            </label>

            <label className="block text-sm font-semibold sm:col-span-2">
              <span className="mb-2 block text-charcoal dark:text-white">NIC / Passport</span>
              <input
                type="text"
                name="NIC"
                value={form.NIC}
                onChange={handleChange}
                className="w-full rounded-xl border border-border-light bg-offwhite px-3 py-2.5 text-charcoal outline-none ring-0 transition focus:border-sacramento dark:border-border-dark dark:bg-bg-dark dark:text-white"
              />
            </label>

            <label className="block text-sm font-semibold sm:col-span-2">
              <span className="mb-2 block text-charcoal dark:text-white">Country</span>
              <input
                type="text"
                name="Country"
                value={form.Country}
                onChange={handleChange}
                className="w-full rounded-xl border border-border-light bg-offwhite px-3 py-2.5 text-charcoal outline-none ring-0 transition focus:border-sacramento dark:border-border-dark dark:bg-bg-dark dark:text-white"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/user/dashboard")}
              className="rounded-full border border-border-light px-4 py-2 text-sm font-semibold text-charcoal hover:bg-offwhite-100 dark:border-border-dark dark:text-white dark:hover:bg-surface-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-sacramento px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-sacramento-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
