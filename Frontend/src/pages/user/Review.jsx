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
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <h2 className="text-3xl font-bold">Write a Review</h2>
        <p className="mt-2 text-slate-400">Share your experience with our service.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">Rating</label>
            <select
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
            >
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Very good</option>
              <option value="3">3 - Good</option>
              <option value="2">2 - Fair</option>
              <option value="1">1 - Poor</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Your feedback</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="5"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
              placeholder="Tell us what you liked or what we can improve..."
            />
          </div>

          {message ? <p className="rounded-lg bg-emerald-600/20 p-3 text-emerald-300">{message}</p> : null}
          {error ? <p className="rounded-lg bg-red-600/20 p-3 text-red-300">{error}</p> : null}

          <button
            type="submit"
            disabled={loading || !isLoggedIn}
            className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
          >
            {loading ? "Submitting..." : isLoggedIn ? "Submit Review" : "Log in to review"}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-800 pt-6">
          <h3 className="text-xl font-semibold">Recent Reviews</h3>
          <div className="mt-4 space-y-3">
            {reviews.length === 0 ? (
              <p className="text-slate-400">No reviews yet. Be the first to share your experience.</p>
            ) : (
              reviews.map((review) => (
                <div key={review.Review_ID} className="rounded-xl border border-slate-800 bg-slate-800/70 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">{Array.from({ length: review.Rate || 0 }).map(() => "★").join("")}</p>
                    <span className="text-sm text-slate-400">Customer #{review.Customer_ID || "Guest"}</span>
                  </div>
                  <p className="mt-2 text-slate-300">{review.Description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
