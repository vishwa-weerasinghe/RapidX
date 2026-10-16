import { useEffect } from "react";

/**
 * SEO Component — dynamically updates <head> meta tags per page/route.
 *
 * Usage:
 *   <SEO
 *     title="Book Your Safari | Minneriya Wild Jeep Safari"
 *     description="Book your jeep safari to Minneriya, Kaudulla or Wasgamuwa online."
 *     canonical="https://www.minneriyawildjeepsafari.com/booking"
 *   />
 *
 * Props:
 *   title       {string}  - Full page <title> (max ~60 chars)
 *   description {string}  - Meta description (max ~160 chars)
 *   canonical   {string}  - Canonical URL for this page (optional)
 *   robots      {string}  - Robots directive, e.g. "noindex" (optional)
 *   ogImage     {string}  - Override OG image URL (optional)
 */

const SITE_NAME = "Minneriya Wild Jeep Safari";
const DEFAULT_TITLE = `Minneriya Jeep Safari & Tours | Prices & Online Booking Sri Lanka`;
const DEFAULT_DESCRIPTION =
  "Book official Minneriya jeep safari online. Experience the famous Minneriya Elephant Gathering, Kaudulla, Hurulu & Wasgamuwa with best rates, prices & certified drivers.";
const DEFAULT_OG_IMAGE = "https://www.minneriyawildjeepsafari.com/og-safari.jpg";
const BASE_URL = "https://www.minneriyawildjeepsafari.com";

function upsertMeta(selector, attr, value) {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    const [attrName, attrValue] = attr.split("=");
    el.setAttribute(attrName.replace(/[\[\]'"]/g, ""), attrValue.replace(/["']/g, ""));
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function upsertLink(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  canonical,
  robots,
  ogImage = DEFAULT_OG_IMAGE,
  structuredData,
}) {
  // Prevent duplicate brand name if already present or if title is intentionally formatted
  const fullTitle = title
    ? (title.includes(SITE_NAME) || title.length >= 48 ? title : `${title} | ${SITE_NAME}`)
    : DEFAULT_TITLE;

  useEffect(() => {
    // --- Title ---
    document.title = fullTitle;

    // --- Basic meta ---
    upsertMeta('meta[name="description"]', 'name="description"', description);
    if (keywords) {
      upsertMeta('meta[name="keywords"]', 'name="keywords"', keywords);
    }
    if (robots) {
      upsertMeta('meta[name="robots"]', 'name="robots"', robots);
    }

    // --- Canonical ---
    if (canonical) {
      upsertLink("canonical", canonical);
    }

    // --- Open Graph ---
    upsertMeta('meta[property="og:title"]', 'property="og:title"', fullTitle);
    upsertMeta('meta[property="og:description"]', 'property="og:description"', description);
    upsertMeta('meta[property="og:image"]', 'property="og:image"', ogImage);
    if (canonical) {
      upsertMeta('meta[property="og:url"]', 'property="og:url"', canonical);
    }

    // --- Twitter ---
    upsertMeta('meta[name="twitter:title"]', 'name="twitter:title"', fullTitle);
    upsertMeta('meta[name="twitter:description"]', 'name="twitter:description"', description);
    upsertMeta('meta[name="twitter:image"]', 'name="twitter:image"', ogImage);

    // --- Dynamic JSON-LD structured data (if provided) ---
    let scriptTag = null;
    if (structuredData) {
      scriptTag = document.createElement("script");
      scriptTag.type = "application/ld+json";
      scriptTag.setAttribute("data-dynamic-seo", "true");
      scriptTag.textContent = JSON.stringify(structuredData);
      document.head.appendChild(scriptTag);
    }

    // Cleanup: restore defaults on unmount
    return () => {
      document.title = DEFAULT_TITLE;
      upsertMeta('meta[name="description"]', 'name="description"', DEFAULT_DESCRIPTION);
      upsertMeta('meta[property="og:title"]', 'property="og:title"', DEFAULT_TITLE);
      upsertMeta('meta[property="og:description"]', 'property="og:description"', DEFAULT_DESCRIPTION);
      upsertMeta('meta[property="og:image"]', 'property="og:image"', DEFAULT_OG_IMAGE);
      upsertMeta('meta[property="og:url"]', 'property="og:url"', BASE_URL);
      upsertMeta('meta[name="twitter:title"]', 'name="twitter:title"', DEFAULT_TITLE);
      upsertMeta('meta[name="twitter:description"]', 'name="twitter:description"', DEFAULT_DESCRIPTION);
      upsertMeta('meta[name="twitter:image"]', 'name="twitter:image"', DEFAULT_OG_IMAGE);
      if (scriptTag && scriptTag.parentNode) {
        scriptTag.parentNode.removeChild(scriptTag);
      }
    };
  }, [fullTitle, description, keywords, canonical, robots, ogImage, structuredData]);

  return null; // renders nothing to the DOM
}
