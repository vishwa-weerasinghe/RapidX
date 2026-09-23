export const DEFAULT_API_ERROR_MESSAGE = "Something went wrong. Please try again.";

/**
 * Resolve the message that should be shown to the user for a failed API call.
 *
 * Responses in the 5xx range are produced by the server itself (stack traces,
 * SQL errors, ...) and can leak internal details when the backend runs with
 * APP_DEBUG=true, so their payload is never rendered - the caller's friendly
 * fallback is used instead. Validation and authorisation failures (4xx) are
 * intentional messages written for the user and are surfaced as-is.
 *
 * Errors that never reached the server (offline, CORS, timeout) also fall back
 * to the friendly message.
 *
 * @param {unknown} err - The error thrown/rejected by the API call.
 * @param {string} [fallback] - Message used when no safe server message exists.
 * @returns {string} A message that is safe to display.
 */
export function getApiErrorMessage(err, fallback = DEFAULT_API_ERROR_MESSAGE) {
  const status = err?.response?.status;

  if (typeof status !== "number" || status >= 500) {
    return fallback;
  }

  const serverMessage = err?.response?.data?.message;

  if (typeof serverMessage === "string" && serverMessage.trim() !== "") {
    return serverMessage.trim();
  }

  return fallback;
}
