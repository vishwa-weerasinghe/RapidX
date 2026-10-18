import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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

// Sidebar needs NavLink in addition to the useNavigate the Bookings page uses.
vi.mock("react-router-dom", () => ({
  useNavigate: () => navigate,
  NavLink: ({ to, children, className, ...props }) => (
    <a
      href={to}
      className={typeof className === "function" ? className({ isActive: false }) : className}
      {...props}
    >
      {children}
    </a>
  ),
}));

import Sidebar from "../../components/Sidebar.jsx";
import Bookings from "./Bookings.jsx";

// Mutable "backend" state so the mocked endpoints behave like the real API:
// the two bookings start unseen and mark-seen flags every one of them as seen.
let unreadCount = 0;

const unseenBooking = (id) => ({
  Booking_ID: id,
  Booking_Date: "2026-10-20",
  Pickup_Time: "07:00:00",
  Pickup_Location: "Sigiriya",
  No_of_adults: 4,
  No_of_child: 0,
  Payment: 100,
  Status: "Pending",
  Admin_Seen: false,
  Admin_Message: "A new booking has been placed by a customer.",
  customer: { First_Name: "Nimal", Last_Name: "Silva" },
  package: { Package_Name: "Minneriya Safari" },
});

const unseenBookings = () => [unseenBooking(101), unseenBooking(102)];

const unreadCountFetches = () =>
  apiGet.mock.calls.filter(([url]) => url === "/admin/bookings/unread-count").length;

describe("Admin sidebar booking badge stays in sync with mark-seen", () => {
  beforeEach(() => {
    apiGet.mockReset();
    apiPost.mockReset();
    navigate.mockReset();
    localStorage.clear();
    unreadCount = 2;

    apiGet.mockImplementation((url) => {
      if (url === "/admin/bookings/unread-count") {
        return Promise.resolve({ data: { count: unreadCount } });
      }

      if (url === "/admin/bookings/notifications" || url === "/bookings") {
        return Promise.resolve({ data: unreadCount > 0 ? unseenBookings() : [] });
      }

      // /vehicles, /packages, /reviews, /appointments etc.
      return Promise.resolve({ data: [] });
    });

    apiPost.mockImplementation((url) => {
      if (url === "/admin/bookings/mark-seen") {
        // Mirrors BookingController::markAllAsSeen(): every unseen booking is
        // flagged as seen, so the unread count the backend reports drops to 0.
        unreadCount = 0;
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    cleanup();
  });

  const renderSidebarWithBookings = () => {
    render(
      <>
        <Sidebar role="Admin" isOpen={true} setIsOpen={() => {}} />
        <Bookings />
      </>
    );
    return document.querySelector("aside");
  };

  it("clears the sidebar badge immediately after the bell marks notifications as seen", async () => {
    const sidebar = renderSidebarWithBookings();

    // The badge next to the "Bookings" menu item starts at 2.
    await waitFor(() => expect(within(sidebar).getByText("2")).toBeTruthy());

    const fetchesBeforeBell = unreadCountFetches();

    // Admin opens the notification bell, which loads the notifications and
    // then marks all of them as seen on the backend.
    fireEvent.click(screen.getByTitle("Booking notifications"));
    await waitFor(() => expect(apiPost).toHaveBeenCalledWith("/admin/bookings/mark-seen"));

    // The sidebar must re-fetch the unread count right away (not wait for the
    // 30-second poll) and drop the badge once the backend reports zero.
    await waitFor(() => expect(unreadCountFetches()).toBeGreaterThan(fetchesBeforeBell));
    await waitFor(() => expect(within(sidebar).queryByText("2")).toBeNull());
  });

  it("re-shows the badge when the synced unread count rises again", async () => {
    unreadCount = 0;
    const sidebar = renderSidebarWithBookings();

    // No badge while the backend reports zero unread notifications.
    await waitFor(() => expect(unreadCountFetches()).toBeGreaterThan(0));
    expect(within(sidebar).queryByText("0")).toBeNull();

    // A new booking notification arrives on the backend; the next sync of the
    // unread count (the same fetch used by the 30-second poll and the
    // mark-seen event) must make the badge reappear with the new total.
    unreadCount = 1;
    window.dispatchEvent(
      new CustomEvent("rapidx:admin-booking-notifications-updated"),
    );

    await waitFor(() => expect(within(sidebar).getByText("1")).toBeTruthy());
  });
});
