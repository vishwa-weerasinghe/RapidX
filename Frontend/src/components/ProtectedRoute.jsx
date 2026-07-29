import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role = "customer" }) {
  const user = (() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  })();

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Get the user's role
  const userRole = `${user?.role ?? user?.Role ?? user?.user_type ?? "customer"}`.toLowerCase();
  const isAdmin = ["admin", "administrator", "superadmin"].includes(userRole);

  // If the route requires customer role but user is admin, redirect to admin dashboard
  if (role === "customer" && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If the route requires admin role but user is customer, redirect to user dashboard
  if (role === "admin" && !isAdmin) {
    return <Navigate to="/user/dashboard" replace />;
  }

  return children;
}