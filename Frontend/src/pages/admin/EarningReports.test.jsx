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

import EarningReports from "./EarningReports.jsx";

describe("Annual earning totals", () => {
  beforeEach(() => {
    apiGet.mockReset();
    apiGet.mockImplementation((url) => {
      if (url === "/appointments/annual-report") {
        return Promise.resolve({
          data: {
            year: "2026",
            rows: [{
              month: "2026-01",
              label: "January",
              earnings_confirmed: 100,
              earnings_unconfirmed: 50,
              refunds: 10,
              total: 90,
            }],
            totals: {
              earnings_confirmed: 100,
              earnings_unconfirmed: 50,
              refunds: 10,
              total: 90,
            },
          },
        });
      }

      if (url === "/appointments/summary") {
        return Promise.resolve({ data: {} });
      }

      return Promise.resolve({
        data: [
          {
            Booking_ID: 1,
            Package_Name: "Minneriya Safari",
            Status: "Confirmed",
            Payment: 100,
          },
          {
            Booking_ID: 2,
            Package_Name: "Minneriya Safari",
            Status: "Pending",
            Payment: 50,
          },
        ],
      });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("subtracts refunds from confirmed earnings in annual totals", async () => {
    render(<EarningReports />);

    await waitFor(() => expect(apiGet).toHaveBeenCalledWith(
      "/appointments/annual-report",
      { params: { year: String(new Date().getFullYear()) } },
    ));

    const totalCells = await screen.findAllByText("$ 90");
    expect(totalCells).toHaveLength(3);
    expect(screen.getAllByText("$ 50")).toHaveLength(3);

    const annualTotalCells = totalCells.filter((cell) => cell.tagName === "TD");
    expect(annualTotalCells).toHaveLength(2);
    expect(annualTotalCells.every((cell) => cell.style.color === "var(--gold)")).toBe(true);
    const annualFooter = annualTotalCells.find((cell) => cell.closest("tfoot"));
    expect(annualFooter.closest("tfoot").style.backgroundColor).toBe("var(--surface-2)");
    expect([...annualFooter.closest("tr").querySelectorAll("td")].slice(0, -1).every(
      (cell) => cell.style.color === "var(--page-text)" || cell.style.color === "rgb(248, 113, 113)",
    )).toBe(true);
  });

  it("uses a high-contrast color for the monthly table total values in dark mode", async () => {
    render(<EarningReports />);
    fireEvent.change(screen.getByTitle("Select report"), {
      target: { value: "monthly" },
    });

    const monthlyTotal = await screen.findByText("$ 150");
    expect(monthlyTotal.classList.contains("dark:text-[#e6c15a]")).toBe(true);
    expect(monthlyTotal.classList.contains("text-sacramento")).toBe(false);
  });
});
