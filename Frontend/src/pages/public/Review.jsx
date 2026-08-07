import { useEffect, useState } from "react";
import api from "../../axios";

const defaultReviewForm = { name: "", email: "", rating: 5, message: "" };

export default function Review({
  reviews: providedReviews,
  renderReviewCard,
  title = "Write a Review",
  description = "Share your experience with our service.",
  layout = "section",
}) {
  const [reviewForm, setReviewForm] = useState(defaultReviewForm);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [fetchedReviews, setFetchedReviews] = useState([]);
  const [submittedReviews, setSubmittedReviews] = useState([]);

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
    if (Array.isArray(providedReviews)) return;
    fetchReviews();
  }, [providedReviews]);

  const setTimedNotification = (nextNotification) => {
    setNotification(nextNotification);
    window.setTimeout(() => setNotification(null), 4000);
  };

  const handleReviewFormChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
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
      const response = await api.post("/reviews", {
        Rate: Number(reviewForm.rating) || 5,
        Description: reviewForm.message.trim(),
        Email: reviewForm.email.trim(),
      });

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
    } catch (err) {
      setTimedNotification({
        text: err.response?.data?.message || "Your email has not been used for booking.",
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

  const reviewsBody = (
    <div className="mt-8 border-t border-[#dce8d7] pt-6 dark:border-[#15311f]">
      <h3 className="text-xl font-semibold">Recent Reviews</h3>
      <div className="mt-4 space-y-3">
        {visibleReviews.length === 0 ? (
          <p className="text-[#4b5d47] dark:text-[#b3c4b1]">No reviews yet. Be the first to share your experience.</p>
        ) : (
          visibleReviews.map((review) => (
            renderCard(review, review.Review_ID || review.review_id || review.id || Math.random())
          ))
        )}
      </div>
    </div>
  );

  if (layout === "standalone") {
    return (
      <div className="min-h-screen bg-[#f8f4eb] px-4 py-10 text-[#1f2b20] transition-colors duration-300 dark:bg-[#050505] dark:text-[#f5f7f2]">
        <div className="mx-auto max-w-2xl rounded-2xl border border-[#dce8d7] bg-[#fcfaf5] p-8 shadow-2xl dark:border-[#15311f] dark:bg-[#0d0d0d]">
          <h2 className="text-3xl font-bold">{title}</h2>
          <p className="mt-2 text-[#4b5d47] dark:text-[#b3c4b1]">{description}</p>
          {formBody}
          {reviewsBody}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 lg:items-start">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibleReviews.map((rev, index) => renderCard(rev, index))}
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
