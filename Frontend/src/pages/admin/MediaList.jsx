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
          <h1 className="text-3xl md:text-4xl font-black text-[#29AB87] dark:text-white tracking-tight">Media Gallery</h1>
          <p className="text-sm text-muted mt-1">Upload and manage promotional images, safari banners, and gallery photos.</p>
        </div>
        <button
          onClick={() => navigate("/admin/media/create")}
          className="btn-primary"
        >
          <span>+ Add Media</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted animate-pulse">Loading gallery items...</p>
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border-light dark:border-border-dark rounded-xl">
          <p className="text-muted mb-2">No media items found in the gallery.</p>
          <button
            onClick={() => navigate("/admin/media/create")}
            className="text-sacramento hover:text-sacramento-600 text-sm font-semibold"
          >
            Upload your first image
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {media.map((item) => (
            <div
              key={item.id}
              className="group card overflow-hidden hover:shadow-md transition duration-300 flex flex-col"
            >
              {/* Image Container with Hover Effect */}
              <div className="relative aspect-video w-full bg-surface-2 overflow-hidden">
                <img
                  src={item.file_path}
                  alt={item.title}
                  className="object-cover w-full h-full transform group-hover:scale-105 transition duration-500"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1547900596-f2c12fc30227?auto=format&fit=crop&q=80&w=400";
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition duration-300" />
              </div>

              {/* Text Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-charcoal dark:text-white line-clamp-1 group-hover:text-sacramento transition">
                    {item.title}
                  </h3>
                  {item.description ? (
                    <p className="text-xs text-muted mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  ) : (
                    <p className="text-xs text-muted/60 mt-1 italic">No description provided</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-border-light dark:border-border-dark mt-4 pt-3">
                  <span className="text-[10px] text-muted/70 uppercase tracking-wider font-semibold font-mono">
                    ID: #{item.id}
                  </span>
                  <div className="flex gap-3">
                    <Link
                      to={`/admin/media/${item.id}/edit`}
                      className="text-xs text-sacramento hover:text-sacramento-600 font-semibold"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-xs text-red-600 hover:text-red-700 font-semibold dark:text-red-400"
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