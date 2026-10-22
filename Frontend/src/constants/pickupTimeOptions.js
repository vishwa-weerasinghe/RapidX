// ─────────────────────────────────────────────────────────────────────────────
// Generic / fallback time sets
// ─────────────────────────────────────────────────────────────────────────────

export const MINNERIYA_MORNING_PICKUP_TIMES = [
  { value: "05:30", label: "05:30" },
  { value: "06:00", label: "06:00 (Recommended)" },
  { value: "06:30", label: "06:30" },
  { value: "07:00", label: "07:00" },
  { value: "07:30", label: "07:30" },
];

export const EVENING_PICKUP_TIMES = [
  { value: "13:00", label: "13:00 (Recommended)" },
  { value: "13:30", label: "13:30" },
  { value: "14:00", label: "14:00" },
  { value: "14:30", label: "14:30" },
  { value: "15:00", label: "15:00" },
];

export const FULL_DAY_PICKUP_TIMES = [
  { value: "05:30", label: "05:30 (Recommended)" },
  { value: "06:00", label: "06:00" },
  { value: "06:30", label: "06:30" },
  { value: "07:00", label: "07:00" },
  { value: "07:30", label: "07:30" },
];

export const HALF_DAY_OR_COMBINED_TIMES = [
  { value: "05:30", label: "05:30 (Morning)" },
  { value: "06:00", label: "06:00 (Morning - Recommended)" },
  { value: "06:30", label: "06:30 (Morning)" },
  { value: "07:00", label: "07:00 (Morning)" },
  { value: "07:30", label: "07:30 (Morning)" },
  { value: "13:00", label: "13:00 (Evening - Recommended)" },
  { value: "13:30", label: "13:30 (Evening)" },
  { value: "14:00", label: "14:00 (Evening)" },
  { value: "14:30", label: "14:30 (Evening)" },
  { value: "15:00", label: "15:00 (Evening)" },
];

