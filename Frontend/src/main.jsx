import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Register from "./pages/user/register.jsx";
import Login from "./pages/public/login.jsx";
import Dashboard from "./pages/dashboard.jsx";
import AdminPackages from "./pages/admin/Packages.jsx";
import PackageForm from "./pages/admin/PackageForm.jsx";
import Drivers from "./pages/admin/Drivers.jsx";
import DriverForm from "./pages/admin/DriverForm.jsx";
import MediaList from "./pages/admin/MediaList.jsx";
import MediaForm from "./pages/admin/MediaForm.jsx";


// admin pages
import AdminLayout from "./layouts/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/dashboard.jsx";
import Packages from "./pages/admin/Packages.jsx";
import Bookings from "./pages/admin/Bookings.jsx";

const user = JSON.parse(localStorage.getItem("user"));

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Admin Routes (with Sidebar Layout) */}
        <Route path="/admin" element={<AdminLayout key="admin-layout" />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="packages" element={<Packages />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="media" element={<MediaList />} />
        </Route>

        <Route path="/admin/packages" element={<AdminPackages user={user} />} />
        <Route path="/admin/packages/create" element={<PackageForm user={user} />} />
        <Route path="/admin/packages/:id/edit" element={<PackageForm user={user} />} />

        <Route path="/admin/drivers" element={<Drivers user={user} />} />
        <Route path="/admin/drivers/create" element={<DriverForm user={user} />} />
        <Route path="/admin/drivers/:id/edit" element={<DriverForm user={user} />} />

        <Route path="/admin/media" element={<MediaList user={user} />} />
        <Route path="/admin/media/create" element={<MediaForm user={user} />} />
        <Route path="/admin/media/:id/edit" element={<MediaForm user={user} />} />



        {/* Fallback to login if route doesn't exist */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>





    </BrowserRouter>
  </StrictMode>,
);
