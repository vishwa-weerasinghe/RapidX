// Name of the `window` event dispatched after booking notifications have been
// marked as seen on the backend (e.g. when the admin opens the bell on the
// Bookings page). Shared UI such as the admin Sidebar listens for this event
// and re-fetches its unread count immediately, so the badge clears right away
// instead of staying stale until the next polling cycle.
export const ADMIN_BOOKING_NOTIFICATIONS_UPDATED =
  "rapidx:admin-booking-notifications-updated";
