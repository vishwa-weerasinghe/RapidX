import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../axios";

const initialState = {
  Vehicle_No: "",
  Vehicle_Type: "",
  No_of_Seats: "",
};

export default function Vehicle() {
  const navigate = useNavigate();
  const user = (() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  })();

  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Check if user is logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F4F8F3] flex justify-center items-center py-10">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 text-center">
          <p className="text-gray-600 mb-4">Please log in to add vehicle details.</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setMessage("");

    try {
      const response = await api.post("/vehicles", form);
      setMessage("Vehicle details saved successfully! ✅");
      setForm(initialState);
      setTimeout(() => {
        navigate("/user/dashboard");
      }, 2000);
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        setMessage(
          err.response?.data?.message || "Failed to save vehicle details."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F8F3] flex justify-center py-10 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-green-800 mb-2">
          Add Vehicle Details
        </h2>
        <p className="text-gray-600 mb-6">
          Please provide your vehicle information
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Vehicle Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Vehicle Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="Vehicle_No"
              value={form.Vehicle_No}
              onChange={handleChange}
              placeholder="e.g., ABC-1234 or ABC1234"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {errors.Vehicle_No && (
              <p className="mt-1 text-sm text-red-600">
                {errors.Vehicle_No[0]}
              </p>
            )}
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Vehicle Type <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="Vehicle_Type"
              value={form.Vehicle_Type}
              onChange={handleChange}
              placeholder="e.g., Sedan, SUV, Van, Truck"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {errors.Vehicle_Type && (
              <p className="mt-1 text-sm text-red-600">
                {errors.Vehicle_Type[0]}
              </p>
            )}
          </div>

          {/* Number of Seats */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Number of Seats <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="No_of_Seats"
              value={form.No_of_Seats}
              onChange={handleChange}
              min="1"
              max="20"
              placeholder="e.g., 5"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {errors.No_of_Seats && (
              <p className="mt-1 text-sm text-red-600">
                {errors.No_of_Seats[0]}
              </p>
            )}
          </div>

          {/* Messages */}
          {message && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4">
              <p className="text-green-800">{message}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
            >
              {loading ? "Saving..." : "Save Vehicle Details"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/user/dashboard")}
              className="px-6 py-2 rounded-lg font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
