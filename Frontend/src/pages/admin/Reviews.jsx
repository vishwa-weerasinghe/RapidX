import { useEffect, useState } from "react";
import api from "../../axios";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get("/reviews");
      setReviews(response.data || []);
      setError("");
    } catch (err) {
      setError("Unable to load reviews right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Manage Reviews</h1>
        <p className="mt-2 text-gray-600">Delete customer reviews from this admin page.</p>
      </div>

      {message ? <p className="rounded-lg bg-emerald-100 p-3 text-emerald-700">{message}</p> : null}
      {error ? <p className="rounded-lg bg-red-100 p-3 text-red-700">{error}</p> : null}

      {loading ? (
        <p className="text-gray-500">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500">No reviews found.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.Review_ID} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-800">Rating: {review.Rate} / 5</p>
                  <p className="text-sm text-gray-500">Customer ID: {review.Customer_ID || "Guest"}</p>
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
          ))}
        </div>
      )}
    </div>
  );
}
