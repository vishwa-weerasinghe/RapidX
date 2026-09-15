import { useEffect, useState } from "react";
import {
  MapPin,
  Users,
  Baby,
  Trees,
  ArrowRight,
} from "lucide-react";
import api from "../../axios";
import { Link, useNavigate } from "react-router-dom";
import { getStaticBlog } from "../../constants/staticBlogs";

export default function Packages() {

  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await api.get("/packages");
      setPackages(res.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load safari packages.");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (pkg) => {
    if (pkg && (pkg.id || pkg.Package_ID)) {
      navigate(`/booking`, { state: { packageId: pkg.id || pkg.Package_ID } });
    } else {
      navigate(`/booking`);
    }
  };

  const filteredPackages = packages.filter((pkg) => {
    const query = search.trim().toLowerCase();

    return (
      pkg.Package_Name?.toLowerCase().includes(query) ||
      pkg.Description?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-offwhite dark:bg-bg-dark">
        <div className="w-14 h-14 border-[5px] border-sacramento border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 rounded-xl p-6 text-center dark:bg-red-950/30 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-offwhite via-offwhite-300 to-offwhite-200 dark:from-bg-dark dark:via-surface dark:to-bg-dark py-12 px-6 text-charcoal dark:text-white">

      {/* Heading */}
      <div className="text-center mb-14">

        <p className="uppercase tracking-[5px] text-sacramento font-semibold">
          Explore Nature
        </p>

        <h1 className="text-5xl font-black text-sacramento mt-2">
          Wild Safari Packages
        </h1>

        <p className="text-muted max-w-2xl mx-auto mt-4 text-lg">
          Discover breathtaking wildlife adventures through carefully curated safari
          experiences designed to create unforgettable journeys.
        </p>

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search safari packages..."
          aria-label="Search safari packages"
          className="form-input w-full max-w-xl mx-auto mt-8 block"
        />
      </div>

      {filteredPackages.length === 0 ? (
        <div className="text-center text-xl text-muted">
          {packages.length === 0
            ? "No Safari Packages Available"
            : "No safari packages match your search."}
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-10">

          {filteredPackages.map((pkg) => {
            const relatedBlog = getStaticBlog(pkg.blog_id);

            return (

            <div
              key={pkg.id}
              className="group rounded-3xl overflow-hidden card backdrop-blur-md shadow-lg hover:shadow-2xl transition duration-500 hover:-translate-y-3"
            >

              {/* Image */}

              <div className="relative overflow-hidden h-60">

                <img
                  src={
                    pkg.Image
                      ? pkg.Image.startsWith("http")
                        ? pkg.Image
                        : `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://127.0.0.1:8000'}/storage/${pkg.Image}`
                      : "https://images.unsplash.com/photo-1549366021-9f761d450615?q=80&w=2012&auto=format&fit=crop"
                  }
                  alt={pkg.Package_Name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

                <div className="absolute bottom-5 left-5">

                  <h2 className="text-2xl font-bold text-white">
                    {pkg.Package_Name}
                  </h2>

                </div>

              </div>

              {/* Body */}

              <div className="p-6">

                <p className="text-muted leading-relaxed mb-6 line-clamp-4">
                  {pkg.Description}
                </p>

                <div className="space-y-3 mb-6">

                  <div className="flex justify-between items-center">

                    <div className="flex items-center gap-2">

                      <Users
                        size={18}
                        className="text-sacramento"
                      />

                      <span>1 Adult</span>

                    </div>

                    <span className="font-bold text-sacramento">
                      $ {pkg.price_one_adult}
                    </span>

                  </div>

                  <div className="flex justify-between items-center">

                    <div className="flex items-center gap-2">

                      <Users
                        size={18}
                        className="text-sacramento"
                      />

                      <span>Per Adult (2+)</span>

                    </div>

                    <span className="font-bold text-sacramento">
                      $ {pkg.price_more_adult}
                    </span>

                  </div>

                  <div className="flex justify-between items-center">

                    <div className="flex items-center gap-2">

                      <Baby
                        size={18}
                        className="text-sacramento"
                      />

                      <span>Child</span>

                    </div>

                    <span className="font-bold text-sacramento">
                      $ {pkg.price_child}
                    </span>

                  </div>

                </div>

                <button
                  onClick={() => handleBook(pkg)}
                  className="btn-primary w-full py-3"
                >
                  Book Safari
                  <ArrowRight size={18} />
                </button>

                {relatedBlog && (
                  <Link
                    to={`/blog#${relatedBlog.slug}`}
                    className="mt-3 inline-flex items-center justify-center gap-1 text-sacramento font-semibold hover:underline"
                  >
                    Read More
                    <ArrowRight size={16} />
                  </Link>
                )}

              </div>

            </div>

            );
          })}

        </div>
      )}

    </div>
  );
}