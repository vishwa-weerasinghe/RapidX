import { useEffect, useState } from "react";
import api from "../../axios";
import { getApiErrorMessage } from "../../utils/apiErrorMessage";
import { Camera, X } from "lucide-react";

const MAX_REVIEW_PHOTOS = 5;
const MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024; // 10MB per photo

  export default function Review() {
    const [rate, setRate] = useState(5);
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
  
    return (
      <div className="min-h-screen bg-offwhite px-4 py-10 text-charcoal transition-colors duration-300 dark:bg-bg-dark dark:text-white">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <section className="card p-8">
              <h2 className="text-3xl font-bold">Write a Review</h2>
              <p className="mt-2 text-muted">Share your experience with our service.</p>
  
              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium">Rating</label>
                  <select
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="form-input"
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
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="5"
                    required
                    className="form-input"
                    placeholder="Tell us what you liked or what we can improve..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Photos (optional)</label>
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border-light bg-white px-3 py-3 text-sm text-muted transition hover:bg-offwhite dark:border-border-dark dark:bg-surface-2 dark:hover:bg-surface-1">
                    <Camera size={18} className="text-sacramento dark:text-amber-400" />
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
                      disabled={photos.length >= MAX_REVIEW_PHOTOS || loading || !isLoggedIn}
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
                          className="relative h-16 w-16 overflow-hidden rounded-lg border border-border-light dark:border-border-dark"
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
  
                {message ? <p className="rounded-lg bg-sacramento/10 p-3 text-sacramento">{message}</p> : null}
                {error ? <p className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 dark:bg-red-950/30 dark:border-red-900/30 dark:text-red-400">{error}</p> : null}
  
                <button
                  type="submit"
                  disabled={loading || !isLoggedIn}
                  className="btn-primary w-full py-3"
                >
                  {loading ? "Submitting..." : isLoggedIn ? "Submit Review" : "Log in to review"}
                </button>
              </form>
            </section>
  
            <section className="card p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold">Submitted Reviews</h3>
                  <p className="mt-1 text-muted">Your latest reviews appear here.</p>
                </div>
              </div>
  
              <div className="mt-6 space-y-3 overflow-y-auto pr-1 lg:max-h-[calc(100vh-12rem)]">
                {reviews.length === 0 ? (
                  <p className="text-muted">No reviews yet. Be the first to share your experience.</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.Review_ID} className="card p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-charcoal dark:text-white">
                            Rating: {review.Rate} / 5
                          </p>
                          <p className="mt-1 text-amber-400 text-sm leading-none">
                            {Array.from({ length: review.Rate || 0 }).map(() => "★").join("")}
                            {Array.from({ length: 5 - (review.Rate || 0) }).map(() => "☆").join("")}
                          </p>
                        </div>
                        <span className="text-sm text-muted">
                          {review.customer
                            ? `${review.customer.First_Name || ""} ${review.customer.Last_Name || ""}`.trim()
                            : "Guest"}
                        </span>
                      </div>
                      <p className="mt-2 text-charcoal/80 dark:text-white/80">{review.Description}</p>
                      {Array.isArray(review.Photos) && review.Photos.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {review.Photos.map((photoUrl, photoIndex) => (
                            <a
                              key={photoUrl || photoIndex}
                              href={photoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block h-14 w-14 overflow-hidden rounded-lg border border-border-light dark:border-border-dark"
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
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }