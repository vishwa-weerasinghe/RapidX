import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../axios";

const initialState = {
  Vehicle_No: "",
  Vehicle_Type: "",
  No_of_Seats: "",
  Driver_ID: "",
};

export default function VehicleForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(initialState);
  const [drivers, setDrivers] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [existingVehicles, setExistingVehicles] = useState([]);

  useEffect(() => {
    // Fetch drivers for dropdown
    api
      .get("/drivers")
      .then((res) => setDrivers(res.data))
      .catch((err) => console.error("Failed to fetch drivers:", err));
  }, []);

  useEffect(() => {
    // Fetch existing vehicles for search
    api
      .get("/vehicles")
      .then((res) => setExistingVehicles(res.data || []))
      .catch((err) => console.error("Failed to fetch vehicles:", err));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/vehicles/${id}`)
      .then((res) => setForm(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      if (isEdit) {
        await api.put(`/vehicles/${id}`, form);
      } else {
        await api.post("/vehicles", form);
      }
      navigate("/admin/vehicles");
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        console.error(err);
        alert("Something went wrong while saving.");
      }
    } finally {
      setSaving(false);
    }
  };

  const filteredVehicles = existingVehicles.filter((vehicle) => {
    const q = search.trim().toLowerCase();
    if (!q) return false;
    return (
      String(vehicle.Vehicle_No || "").toLowerCase().includes(q) ||
      String(vehicle.Vehicle_Type || "").toLowerCase().includes(q) ||
      String(vehicle.Vehicle_ID || "").includes(q)
    );
  });

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        {isEdit ? "Edit Vehicle" : "Add Vehicle"}
      </h1>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Search Existing Vehicles
        </label>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m1.35-5.4a6.75 6.75 0 11-13.5 0 6.75 6.75 0 0113.5 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by vehicle number or type..."
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {search.trim() !== "" && (
          <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 max-h-64 overflow-y-auto">
            {filteredVehicles.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-500">
                No existing vehicles match your search.
              </p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredVehicles.map((vehicle) => (
                  <li
                    key={vehicle.Vehicle_ID}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-100"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {vehicle.Vehicle_No}
                      </p>
                      <p className="text-xs text-gray-500">
                        {vehicle.Vehicle_Type} · {vehicle.No_of_Seats} seats
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      #{vehicle.Vehicle_ID}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vehicle Number
          </label>
          <input
            type="text"
            name="Vehicle_No"
            value={form.Vehicle_No}
            onChange={handleChange}
            placeholder="e.g., ABC-1234"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.Vehicle_No && (
            <p className="text-red-500 text-xs mt-1">{errors.Vehicle_No[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vehicle Type
          </label>
          <input
            type="text"
            name="Vehicle_Type"
            value={form.Vehicle_Type}
            onChange={handleChange}
            placeholder="e.g., Sedan, SUV, Van"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.Vehicle_Type && (
            <p className="text-red-500 text-xs mt-1">{errors.Vehicle_Type[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Seats
          </label>
          <input
            type="number"
            name="No_of_Seats"
            value={form.No_of_Seats}
            onChange={handleChange}
            min="1"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.No_of_Seats && (
            <p className="text-red-500 text-xs mt-1">{errors.No_of_Seats[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Driver
          </label>
          <select
            name="Driver_ID"
            value={form.Driver_ID}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select a Driver --</option>
            {drivers.map((driver) => (
              <option key={driver.Driver_ID} value={driver.Driver_ID}>
                {driver.Driver_Name} ({driver.Phone_Number})
              </option>
            ))}
          </select>
          {errors.Driver_ID && (
            <p className="text-red-500 text-xs mt-1">{errors.Driver_ID[0]}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            {saving ? "Saving..." : isEdit ? "Update Vehicle" : "Create Vehicle"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/vehicles")}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

