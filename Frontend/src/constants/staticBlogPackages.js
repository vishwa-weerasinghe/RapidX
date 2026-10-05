/**
 * Static safari packages offered inside the blog pages
 * (src/pages/public/Blog.jsx -> blogSections[].tourPackages[]).
 *
 * The admin package form uses these names when linking a package to one of
 * the static blog offers.
 */
export const STATIC_BLOG_PACKAGES = [
  { id: 101, name: "Minneriya Morning Safari" },
  { id: 102, name: "Minneriya Evening Safari" },
  { id: 103, name: "Minneriya Half Day Safari (Morning or Evening)" },
  { id: 201, name: "Kaudulla Morning Safari" },
  { id: 202, name: "Kaudulla Evening Safari" },
  { id: 203, name: "Kaudulla Half Day Safari (Morning or Evening)" },
  { id: 301, name: "Wasgamuwa Safari (Morning or Evening)" },
  { id: 401, name: "Hurulu Eco Park Safari (Morning or Evening)" },
  { id: 402, name: "Hurulu Eco Park Half Day Safari" },
  { id: 501, name: "Full Day Safari (Hurulu + Minneriya/Kaudulla)" },
  { id: 601, name: "Dambulla Tour & Evening Safari" },
  { id: 701, name: "Village Tour" },
  { id: 801, name: "Polonnaruwa Ruins & Evening Safari" },
  { id: 901, name: "Sigiriya or Pidurangala & Evening Safari" },
  { id: 1001, name: "Sigiriya Village Safari" },
];

export function getStaticBlogPackage(name) {
  return STATIC_BLOG_PACKAGES.find((pkg) => pkg.name === name) || null;
}

/**
 * Maps each static blog package to the blog section (anchor id) that lists
 * its details on the static blog page (src/pages/public/Blog.jsx).
 * Used by the package cards' "Read More" link -> /blog#<sectionId>.
 */
const STATIC_BLOG_PACKAGE_SECTIONS = {
  "Minneriya Morning Safari": "minneriya",
  "Minneriya Evening Safari": "minneriya",
  "Minneriya Half Day Safari (Morning or Evening)": "minneriya",
  "Kaudulla Morning Safari": "kaudulla",
  "Kaudulla Evening Safari": "kaudulla",
  "Kaudulla Half Day Safari (Morning or Evening)": "kaudulla",
  "Wasgamuwa Safari (Morning or Evening)": "wasgamuwa",
  "Hurulu Eco Park Safari (Morning or Evening)": "hurulu",
  "Hurulu Eco Park Half Day Safari": "hurulu",
  "Full Day Safari (Hurulu + Minneriya/Kaudulla)": "full-day-safari",
  "Dambulla Tour & Evening Safari": "dambulla-safari",
  "Village Tour": "hiriwadunna-village-tour",
  "Polonnaruwa Ruins & Evening Safari": "polonnaruwa-safari",
  "Sigiriya or Pidurangala & Evening Safari": "sigiriya-pidurangala-safari",
  "Sigiriya Village Safari": "sigiriya-village-tour",
};

export function getStaticBlogPackageSection(name) {
  return STATIC_BLOG_PACKAGE_SECTIONS[name] || null;
}