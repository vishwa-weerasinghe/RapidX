export const STATIC_BLOGS = [
  { blogId: 1, slug: "minneriya", title: "Minneriya National Park" },
  { blogId: 2, slug: "kaudulla", title: "Kaudulla National Park" },
  { blogId: 3, slug: "wasgamuwa", title: "Wasgamuwa National Park" },
  { blogId: 4, slug: "hurulu", title: "Hurulu Eco Park" },
  { blogId: 5, slug: "full-day-safari", title: "Full Day Safari Experience" },
  { blogId: 6, slug: "dambulla-safari", title: "Dambulla Safari" },
  { blogId: 7, slug: "hiriwadunna-village-tour", title: "Village Tour" },
  { blogId: 8, slug: "polonnaruwa-safari", title: "Polonnaruwa Ruins & Safari Tour" },
  { blogId: 9, slug: "sigiriya-pidurangala-safari", title: "Sigiriya / Pidurangala & Safari Tour" },
  { blogId: 10, slug: "sigiriya-village-tour", title: "Sigiriya Village Tour" },
];

export function getStaticBlog(blogId) {
  const normalizedBlogId = String(blogId ?? "").trim();

  return STATIC_BLOGS.find((blog) => String(blog.blogId) === normalizedBlogId);
}