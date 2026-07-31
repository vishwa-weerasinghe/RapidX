import { useEffect, useState } from "react";
import api from "../../axios";

export default function Review() {
  const [rate, setRate] = useState(5);
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem("token")));

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
      const response = await api.post(
        "/reviews",
        {
          Rate: Number(rate),
          Description: description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(response.data?.message || "Thank you for your review!");
      setDescription("");
      setRate(5);
      fetchReviews();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit review right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f4eb] px-4 py-10 text-[#1f2b20] transition-colors duration-300 dark:bg-[#050505] dark:text-[#f5f7f2]">
      <div className="mx-auto max-w-2xl rounded-2xl border border-[#dce8d7] bg-[#fcfaf5] p-8 shadow-2xl dark:border-[#15311f] dark:bg-[#0d0d0d]">
        <h2 className="text-3xl font-bold">Write a Review</h2>
        <p className="mt-2 text-[#4b5d47] dark:text-[#b3c4b1]">Share your experience with our service.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">Rating</label>
            <select
              value={rate}
              onChange={(e) => setRate(e.target.value)}
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="5"
              required
              className="w-full rounded-lg border border-[#dce8d7] bg-[#fdfcf8] px-3 py-2 text-[#1f2b20] outline-none focus:ring-2 focus:ring-sacramento dark:border-[#15311f] dark:bg-[#111111] dark:text-[#f5f7f2]"
              placeholder="Tell us what you liked or what we can improve..."
            />
          </div>

          {message ? <p className="rounded-lg bg-castleton-50 p-3 text-sacramento dark:bg-sacramento-900/40 dark:text-castleton-300">{message}</p> : null}
          {error ? <p className="rounded-lg bg-red-100 p-3 text-red-700 dark:bg-red-950/40 dark:text-red-400">{error}</p> : null}

          <button
            type="submit"
            disabled={loading || !isLoggedIn}
            className="w-full rounded-lg bg-sacramento px-4 py-3 font-semibold text-offwhite transition hover:bg-sacramento-600 disabled:opacity-50"
          >
            {loading ? "Submitting..." : isLoggedIn ? "Submit Review" : "Log in to review"}
          </button>
        </form>

        <div className="mt-8 border-t border-[#dce8d7] pt-6 dark:border-[#15311f]">
          <h3 className="text-xl font-semibold">Recent Reviews</h3>
          <div className="mt-4 space-y-3">
            {reviews.length === 0 ? (
              <p className="text-[#4b5d47] dark:text-[#b3c4b1]">No reviews yet. Be the first to share your experience.</p>
            ) : (
              reviews.map((review) => (
                <div key={review.Review_ID} className="rounded-xl border border-[#dce8d7] bg-[#fdfcf8] p-4 dark:border-[#15311f] dark:bg-[#111111]">
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
