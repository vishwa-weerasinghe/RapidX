import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

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
      const user = JSON.parse(userStr);
      
      if (!user || !user.role) {
        console.log("Invalid user data");
        navigate("/login", { replace: true });
        return;
      }

      // Redirect based on user role
      if (user.role === "admin") {
        console.log("Redirecting to admin dashboard");
        navigate("/admin/dashboard", { replace: true });
      } else {
        console.log("Redirecting to user dashboard");
        navigate("/user/dashboard", { replace: true });
      }
    } catch (error) {
      console.log("Error parsing user:", error);
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return null;
}
