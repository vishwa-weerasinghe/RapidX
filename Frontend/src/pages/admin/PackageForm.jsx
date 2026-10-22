import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X } from "lucide-react";
import api from "../../axios";
import { STATIC_BLOG_PACKAGES } from "../../constants/staticBlogPackages";
import { resolvePackageImageUrl } from "../../utils/packageImages";

const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const ALLOWED_EXTENSIONS = /\.(jpe?g|png|webp)$/i;

const initialState = {
  Package_Name: "",
  Description: "",
  price_one_adult: "",
  price_more_adult: "",
  price_child: "",
  blog_id: "",
};

export default function PackageForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const newImagesRef = useRef(newImages);
  newImagesRef.current = newImages;
  const [errors, setErrors] = useState({});
  const [imageError, setImageError] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => () => {
    newImagesRef.current.forEach((image) => URL.revokeObjectURL(image.preview));
  }, []);

  useEffect(() => {
    if (!isEdit) return;

    api
      .get(`/packages/${id}`)
      .then((res) => {
        const data = res.data;
        setForm({
          Package_Name: data.Package_Name || "",
          Description: data.Description || "",
          price_one_adult: data.price_one_adult || "",
          price_more_adult: data.price_more_adult || "",
          price_child: data.price_child || "",
          blog_id: data.blog_id || "",
        });
        const images = Array.isArray(data.images) ? data.images : [];
        setExistingImages(images.length
          ? images
          : data.Image ? [{ id: null, url: data.Image, legacy: true }] : []);
      })
      .catch((err) => setFormError(err.response?.data?.message || "Unable to load this package."))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleImageSelection = (event) => {
    const selected = Array.from(event.target.files || []);
    event.target.value = "";
    if (selected.length === 0) return;

    const slots = MAX_IMAGES - existingImages.length - newImages.length;
    if (selected.length > slots) {
      setImageError(`You can select only ${Math.max(0, slots)} more image${slots === 1 ? "" : "s"}; each package allows up to 3.`);
      return;
    }

    const invalidType = selected.find((file) =>
      !ALLOWED_EXTENSIONS.test(file.name) || (file.type && !ALLOWED_TYPES.has(file.type.toLowerCase())),
    );
    if (invalidType) {
      setImageError(`${invalidType.name} is not supported. Choose a JPEG, JPG, PNG, or WebP image.`);
      return;
    }

    const oversized = selected.find((file) => file.size > MAX_IMAGE_SIZE);
    if (oversized) {
      setImageError(`${oversized.name} is larger than 10 MB. Choose a smaller image.`);
      return;
    }

    setImageError("");
    const additions = selected.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setNewImages((current) => [...current, ...additions]);
  };

  const removeNewImage = (index) => {
    setNewImages((current) => {
      const removed = current[index];
      if (removed) URL.revokeObjectURL(removed.preview);
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
    setImageError("");
  };

  const removeExistingImage = (index) => {
    setExistingImages((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setImageError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    setImageError("");
    setFormError("");

    const formData = new FormData();
    formData.append("Package_Name", form.Package_Name);
    formData.append("Description", form.Description);
    formData.append("price_one_adult", form.price_one_adult);
    formData.append("price_more_adult", form.price_more_adult);
    formData.append("price_child", form.price_child);
    formData.append("blog_id", form.blog_id || "");
    newImages.forEach(({ file }) => formData.append("Images[]", file));

    if (isEdit) {
      formData.append("manage_images", "1");
      existingImages
        .filter((image) => !image.legacy && image.id)
        .forEach((image) => formData.append("retain_image_ids[]", image.id));
      formData.append("keep_legacy_image", existingImages.some((image) => image.legacy) ? "1" : "0");
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
      const responseErrors = err.response?.data?.errors || {};
      const imageMessages = Object.entries(responseErrors)
        .filter(([key]) => key === "Images" || key === "Image" || key.startsWith("Images."))
        .flatMap(([, messages]) => messages || []);
      if (imageMessages.length) setImageError(imageMessages[0]);
      setErrors(Object.fromEntries(Object.entries(responseErrors).filter(([key]) => !key.startsWith("Images") && key !== "Image")));
      setFormError(err.response?.data?.message || "Something went wrong while saving the package.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-muted">Loading...</div>;

  const selectedImageCount = existingImages.length + newImages.length;

  return (
    <div className="p-4 sm:p-6 w-full max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-charcoal dark:text-white mb-6">
        {isEdit ? "Edit Package" : "Add Package"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-charcoal dark:text-white mb-1">Package Name</label>
          <input type="text" name="Package_Name" value={form.Package_Name} onChange={handleChange} required maxLength={100} className="form-input" />
          {errors.Package_Name && <p className="text-red-500 text-xs mt-1">{errors.Package_Name[0]}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal dark:text-white mb-1">Description</label>
          <textarea name="Description" value={form.Description} onChange={handleChange} rows={4} required className="form-input" />
          {errors.Description && <p className="text-red-500 text-xs mt-1">{errors.Description[0]}</p>}
        </div>

        <div>
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="package-images" className="block text-sm font-medium text-charcoal dark:text-white">Package Images</label>
            <span className="text-xs font-semibold text-muted">{selectedImageCount} of {MAX_IMAGES} images selected</span>
          </div>

          {(existingImages.length > 0 || newImages.length > 0) && (
            <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {existingImages.map((image, index) => (
                <div key={image.id || image.url || `legacy-${index}`} className="relative overflow-hidden rounded-xl border border-border-light dark:border-border-dark">
                  <img src={resolvePackageImageUrl(image.url || image.image_url)} alt={`Package image ${index + 1}`} className="h-40 w-full bg-gray-50 object-cover dark:bg-slate-900" />
                  <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-xs text-white">Current image</span>
                  <button type="button" onClick={() => removeExistingImage(index)} aria-label={`Remove current image ${index + 1}`} className="absolute right-2 top-2 rounded-full bg-black/65 p-1.5 text-white hover:bg-red-600">
                    <X size={16} />
                  </button>
                </div>
              ))}
              {newImages.map((image, index) => (
                <div key={image.preview} className="relative overflow-hidden rounded-xl border border-border-light dark:border-border-dark">
                  <img src={image.preview} alt={`New package image ${index + 1}`} className="h-40 w-full bg-gray-50 object-cover dark:bg-slate-900" />
                  <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-xs text-white">New image</span>
                  <button type="button" onClick={() => removeNewImage(index)} aria-label={`Remove new image ${index + 1}`} className="absolute right-2 top-2 rounded-full bg-black/65 p-1.5 text-white hover:bg-red-600">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedImageCount < MAX_IMAGES && (
            <input
              id="package-images"
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={handleImageSelection}
              className="form-input"
            />
          )}
          <p className="mt-1 text-xs text-muted">JPEG, JPG, PNG, or WebP. Maximum 10 MB per image. Remove an image above to replace it.</p>
          {imageError && <p role="alert" className="text-red-500 text-xs mt-1">{imageError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal dark:text-white mb-1">Related Blog Package</label>
          <select name="blog_id" value={form.blog_id} onChange={handleChange} className="form-input">
            <option value="">None</option>
            {STATIC_BLOG_PACKAGES.map((pkg) => <option key={pkg.id} value={pkg.id}>{pkg.name}</option>)}
          </select>
          {errors.blog_id && <p className="text-red-500 text-xs mt-1">{errors.blog_id[0]}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            ["price_one_adult", "Price (1 Adult)"],
            ["price_more_adult", "Price (Per Adult 2+)"],
            ["price_child", "Price (Child)"],
          ].map(([name, label]) => (
            <div key={name}>
              <label className="block text-sm font-medium text-charcoal dark:text-white mb-1">{label}</label>
              <input type="number" step="0.01" min="0" name={name} value={form[name]} onChange={handleChange} required className="form-input" />
              {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name][0]}</p>}
            </div>
          ))}
        </div>

        {formError && <p role="alert" className="text-red-500 text-sm">{formError}</p>}

        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? "Saving..." : isEdit ? "Update Package" : "Create Package"}
          </button>
          <button type="button" onClick={() => navigate("/admin/packages")} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}