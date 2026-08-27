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
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

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
          Image: res.data.Image || "",
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
    return <div className="p-6 text-muted">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold text-charcoal dark:text-white mb-6">
        {isEdit ? "Edit Package" : "Add Package"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Package Name */}
        <div>
          <label className="block text-sm font-medium text-charcoal dark:text-white mb-1">
            Package Name
          </label>

          <input
            type="text"
            name="Package_Name"
            value={form.Package_Name}
            onChange={handleChange}
            className="form-input"
          />

          {errors.Package_Name && (
            <p className="text-red-500 text-xs mt-1">
              {errors.Package_Name[0]}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-charcoal dark:text-white mb-1">
            Description
          </label>

          <textarea
            name="Description"
            value={form.Description}
            onChange={handleChange}
            rows={4}
            className="form-input"
          />

          {errors.Description && (
            <p className="text-red-500 text-xs mt-1">
              {errors.Description[0]}
            </p>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-charcoal dark:text-white mb-1">
            Package Image
          </label>

          {isEdit && typeof form.Image === "string" && (
            <div className="mb-3">
              <p className="mb-2 text-sm text-muted">Current image</p>
              <img
                src={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://127.0.0.1:8000'}/storage/${form.Image}`}
                alt="Current package"
                className="h-56 w-full rounded-lg border border-border-light bg-gray-50 object-contain object-left dark:border-border-dark dark:bg-slate-900"
              />
            </div>
          )}

          {imagePreview && (
            <div className="mb-3">
              <p className="mb-2 text-sm text-muted">Selected image preview</p>
              <img
                src={imagePreview}
                alt="Selected package preview"
                className="h-56 w-full rounded-lg border border-border-light bg-gray-50 object-contain object-left dark:border-border-dark dark:bg-slate-900"
              />
            </div>
          )}

          <input
            type="file"
            name="Image"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            onChange={(e) => {
              const file = e.target.files[0] || null;
              setForm({ ...form, Image: file });
              setImagePreview(file ? URL.createObjectURL(file) : "");
            }}
            className="form-input"
          />

          <p className="mt-1 text-xs text-muted">
            {isEdit
              ? "Upload a new image only if you want to replace the current one."
              : "Upload an image for this package."}
            JPG, PNG, JPEG or WEBP. Maximum size: 10 MB.
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
            <label className="block text-sm font-medium text-charcoal dark:text-white mb-1">
              Price (Adult)
            </label>

            <input
              type="number"
              step="0.01"
              name="Price_for_adult"
              value={form.Price_for_adult}
              onChange={handleChange}
              className="form-input"
            />

            {errors.Price_for_adult && (
              <p className="text-red-500 text-xs mt-1">
                {errors.Price_for_adult[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal dark:text-white mb-1">
              Price (Child)
            </label>

            <input
              type="number"
              step="0.01"
              name="Price_for_child"
              value={form.Price_for_child}
              onChange={handleChange}
              className="form-input"
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
            className="btn-primary disabled:opacity-50"
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
            className="btn-secondary"
          >
            Cancel
          </button>

        </div>

      </form>
    </div>
  );
}