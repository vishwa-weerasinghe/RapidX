const FALLBACK_PACKAGE_IMAGE =
  "https://images.unsplash.com/photo-1549366021-9f761d450615?q=80&w=2012&auto=format&fit=crop";

function backendBaseUrl() {
  const apiUrl = import.meta.env?.VITE_API_URL || "/api";
  if (apiUrl.startsWith("http")) return apiUrl.replace(/\/api\/?$/, "");
  return "http://127.0.0.1:8000";
}

export function resolvePackageImageUrl(value) {
  const imageUrl = String(value || "").trim();
  if (!imageUrl) return "";
  if (/^(https?:|data:|blob:)/i.test(imageUrl)) return imageUrl;
  const baseUrl = backendBaseUrl();
  if (imageUrl.startsWith("/storage/")) return `${baseUrl}${imageUrl}`;
  return `${baseUrl}/storage/${imageUrl.replace(/^\/+/, "")}`;
}

export function getPackageImageUrls(packageRecord) {
  const entries = Array.isArray(packageRecord?.images) ? packageRecord.images : [];
  const values = entries.map((entry) =>
    typeof entry === "string" ? entry : entry?.url || entry?.image_url || entry?.secure_url,
  ).filter(Boolean);

  if (packageRecord?.Image) values.push(packageRecord.Image);

  return [...new Set(values.map(resolvePackageImageUrl).filter(Boolean))];
}

export { FALLBACK_PACKAGE_IMAGE };