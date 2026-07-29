import { useEffect, useState } from "react";
import {
  MapPin,
  Users,
  Baby,
  Trees,
  ArrowRight,
} from "lucide-react";
import api from "../../axios";
import { useNavigate } from "react-router-dom";

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

  function handleBook(pkg) {
     navigate(`/user/booking/${pkg.id}`);
  }

  const filteredPackages = packages.filter((pkg) => {
    const query = search.trim().toLowerCase();

    return (
      pkg.Package_Name?.toLowerCase().includes(query) ||
      pkg.Description?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#F4F8F3]">
        <div className="w-14 h-14 border-[5px] border-green-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 rounded-xl p-6 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f4eb] via-[#f2ebdc] to-[#e4edd8] dark:from-[#050505] dark:via-[#0d0d0d] dark:to-[#111b14] py-12 px-6 text-[#1f2b20] dark:text-[#f5f7f2]">

      {/* Heading */}
      <div className="text-center mb-14">

        <p className="uppercase tracking-[5px] text-green-700 font-semibold">
          Explore Nature
        </p>

        <h1 className="text-5xl font-black text-[#1F3D2B] mt-2">
          Wild Safari Packages
        </h1>

        <p className="text-gray-600 max-w-2xl mx-auto mt-4 text-lg">
        Discover breathtaking wildlife adventures through carefully curated safari 
        experiences designed to create unforgettable journeys.
        </p>

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search safari packages..."
          aria-label="Search safari packages"
          className="w-full max-w-xl mx-auto mt-8 block rounded-xl border border-[#cfe0c8] dark:border-[#1e3a23] bg-[#fcfaf5] dark:bg-[#0d0d0d] px-4 py-3 text-[#1f2b20] dark:text-[#f5f7f2] outline-none focus:ring-2 focus:ring-emerald-600"
        />
      </div>

      {filteredPackages.length === 0 ? (
        <div className="text-center text-xl text-gray-500">
          {packages.length === 0
            ? "No Safari Packages Available"
            : "No safari packages match your search."}
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-10">

          {filteredPackages.map((pkg) => (

            <div
              key={pkg.id}
              className="group rounded-3xl overflow-hidden bg-[#fcfaf5]/90 dark:bg-[#0d0d0d]/95 backdrop-blur-md shadow-lg hover:shadow-2xl transition duration-500 hover:-translate-y-3 border border-[#dce8d7] dark:border-[#15311f]"
            >

              {/* Image */}

              <div className="relative overflow-hidden h-60">

                <img
                  src={
                    pkg.Image
                      ? `http://127.0.0.1:8000/storage/${pkg.Image}`
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

                <p className="text-gray-600 leading-relaxed mb-6 line-clamp-4">
                  {pkg.Description}
                </p>

                <div className="space-y-3 mb-6">

                  <div className="flex justify-between items-center">

                    <div className="flex items-center gap-2">

                      <Users
                        size={18}
                        className="text-green-700"
                      />

                      <span>Adult</span>

                    </div>

                    <span className="font-bold text-green-800">
                      Rs. {pkg.Price_for_adult}
                    </span>

                  </div>

                  <div className="flex justify-between items-center">

                    <div className="flex items-center gap-2">

                      <Baby
                        size={18}
                        className="text-green-700"
                      />

                      <span>Child</span>

                    </div>

                    <span className="font-bold text-green-800">
                      Rs. {pkg.Price_for_child}
                    </span>

                  </div>

                </div>

                <button
                  onClick={() => handleBook(pkg)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-green-700 to-emerald-600 hover:from-emerald-600 hover:to-green-800 text-white font-semibold transition duration-300 flex justify-center items-center gap-2"
                >
                  Book Safari
                  <ArrowRight size={18} />
                </button>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}
