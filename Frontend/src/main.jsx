import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import App from "./App.jsx";
import Blog from "./pages/public/Blog.jsx";
import Register from "./pages/user/register.jsx";
import Login from "./pages/public/login.jsx";
import ForgotPassword from "./pages/public/ForgotPassword.jsx";
import ResetPassword from "./pages/public/ResetPassword.jsx";
import Dashboard from "./pages/dashboard.jsx";
import Review from "./pages/user/Review.jsx";
import GuestReviewPage from "./pages/public/Review.jsx";

import AdminLayout from "./layouts/AdminLayout.jsx";
import CustomerLayout from "./layouts/CustomerLayout.jsx";

import AdminDashboard from "./pages/admin/dashboard.jsx";
import CustomerDashboard from "./pages/user/dashboard.jsx";
import Packages from "./pages/admin/Packages.jsx";
import CustomerPackages from "./pages/user/Packages.jsx";

import Bookings from "./pages/admin/Bookings.jsx";
import BookingForm from "./pages/admin/BookingForm.jsx";
import MyBookings from "./pages/user/MyBookings";
import Cancellation from "./pages/user/cancellation.jsx";

import Appointments from "./pages/admin/appointment.jsx";
import EarningReports from "./pages/admin/EarningReports.jsx";
import BookingSummary from "./pages/admin/BookingSummary.jsx";
import GuestBooking from "./pages/public/booking.jsx";
import PolicyPage from "./pages/public/PolicyPage.jsx";
import PaymentSuccess from "./pages/public/PaymentSuccess.jsx";
import PaymentCancel from "./pages/public/PaymentCancel.jsx";
import AddToCart from "./pages/user/Addtocart.jsx";
import Cart from "./pages/user/Cart.jsx";
import ProfileEdit from "./pages/user/ProfileEdit.jsx";

import Drivers from "./pages/admin/Drivers.jsx";
import DriverForm from "./pages/admin/DriverForm.jsx";

import MediaList from "./pages/admin/MediaList.jsx";
import MediaForm from "./pages/admin/MediaForm.jsx";
import AdminReviews from "./pages/admin/Reviews.jsx";
import PromotionCodes from "./pages/admin/PromotionCodes.jsx";

import PackageForm from "./pages/admin/PackageForm.jsx";
import AdminVehicles from "./pages/admin/VehicleList.jsx";
import VehicleFormPage from "./pages/admin/VehicleForm.jsx";
import CustomerManagement from "./pages/admin/CustomerManagement.jsx";

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
          <Route path="/minneriya-safari" element={<Blog defaultPark="minneriya" />} />
          <Route path="/minneriya-jeep-safari" element={<Blog defaultPark="minneriya" />} />
          <Route path="/kaudulla-safari" element={<Blog defaultPark="kaudulla" />} />
          <Route path="/hurulu-safari" element={<Blog defaultPark="hurulu" />} />
          <Route path="/wasgamuwa-safari" element={<Blog defaultPark="wasgamuwa" />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/password-reset/:token" element={<ResetPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/booking" element={<GuestBooking />} />
          <Route path="/booking/:id" element={<GuestBooking />} />
          <Route path="/help/:type" element={<PolicyPage />} />
          <Route path="/privacy-policy" element={<PolicyPage />} />
          <Route path="/terms-and-conditions" element={<PolicyPage />} />
          <Route path="/return-refund-policy" element={<PolicyPage />} />
                <Route path="/write-review" element={<GuestReviewPage layout="standalone" />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
          <Route path="/addtocart/:id" element={<AddToCart />} />

          {/* Customer Routes */}
          <Route element={<CustomerLayout />}>
            <Route
              path="/dashboard"
              element={<Navigate to="/user/dashboard" replace />}
            />
            <Route path="/user/dashboard" element={<CustomerDashboard user={user} />} />
            <Route path="/user/packages" element={<CustomerPackages />} />
            <Route path="/user/reviews" element={<Review />} />
            <Route path="/user/bookings" element={<MyBookings />} />
            <Route path="/user/bookings/:id/edit" element={<Cancellation />} />
            <Route path="/user/cart" element={<Cart />} />
            <Route path="/user/profile/edit" element={<ProfileEdit />} />
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
            <Route path="customers" element={<CustomerManagement />} />
            <Route path="packages" element={<Packages />} />
            <Route path="drivers" element={<Drivers />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="earnings-and-reports" element={<Appointments />} />
            <Route path="appointments" element={<Navigate to="/admin/earnings-and-reports" replace />} />
            <Route path="earning-reports" element={<EarningReports />} />
            <Route path="booking-summary" element={<BookingSummary />} />
            <Route path="media" element={<MediaList />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="promotion-codes" element={<PromotionCodes />} />
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

          
          
         
          

          {/* fallback */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
