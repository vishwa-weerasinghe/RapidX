import { useEffect, useState, useRef } from "react";
import api from "../../axios";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [newReviewIds, setNewReviewIds] = useState(new Set());
  const [showNewOnly, setShowNewOnly] = useState(false);
  const reviewsRef = useRef(reviews);

  useEffect(() => {
    reviewsRef.current = reviews;
  }, [reviews]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get("/reviews");
      const data = response.data || [];
      setReviews(data);
      setError("");

      const storedLastId = parseInt(localStorage.getItem("lastSeenReviewId") || "0", 10);
      const unseenIds = new Set(
        data.filter((r) => r.Review_ID > storedLastId).map((r) => r.Review_ID)
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
          const latest = res.data || [];
          const currentMaxId =
            reviewsRef.current.length > 0
              ? Math.max(...reviewsRef.current.map((r) => r.Review_ID))
              : 0;
          const latestMaxId =
            latest.length > 0 ? Math.max(...latest.map((r) => r.Review_ID)) : 0;

          if (latestMaxId > currentMaxId) {
            setReviews(latest);
          }

          const storedLastId = parseInt(localStorage.getItem("lastSeenReviewId") || "0", 10);
          const unseenIds = new Set(
            latest.filter((r) => r.Review_ID > storedLastId).map((r) => r.Review_ID)
          );
          setNewReviewIds(unseenIds);
        })
        .catch(() => {});
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

      setReviews((prev) => prev.filter((review) => review.Review_ID !== reviewId));
      setMessage("Review deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete review.");
    }
  };

  const handleBellClick = () => {
    if (showNewOnly) {
      // Going back to all reviews - mark all as seen
      const maxId = reviews.length > 0
        ? Math.max(...reviews.map((r) => r.Review_ID))
        : 0;
      localStorage.setItem("lastSeenReviewId", String(maxId));
      setNewReviewIds(new Set());
    }
    setShowNewOnly((prev) => !prev);
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = review.Description
      ? review.Description.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    if (!showNewOnly) return matchesSearch;
    return matchesSearch && newReviewIds.has(review.Review_ID);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Reviews</h1>
          <p className="mt-2 text-gray-600">Delete customer reviews from this admin page.</p>
        </div>

        <div className="relative">
          <button
            onClick={handleBellClick}
            className="relative rounded-full bg-white p-2 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50"
            title={showNewOnly ? "Show all reviews" : "Show new reviews"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-600"
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
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {newReviewIds.size}
              </span>
            )}
          </button>
        </div>
      </div>

      {message ? <p className="rounded-lg bg-emerald-100 p-3 text-emerald-700">{message}</p> : null}
      {error ? <p className="rounded-lg bg-red-100 p-3 text-red-700">{error}</p> : null}

      <div className="flex items-center gap-3">
        <div className="flex w-full md:w-1/2">
          <input
            type="text"
            placeholder="Search reviews by keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-l-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <button className="rounded-r-lg bg-indigo-600 px-4 text-white hover:bg-indigo-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading reviews...</p>
      ) : filteredReviews.length === 0 ? (
        <p className="text-gray-500">
          {showNewOnly ? "No new reviews." : "No reviews found."}
        </p>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => {
            const isNew = newReviewIds.has(review.Review_ID);
            return (
              <div
                key={review.Review_ID}
                className={`rounded-xl border bg-white p-4 shadow-sm ${
                  isNew
                    ? "border-indigo-400 ring-1 ring-indigo-200"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-800">
                      Rating: {review.Rate} / 5
                    </p>
                    <p className="text-sm text-gray-500">
                      {review.customer
                        ? `${review.customer.First_Name || ""} ${review.customer.Last_Name || ""}`.trim()
                        : "Guest"}
                    </p>
                    <p className="mt-3 text-gray-700">{review.Description}</p>
                  </div>

                  <button
                    onClick={() => handleDelete(review.Review_ID)}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
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
        <p className="mt-2 text-sm text-gray-500">No new reviews to show.</p>
      )}
    </div>
  );
}