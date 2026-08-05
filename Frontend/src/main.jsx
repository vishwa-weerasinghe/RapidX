import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import App from "./App.jsx";
import Register from "./pages/user/register.jsx";
import Login from "./pages/public/login.jsx";
import Dashboard from "./pages/dashboard.jsx";
import Review from "./pages/user/Review.jsx";

import AdminLayout from "./layouts/AdminLayout.jsx";
import CustomerLayout from "./layouts/CustomerLayout.jsx";

import AdminDashboard from "./pages/admin/dashboard.jsx";
import CustomerDashboard from "./pages/user/dashboard.jsx";
import Packages from "./pages/admin/Packages.jsx";
import CustomerPackages from "./pages/user/Packages.jsx";

import Bookings from "./pages/admin/Bookings.jsx";
import BookingForm from "./pages/admin/BookingForm.jsx";
import MyBookings from "./pages/user/MyBookings";

import Appointments from "./pages/admin/appointment.jsx";
import CustomerBooking from "./pages/user/Booking.jsx";
import GuestBooking from "./pages/public/booking.jsx";
import Cart from "./pages/user/Cart.jsx";

import Drivers from "./pages/admin/Drivers.jsx";
import DriverForm from "./pages/admin/DriverForm.jsx";

import MediaList from "./pages/admin/MediaList.jsx";
import MediaForm from "./pages/admin/MediaForm.jsx";
import AdminReviews from "./pages/admin/Reviews.jsx";

import PackageForm from "./pages/admin/PackageForm.jsx";
import AdminVehicles from "./pages/admin/VehicleList.jsx";
import VehicleFormPage from "./pages/admin/VehicleForm.jsx";

import { ThemeProvider } from "./context/ThemeContext.jsx";

const user = (() => {
  try {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
})();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<App />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/booking" element={<GuestBooking />} />
          <Route path="/booking/:id" element={<GuestBooking />} />
          <Route path="/cart" element={<Cart />} />

          {/* Customer Routes */}
          <Route element={<CustomerLayout />}>
            <Route
              path="/dashboard"
              element={<Navigate to="/user/dashboard" replace />}
            />
            <Route path="/user/dashboard" element={<CustomerDashboard user={user} />} />
            <Route path="/user/packages" element={<CustomerPackages />} />
            <Route path="/user/reviews" element={<Review />} />
            <Route path="/user/booking" element={<CustomerBooking />} />
            <Route path="/user/booking/:id" element={<CustomerBooking />} />
            <Route path="/user/bookings" element={<MyBookings />} />
            <Route path="/user/cart" element={<Cart />} />
            <Route
              path="/packages"
              element={<Navigate to="/user/packages" replace />}
            />
            <Route
              path="/reviews"
              element={<Navigate to="/user/reviews" replace />}
            />
            {/* <Route path="/booking/:id" element={<Navigate to="/user/booking/:id" replace />} />*/}
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard user={user} />} />
            <Route path="packages" element={<Packages />} />
            <Route path="drivers" element={<Drivers />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="media" element={<MediaList />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="vehicles" element={<AdminVehicles />} />
            <Route
              path="packages/create"
              element={<PackageForm user={user} />}
            />
            <Route
              path="packages/:id/edit"
              element={<PackageForm user={user} />}
            />
            <Route
              path="drivers/create"
              element={<DriverForm user={user} />}
            />
            <Route
              path="drivers/:id/edit"
              element={<DriverForm user={user} />}
            />
            <Route
              path="media/create"
              element={<MediaForm user={user} />}
            />
            <Route
              path="media/:id/edit"
              element={<MediaForm user={user} />}
            />
            <Route path="bookings/:id/edit" element={<BookingForm />} />
            <Route
              path="vehicles/create"
              element={<VehicleFormPage user={user} />}
            />
            <Route
              path="vehicles/:id/edit"
              element={<VehicleFormPage user={user} />}
            />
          </Route>

          <Route path="/admin/Vehicles" element={<AdminVehicles />} />
          <Route path="/admin/vehicle" element={<AdminVehicles />} />
          <Route path="/admin/Vehicle" element={<AdminVehicles />} />
          <Route
            path="/admin/addVehicles"
            element={<VehicleFormPage user={user} />}
          />
          <Route
            path="/admin/addvehicles"
            element={<VehicleFormPage user={user} />}
          />
          <Route
            path="/admin/addVehicle"
            element={<VehicleFormPage user={user} />}
          />
          <Route
            path="/admin/addvehicle"
            element={<VehicleFormPage user={user} />}
          />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
