import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ProtectedRoute from "../components/ProtectedRoute";
import { Header } from "../components/admin-dashboard/header";

export default function AdminLayout() {
  return (
    <ProtectedRoute role="admin">
      <div className="flex min-h-screen bg-gray-50 dark:bg-neutral-900">
        <Sidebar role="Admin" />
        
        {/* Right side content wrapper */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