export const DAY_TOUR_TIMES = [
  { value: "07:00", label: "07:00 (Recommended)" },
  { value: "07:30", label: "07:30" },
  { value: "08:00", label: "08:00" },
  { value: "08:30", label: "08:30" },
  { value: "09:00", label: "09:00" },
  { value: "13:00", label: "13:00 (Afternoon portion)" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 🦁 Hurulu Eco Morning or Evening Safari — 06:30–08:00 & 12:00–14:00, every 30 min
// ─────────────────────────────────────────────────────────────────────────────
export const HURULU_ECO_MORNING_OR_EVENING_TIMES = [
  { value: "06:30", label: "06:30 (Morning - Recommended)" },
  { value: "07:00", label: "07:00 (Morning)" },
  { value: "07:30", label: "07:30 (Morning)" },
  { value: "08:00", label: "08:00 (Morning)" },
  { value: "12:00", label: "12:00 (Evening)" },
  { value: "12:30", label: "12:30 (Evening)" },
  { value: "13:00", label: "13:00 (Evening)" },
  { value: "13:30", label: "13:30 (Evening)" },
  { value: "14:00", label: "14:00 (Evening)" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 🌿 Eco Park Half Day Safari — 06:00–07:30 & 12:00–13:30, every 30 min
// ─────────────────────────────────────────────────────────────────────────────
export const ECO_PARK_HALFDAY_TIMES = [
  { value: "06:00", label: "06:00 (Morning - Recommended)" },
  { value: "06:30", label: "06:30 (Morning)" },
  { value: "07:00", label: "07:00 (Morning)" },
  { value: "07:30", label: "07:30 (Morning)" },
  { value: "12:00", label: "12:00 (Evening)" },
  { value: "12:30", label: "12:30 (Evening)" },
  { value: "13:00", label: "13:00 (Evening)" },
  { value: "13:30", label: "13:30 (Evening)" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 🐘 Dambulla Safari — 08:30–11:00, every 30 min
// ─────────────────────────────────────────────────────────────────────────────
export const DAMBULLA_TOUR_SAFARI_TIMES = [
  { value: "08:30", label: "08:30 (Recommended)" },
  { value: "09:00", label: "09:00" },
  { value: "09:30", label: "09:30" },
  { value: "10:00", label: "10:00" },
  { value: "10:30", label: "10:30" },
  { value: "11:00", label: "11:00" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 🐘 Wasgamuwa Safari — 06:00–07:30 & 11:00–12:30, every 30 min
// ─────────────────────────────────────────────────────────────────────────────
export const WASGAMUWA_MORNING_OR_EVENING_TIMES = [
  { value: "06:00", label: "06:00 (Morning - Recommended)" },
  { value: "06:30", label: "06:30 (Morning)" },
  { value: "07:00", label: "07:00 (Morning)" },
  { value: "07:30", label: "07:30 (Morning)" },
  { value: "11:00", label: "11:00 (Afternoon)" },
  { value: "11:30", label: "11:30 (Afternoon)" },
  { value: "12:00", label: "12:00 (Afternoon)" },
  { value: "12:30", label: "12:30 (Afternoon)" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 🐘 Kaudulla Half Day Safari — 06:00–07:30 & 12:00–13:30, every 30 min
// ─────────────────────────────────────────────────────────────────────────────
export const KAUDULLA_HALFDAY_TIMES = [
  { value: "06:00", label: "06:00 (Morning - Recommended)" },
  { value: "06:30", label: "06:30 (Morning)" },
  { value: "07:00", label: "07:00 (Morning)" },
  { value: "07:30", label: "07:30 (Morning)" },
  { value: "12:00", label: "12:00 (Evening)" },
  { value: "12:30", label: "12:30 (Evening)" },
  { value: "13:00", label: "13:00 (Evening)" },
  { value: "13:30", label: "13:30 (Evening)" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 🐘 Kaudulla Evening Safari — 12:00–14:00, every 30 min
// ─────────────────────────────────────────────────────────────────────────────
export const KAUDULLA_EVENING_TIMES = [
  { value: "12:00", label: "12:00" },
  { value: "12:30", label: "12:30" },
  { value: "13:00", label: "13:00 (Recommended)" },
  { value: "13:30", label: "13:30" },
  { value: "14:00", label: "14:00" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 🦁 Minneriya Half Day Safari — 06:00–07:30 & 12:00–13:30, every 30 min
// ─────────────────────────────────────────────────────────────────────────────
export const MINNERIYA_HALFDAY_TIMES = [
  { value: "06:00", label: "06:00 (Morning - Recommended)" },
  { value: "06:30", label: "06:30 (Morning)" },
  { value: "07:00", label: "07:00 (Morning)" },
  { value: "07:30", label: "07:30 (Morning)" },
  { value: "12:00", label: "12:00 (Evening)" },
  { value: "12:30", label: "12:30 (Evening)" },
  { value: "13:00", label: "13:00 (Evening)" },
  { value: "13:30", label: "13:30 (Evening)" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 🦁 Minneriya Evening Safari — 11:30–14:00, every 30 min
// ─────────────────────────────────────────────────────────────────────────────
export const MINNERIYA_EVENING_PICKUP_TIMES = [
  { value: "11:30", label: "11:30" },
  { value: "12:00", label: "12:00" },
  { value: "12:30", label: "12:30" },
  { value: "13:00", label: "13:00 (Recommended)" },
  { value: "13:30", label: "13:30" },
  { value: "14:00", label: "14:00" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 🏔️ Sigiriya / Pidurangala Eco Safari & combined — 09:00–11:00, every 30 min
// ─────────────────────────────────────────────────────────────────────────────
export const SIGIRIYA_PIDURANGALA_ECOPARK_SAFARI_TIMES = [
  { value: "09:00", label: "09:00 (Recommended)" },
  { value: "09:30", label: "09:30" },
  { value: "10:00", label: "10:00" },
  { value: "10:30", label: "10:30" },
  { value: "11:00", label: "11:00" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 🏔️ Sigiriya / Pidurangala /Minneriya/Kaudulla & combined — 09:00–11:00, every 30 min
// ─────────────────────────────────────────────────────────────────────────────
export const SIGIRIYA_PIDURANGALA_MINNERIYA_KAUDULLA_SAFARI_TIMES = [
  { value: "09:00", label: "09:00 (Recommended)" },
  { value: "09:30", label: "09:30" },
  { value: "10:00", label: "10:00" },
  { value: "10:30", label: "10:30" },
  { value: "11:00", label: "11:00" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 🏛️ Polonnaruwa Safari — 07:00–08:30, every 30 min
// ─────────────────────────────────────────────────────────────────────────────
export const POLONNARUWA_TIMES = [
  { value: "07:00", label: "07:00 (Recommended)" },
  { value: "07:30", label: "07:30" },
  { value: "08:00", label: "08:00" },
  { value: "08:30", label: "08:30" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 🌿 Village Tour — 09:00–14:00, every 1 hour
// ─────────────────────────────────────────────────────────────────────────────
export const VILLAGE_TOUR_TIMES = [
  { value: "09:00", label: "09:00 (Recommended)" },
  { value: "10:00", label: "10:00" },
  { value: "11:00", label: "11:00" },
  { value: "12:00", label: "12:00" },
  { value: "13:00", label: "13:00" },
  { value: "14:00", label: "14:00" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Generic fallback (used when no package-specific set matches)
// ─────────────────────────────────────────────────────────────────────────────
export const pickupTimeOptions = [
  { value: "05:30", label: "05:30" },
  { value: "06:00", label: "06:00" },
  { value: "06:30", label: "06:30" },
  { value: "07:00", label: "07:00" },
  { value: "07:30", label: "07:30" },
  { value: "08:00", label: "08:00" },
  { value: "09:00", label: "09:00" },
  { value: "10:00", label: "10:00" },
  { value: "11:00", label: "11:00" },
  { value: "13:00", label: "13:00 (Recommend)" },
  { value: "13:30", label: "13:30" },
  { value: "14:00", label: "14:00" },
  { value: "14:30", label: "14:30" },
  { value: "15:00", label: "15:00" },
  { value: "16:00", label: "16:00" },
];

// ─────────────────────────────────────────────────────────────────────────────
// getPickupTimeOptions
// Checks run most-specific → least-specific so the right set is always chosen.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns pickup time options dynamic to the package selected.
 * @param {string|object} pkgOrName
 * @returns {Array<{value: string, label: string}>}
 */
export function getPickupTimeOptions(pkgOrName) {
  if (!pkgOrName) return pickupTimeOptions;

  const name =
    typeof pkgOrName === "string"
      ? pkgOrName
      : pkgOrName?.Package_Name || pkgOrName?.name || pkgOrName?.title || "";

  const lower = name.toLowerCase().trim();
  if (!lower) return pickupTimeOptions;

  // ── Full day ───────────────────────────────────────────────────────────────
  if (lower.includes("full day")) {
    return FULL_DAY_PICKUP_TIMES;
  }

  // ── Dambulla — must be FIRST (name may also contain kaudulla/minneriya) ────
  if (lower.includes("dambulla")) {
    return DAMBULLA_TOUR_SAFARI_TIMES;
  }

  // ── Polonnaruwa — check BEFORE kaudulla/minneriya/sigiriya ────────────────
  if (lower.includes("polonnaruwa")) {
    return POLONNARUWA_TIMES;
  }

  // ── Hurulu Eco — check BEFORE generic "morning or evening" ─────────────────
  if (lower.includes("hurulu")) {
    if (lower.includes("half day")) {
      return ECO_PARK_HALFDAY_TIMES;
    }
    return HURULU_ECO_MORNING_OR_EVENING_TIMES;
  }

  // ── Eco Park Half Day ──────────────────────────────────────────────────────
  if (lower.includes("eco park") && lower.includes("half day")) {
    return ECO_PARK_HALFDAY_TIMES;
  }

  // ── Kaudulla — check BEFORE generic "half day" / "evening" ────────────────
  if (lower.includes("kaudulla") || lower.includes("kawdulla")) {
    if (lower.includes("half day")) {
      return KAUDULLA_HALFDAY_TIMES;
    }
    if (lower.includes("evening") || lower.includes("afternoon")) {
      return KAUDULLA_EVENING_TIMES;
    }
  }

  // ── Minneriya — check BEFORE generic "half day" / "evening" ───────────────
  if (lower.includes("minneriya")) {
    if (lower.includes("half day")) {
      return MINNERIYA_HALFDAY_TIMES;
    }
    if (lower.includes("evening") || lower.includes("afternoon")) {
      return MINNERIYA_EVENING_PICKUP_TIMES;
    }
  }

  // ── Wasgamuwa ──────────────────────────────────────────────────────────────
  if (lower.includes("wasgamuwa")) {
    return WASGAMUWA_MORNING_OR_EVENING_TIMES;
  }

  // ── Pidurangala / Sigiriya — check BEFORE generic "evening" ───────────────
  if (lower.includes("pidurangala") || lower.includes("sigiriya")) {
    return SIGIRIYA_PIDURANGALA_ECOPARK_SAFARI_TIMES;
  }

  // ── Village Tour — check BEFORE generic fallbacks ─────────────────────────
  if (lower.includes("village")) {
    return VILLAGE_TOUR_TIMES;
  }

  // ── Generic half day / morning or evening / morning / evening ─────────────
  if (
    lower.includes("half day") ||
    lower.includes("morning or evening") ||
    lower.includes("morning / evening")
  ) {
    return HALF_DAY_OR_COMBINED_TIMES;
  }

  if (lower.includes("morning")) {
    return MINNERIYA_MORNING_PICKUP_TIMES;
  }

  // ── Fallback ───────────────────────────────────────────────────────────────
  return pickupTimeOptions;
}

/**
 * Returns default pickup time for a given package.
 * @param {string|object} pkgOrName
 * @returns {string} e.g. "06:00", "13:00"
 */
export function getDefaultPickupTime(pkgOrName) {
  const options = getPickupTimeOptions(pkgOrName);
  const recommended = options.find(
    (opt) =>
      opt.label.includes("Recommended") || opt.label.includes("Recommend")
  );
  return (recommended || options[0])?.value || "06:00";
}
