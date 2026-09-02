import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import SEO from "../../components/SEO";
import { ChevronLeft, Calendar, Clock, ArrowRight, MapPin } from "lucide-react";

import minneriyaImg from "../../assets/minneriya.jpg";
import kaudullaImg from "../../assets/kaudulla.jpg";
import wasgamuwaImg from "../../assets/wasgamuwa.jpg";
import huruluImg from "../../assets/hurulu.jpg";

const blogSections = [
  {
    id: "minneriya",
    title: "Minneriya National Park",
    subtitle: "The Great Elephant Gathering",
    tags: ["Wildlife", "Elephants", "Dry Season"],
    readTime: "4 min read",
    date: "Aug 15, 2026",
    img: minneriyaImg,
    paragraphs: [
      'Minneriya National Park is world-renowned for the magnificent "Elephant Gathering" that occurs during the dry season, typically between July and October. Hundreds of wild elephants converge around the Minneriya tank to graze on the fresh grass revealed by the receding waters.',
      "Spanning over 8,800 hectares, the park offers a diverse landscape of dry tropical forest, grasslands, and wetlands. Beyond elephants, you might spot leopards, sloth bears, sambar deer, and a vast array of bird species including painted storks, pelicans, and the endemic Sri Lanka junglefowl.",
      "Whether you are a wildlife enthusiast or a casual traveler, a safari here promises breathtaking scenery and unforgettable close encounters with nature at its most spectacular.",
    ],
  },
  {
    id: "kaudulla",
    title: "Kaudulla National Park",
    subtitle: "The Pristine Wildlife Corridor",
    tags: ["Bird Watching", "Jeep Safari", "Nature"],
    readTime: "3 min read",
    date: "Sep 2, 2026",
    img: kaudullaImg,
    paragraphs: [
      "Often seen as the sister park to Minneriya, Kaudulla National Park is another crucial wildlife corridor spanning approximately 6,900 hectares. It is centered around the ancient Kaudulla reservoir, built by King Mahasen.",
      "When the Minneriya tank fills up, the elephant herds naturally migrate to Kaudulla. A jeep safari here during the late afternoon offers spectacular views of large herds bathing, playing, and feeding against the stunning backdrop of the golden sunset.",
      "The park is also a haven for birdwatchers, with large flocks of cormorants, spot-billed pelicans, and grey herons. The undisturbed, pristine nature of Kaudulla makes it an essential stop for any true wildlife lover visiting Sri Lanka.",
    ],
  },
  {
    id: "wasgamuwa",
    title: "Wasgamuwa National Park",
    subtitle: "The Gathering Place of Bears",
    tags: ["Off The Beaten Path", "Sloth Bears", "Adventure"],
    readTime: "5 min read",
    date: "Oct 10, 2026",
    img: wasgamuwaImg,
    paragraphs: [
      "Wasgamuwa National Park is an off-the-beaten-path destination that offers a more remote and intimate safari experience. Bordered by the Mahaweli and Amban rivers, the park's dense forests and expansive grasslands are rich in biodiversity.",
      'The name "Wasgamuwa" translates to "gathering place of bears" in ancient Sinhala, paying tribute to the elusive sloth bears that inhabit the area. The park is also home to elephants, leopards, water buffalo, and marsh crocodiles.',
      "Because it is far less crowded than other parks, Wasgamuwa allows visitors to enjoy the wilderness in relative solitude. Its rugged beauty and ancient historical ruins add a unique and unforgettable charm to the safari adventure.",
    ],
  },
  {
    id: "hurulu",
    title: "Hurulu Eco Park",
    subtitle: "The Vital Elephant Corridor",
    tags: ["Eco Tourism", "Biosphere", "Leopards"],
    readTime: "3 min read",
    date: "Nov 5, 2026",
    img: huruluImg,
    paragraphs: [
      "Hurulu Eco Park forms a crucial link in the elephant corridor connecting Minneriya, Kaudulla, and other surrounding reserves. Covering around 10,000 hectares, it is proudly designated as a UNESCO biosphere reserve.",
      "During certain months when the water levels rise in Minneriya and Kaudulla, the elephant herds seek refuge in the dense vegetation of Hurulu Eco Park, making it a location for year-round elephant sightings in the region.",
      "The park's unique terrain offers an adventurous jeep ride through narrow trails and thick scrub. Keep your eyes peeled for raptors, wild boar, and the elusive Sri Lankan leopard that calls this park home.",
    ],
  },
];

