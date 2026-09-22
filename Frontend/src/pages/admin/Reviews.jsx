import { useEffect, useState, useRef } from "react";
import api from "../../axios";
import { Trash2 } from "lucide-react";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [newReviewIds, setNewReviewIds] = useState(new Set());
  const [notificationReviewIds, setNotificationReviewIds] = useState(new Set());
  const [showNewOnly, setShowNewOnly] = useState(false);
  const reviewsRef = useRef(reviews);

  const getReviewId = (review) => Number(review?.Review_ID || 0);

  const isTripAdvisorReview = (review) => {
    return `${review?.source || review?.Source || ""}`.toLowerCase() === "tripadvisor";
  };

  const getSystemReviews = (items) => items.filter((review) => !isTripAdvisorReview(review));

  useEffect(() => {
    reviewsRef.current = reviews;
  }, [reviews]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get("/reviews");
      const data = getSystemReviews(response.data || []);
      setReviews(data);
      setError("");

      const storedLastId = parseInt(localStorage.getItem("lastSeenReviewId") || "0", 10);
      const unseenIds = new Set(
        data.filter((r) => getReviewId(r) > storedLastId).map((r) => getReviewId(r))
      );
      setNewReviewIds(unseenIds);
    } catch (err) {
      setError("Unable to load reviews right now.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get("/reviews/analytics");
      setAnalytics(response.data);
    } catch {
      setAnalytics(null);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      api
        .get("/reviews")
        .then((res) => {
          const latest = getSystemReviews(res.data || []);
          const currentMaxId =
            reviewsRef.current.length > 0
              ? Math.max(...reviewsRef.current.map((r) => getReviewId(r)))
              : 0;
          const latestMaxId =
            latest.length > 0 ? Math.max(...latest.map((r) => getReviewId(r))) : 0;

          if (latestMaxId > currentMaxId) {
            setReviews(latest);
          }

          const storedLastId = parseInt(localStorage.getItem("lastSeenReviewId") || "0", 10);
          const unseenIds = new Set(
            latest.filter((r) => getReviewId(r) > storedLastId).map((r) => getReviewId(r))
          );
          setNewReviewIds(unseenIds);
        })
        .catch(() => { });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/reviews/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setReviews((prev) => prev.filter((review) => getReviewId(review) !== Number(reviewId)));
      setMessage("Review deleted successfully.");
      fetchAnalytics();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete review.");
    }
  };

  const handleBellClick = () => {
    if (showNewOnly) {
      setShowNewOnly(false);
      setNotificationReviewIds(new Set());
      return;
    }

    if (newReviewIds.size === 0) return;

    setNotificationReviewIds(new Set(newReviewIds));

    const maxId = reviews.length > 0
      ? Math.max(...reviews.map((r) => getReviewId(r)))
      : 0;
    localStorage.setItem("lastSeenReviewId", String(maxId));
    setNewReviewIds(new Set());
    setShowNewOnly(true);
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = review.Description
      ? review.Description.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    if (!showNewOnly) return matchesSearch;
    return matchesSearch && notificationReviewIds.has(getReviewId(review));
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-[#29AB87] dark:text-white tracking-tight">Manage Reviews</h1>
          <p className="mt-2 text-muted">Delete customer reviews from this admin page.</p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={handleBellClick}
            className="relative rounded-full card p-2 shadow-sm hover:bg-offwhite-100 dark:hover:bg-surface-2"
            title={showNewOnly ? "Show all reviews" : "Show new reviews"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {newReviewIds.size > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                {newReviewIds.size}
              </span>
            )}
          </button>
        </div>
      </div>

      {message ? <p className="rounded-lg bg-sacramento/10 p-3 text-sacramento">{message}</p> : null}
      {error ? <p className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 dark:bg-red-950/30 dark:border-red-900/30 dark:text-red-400">{error}</p> : null}

      {/* ── Rating Analytics ── */}
      {analytics && (
        <div className="card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-charcoal dark:text-white">Rating Analytics</h2>
              <p className="text-xs text-muted mt-0.5">Review feedback breakdown by rating</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-sacramento/10 px-3 py-1.5 text-xs font-bold text-sacramento dark:text-castleton-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.539 1.118l-3.366-2.445a1 1 0 00-1.176 0l-3.366 2.445c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.98 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.951-.69l1.286-3.958z" />
              </svg>
              Live Insights
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl bg-sacramento/10 dark:bg-sacramento-900/20 p-4 ring-1 ring-sacramento/20 dark:ring-sacramento-900/30">
              <p className="text-2xl font-extrabold text-charcoal dark:text-white leading-none">
                {analytics.average_rating} / 5
              </p>
              <p className="text-xs font-semibold text-muted mt-2">Average Rating</p>
            </div>
            <div className="rounded-xl bg-sacramento/10 dark:bg-sacramento-900/20 p-4 ring-1 ring-sacramento/20 dark:ring-sacramento-900/30">
              <p className="text-2xl font-extrabold text-charcoal dark:text-white leading-none">
                {analytics.total_reviews}
              </p>
              <p className="text-xs font-semibold text-muted mt-2">Total Reviews</p>
            </div>
            <div className="rounded-xl bg-green-50 dark:bg-green-950/20 p-4 ring-1 ring-green-100 dark:ring-green-900/30">
              <p className="text-2xl font-extrabold text-green-700 dark:text-green-400 leading-none">
                {analytics.positive_percentage}%
              </p>
              <p className="text-xs font-semibold text-muted mt-2">Positive (4-5 ★)</p>
            </div>
            <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-4 ring-1 ring-red-100 dark:ring-red-900/30">
              <p className="text-2xl font-extrabold text-red-600 dark:text-red-400 leading-none">
                {analytics.negative_reviews}
              </p>
              <p className="text-xs font-semibold text-muted mt-2">Negative (1-2 ★)</p>
            </div>
          </div>

          {/* Per-rating distribution bars */}
          <div className="space-y-2.5">
            {(analytics.rating_distribution || []).map((row) => {
              const maxCount = Math.max(
                ...(analytics.rating_distribution || []).map((r) => r.count),
                1
              );
              const barWidth = row.count > 0 ? (row.count / maxCount) * 100 : 0;
              return (
                <div key={row.rating} className="flex items-center gap-3">
                  <span className="w-12 flex items-center justify-end gap-0.5 text-sm font-bold text-charcoal dark:text-white shrink-0">
                    {row.rating}
                    <span className="text-amber-400">★</span>
                  </span>
                  <div className="flex-1 h-2.5 rounded-full bg-offwhite-200 dark:bg-surface-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-sacramento dark:bg-castleton-300 transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <span className="w-20 text-right text-xs font-semibold text-muted shrink-0">
                    {row.count} ({row.percentage}%)
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-4 pt-1 text-xs font-semibold text-muted border-t border-[var(--border)]">
            <span>Neutral (3 ★): {analytics.neutral_reviews}</span>
            <span>Highest: {analytics.highest_rating || "—"} ★</span>
            <span>Lowest: {analytics.lowest_rating || "—"} ★</span>
            <span>Most common: {analytics.most_common_rating || "—"} ★</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex w-full md:w-1/2">
          <input
            type="text"
            placeholder="Search reviews by keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input flex-1"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-muted">Loading reviews...</p>
      ) : filteredReviews.length === 0 ? (
        <p className="text-muted">
          {showNewOnly ? "No new reviews." : "No reviews found."}
        </p>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => {
            const reviewId = getReviewId(review);
            const isNew = newReviewIds.has(reviewId) || notificationReviewIds.has(reviewId);
            return (
              <div
                key={reviewId}
                className={`card p-4 ${isNew
                    ? "border-sacramento ring-1 ring-sacramento/30"
                    : ""
                  }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-charcoal dark:text-white">
                      Rating: {review.Rate} / 5
                    </p>
                    <p className="mt-1 text-amber-400 text-sm leading-none">
                      {Array.from({ length: review.Rate || 0 }).map(() => "★").join("")}
                      {Array.from({ length: 5 - (review.Rate || 0) }).map(() => "☆").join("")}
                    </p>
                    <p className="text-sm text-muted">
                      {review.customer
                        ? `${review.customer.First_Name || ""} ${review.customer.Last_Name || ""}`.trim()
                        : "Guest"}
                    </p>
                    <p className="mt-3 text-charcoal/80 dark:text-white/80">{review.Description}</p>
                  </div>

                  <button
                    onClick={() => handleDelete(review.Review_ID)}
                    className="btn-danger"
                    title="Delete review"
                    aria-label="Delete review"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showNewOnly && newReviewIds.size === 0 && !loading && (
        <p className="mt-2 text-sm text-muted">No new reviews to show.</p>
      )}
    </div>
  );
}