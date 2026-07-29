
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../axios";

const initialState = {
  Package_Name: "",
  Description: "",
  Price_for_adult: "",
  Price_for_child: "",
  Image: null,
};

export default function PackageForm() {
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
      .get(`/packages/${id}`)
      .then((res) => {
        setForm({
          Package_Name: res.data.Package_Name || "",
          Description: res.data.Description || "",
          Price_for_adult: res.data.Price_for_adult || "",
          Price_for_child: res.data.Price_for_child || "",
          Image: res.data.Image || null,
        });
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    const formData = new FormData();
    formData.append("Package_Name", form.Package_Name);
    formData.append("Description", form.Description);
    formData.append("Price_for_adult", form.Price_for_adult);
    formData.append("Price_for_child", form.Price_for_child);

    if (form.Image instanceof File) {
      formData.append("Image", form.Image);
    }

    try {
      if (isEdit) {
        formData.append("_method", "PUT");
        await api.post(`/packages/${id}`, formData);
      } else {
        await api.post("/packages", formData);
      }

      navigate("/admin/packages");
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

  if (loading) {
    return <div className="p-6 text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        {isEdit ? "Edit Package" : "Add Package"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Package Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Package Name
          </label>

          <input
            type="text"
            name="Package_Name"
            value={form.Package_Name}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {errors.Package_Name && (
            <p className="text-red-500 text-xs mt-1">
              {errors.Package_Name[0]}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>

          <textarea
            name="Description"
            value={form.Description}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {errors.Description && (
            <p className="text-red-500 text-xs mt-1">
              {errors.Description[0]}
            </p>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Package Image
          </label>

          {isEdit && typeof form.Image === "string" && (
            <div className="mb-3">
              <p className="mb-2 text-sm text-gray-600">Current image</p>
              <img
                src={`http://127.0.0.1:8000/storage/${form.Image}`}
                alt="Current package"
                className="h-40 w-full rounded-lg border border-gray-300 object-cover"
              />
            </div>
          )}

          <input
            type="file"
            name="Image"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            onChange={(e) =>
              setForm({
                ...form,
                Image: e.target.files[0] || null,
              })
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />

          <p className="mt-1 text-xs text-gray-500">
            Upload a new image only if you want to replace the current one.
            JPG, PNG, JPEG or WEBP. Maximum size: 2 MB.
          </p>

          {errors.Image && (
            <p className="text-red-500 text-xs mt-1">
              {errors.Image[0]}
            </p>
          )}
        </div>

        {/* Prices */}
        <div className="grid grid-cols-2 gap-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (Adult)
            </label>

            <input
              type="number"
              step="0.01"
              name="Price_for_adult"
              value={form.Price_for_adult}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {errors.Price_for_adult && (
              <p className="text-red-500 text-xs mt-1">
                {errors.Price_for_adult[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (Child)
            </label>

            <input
              type="number"
              step="0.01"
              name="Price_for_child"
              value={form.Price_for_child}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {errors.Price_for_child && (
              <p className="text-red-500 text-xs mt-1">
                {errors.Price_for_child[0]}
              </p>
            )}
          </div>

        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">

          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            {saving
              ? "Saving..."
              : isEdit
              ? "Update Package"
              : "Create Package"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/packages")}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
          >
            Cancel
          </button>

        </div>

      </form>
    </div>
  );
}
