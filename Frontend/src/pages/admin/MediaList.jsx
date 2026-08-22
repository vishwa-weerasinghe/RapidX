import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../axios";

export default function MediaList() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Use relative file paths served by backend (proxied during dev)

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await api.get("/media");
      setMedia(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this media item?")) return;
    try {
      await api.delete(`/media/${id}`);
      setMedia((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete media item.");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Media Gallery</h1>
          <p className="text-sm text-gray-500 mt-1">Upload and manage promotional images, safari banners, and gallery photos.</p>
        </div>
        <button
          onClick={() => navigate("/admin/media/create")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-2"
        >
          <span>+ Add Media</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500 animate-pulse">Loading gallery items...</p>
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-500 mb-2">No media items found in the gallery.</p>
          <button
            onClick={() => navigate("/admin/media/create")}
            className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
          >
            Upload your first image
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {media.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-xl border border-gray-150 overflow-hidden shadow-sm hover:shadow-md transition duration-300 flex flex-col"
            >
              {/* Image Container with Hover Effect */}
              <div className="relative aspect-video w-full bg-gray-100 overflow-hidden">
                <img
                  src={item.file_path}
                  alt={item.title}
                  className="object-cover w-full h-full transform group-hover:scale-105 transition duration-500"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1547900596-f2c12fc30227?auto=format&fit=crop&q=80&w=400"; // fallback placeholder
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition duration-300" />
              </div>

              {/* Text Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800 line-clamp-1 group-hover:text-blue-600 transition">
                    {item.title}
                  </h3>
                  {item.description ? (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1 italic">No description provided</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-gray-100 mt-4 pt-3">
                  <span className="text-[10px] text-gray-450 uppercase tracking-wider font-semibold font-mono">
                    ID: #{item.id}
                  </span>
                  <div className="flex gap-3">
                    <Link
                      to={`/admin/media/${item.id}/edit`}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-xs text-red-650 hover:text-red-800 font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
