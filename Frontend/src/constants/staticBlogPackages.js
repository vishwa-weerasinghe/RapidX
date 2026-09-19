/**
 * Static safari packages offered inside the blog pages
 * (src/pages/public/Blog.jsx -> blogSections[].tourPackages[]).
 *
 * The admin package form uses these names when linking a package to one of
 * the static blog offers.
 */
export const STATIC_BLOG_PACKAGES = [
  "Minneriya Morning Safari",
  "Minneriya Evening Safari",
  "Minneriya Half Day Safari (Morning or Evening)",
  "Kaudulla Morning Safari",
  "Kaudulla Evening Safari",
  "Kaudulla Half Day Safari (Morning or Evening)",
  "Wasgamuwa Safari (Morning or Evening)",
  "Hurulu Eco Park Safari (Morning or Evening)",
  "Hurulu Eco Park Half Day Safari",
  "Full Day Safari (Hurulu + Minneriya/Kaudulla)",
  "Dambulla Tour & Evening Safari",
  "Village Tour",
  "Polonnaruwa Ruins & Evening Safari",
  "Sigiriya or Pidurangala & Evening Safari",
  "Sigiriya Village Safari",
];

export function getStaticBlogPackage(name) {
  return STATIC_BLOG_PACKAGES.find((pkgName) => pkgName === name) || null;
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