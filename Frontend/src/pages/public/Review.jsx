import { useEffect, useState } from "react";
import api from "../../axios";
import { ReviewCardSkeleton } from "../../components/Skeletons";
import { Camera, X } from "lucide-react";

const defaultReviewForm = { name: "", email: "", rating: 5, message: "" };

const MAX_REVIEW_PHOTOS = 5;
const MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024; // 10MB per photo

export default function Review({
  reviews: providedReviews,
  renderReviewCard,
  title = "Write a Review",
  description = "Share your experience with our service.",
  layout = "section",
  loading: loadingReviews = false,
}) {
  const [reviewForm, setReviewForm] = useState(defaultReviewForm);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [fetchedReviews, setFetchedReviews] = useState([]);
  const [submittedReviews, setSubmittedReviews] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [photoError, setPhotoError] = useState(null);

  const renderCard =
    typeof renderReviewCard === "function"
      ? renderReviewCard
      : (review, index) => (
          <div
            key={review.Review_ID || index}
            className="rounded-xl border border-[#dce8d7] bg-[#fdfcf8] p-4 dark:border-[#15311f] dark:bg-[#111111]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-[#1f2b20] dark:text-[#e6ebdf]">
                  Rating: {review.Rate} / 5
                </p>
                <p className="mt-1 text-amber-400 text-sm leading-none">
                  {Array.from({ length: review.Rate || 0 }).map(() => "★").join("")}
                  {Array.from({ length: 5 - (review.Rate || 0) }).map(() => "☆").join("")}
                </p>
              </div>
              <span className="text-sm text-[#4b5d47] dark:text-[#b3c4b1]">
                {review.customer
                  ? `${review.customer.First_Name || ""} ${review.customer.Last_Name || ""}`.trim()
                  : "Guest"}
              </span>
            </div>
            <p className="mt-2 text-[#1f2b20] dark:text-[#e6ebdf]">{review.Description}</p>
            {Array.isArray(review.Photos) && review.Photos.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {review.Photos.map((photoUrl, photoIndex) => (
                  <a
                    key={photoUrl || photoIndex}
                    href={photoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-14 w-14 overflow-hidden rounded-lg border border-[#dce8d7] dark:border-[#15311f]"
                  >
                    <img
                      src={photoUrl}
                      alt={`Review photo ${photoIndex + 1}`}
                      className="h-full w-full object-cover transition hover:scale-105"
                    />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        );

  const visibleReviews = Array.isArray(providedReviews)
    ? [...submittedReviews, ...providedReviews]
    : [...submittedReviews, ...fetchedReviews];

  const fetchReviews = async () => {
    try {
      const response = await api.get("/reviews");
      setFetchedReviews(response.data || []);
    } catch (err) {
      setFetchedReviews([]);
    }
  };

  useEffect(() => {
    // Skip when reviews are provided by the parent, and on the standalone
    // form page (reviews aren't displayed there — no need to fetch).
    if (Array.isArray(providedReviews)) return;
    if (layout === "standalone") return;
    fetchReviews();
  }, [providedReviews, layout]);

  const setTimedNotification = (nextNotification) => {
    setNotification(nextNotification);
    window.setTimeout(() => setNotification(null), 4000);
  };

  const handleReviewFormChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
  };

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

    if (!reviewForm.email.trim()) {
      setTimedNotification({ text: "Your email has not been used for booking.", type: "error" });
      return;
    }

    if (!reviewForm.message.trim()) {
      setTimedNotification({ text: "Please share a few words about your experience.", type: "error" });
      return;
    }

    setLoading(true);
    setNotification(null);

    try {
      const formData = new FormData();
      formData.append("Rate", String(Number(reviewForm.rating) || 5));
      formData.append("Description", reviewForm.message.trim());
      formData.append("Email", reviewForm.email.trim());
      photos.forEach((photo) => formData.append("Photos[]", photo.file));

      const response = await api.post("/reviews", formData);

      const enteredName = reviewForm.name.trim() || "Guest User";
      const initials =
        enteredName
          .split(" ")
          .map((word) => word[0] || "")
          .join("")
          .slice(0, 2)
          .toUpperCase() || "G";

      setSubmittedReviews((prev) => [
        {
          Review_ID: response.data?.Review_ID || Date.now(),
          Rate: Number(reviewForm.rating) || 5,
          Description: reviewForm.message.trim(),
          Photos: response.data?.Photos || [],
          initials,
          name: enteredName,
          source: "Guest",
          isGuest: true,
        },
        ...prev,
      ]);

      setTimedNotification({
        text: response.data?.message || "Thank you for your review",
        type: "success",
      });
      setReviewForm(defaultReviewForm);
      clearPhotos();
    } catch (err) {
      setTimedNotification({
        text:
          err.response?.status === 413
            ? "The photos you attached are too large in total. Please try smaller images."
            : err.response?.data?.message || "Your email has not been used for booking.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const formBody = (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium">Your email</label>
        <input
          type="email"
          name="email"
          value={reviewForm.email}
          onChange={handleReviewFormChange}
          required
          className="w-full rounded-lg border border-[#dce8d7] bg-[#fdfcf8] px-3 py-2 text-[#1f2b20] outline-none focus:ring-2 focus:ring-sacramento dark:border-[#15311f] dark:bg-[#111111] dark:text-[#f5f7f2]"
          placeholder="Enter the email used for your safari booking"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Your name</label>
        <input
          type="text"
          name="name"
          value={reviewForm.name}
          onChange={handleReviewFormChange}
          className="w-full rounded-lg border border-[#dce8d7] bg-[#fdfcf8] px-3 py-2 text-[#1f2b20] outline-none focus:ring-2 focus:ring-sacramento dark:border-[#15311f] dark:bg-[#111111] dark:text-[#f5f7f2]"
          placeholder="Enter your name"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Rating</label>
        <select
          name="rating"
          value={reviewForm.rating}
          onChange={handleReviewFormChange}
          className="w-full rounded-lg border border-[#dce8d7] bg-[#fdfcf8] px-3 py-2 text-[#1f2b20] outline-none focus:ring-2 focus:ring-sacramento dark:border-[#15311f] dark:bg-[#111111] dark:text-[#f5f7f2]"
        >
          <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent</option>
          <option value="4">⭐⭐⭐⭐ 4 - Very good</option>
          <option value="3">⭐⭐⭐ 3 - Good</option>
          <option value="2">⭐⭐ 2 - Fair</option>
          <option value="1">⭐ 1 - Poor</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Your feedback</label>
        <textarea
          name="message"
          value={reviewForm.message}
          onChange={handleReviewFormChange}
          rows="5"
          required
          className="w-full rounded-lg border border-[#dce8d7] bg-[#fdfcf8] px-3 py-2 text-[#1f2b20] outline-none focus:ring-2 focus:ring-sacramento dark:border-[#15311f] dark:bg-[#111111] dark:text-[#f5f7f2]"
          placeholder="Tell us what you liked or what we can improve..."
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Photos (optional)</label>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#a9c3a0] bg-[#fdfcf8] px-3 py-3 text-sm text-[#4b5d47] transition hover:bg-[#f3f0e6] dark:border-[#2b5236] dark:bg-[#111111] dark:text-[#b3c4b1] dark:hover:bg-[#152015]">
          <Camera size={18} className="text-sacramento" />
          <span>
            {photos.length > 0
              ? `${photos.length}/${MAX_REVIEW_PHOTOS} photos selected - click to add more`
              : "Add photos (up to 5, max 10MB each)"}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={photos.length >= MAX_REVIEW_PHOTOS || loading}
            onChange={handlePhotoChange}
          />
        </label>
        {photoError ? (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{photoError}</p>
        ) : null}
        {photos.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {photos.map((photo, index) => (
              <div
                key={photo.preview}
                className="relative h-16 w-16 overflow-hidden rounded-lg border border-[#dce8d7] dark:border-[#15311f]"
              >
                <img
                  src={photo.preview}
                  alt={`Selected photo ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute right-0.5 top-0.5 rounded-full bg-black/70 p-0.5 text-white transition hover:bg-red-600"
                  aria-label={`Remove photo ${index + 1}`}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {notification ? (
        <p
          className={`rounded-lg p-3 text-sm ${notification.type === "error"
            ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
            : "bg-castleton-50 text-sacramento dark:bg-sacramento-900/40 dark:text-castleton-300"
            }`}
        >
          {notification.text}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-sacramento px-4 py-3 font-semibold text-offwhite transition hover:bg-sacramento-600 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );

  if (layout === "form") {
    return (
      <div
        id="guest-review-form"
        className="rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-sm"
      >
        <div className="mb-6">
          <h4 className="font-outfit text-xl font-bold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        {formBody}
      </div>
    );
  }

  if (layout === "standalone") {
    return (
      <div className="min-h-screen bg-[#f8f4eb] px-4 py-10 text-[#1f2b20] transition-colors duration-300 dark:bg-[#050505] dark:text-[#f5f7f2] flex items-center justify-center">
        <div className="w-full lg:w-3/4 rounded-2xl border border-[#dce8d7] bg-[#fcfaf5] p-8 shadow-2xl dark:border-[#15311f] dark:bg-[#0d0d0d]">
          <button
            type="button"
            onClick={() => window.history.back()}
            aria-label="Go back"
            className="inline-flex items-center gap-1.5 mb-5 text-sm font-semibold text-[#4b5d47] dark:text-[#b3c4b1] hover:text-sacramento transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h2 className="text-3xl font-bold">{title}</h2>
          <p className="mt-2 text-[#4b5d47] dark:text-[#b3c4b1]">{description}</p>
          {formBody}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 lg:items-start">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loadingReviews && visibleReviews.length === 0 ? (
          Array.from({ length: 4 }).map((_, index) => (
            <ReviewCardSkeleton key={index} />
          ))
        ) : (
          visibleReviews.map((rev, index) => renderCard(rev, index))
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-sm lg:sticky lg:top-24">
        <div className="mb-7">
          <h4 className="font-outfit text-xl font-bold text-gray-900">Write Review</h4>
          <p className="text-sm text-gray-500 mt-1">
            Tell us about the moments that made your adventure unforgettable. Your experience helps inspire future explorers.
          </p>
        </div>
        {formBody}
      </div>
    </div>
  );
}