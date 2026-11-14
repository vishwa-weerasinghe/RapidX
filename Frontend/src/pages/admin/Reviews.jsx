import { useEffect, useState, useRef } from "react";
import api from "../../axios";
import { getApiErrorMessage } from "../../utils/apiErrorMessage";
import { ADMIN_REVIEW_NOTIFICATIONS_VIEWED } from "../../constants/notificationEvents";
import { Trash2, Star, Search, X, Bell, RefreshCw, Sparkles, MessageSquareQuote } from "lucide-react";

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
      window.dispatchEvent(new CustomEvent(ADMIN_REVIEW_NOTIFICATIONS_VIEWED));
    } catch {
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
        .catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this customer review?")) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/reviews/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setReviews((prev) => prev.filter((review) => getReviewId(review) !== Number(reviewId)));
      setMessage("Review deleted successfully.");
      setTimeout(() => setMessage(""), 3500);
      fetchAnalytics();
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, "Unable to delete review."));
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

    const maxId =
      reviews.length > 0 ? Math.max(...reviews.map((r) => getReviewId(r))) : 0;
    localStorage.setItem("lastSeenReviewId", String(maxId));
    setNewReviewIds(new Set());
    window.dispatchEvent(new CustomEvent(ADMIN_REVIEW_NOTIFICATIONS_VIEWED));
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
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Header Area */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-sacramento/10 dark:bg-sacramento-900/40 text-sacramento dark:text-sacramento-300">
            <Star size={24} strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Manage Guest Reviews
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Monitor customer feedback sentiment, satisfaction rates, and moderation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleBellClick}
            className={`relative p-2.5 rounded-xl border transition-all ${
              newReviewIds.size > 0
                ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                : "bg-white dark:bg-[#16231c] border-border-light dark:border-border-dark text-slate-600 dark:text-slate-300 hover:text-sacramento dark:hover:text-sacramento-300"
            }`}
            title={showNewOnly ? "Show all reviews" : "Show new reviews"}
          >
            <Bell size={18} className={newReviewIds.size > 0 ? "animate-bounce" : ""} />
            {newReviewIds.size > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold text-white shadow-sm">
                {newReviewIds.size}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              fetchReviews();
              fetchAnalytics();
            }}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white dark:bg-[#16231c] border border-border-light dark:border-border-dark text-slate-600 dark:text-slate-300 hover:text-sacramento transition-colors"
            title="Refresh Reviews"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
          {message}
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 text-xs font-bold">
          {error}
        </div>
      )}

      {/* ── Rating Analytics Section ── */}
      {analytics && (
        <div className="rounded-3xl bg-white dark:bg-[#16231c] border border-border-light dark:border-border-dark/60 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-sacramento dark:text-sacramento-300" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Rating Analytics & Insights
              </h2>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-sacramento/10 text-sacramento dark:text-sacramento-300 border border-sacramento/20">
              Live Verified
            </span>
          </div>

          {/* Metric KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700/40">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {analytics.average_rating} <span className="text-sm font-semibold text-slate-400">/ 5</span>
              </span>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Average Score</p>
            </div>
            <div className="p-4 rounded-2xl bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-200 dark:border-yellow-700/40">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {analytics.total_reviews}
              </span>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Total Submissions</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400">
                {analytics.positive_percentage}%
              </span>
              <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mt-1">Positive (4-5 ★)</p>
            </div>
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <span className="text-2xl sm:text-3xl font-black text-rose-700 dark:text-rose-400">
                {analytics.negative_reviews}
              </span>
              <p className="text-xs font-semibold text-rose-800 dark:text-rose-300 mt-1">Negative (1-2 ★)</p>
            </div>
          </div>

          {/* Rating Distribution Bars */}
          <div className="space-y-2 pt-2">
            {(analytics.rating_distribution || []).map((row) => {
              const maxCount = Math.max(
                ...(analytics.rating_distribution || []).map((r) => r.count),
                1
              );
              const barWidth = row.count > 0 ? (row.count / maxCount) * 100 : 0;
              return (
                <div key={row.rating} className="flex items-center gap-3 text-xs">
                  <span className="w-12 flex items-center justify-end gap-1 font-bold text-slate-800 dark:text-slate-200 shrink-0">
                    {row.rating}
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-surface-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-sacramento dark:bg-castleton-400 transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <span className="w-16 text-right font-mono text-[11px] font-semibold text-slate-400 shrink-0">
                    {row.count} ({row.percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white dark:bg-[#16231c] p-3.5 sm:p-4 rounded-2xl border border-border-light dark:border-border-dark/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search reviews by keyword, message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2 rounded-xl text-sm bg-slate-50 dark:bg-surface-2 border border-slate-200/80 dark:border-border-dark text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sacramento/30"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between sm:justify-end gap-3">
          <span>{filteredReviews.length} review{filteredReviews.length === 1 ? "" : "s"} shown</span>
          {showNewOnly && (
            <button
              onClick={() => setShowNewOnly(false)}
              className="text-xs font-bold text-sacramento dark:text-sacramento-300 underline"
            >
              Show all reviews
            </button>
          )}
        </div>
      </div>

      {/* Reviews Feed */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full border-3 border-emerald-100 border-t-sacramento animate-spin" />
          <p className="text-sm font-semibold text-slate-400 animate-pulse">Loading feedback records...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white dark:bg-[#16231c] rounded-3xl border border-border-light dark:border-border-dark/60 p-12 text-center">
          <MessageSquareQuote size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {showNewOnly ? "No new unread reviews." : "No reviews match your search filter."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((review) => {
            const reviewId = getReviewId(review);
            const isNew = newReviewIds.has(reviewId) || notificationReviewIds.has(reviewId);
            const customerName = review.customer
              ? `${review.customer.First_Name || ""} ${review.customer.Last_Name || ""}`.trim()
              : "Guest Traveler";
            const initial = (customerName[0] ?? "G").toUpperCase();

            return (
              <div
                key={reviewId}
                className={`rounded-3xl bg-white dark:bg-[#16231c] p-5 sm:p-6 border transition-all duration-300 shadow-sm flex flex-col justify-between ${
                  isNew
                    ? "border-sacramento dark:border-sacramento-400 ring-2 ring-sacramento/20"
                    : "border-border-light dark:border-border-dark/60"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sacramento to-castleton-400 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        {initial}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {customerName}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">
                          #{reviewId}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-extrabold text-amber-700 dark:text-amber-400">
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                      <span>{review.Rate} / 5</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic mt-2">
                    &quot;{review.Description}&quot;
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-border-light/60 dark:border-border-dark/40">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={13}
                        className={
                          star <= (review.Rate || 0)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-200 dark:fill-slate-700 text-slate-200 dark:text-slate-700"
                        }
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => handleDelete(review.Review_ID)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
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
    </div>
  );
}