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

  useEffect(() => {
    api
      .get("/drivers")
      .then((res) => setDrivers(res.data))
      .catch((err) => console.error("Failed to fetch drivers:", err));
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
      const payload = {
        ...form,
        Driver_ID: form.Driver_ID || null,
      };

      if (isEdit) {
        await api.put(`/vehicles/${id}`, payload);
      } else {
        await api.post("/vehicles", payload);
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

  if (loading) return <div className="p-6 text-muted">Loading...</div>;

  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold text-charcoal dark:text-white mb-6">
        {isEdit ? "Edit Vehicle" : "Add Vehicle"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-charcoal dark:text-white mb-1">
            Vehicle Number
          </label>
          <input
            type="text"
            name="Vehicle_No"
            value={form.Vehicle_No}
            onChange={handleChange}
            placeholder="e.g., ABC-1234"
            className="form-input"
          />
          {errors.Vehicle_No && (
            <p className="text-red-500 text-xs mt-1">{errors.Vehicle_No[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal dark:text-white mb-1">
            Vehicle Type
          </label>
          <input
            type="text"
            name="Vehicle_Type"
            value={form.Vehicle_Type}
            onChange={handleChange}
            placeholder="e.g., Sedan, SUV, Van"
            className="form-input"
          />
          {errors.Vehicle_Type && (
            <p className="text-red-500 text-xs mt-1">{errors.Vehicle_Type[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal dark:text-white mb-1">
            Number of Seats
          </label>
          <input
            type="number"
            name="No_of_Seats"
            value={form.No_of_Seats}
            onChange={handleChange}
            min="1"
            className="form-input"
          />
          {errors.No_of_Seats && (
            <p className="text-red-500 text-xs mt-1">{errors.No_of_Seats[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal dark:text-white mb-1">
            Driver
          </label>
          <select
            name="Driver_ID"
            value={form.Driver_ID}
            onChange={handleChange}
            className="form-input"
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
            className="btn-primary disabled:opacity-50"
          >
            {saving ? "Saving..." : isEdit ? "Update Vehicle" : "Create Vehicle"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/vehicles")}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}