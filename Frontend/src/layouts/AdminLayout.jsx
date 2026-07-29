import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ProtectedRoute from "../components/ProtectedRoute";
import { Header } from "../components/admin-dashboard/header";

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ProtectedRoute role="admin">
      <div className="flex min-h-screen bg-gray-50 dark:bg-neutral-900 relative">
        <Sidebar role="Admin" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        {/* Mobile Sidebar Backdrop */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Right side content wrapper */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 p-4 sm:p-6 overflow-x-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
