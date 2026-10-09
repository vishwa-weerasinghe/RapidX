import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { apiGet } = vi.hoisted(() => ({
  apiGet: vi.fn(),
}));

vi.mock("../../axios", () => ({
  default: {
    get: (...args) => apiGet(...args),
  },
}));

vi.mock("react-router-dom", () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

import BookingSummary from "./BookingSummary.jsx";
import CustomerManagement from "./CustomerManagement.jsx";

describe("Admin page search and booking summary", () => {
  beforeEach(() => {
    apiGet.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("matches a customer search against their full name", async () => {
    apiGet.mockResolvedValue({
      data: [
        {
          Customer_ID: 1,
          First_Name: "Tina",
          Last_Name: "Silva",
          Email: "tina@example.com",
          Phone_No: "0770000000",
          created_at: "2026-01-01",
        },
        {
          Customer_ID: 2,
          First_Name: "Nimal",
          Last_Name: "Perera",
          Email: "nimal@example.com",
          Phone_No: "0770000001",
          created_at: "2026-01-02",
        },
      ],
    });

    render(<CustomerManagement />);
    await screen.findByText("Tina Silva");

    fireEvent.change(screen.getByRole("searchbox", { name: "Search customers" }), {
      target: { value: "Tina Silva" },
    });

    expect(screen.getByText("Tina Silva")).toBeTruthy();
    expect(screen.queryByText("Nimal Perera")).toBeNull();
  });

  it("keeps the selected month visibly associated with its bookings table", async () => {
    apiGet.mockImplementation((url) => {
      if (url === "/appointments/annual-report") {
        return Promise.resolve({
          data: { year: 2026, rows: [], totals: {} },
        });
      }

      if (url === "/appointments/summary") {
        return Promise.resolve({
          data: { total_confirmed: 1, total_unconfirmed: 0, total_cancelled: 0 },
        });
      }

      return Promise.resolve({
        data: [
          {
            Booking_ID: 42,
            First_Name: "Tina",
            Last_Name: "Silva",
            Package_Name: "Elephant Safari",
            Booking_Date: "2026-10-08",
            Payment: 120,
          },
        ],
      });
    });

    render(<BookingSummary />);

    expect(await screen.findByText(/Bookings for \w+ 2026/)).toBeTruthy();
    fireEvent.change(screen.getByTitle("Select booking month"), {
      target: { value: "2026-09" },
    });

    await waitFor(() => {
      expect(apiGet).toHaveBeenCalledWith("/appointments", {
        params: { month: "2026-09" },
      });
      expect(screen.getByText("Bookings for September 2026")).toBeTruthy();
    });
    expect(screen.getByText("#42")).toBeTruthy();
  });

  it("keeps every annual booking total visible in dark mode", async () => {
    apiGet.mockImplementation((url) => {
      if (url === "/appointments/annual-report") {
        return Promise.resolve({
          data: {
            year: 2026,
            rows: [],
            totals: {
              total_confirmed: 2,
              total_in_cart: 1,
              total_pending: 3,
              total_cancelled: 1,
            },
          },
        });
      }

      if (url === "/appointments/summary") {
        return Promise.resolve({ data: {} });
      }

      return Promise.resolve({ data: [] });
    });

    render(<BookingSummary />);
    fireEvent.change(screen.getByTitle("Select report"), {
      target: { value: "annual" },
    });

    const yearRowLabel = await screen.findByText("Entire Year (2026)");
    const yearTotalRow = yearRowLabel.closest("tr");
    expect([...yearTotalRow.querySelectorAll("td")]).toHaveLength(6);
    const yearCells = [...yearTotalRow.querySelectorAll("td")];
    expect(yearCells.slice(0, -1).every((cell) =>
      cell.style.color === "var(--page-text)"
    )).toBe(true);
    expect(yearCells.at(-1).style.color).toBe("var(--gold)");
    expect(yearTotalRow.parentElement.style.backgroundColor).toBe("var(--surface-2)");
  });
});
