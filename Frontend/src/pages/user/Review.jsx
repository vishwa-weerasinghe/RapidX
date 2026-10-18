import { useEffect, useState } from "react";
import api from "../../axios";
import { getApiErrorMessage } from "../../utils/apiErrorMessage";
import { Camera, X, MessageSquareQuote, Star, Send, Sparkles, Image as ImageIcon, CheckCircle2 } from "lucide-react";

const MAX_REVIEW_PHOTOS = 5;
const MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024; // 10MB per photo

export default function Review() {
  const [rate, setRate] = useState(5);
  const [hoveredRate, setHoveredRate] = useState(0);
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem("token")));
  const [photos, setPhotos] = useState([]);
  const [photoError, setPhotoError] = useState(null);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();
  const customerId = user?.Customer_ID || user?.customer_id || user?.id || null;

  const fetchReviews = async () => {
    try {
      const response = await api.get("/reviews");
      const allReviews = response.data || [];
      const myReviews = customerId
        ? allReviews.filter((r) => Number(r.Customer_ID) === Number(customerId))
        : allReviews;
      setReviews(myReviews);
    } catch (err) {
      setReviews([]);
    }
  };

  useEffect(() => {
    fetchReviews();
    setIsLoggedIn(Boolean(localStorage.getItem("token")));
  }, [customerId]);

  const clearPhotos = () => {
    setPhotos((prev) => {
      prev.forEach((photo) => URL.revokeObjectURL(photo.preview));
      return [];
    });
    setPhotoError(null);
  };

  // Revoke preview object URLs when the component unmounts
  useEffect(() => clearPhotos, []);

  const handlePhotoChange = (e) => {
    const selected = Array.from(e.target.files || []);
    e.target.value = "";

    const accepted = [];
    const errors = [];

    for (const file of selected) {
      if (photos.length + accepted.length >= MAX_REVIEW_PHOTOS) {
        errors.push(`You can attach up to ${MAX_REVIEW_PHOTOS} photos.`);
        break;
      }
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name} is not an image file.`);
        continue;
      }
      if (file.size > MAX_PHOTO_SIZE_BYTES) {
        errors.push(`${file.name} exceeds the 10MB photo size limit.`);
        continue;
      }
      accepted.push({ file, preview: URL.createObjectURL(file) });
    }

    if (accepted.length > 0) {
      setPhotos((prev) => [...prev, ...accepted]);
    }
    setPhotoError(errors[0] || null);
  };

  const removePhoto = (index) => {
    setPhotos((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!localStorage.getItem("token")) {
      setError("Please log in as a customer before submitting a review.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("Rate", String(Number(rate)));
      formData.append("Description", description);
      if (customerId) {
        formData.append("Customer_ID", String(customerId));
      }
      formData.append("Email", user?.Email || user?.email || "");
      photos.forEach((photo) => formData.append("Photos[]", photo.file));

      const response = await api.post(
        "/reviews",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(response.data?.message || "Thank you for your review!");
      setDescription("");
      setRate(5);
      clearPhotos();
      fetchReviews();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.status === 413
          ? "The photos you attached are too large in total. Please try smaller images."
          : getApiErrorMessage(err, "Unable to submit review right now.")
      );
    } finally {
      setLoading(false);
    }
  };

  const ratingLabels = {
    5: "Excellent - Truly unforgettable",
    4: "Very Good - Great safari experience",
    3: "Good - Enjoyed the tour",
    2: "Fair - Room for improvement",
    1: "Poor - Below expectations",
  };

  return (
    <div className="min-h-screen py-6 sm:py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300 bg-slate-50/50 dark:bg-bg-dark text-slate-800 dark:text-white">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Modern Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-border-light dark:border-border-dark/60 bg-white dark:bg-[#16231c] p-6 sm:p-8 shadow-sm">
          <div className="absolute -top-14 -right-14 w-48 h-48 bg-sacramento/10 dark:bg-sacramento-900/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-sacramento text-white rounded-2xl shadow-sm shrink-0">
                <MessageSquareQuote size={24} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Guest Reviews & Experiences
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Share your safari memories, rate guides, and inspire future travelers.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-surface-2 border border-slate-200/80 dark:border-border-dark text-xs font-bold text-slate-700 dark:text-slate-300 self-start sm:self-auto">
              <Sparkles size={14} className="text-amber-500" />
              <span>{reviews.length} {reviews.length === 1 ? "Experience" : "Experiences"} Shared</span>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Write a Review Card */}
          <section className="lg:col-span-6 xl:col-span-5 rounded-3xl border border-border-light dark:border-border-dark/60 bg-white dark:bg-[#16231c] p-6 sm:p-7 shadow-sm space-y-6">
            <div className="border-b border-slate-100 dark:border-border-dark/60 pb-4">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Write a Review
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Tell us about your wild adventure in Minneriya and Kaudulla.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Star Rating Selector */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isFilled = (hoveredRate || Number(rate)) >= starVal;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setRate(starVal)}
                        onMouseEnter={() => setHoveredRate(starVal)}
                        onMouseLeave={() => setHoveredRate(0)}
                        className="p-1 rounded-xl transition duration-150 transform hover:scale-110 active:scale-95 focus:outline-none"
                        title={`${starVal} Star${starVal > 1 ? "s" : ""}`}
                      >
                        <Star
                          size={28}
                          className={`${
                            isFilled
                              ? "text-amber-400 fill-amber-400 drop-shadow-sm"
                              : "text-slate-300 dark:text-slate-600"
                          } transition-colors duration-150`}
                        />
                      </button>
                    );
                  })}
                  <span className="ml-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    {rate} / 5
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-slate-400 font-medium">
                  {ratingLabels[rate] || "Selected rating"}
                </p>
              </div>

              {/* Feedback Description */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Your Experience
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  required
                  className="w-full rounded-2xl border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-surface-2 p-3.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sacramento/30 focus:border-sacramento transition"
                  placeholder="What was the highlight of your safari? Wildlife sightings, our drivers, timing..."
                />
              </div>

              {/* Photos Upload */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Photos (Optional)
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {photos.length}/{MAX_REVIEW_PHOTOS} attached
                  </span>
                </div>

                <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 dark:border-border-dark bg-slate-50/50 dark:bg-surface-2/40 p-4 text-xs text-slate-500 dark:text-slate-400 cursor-pointer hover:bg-slate-50 dark:hover:bg-surface-2 transition duration-200">
                  <div className="p-2 rounded-full bg-sacramento/10 text-sacramento dark:text-castleton-300">
                    <Camera size={20} />
                  </div>
                  <div className="text-center">
                    <span className="font-bold text-slate-700 dark:text-slate-200 block">
                      Click to upload photos
                    </span>
                    <span className="text-[11px] text-slate-400">
                      JPG, PNG up to 10MB each (max {MAX_REVIEW_PHOTOS})
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={photos.length >= MAX_REVIEW_PHOTOS || loading || !isLoggedIn}
                    onChange={handlePhotoChange}
                  />
                </label>

                {photoError && (
                  <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">{photoError}</p>
                )}

                {photos.length > 0 && (
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {photos.map((photo, index) => (
                      <div
                        key={photo.preview}
                        className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 dark:border-border-dark group"
                      >
                        <img
                          src={photo.preview}
                          alt={`Selected photo ${index + 1}`}
                          className="h-full w-full object-cover group-hover:scale-105 transition duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white hover:bg-red-600 transition"
                          aria-label={`Remove photo ${index + 1}`}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {message && (
                <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 text-xs font-semibold">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              {error && (
                <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/40 text-xs font-semibold">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !isLoggedIn}
                className="w-full py-3.5 rounded-2xl bg-sacramento hover:bg-sacramento-600 text-white text-sm font-bold shadow-md shadow-sacramento/20 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={16} />
                    <span>{isLoggedIn ? "Publish Review" : "Log in to Review"}</span>
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Submitted Reviews List */}
          <section className="lg:col-span-6 xl:col-span-7 rounded-3xl border border-border-light dark:border-border-dark/60 bg-white dark:bg-[#16231c] p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-border-dark/60 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Submitted Reviews
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Latest traveler verified reviews and photos
                </p>
              </div>
              <span className="text-xs font-bold text-sacramento dark:text-castleton-300 bg-sacramento/10 dark:bg-sacramento-900/40 px-3 py-1 rounded-full border border-sacramento/20">
                {reviews.length} Total
              </span>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[640px] pr-1">
              {reviews.length === 0 ? (
                <div className="p-10 text-center rounded-2xl border border-dashed border-slate-200 dark:border-border-dark bg-slate-50/50 dark:bg-surface-2/30">
                  <MessageSquareQuote size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    No reviews yet
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Be the first explorer to share your experience with our team!
                  </p>
                </div>
              ) : (
                reviews.map((review) => {
                  const customerName = review.customer
                    ? `${review.customer.First_Name || ""} ${review.customer.Last_Name || ""}`.trim()
                    : "Guest Explorer";
                  const initial = customerName.charAt(0).toUpperCase() || "E";

                  return (
                    <div
                      key={review.Review_ID}
                      className="p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-border-dark/60 bg-slate-50/60 dark:bg-surface-2/40 hover:bg-slate-50 dark:hover:bg-surface-2/70 transition duration-200 space-y-3"
                    >
                      {/* Review Card Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-sacramento text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                            {initial}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                              {customerName}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="flex items-center text-amber-400 text-xs">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    size={13}
                                    className={
                                      i < Number(review.Rate || 0)
                                        ? "text-amber-400 fill-amber-400"
                                        : "text-slate-200 dark:text-slate-700"
                                    }
                                  />
                                ))}
                              </div>
                              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                {review.Rate}.0
                              </span>
                            </div>
                          </div>
                        </div>

                        <span className="text-[11px] font-semibold text-slate-400">
                          Verified Tour
                        </span>
                      </div>

                      {/* Review text */}
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {review.Description}
                      </p>

                      {/* Photo Attachments */}
                      {Array.isArray(review.Photos) && review.Photos.length > 0 && (
                        <div className="pt-1 flex flex-wrap gap-2">
                          {review.Photos.map((photoUrl, photoIndex) => (
                            <a
                              key={photoUrl || photoIndex}
                              href={photoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block h-16 w-16 overflow-hidden rounded-xl border border-slate-200 dark:border-border-dark group"
                              title="Click to view full photo"
                            >
                              <img
                                src={photoUrl}
                                alt={`Review photo ${photoIndex + 1}`}
                                className="h-full w-full object-cover group-hover:scale-110 transition duration-200"
                              />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}