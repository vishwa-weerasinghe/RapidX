import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { apiGet, navigate } = vi.hoisted(() => ({
  apiGet: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock("../../axios", () => ({
  default: {
    get: (...args) => apiGet(...args),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    put: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

vi.mock("react-router-dom", () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  useNavigate: () => navigate,
}));

vi.mock("../../context/ThemeContext", () => ({
  useTheme: () => ({ theme: "light" }),
}));

vi.mock("../../components/admin-dashboard/PackagePopularityChart", () => ({
  default: () => <div>Package chart</div>,
}));

import Appointments from "./appointment.jsx";
import Vehicles from "./VehicleList.jsx";

describe("Admin notification and driver flows", () => {
  beforeEach(() => {
    apiGet.mockReset();
    navigate.mockReset();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows the new appointments panel when the notifications bell is clicked", async () => {
    localStorage.setItem("lastSeenAppointmentId", "10");
    apiGet.mockImplementation((url) => {
      if (url === "/appointments") {
        return Promise.resolve({
          data: [
            { Booking_ID: 11, Package_Name: "Elephant Safari", Status: "Confirmed" },
            { Booking_ID: 12, Package_Name: "Leopard Safari", Status: "Confirmed" },
          ],
        });
      }

      if (url === "/appointments/summary") {
        return Promise.resolve({ data: { total_confirmed: 2, total_unconfirmed: 0, total_earnings_confirmed: 1000, total_earnings_unconfirmed: 0, total_refunds: 0 } });
      }

      return Promise.resolve({ data: [] });
    });

    render(<Appointments />);

    await waitFor(() => expect(apiGet).toHaveBeenCalledWith("/appointments", { params: { month: expect.any(String) } }));

    fireEvent.click(screen.getByTitle(/show new appointments/i));

    expect(await screen.findByText(/new appointments/i)).toBeTruthy();
    expect(screen.getByText(/Leopard Safari/i)).toBeTruthy();
  });

  it("shows the matched vehicles when the See Vehicle button is used on the vehicle page", async () => {
    apiGet.mockImplementation((url) => {
      if (url === "/vehicles") {
        return Promise.resolve({
          data: [
            {
              Vehicle_ID: 5,
              Vehicle_No: "ABC-123",
              Vehicle_Type: "Jeep",
              No_of_Seats: 6,
              Driver_ID: 19,
            },
            {
              Vehicle_ID: 7,
              Vehicle_No: "DEF-456",
              Vehicle_Type: "Safari",
              No_of_Seats: 8,
              Driver_ID: 10,
            },
          ],
        });
      }

      return Promise.resolve({ data: [] });
    });

    render(<Vehicles />);

    await waitFor(() => expect(apiGet).toHaveBeenCalledWith("/vehicles"));
    fireEvent.click(screen.getByRole("button", { name: /see vehicle/i }));

    expect((await screen.findAllByText(/ABC-123/i)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/DEF-456/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Nimal Silva/i)).toBeNull();
  });
});
