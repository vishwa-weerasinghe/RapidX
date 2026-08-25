import { useEffect, useRef, useState } from "react";
import api from "../../axios";
import { useNavigate } from "react-router-dom";
import { pickupTimeOptions } from "../../constants/pickupTimeOptions";

const emptyCreateForm = {
  Booking_Date: "",
  Pickup_Time: "13:00",
  Area: "",
  Pickup_Location: "",
  No_of_adults: 1,
  No_of_child: 0,
  Package_ID: "",
  Customer_ID: "",
  First_Name: "",
  Last_Name: "",
  Email: "",
  Phone_No: "",
  NIC: "",
  Country: "",
  Status: "Confirmed",
};

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [packages, setPackages] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [newBookingIds, setNewBookingIds] = useState(new Set());
  const [notificationBookingIds, setNotificationBookingIds] = useState(new Set());
  const [showNewOnly, setShowNewOnly] = useState(false);
  const bookingsRef = useRef(bookings);

  const navigate = useNavigate();

  const getBookingId = (booking) => Number(booking?.Booking_ID || 0);

  useEffect(() => {
    bookingsRef.current = bookings;
  }, [bookings]);

  useEffect(() => {
    fetchData();
    fetchPackages();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      api.get("/bookings").then((response) => {
        const latest = response.data || [];
        const currentMaxId = bookingsRef.current.length > 0
          ? Math.max(...bookingsRef.current.map(getBookingId))
          : 0;
        const latestMaxId = latest.length > 0
          ? Math.max(...latest.map(getBookingId))
          : 0;

        if (latestMaxId > currentMaxId) setBookings(latest);

        const storedLastId = parseInt(localStorage.getItem("lastSeenBookingId") || "0", 10);
        setNewBookingIds(new Set(
          latest.filter((booking) => getBookingId(booking) > storedLastId).map(getBookingId)
        ));
      }).catch(() => { });

    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsResponse, vehiclesResponse] = await Promise.all([
        api.get("/bookings"),
        api.get("/vehicles"),
      ]);

      setBookings(bookingsResponse.data);
      setVehicles(vehiclesResponse.data);
      const storedLastId = parseInt(localStorage.getItem("lastSeenBookingId") || "0", 10);
      setNewBookingIds(new Set(
        bookingsResponse.data
          .filter((booking) => getBookingId(booking) > storedLastId)
          .map(getBookingId)
      ));
    } catch (err) {
      console.error(err);
      alert("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const res = await api.get("/packages");
      setPackages(res.data);
      if (res.data.length > 0) {
        const firstPackage = res.data[0];
        setSelectedPackage(firstPackage);
        setCreateForm((prev) => ({ ...prev, Package_ID: String(firstPackage.Package_ID || firstPackage.id || "") }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVehicleChange = async (bookingId, vehicleId) => {
    try {
      await api.put(`/bookings/${bookingId}`, {
        Vehicle_ID: vehicleId || null,
      });

      await fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update vehicle assignment.");
    }
  };

  const handleEdit = (booking) => {
    navigate("/booking", {
      state: { bookingId: booking.Booking_ID },
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;

    try {
      await api.delete(`/bookings/${id}`);
      alert("Booking deleted successfully.");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete booking.");
    }
  };

  const handleCreateInputChange = (event) => {
    const { name, value } = event.target;

    setCreateForm((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "Package_ID") {
        const pkg = packages.find((item) => String(item.Package_ID || item.id) === String(value));
        setSelectedPackage(pkg || null);
      }

      return updated;
    });
  };

  const calculateCreatePayment = () => {
    if (!selectedPackage) return 0;

    const adultTotal = Number(createForm.No_of_adults || 0) * Number(selectedPackage.Price_for_adult || 0);
    const childTotal = Number(createForm.No_of_child || 0) * Number(selectedPackage.Price_for_child || 0);

    return adultTotal + childTotal;
  };

  const handleCreateBooking = async (event) => {
    event.preventDefault();
    setCreating(true);

    const payload = {
      Booking_Date: createForm.Booking_Date,
      Pickup_Time: createForm.Pickup_Time,
      Area: createForm.Area,
      Pickup_Location: createForm.Pickup_Location,
      No_of_adults: Number(createForm.No_of_adults),
      No_of_child: Number(createForm.No_of_child),
      Package_ID: createForm.Package_ID,
      Payment: calculateCreatePayment(),
      Status: createForm.Status,
    };

    if (createForm.Customer_ID) {
      payload.Customer_ID = createForm.Customer_ID;
    } else {
      payload.First_Name = createForm.First_Name;
      payload.Last_Name = createForm.Last_Name;
      payload.Email = createForm.Email;
      payload.Phone_No = createForm.Phone_No;
      payload.NIC = createForm.NIC;
      payload.Country = createForm.Country;
    }

    try {
      await api.post("/bookings", payload);
      alert("Booking created successfully.");
      setShowCreateModal(false);
      setCreateForm(emptyCreateForm);
      setSelectedPackage(packages[0] || null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create booking.");
    } finally {
      setCreating(false);
    }
  };

  const handleBellClick = async () => {
    if (showNewOnly) {
      setShowNewOnly(false);
      setNotificationBookingIds(new Set());
      return;
    }

    if (newBookingIds.size === 0) return;

    setNotificationBookingIds(new Set(newBookingIds));
    const maxId = bookings.length > 0 ? Math.max(...bookings.map(getBookingId)) : 0;
    localStorage.setItem("lastSeenBookingId", String(maxId));
    setNewBookingIds(new Set());
    setShowNewOnly(true);

    try {
      await api.post("/admin/bookings/mark-seen");
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const query = search.trim().toLowerCase();
    const customerName = `${booking.customer?.First_Name ?? ""} ${booking.customer?.Last_Name ?? ""}`;

    const matchesSearch = (
      String(booking.Booking_ID ?? "").toLowerCase().includes(query) ||
      customerName.toLowerCase().includes(query) ||
      booking.package?.Package_Name?.toLowerCase().includes(query) ||
      booking.Booking_Date?.toLowerCase().includes(query) ||
      booking.Pickup_Time?.toLowerCase().includes(query) ||
      booking.Pickup_Location?.toLowerCase().includes(query) ||
      booking.Status?.toLowerCase().includes(query)
    );

    if (!showNewOnly) return matchesSearch;
    return matchesSearch && notificationBookingIds.has(getBookingId(booking));
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-14 h-14 border-4 border-sacramento border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold text-sacramento">Booking Management</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBellClick}
            className="relative rounded-full card p-2 shadow-sm hover:bg-offwhite-100 dark:hover:bg-surface-2"
            title={showNewOnly ? "Show all bookings" : "Show new bookings"}
            aria-label={showNewOnly ? "Show all bookings" : "Show new bookings"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {newBookingIds.size > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                {newBookingIds.size}
              </span>
            )}
          </button>
          <button type="button" onClick={() => navigate("/booking")} className="btn-primary">
            + Add Booking
          </button>
        </div>
      </div>

      {showNewOnly && newBookingIds.size === 0 && (
        <p className="mb-6 text-sm text-muted">No new bookings to show.</p>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search ID, customer, package, date, location, or status..."
          aria-label="Search bookings"
          className="form-input w-full max-w-xl"
        />
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-sacramento">Add New Booking</h2>
                <p className="text-sm text-muted">Create a booking for a registered customer or a guest/unregistered customer.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-charcoal dark:text-white">Booking Date</label>
                  <input
                    type="date"
                    name="Booking_Date"
                    value={createForm.Booking_Date}
                    onChange={handleCreateInputChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-charcoal dark:text-white">Pickup Time</label>
                  <select
                    name="Pickup_Time"
                    value={createForm.Pickup_Time}
                    onChange={handleCreateInputChange}
                    className="form-input"
                    required
                  >
                    {pickupTimeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-charcoal dark:text-white">Pickup Location</label>
                  <input
                    type="text"
                    name="Pickup_Location"
                    value={createForm.Pickup_Location}
                    onChange={handleCreateInputChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-charcoal dark:text-white">Adults</label>
                  <input
                    type="number"
                    min="1"
                    name="No_of_adults"
                    value={createForm.No_of_adults}
                    onChange={handleCreateInputChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-charcoal dark:text-white">Children</label>
                  <input
                    type="number"
                    min="0"
                    name="No_of_child"
                    value={createForm.No_of_child}
                    onChange={handleCreateInputChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-charcoal dark:text-white">Package</label>
                  <select
                    name="Package_ID"
                    value={createForm.Package_ID}
                    onChange={handleCreateInputChange}
                    className="form-input"
                    required
                  >
                    <option value="">Select a package</option>
                    {packages.map((item) => (
                      <option key={item.Package_ID || item.id} value={item.Package_ID || item.id}>
                        {item.Package_Name} - $ {item.Price_for_adult} (Adult) / $ {item.Price_for_child} (Child)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-charcoal dark:text-white">Status</label>
                  <select
                    name="Status"
                    value={createForm.Status}
                    onChange={handleCreateInputChange}
                    className="form-input"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl border border-border-light bg-offwhite-100 p-4 dark:border-border-dark dark:bg-surface-2">
                <label className="mb-1 block text-sm font-semibold text-charcoal dark:text-white">Customer ID (optional)</label>
                <input
                  type="text"
                  name="Customer_ID"
                  value={createForm.Customer_ID}
                  onChange={handleCreateInputChange}
                  className="form-input"
                  placeholder="Leave blank to create a guest customer"
                />
                {!createForm.Customer_ID && (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-charcoal dark:text-white">First Name</label>
                      <input
                        type="text"
                        name="First_Name"
                        value={createForm.First_Name}
                        onChange={handleCreateInputChange}
                        className="form-input"
                        required={!createForm.Customer_ID}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-charcoal dark:text-white">Last Name</label>
                      <input
                        type="text"
                        name="Last_Name"
                        value={createForm.Last_Name}
                        onChange={handleCreateInputChange}
                        className="form-input"
                        required={!createForm.Customer_ID}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-charcoal dark:text-white">Email</label>
                      <input
                        type="email"
                        name="Email"
                        value={createForm.Email}
                        onChange={handleCreateInputChange}
                        className="form-input"
                        required={!createForm.Customer_ID}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-charcoal dark:text-white">Phone Number</label>
                      <input
                        type="text"
                        name="Phone_No"
                        value={createForm.Phone_No}
                        onChange={handleCreateInputChange}
                        className="form-input"
                        required={!createForm.Customer_ID}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-charcoal dark:text-white">NIC</label>
                      <input
                        type="text"
                        name="NIC"
                        value={createForm.NIC}
                        onChange={handleCreateInputChange}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-charcoal dark:text-white">Country</label>
                      <input
                        type="text"
                        name="Country"
                        value={createForm.Country}
                        onChange={handleCreateInputChange}
                        className="form-input"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-lg bg-sacramento/10 p-3 text-sm text-sacramento">
                Estimated payment: $ {calculateCreatePayment().toLocaleString()}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary disabled:opacity-60"
                >
                  {creating ? "Creating..." : "Create Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl card">
        <table className="min-w-full">
          <thead className="bg-sacramento text-white">
            <tr>
              <th className="px-4 py-3 text-left">Booking ID</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Package</th>
              <th className="px-4 py-3 text-left">Booking Date</th>
              <th className="px-4 py-3 text-left">Pickup Time</th>
              <th className="px-4 py-3 text-left">Pickup Area</th>
              <th className="px-4 py-3 text-left">Pickup Location</th>
              <th className="px-4 py-3 text-center">Adults</th>
              <th className="px-4 py-3 text-center">Children</th>
              <th className="px-4 py-3 text-right">Payment</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-left">Vehicle</th>
              <th className="px-4 py-3 text-left">Driver</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="13" className="py-6 text-center text-muted">
                  {bookings.length === 0
                    ? "No bookings found."
                    : "No bookings match your search."}
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr key={booking.Booking_ID} className="table-row">
                  <td className="px-4 py-3 text-charcoal dark:text-white">{booking.Booking_ID}</td>
                  <td className="px-4 py-3 text-charcoal/80 dark:text-white/80">
                    {booking.customer
                      ? `${booking.customer.First_Name} ${booking.customer.Last_Name}`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-charcoal/80 dark:text-white/80">{booking.package?.Package_Name || "-"}</td>
                  <td className="px-4 py-3 text-charcoal/80 dark:text-white/80">{booking.Booking_Date}</td>
                  <td className="px-4 py-3 text-charcoal/80 dark:text-white/80">{booking.Pickup_Time}</td>
                  <td className="px-4 py-3 text-charcoal/80 dark:text-white/80">{booking.Area || "—"}</td>
                  <td className="px-4 py-3 text-charcoal/80 dark:text-white/80">{booking.Pickup_Location}</td>
                  <td className="px-4 py-3 text-center text-charcoal/80 dark:text-white/80">{booking.No_of_adults}</td>
                  <td className="px-4 py-3 text-center text-charcoal/80 dark:text-white/80">{booking.No_of_child}</td>
                  <td className="px-4 py-3 text-right text-charcoal dark:text-white">$ {booking.Payment}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                      {booking.Status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={booking.Vehicle_ID ?? ""}
                      onChange={(event) => handleVehicleChange(booking.Booking_ID, event.target.value)}
                      className="form-input min-w-40"
                      aria-label={`Vehicle for booking ${booking.Booking_ID}`}
                    >
                      <option value="">Not assigned</option>
                      {vehicles.map((vehicle) => (
                        <option key={vehicle.Vehicle_ID} value={vehicle.Vehicle_ID}>
                          {vehicle.Vehicle_No} ({vehicle.Vehicle_Type})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-charcoal/80 dark:text-white/80">{booking.vehicle?.driver?.Driver_Name || "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleEdit(booking)} className="text-sacramento hover:underline">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(booking.Booking_ID)} className="ml-3 text-red-600 hover:underline dark:text-red-400">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}