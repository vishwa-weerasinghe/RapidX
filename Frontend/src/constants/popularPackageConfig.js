/**
 * 🌟 POPULAR PACKAGE CONFIGURATION
 *
 * Controls which SINGLE package displays the "Popular" badge on the homepage.
 * Strictly only one package will ever show the badge at a time.
 *
 * You can easily change this anytime by setting POPULAR_PACKAGE_TARGET to:
 * - A package name or keyword (e.g. "Minneriya Half Day", "Kaudulla", "Wasgamuwa", "Hurulu")
 * - A package numeric ID (e.g. 1, 2)
 * - "auto" to automatically select the single highest-booked package
 */
export const POPULAR_PACKAGE_TARGET = "Hurulu Eco Park Half Day";

/**
 * Marks exactly one package as popular in the list based on POPULAR_PACKAGE_TARGET.
 * Guarantees that only ONE package has `popular: true`.
 *
 * @param {Array<object>} packages - List of package objects
 * @param {string|number} target - Identifier (name keyword, ID, or "auto")
 * @returns {Array<object>} - Updated packages with strictly one `popular: true`
 */
export function applyPopularPackageBadge(packages = [], target = POPULAR_PACKAGE_TARGET) {
  if (!Array.isArray(packages) || packages.length === 0) {
    return [];
  }

  let selectedId = null;

  // 1. If target is a number, match by package ID
  if (typeof target === "number") {
    const match = packages.find((p) => Number(p.id) === target);
    if (match) {
      selectedId = match.id;
    }
  }

  // 2. If target is a specific string (not "auto"), match by package name
  if (!selectedId && typeof target === "string" && target.trim() && target.toLowerCase() !== "auto") {
    const query = target.toLowerCase().trim();
    const match = packages.find((p) => {
      const name = (p.Package_Name || p.title || p.name || "").toLowerCase();
      return name.includes(query);
    });
    if (match) {
      selectedId = match.id;
    }
  }

  // 3. Fallback: If "auto" or no target matched, select the single package with highest bookings
  if (!selectedId) {
    let maxBookings = 0;
    let topPkg = null;

    packages.forEach((pkg) => {
      const count = Number(pkg.bookings_count || 0);
      if (count > maxBookings) {
        maxBookings = count;
        topPkg = pkg;
      }
    });

    if (topPkg) {
      selectedId = topPkg.id;
    } else {
      // Default fallback: pick the very first package if all bookings are 0
      selectedId = packages[0]?.id;
    }
  }

  // Assign popular: true to ONLY the single selected package
  return packages.map((pkg) => ({
    ...pkg,
    popular: pkg.id === selectedId,
  }));
}
