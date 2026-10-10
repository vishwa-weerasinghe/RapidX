import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { apiGet, apiPost, navigate } = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock("../../axios", () => ({
  default: {
    get: (...args) => apiGet(...args),
    post: (...args) => apiPost(...args),
    put: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigate,
}));

import Bookings from "./Bookings.jsx";

// Every request the page makes must be scoped by the backend, so the test
// records the config (which carries `params`) alongside the URL.
const bookingsCalls = () =>
  apiGet.mock.calls.filter(([url]) => url === "/bookings").map(([, config]) => config);

const lastBookingsParams = () => {
  const calls = bookingsCalls();
  return calls.length > 0 ? calls[calls.length - 1]?.params : undefined;
};

const renderBookings = async () => {
  render(<Bookings />);

  // The initial load resolves straight away and swaps the spinner for the table.
  await waitFor(() => expect(bookingsCalls().length).toBeGreaterThan(0));
};

// The first cell of every table row is the Booking ID, so the rendered order of
// the table can be read back without depending on the other columns.
const renderedBookingIds = () =>
  Array.from(document.querySelectorAll("tbody tr")).map((row) =>
    row.querySelector("td")?.textContent?.trim(),
  );

const bookingRow = (id, date) => ({
  Booking_ID: id,
  Booking_Date: date,
  Pickup_Time: "10:00:00",
  Pickup_Location: "Colombo",
  No_of_adults: 2,
  No_of_child: 0,
  Payment: 1500,
  Status: "Confirmed",
});

describe("Admin bookings period filter", () => {
  beforeEach(() => {
    apiGet.mockReset();
    apiPost.mockReset();
    navigate.mockReset();

    apiGet.mockImplementation(() => Promise.resolve({ data: [] }));
    apiPost.mockImplementation(() => Promise.resolve({ data: {} }));
  });

  afterEach(() => {
    cleanup();
  });

  it("defaults to All Time on first render so every booking period is loaded", async () => {
    await renderBookings();

    expect(lastBookingsParams()).toEqual({ period: "all_time" });

    // Regression guard: no request may be sent without a period, because that
    // would bypass the server-side filter contract entirely.
    expect(bookingsCalls().every((config) => Boolean(config?.params?.period))).toBe(true);
  });

  it("re-queries the backend when a different period is selected", async () => {
    await renderBookings();

    const callsAfterLoad = bookingsCalls().length;

    fireEvent.change(screen.getByLabelText(/booking period/i), {
      target: { value: "last_month" },
    });

    await waitFor(() =>
      expect(lastBookingsParams()).toEqual({ period: "last_month" }),
    );

    expect(bookingsCalls().length).toBeGreaterThan(callsAfterLoad);
  });

  it("sends the search term together with the selected period", async () => {
    await renderBookings();

    fireEvent.change(screen.getByLabelText(/booking period/i), {
      target: { value: "last_month" },
    });

    fireEvent.change(screen.getByLabelText(/search bookings/i), {
      target: { value: "Nimal" },
    });

    await waitFor(() =>
      expect(lastBookingsParams()).toEqual({ period: "last_month", search: "Nimal" }),
    );
  });

  it("keeps every period option available and defaults to All Time", async () => {
    await renderBookings();

    expect(screen.getByLabelText(/booking period/i).value).toBe("all_time");

    const labels = Array.from(screen.getByLabelText(/booking period/i).options).map(
      (option) => option.textContent,
    );

    expect(labels).toEqual([
      "This Week",
      "This Month",
      "Last Month",
      "This Year",
      "Last Year",
      "All Time",
      "Custom Date Range",
    ]);
  });

  it("only queries the custom range once both dates are chosen", async () => {
    await renderBookings();

    fireEvent.change(screen.getByLabelText(/booking period/i), {
      target: { value: "custom" },
    });

    const fromInput = screen.getByLabelText(/from date/i);
    const toInput = screen.getByLabelText(/to date/i);

    // No dates yet -> no request, so the table never falls back to "all time".
    await new Promise((resolve) => setTimeout(resolve, 600));
    expect(lastBookingsParams()).not.toHaveProperty("from_date");

    fireEvent.change(fromInput, { target: { value: "2026-10-01" } });
    fireEvent.change(toInput, { target: { value: "2026-10-31" } });

    await waitFor(() =>
      expect(lastBookingsParams()).toEqual({
        period: "custom",
        from_date: "2026-10-01",
        to_date: "2026-10-31",
      }),
    );
  });

  it("renders exactly the bookings returned by the filtered endpoint", async () => {
    apiGet.mockImplementation((url) => {
      if (url === "/bookings") {
        return Promise.resolve({
          data: [
            {
              Booking_ID: 501,
              Booking_Date: "2026-09-05",
              Pickup_Time: "10:00:00",
              Pickup_Location: "Colombo",
              No_of_adults: 2,
              No_of_child: 0,
              Payment: 1500,
              Status: "Confirmed",
            },
          ],
        });
      }

      return Promise.resolve({ data: [] });
    });

    await renderBookings();

    await waitFor(() => expect(screen.getByText("501")).toBeTruthy());
    expect(screen.getByText(/showing/i).textContent).toContain("1 booking for All Time");
  });

  it("shows bookings from every booking period while All Time is the default", async () => {
    // Bookings spread across the year: all of them must render because the
    // default period is All Time, and they must come back newest ID first.
    apiGet.mockImplementation((url) => {
      if (url === "/bookings") {
        return Promise.resolve({
          data: [
            bookingRow(103, "2026-01-15"),
            bookingRow(104, "2026-06-10"),
            bookingRow(105, "2026-09-20"),
          ],
        });
      }

      return Promise.resolve({ data: [] });
    });

    await renderBookings();

    await waitFor(() => expect(renderedBookingIds()).toEqual(["105", "104", "103"]));
    expect(screen.getByText(/showing/i).textContent).toContain("3 bookings for All Time");
  });

  it("sorts the table by Booking_ID descending regardless of the response order", async () => {
    apiGet.mockImplementation((url) => {
      if (url === "/bookings") {
        // Deliberately unsorted, with safari dates in the opposite order too,
        // so only a Booking_ID descending sort yields 105 -> 104 -> 103.
        return Promise.resolve({
          data: [
            bookingRow(103, "2026-12-01"),
            bookingRow(105, "2026-01-05"),
            bookingRow(104, "2026-06-10"),
          ],
        });
      }

      return Promise.resolve({ data: [] });
    });

    await renderBookings();

    await waitFor(() => expect(renderedBookingIds()).toEqual(["105", "104", "103"]));
  });

  it("keeps the descending Booking_ID order after another period is selected", async () => {
    await renderBookings();

    apiGet.mockImplementation((url) => {
      if (url === "/bookings") {
        return Promise.resolve({
          data: [
            bookingRow(201, "2026-08-01"),
            bookingRow(203, "2026-08-05"),
            bookingRow(202, "2026-08-10"),
          ],
        });
      }

      return Promise.resolve({ data: [] });
    });

    fireEvent.change(screen.getByLabelText(/booking period/i), {
      target: { value: "last_month" },
    });

    await waitFor(() => expect(lastBookingsParams()).toEqual({ period: "last_month" }));
    await waitFor(() => expect(renderedBookingIds()).toEqual(["203", "202", "201"]));
  });
});
