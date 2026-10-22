import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Image, Plus, Edit3, Trash2, RefreshCw } from "lucide-react";
import api from "../../axios";

export default function MediaList() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await api.get("/media");
      setMedia(Array.isArray(res.data) ? res.data : []);
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
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Header Area */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-sacramento/10 dark:bg-sacramento-900/40 text-sacramento dark:text-sacramento-300">
            <Image size={24} strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Media Gallery
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Upload promotional banners, wildlife gallery captures, and safari photos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchMedia}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white dark:bg-[#16231c] border border-border-light dark:border-border-dark text-slate-600 dark:text-slate-300 hover:text-sacramento dark:hover:text-sacramento-300 transition-colors"
            title="Refresh Media"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => navigate("/admin/media/create")}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sacramento hover:bg-sacramento-600 dark:bg-castleton-500 dark:hover:bg-castleton-600 text-white font-bold text-sm shadow-sm transition-all active:scale-95"
          >
            <Plus size={16} />
            <span>Add Media</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full border-3 border-emerald-100 border-t-sacramento animate-spin" />
          <p className="text-sm font-semibold text-slate-400 animate-pulse">Loading gallery assets...</p>
        </div>
      ) : media.length === 0 ? (
        <div className="bg-white dark:bg-[#16231c] rounded-3xl border border-border-light dark:border-border-dark/60 p-12 text-center">
          <Image size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">No Media Files Available</h3>
          <p className="text-xs text-slate-400 mb-5">Upload high-resolution photography to enrich the public website.</p>
          <button
            onClick={() => navigate("/admin/media/create")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sacramento text-white text-xs font-bold"
          >
            <Plus size={14} /> Upload First Image
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {media.map((item) => (
            <div
              key={item.id}
              className="group rounded-3xl bg-white dark:bg-[#16231c] border border-border-light dark:border-border-dark/60 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image Preview with Hover Zoom */}
              <div className="relative aspect-video w-full bg-slate-100 dark:bg-surface-2 overflow-hidden">
                <img
                  src={item.file_path}
                  alt={item.title}
                  className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1547900596-f2c12fc30227?auto=format&fit=crop&q=80&w=400";
                  }}
                />
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white text-[10px] font-mono font-bold">
                  #{item.id}
                </div>
              </div>

              {/* Text Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-sacramento dark:group-hover:text-sacramento-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {item.description || "No description provided"}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-border-light/60 dark:border-border-dark/40">
                  <Link
                    to={`/admin/media/${item.id}/edit`}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-sacramento dark:hover:text-sacramento-300 hover:bg-slate-100 dark:hover:bg-surface-2 transition-colors"
                    title="Edit Media"
                  >
                    <Edit3 size={15} />
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Delete Media"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}