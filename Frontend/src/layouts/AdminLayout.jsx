import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AdminLayout() {
  return (
    <ProtectedRoute role="admin">
      <div className="flex min-h-screen">
        <Sidebar role="Admin" />

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
}
