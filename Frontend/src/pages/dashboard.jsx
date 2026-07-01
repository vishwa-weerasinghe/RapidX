import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerDashboard from "./user/dashboard";
import AdminDashboard from "./admin/dashboard";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    // Check if user is logged in
    if (!token || !userStr) {
      console.log("No token or user found");
      navigate("/login", { replace: true });
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      
      if (!userData) {
        console.log("Invalid user data");
        navigate("/login", { replace: true });
        return;
      }

      setUser(userData);
      setLoading(false);
    } catch (error) {
      console.log("Error parsing user:", error);
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Show appropriate dashboard based on role
  if (user?.role === "admin") {
    return <AdminDashboard user={user} />;
  }

  return <CustomerDashboard user={user} />;
}
