import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../axios";

const initialState = {
  title: "",
  description: "",
};

export default function MediaForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const backendUrl = api.defaults.baseURL.replace("/api", "");

  const [form, setForm] = useState(initialState);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState("");

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/media/${id}`)
      .then((res) => {
        setForm({
          title: res.data.title,
          description: res.data.description || "",
        });
        if (res.data.file_path) {
          setExistingImageUrl(`${backendUrl}${res.data.file_path}`);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id, isEdit, backendUrl]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);

    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    try {
      if (isEdit) {
        // Laravel PUT request workaround for multipart/form-data:
        // We submit as a POST with _method=PUT.
        formData.append("_method", "PUT");
        await api.post(`/media/${id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await api.post("/media", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
      navigate("/admin/media");
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        console.error(err);
        alert("Something went wrong while saving the media item.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-500 flex items-center gap-2">
        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500" />
        <span>Loading media details...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          {isEdit ? "Edit Media Item" : "Upload New Media"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isEdit ? "Update details or replace the media file." : "Add a photo to the public safari booking gallery."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Media Title
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Majestic Lion in Yala National Park"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Describe the media (safari package context, animal type, location, etc.)..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">{errors.description[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image File
          </label>

          {/* Existing or Preview Image Display */}
          {(previewUrl || existingImageUrl) && (
            <div className="mb-4">
              <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {previewUrl ? "New Preview:" : "Current Image:"}
              </span>
              <div className="relative aspect-video max-w-sm rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                <img
                  src={previewUrl || existingImageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-gray-400">PNG, JPG, JPEG, GIF or SVG (max. 10MB)</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
          {errors.image && (
            <p className="text-red-500 text-xs mt-1">{errors.image[0]}</p>
          )}
        </div>

        <div className="flex gap-3 pt-3 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
          >
            {saving ? "Saving..." : isEdit ? "Update Media" : "Upload Media"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/media")}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
