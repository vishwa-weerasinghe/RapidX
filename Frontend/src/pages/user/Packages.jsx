import { useEffect, useState } from "react";
import {
  MapPin,
  Users,
  Baby,
  Trees,
  ArrowRight,
  Search,
  X,
  Compass,
  Sparkles,
} from "lucide-react";
import api from "../../axios";
import { Link, useNavigate } from "react-router-dom";
import { getStaticBlogPackageSection } from "../../constants/staticBlogPackages";
import ReserveNowNotice from "../../components/ReserveNowNotice";
import PackageImageCarousel from "../../components/PackageImageCarousel";
import { FALLBACK_PACKAGE_IMAGE, getPackageImageUrls } from "../../utils/packageImages";

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
      <div className="flex flex-col justify-center items-center h-screen gap-3 bg-slate-50 dark:bg-bg-dark">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-100 dark:border-emerald-950/40 border-t-sacramento dark:border-t-sacramento-300 animate-spin" />
        <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 animate-pulse">Loading safari packages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto my-16 bg-red-100 text-red-700 rounded-2xl p-6 text-center dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900/40">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-bg-dark py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-charcoal dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header Hero Section */}
        <div className="relative overflow-hidden rounded-3xl border border-border-light dark:border-border-dark/60 bg-white dark:bg-[#16231c] p-6 sm:p-10 shadow-sm mb-10 text-center">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-sacramento/10 dark:bg-sacramento-900/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-amber-500/10 dark:bg-amber-900/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sacramento/10 dark:bg-sacramento-900/40 text-sacramento dark:text-sacramento-300 text-xs font-bold mb-3 border border-sacramento/20">
              <Compass size={13} className="animate-spin-slow" />
              <span>Wild Adventures · Sri Lanka</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Wild Safari Packages
            </h1>

            <p className="text-muted dark:text-slate-400 mt-3 text-sm sm:text-base leading-relaxed">
              Discover breathtaking wildlife adventures through carefully curated safari
              experiences designed to create unforgettable journeys.
            </p>

            {/* Search Input Bar */}
            <div className="relative max-w-xl mx-auto mt-6">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search safari packages by name, park, or features..."
                aria-label="Search safari packages"
                className="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-50 dark:bg-surface-2 border border-slate-200/80 dark:border-border-dark text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sacramento/30 shadow-sm"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
                  title="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="mt-3 text-xs font-semibold text-slate-400 dark:text-slate-500">
              Showing {filteredPackages.length} of {packages.length} tour packages
            </div>
          </div>
        </div>

        {/* Reserve Now & Pay Later Notice */}
        <ReserveNowNotice className="mb-10" />

        {/* Packages Grid */}
        {filteredPackages.length === 0 ? (
          <div className="rounded-3xl border border-border-light dark:border-border-dark/60 bg-white dark:bg-[#16231c] p-12 text-center text-muted dark:text-slate-400 shadow-sm max-w-lg mx-auto">
            <Compass size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">
              {packages.length === 0
                ? "No Safari Packages Available"
                : "No matching packages found"}
            </h3>
            <p className="text-xs text-slate-400">
              {search
                ? `No packages match “${search}”. Try clearing your search.`
                : "Check back soon for new safari itineraries."}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sacramento/10 text-sacramento text-xs font-bold"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6 sm:gap-8">
            {filteredPackages.map((pkg) => {
              const packageImages = getPackageImageUrls(pkg);
              const relatedSection = getStaticBlogPackageSection(
                pkg.blog_id || pkg.related_package
              );

              return (
                <div
                  key={pkg.id}
                  className="group rounded-3xl overflow-hidden card backdrop-blur-md shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
                >
                  <div>
                    {/* Image Banner */}
                    <div className="relative overflow-hidden h-56 bg-slate-100 dark:bg-slate-800">
                      <PackageImageCarousel images={packageImages} fallbackSrc={FALLBACK_PACKAGE_IMAGE} alt={pkg.Package_Name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"></div>

                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
                          <Trees size={12} className="text-emerald-400" />
                          <span>Wild Tour</span>
                        </span>
                      </div>

                      <div className="absolute bottom-11 left-4 right-4 z-10">
                        <h2 className="text-xl font-extrabold text-white leading-snug drop-shadow-sm">
                          {pkg.Package_Name}
                        </h2>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-5 sm:p-6">
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6 line-clamp-3">
                        {pkg.Description || "Experience an unforgettable safari journey across stunning wildlife sanctuaries."}
                      </p>

                      {/* Tiered Pricing Badges */}
                      <div className="grid grid-cols-3 gap-2 mb-6 p-2.5 rounded-2xl bg-slate-50 dark:bg-surface-2/60 border border-slate-100 dark:border-border-dark/60 text-center">
                        <div className="p-1">
                          <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
                            1 Adult
                          </span>
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                            ${Number(pkg.price_one_adult ?? 0).toFixed(0)}
                          </span>
                        </div>

                        <div className="p-1 border-x border-slate-200/60 dark:border-border-dark/60">
                          <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
                            2+ Adults
                          </span>
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                            ${Number(pkg.price_more_adult ?? 0).toFixed(0)}
                          </span>
                        </div>

                        <div className="p-1">
                          <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
                            Child
                          </span>
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                            ${Number(pkg.price_child ?? 0).toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 space-y-2.5">
                    <button
                      type="button"
                      onClick={() => handleBook(pkg)}
                      className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-sacramento hover:bg-sacramento-600 dark:bg-castleton-500 dark:hover:bg-castleton-600 text-white font-bold text-sm shadow-sm hover:shadow transition-all active:scale-98 group"
                    >
                      <span>Book Safari</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    {relatedSection && (
                      <Link
                        to={`/blog#${relatedSection}`}
                        className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 text-xs text-sacramento dark:text-sacramento-300 font-bold hover:underline"
                      >
                        <span>Learn itinerary details</span>
                        <ArrowRight size={13} />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}