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
            Customer_ID: customerId,
            Email: user?.Email || user?.email || "",
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