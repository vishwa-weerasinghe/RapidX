import { useEffect, useState, useRef } from "react";
import api from "../../axios";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
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

  useEffect(() => {
    fetchReviews();
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
                  >
                    Delete
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