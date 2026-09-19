import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../axios";

const initialState = {
  Driver_Name: "",
  Phone_Number: "",
  Email: "",
};

export default function DriverForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/drivers/${id}`)
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
        await api.put(`/drivers/${id}`, form);
      } else {
        await api.post("/drivers", form);
      }
      navigate("/admin/drivers");
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
        {isEdit ? "Edit Driver" : "Add Driver"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-charcoal dark:text-white mb-1">
            Driver Name
          </label>
          <input
            type="text"
            name="Driver_Name"
            value={form.Driver_Name}
            onChange={handleChange}
            className="form-input"
          />
          {errors.Driver_Name && (
            <p className="text-red-500 text-xs mt-1">{errors.Driver_Name[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal dark:text-white mb-1">
            Phone Number
          </label>
          <input
            type="text"
            name="Phone_Number"
            value={form.Phone_Number}
            onChange={handleChange}
            className="form-input"
          />
          {errors.Phone_Number && (
            <p className="text-red-500 text-xs mt-1">{errors.Phone_Number[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal dark:text-white mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="Email"
            value={form.Email}
            onChange={handleChange}
            className="form-input"
          />
          {errors.Email && (
            <p className="text-red-500 text-xs mt-1">{errors.Email[0]}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? "Saving..." : isEdit ? "Update Driver" : "Create Driver"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/drivers")}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}