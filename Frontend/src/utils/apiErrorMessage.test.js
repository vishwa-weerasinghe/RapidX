import { describe, expect, it } from "vitest";
import { DEFAULT_API_ERROR_MESSAGE, getApiErrorMessage } from "./apiErrorMessage";

const FALLBACK = "Unable to submit review right now.";

// Raw payload the API returned for the missing `reviews.Photos` column.
const SQL_ERROR_MESSAGE =
  "SQLSTATE[42S22]: Column not found: 1054 Unknown column 'Photos' in 'field list' (Connection: mysql, Host: 127.0.0.1)";

describe("getApiErrorMessage", () => {
  it("shows the server message for client errors", () => {
    const err = {
      response: {
        status: 422,
        data: { message: "The photos field must not have more than 5 items." },
      },
    };

    expect(getApiErrorMessage(err, FALLBACK)).toBe(
      "The photos field must not have more than 5 items.",
    );
  });

  it("never leaks server errors to the user", () => {
    [500, 502, 503, 504].forEach((status) => {
      const err = { response: { status, data: { message: SQL_ERROR_MESSAGE } } };

      expect(getApiErrorMessage(err, FALLBACK)).toBe(FALLBACK);
    });
  });

  it("falls back when a client error carries no message", () => {
    const err = { response: { status: 400, data: {} } };

    expect(getApiErrorMessage(err, FALLBACK)).toBe(FALLBACK);
  });

  it("falls back when the request never reached the server", () => {
    expect(getApiErrorMessage(new Error("Network Error"), FALLBACK)).toBe(FALLBACK);
    expect(getApiErrorMessage(undefined, FALLBACK)).toBe(FALLBACK);
  });

  it("falls back when the server message is blank", () => {
    const err = { response: { status: 403, data: { message: "   " } } };

    expect(getApiErrorMessage(err, FALLBACK)).toBe(FALLBACK);
  });

  it("trims the server message before displaying it", () => {
    const err = {
      response: { status: 422, data: { message: "  Please use the email from a booked safari.  " } },
    };

    expect(getApiErrorMessage(err, FALLBACK)).toBe(
      "Please use the email from a booked safari.",
    );
  });

  it("uses the default friendly message when no fallback is provided", () => {
    const err = { response: { status: 500, data: { message: SQL_ERROR_MESSAGE } } };

    expect(getApiErrorMessage(err)).toBe(DEFAULT_API_ERROR_MESSAGE);
  });
});
