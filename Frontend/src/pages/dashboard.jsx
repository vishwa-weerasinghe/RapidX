import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminDashboard from "./admin/dashboard.jsx";
import CustomerDashboard from "./user/dashboard.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!token || !user) {
      navigate("/login");
    }
  }, [token, user, navigate]);

  if (!user) return null;

  return user.role === "admin" ? (
    <AdminDashboard user={user} />
  ) : (
    <CustomerDashboard user={user} />
  );
}
