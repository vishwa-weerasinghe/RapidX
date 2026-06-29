import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function CustomerLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar role="customer" />

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
