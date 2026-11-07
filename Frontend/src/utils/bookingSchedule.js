const SRI_LANKA_TIME_ZONE = "Asia/Colombo";

export function getSriLankaToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SRI_LANKA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const dateParts = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
}

export function isSriLankaBookingTimeInFuture(date, time) {
  if (!date || !time) return false;
  const selected = new Date(`${date}T${time.slice(0, 5)}:00+05:30`);
  return !Number.isNaN(selected.getTime()) && selected.getTime() > Date.now();
}

export function isSriLankaPickupTimePast(date, time) {
  return date === getSriLankaToday() && !isSriLankaBookingTimeInFuture(date, time);
}
