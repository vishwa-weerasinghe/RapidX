export const MORNING_PICKUP_TIMES = [
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

/**
 * Returns pickup time options dynamic to the package selected.
 * @param {string|object} pkgOrName
 * @returns {Array<{value: string, label: string}>}
 */
export function getPickupTimeOptions(pkgOrName) {
  if (!pkgOrName) return pickupTimeOptions;

  const name = typeof pkgOrName === "string"
    ? pkgOrName
    : (pkgOrName?.Package_Name || pkgOrName?.name || pkgOrName?.title || "");

  const lower = name.toLowerCase().trim();
  if (!lower) return pickupTimeOptions;

  if (lower.includes("full day")) {
    return FULL_DAY_PICKUP_TIMES;
  }

  if (
    lower.includes("half day") ||
    lower.includes("morning or evening") ||
    lower.includes("morning / evening")
  ) {
    return HALF_DAY_OR_COMBINED_TIMES;
  }

  if (lower.includes("morning")) {
    return MORNING_PICKUP_TIMES;
  }

  if (lower.includes("evening") || lower.includes("afternoon")) {
    return EVENING_PICKUP_TIMES;
  }

  if (
    lower.includes("dambulla") ||
    lower.includes("polonnaruwa") ||
    lower.includes("sigiriya") ||
    lower.includes("village")
  ) {
    return DAY_TOUR_TIMES;
  }

  return pickupTimeOptions;
}

/**
 * Returns default pickup time for a given package.
 * @param {string|object} pkgOrName
 * @returns {string} e.g. "06:00", "13:00"
 */
export function getDefaultPickupTime(pkgOrName) {
  const options = getPickupTimeOptions(pkgOrName);
  const recommended = options.find((opt) => opt.label.includes("Recommended") || opt.label.includes("Recommend"));
  return (recommended || options[0])?.value || "06:00";
}