export default function Blog() {
  const { theme } = useTheme();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("");

  const isDark = theme === "dark";

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -70% 0px" }
    );
    const sections = document.querySelectorAll("article[id]");
    sections.forEach((s) => observer.observe(s));
    return () => sections.forEach((s) => observer.unobserve(s));
  }, []);

  return (
    <>
      <SEO
        title="Safari Blog & Travel Guides | Wild Jeep Safari"
        description="Explore our travel guides for Minneriya, Kaudulla, Wasgamuwa, and Hurulu Eco Park."
      />

      <div
        className={`min-h-screen transition-colors duration-300 ${
          isDark ? "bg-neutral-950 text-neutral-100" : "bg-white text-neutral-900"
        }`}
      >
        {/* Top Navigation Bar */}
        <header
          className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
            isDark
              ? "bg-neutral-950/95 border-neutral-800"
              : "bg-white/95 border-neutral-100"
          } backdrop-blur-md`}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-sacramento transition-colors"
            >
              <ChevronLeft size={18} />
              <span>Back to Home</span>
            </Link>
            <p
              className={`text-xs font-bold uppercase tracking-widest hidden sm:block ${
                isDark ? "text-neutral-500" : "text-neutral-400"
              }`}
            >
              Safari Travel Blog
            </p>
            <div className="w-28 hidden sm:block" />
          </div>
        </header>

        {/* Mobile Quick Links (Header) */}
        <div
          className={`border-b lg:hidden transition-colors duration-300 ${
            isDark ? "border-neutral-800" : "border-neutral-100"
          }`}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-wrap gap-2">
              {blogSections.map((s) => (
                <a
                  key={`mobile-toc-${s.id}`}
                  href={`#${s.id}`}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                    isDark
                      ? "border-neutral-700 text-neutral-300 hover:border-sacramento hover:text-sacramento"
                      : "border-neutral-200 text-neutral-600 hover:border-sacramento hover:text-sacramento"
                  }`}
                >
                  {s.title.split(" ")[0]}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 flex gap-12 lg:gap-16">
          {/* Sticky Sidebar TOC — desktop only */}
          <aside className="hidden lg:block w-52 shrink-0">
            <div className="sticky top-24">
              <p
                className={`text-[11px] font-bold uppercase tracking-widest mb-4 ${
                  isDark ? "text-neutral-500" : "text-neutral-400"
                }`}
              >
                In this blog
              </p>
              <nav className="space-y-1">
                {blogSections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className={`block text-sm py-1.5 pl-3 border-l-2 transition-all duration-200 ${
                      activeSection === s.id
                        ? "border-sacramento text-sacramento font-semibold"
                        : `border-transparent ${
                            isDark
                              ? "text-neutral-500 hover:text-neutral-300 hover:border-neutral-600"
                              : "text-neutral-400 hover:text-neutral-700 hover:border-neutral-300"
                          }`
                    }`}
                  >
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Articles */}
          <main className="flex-1 min-w-0 space-y-16 sm:space-y-20">
            {blogSections.map((section, index) => (
              <article key={section.id} id={section.id} className="scroll-mt-20">
                {/* Image */}
                <div className="rounded-xl sm:rounded-2xl overflow-hidden mb-6 sm:mb-8 aspect-[16/9] shadow-sm">
                  <img
                    src={section.img}
                    alt={section.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {section.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        isDark
                          ? "bg-neutral-800 text-neutral-300"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1.5 leading-tight">
                  {section.title}
                </h2>
                <p
                  className={`text-base sm:text-lg mb-4 ${
                    isDark ? "text-neutral-400" : "text-neutral-500"
                  }`}
                >
                  {section.subtitle}
                </p>

                {/* Meta */}
                <div
                  className={`flex flex-wrap items-center gap-3 sm:gap-5 text-xs font-medium mb-6 pb-6 border-b ${
                    isDark
                      ? "text-neutral-500 border-neutral-800"
                      : "text-neutral-400 border-neutral-100"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    {section.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} />
                    {section.readTime}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} />
                    Sri Lanka
                  </span>
                </div>

                {/* Body */}
                <div
                  className={`space-y-4 text-sm sm:text-base leading-relaxed ${
                    isDark ? "text-neutral-300" : "text-neutral-600"
                  }`}
                >
                  {section.paragraphs.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>

                {/* Book CTA */}
                <div className="mt-8">
                  <Link
                    to="/#packages"
                    className="inline-flex items-center gap-2 bg-sacramento hover:bg-castleton text-white text-sm font-bold px-5 py-3 rounded-xl shadow-sm hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Explore Packages
                    <ArrowRight size={16} />
                  </Link>
                </div>

                {/* Divider (not after last) */}
                {index < blogSections.length - 1 && (
                  <div
                    className={`mt-14 sm:mt-16 border-t ${
                      isDark ? "border-neutral-800" : "border-neutral-100"
                    }`}
                  />
                )}
              </article>
            ))}
          </main>
        </div>
      </div>
    </>
  );
}
