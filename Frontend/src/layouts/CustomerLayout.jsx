import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Header } from "../components/user-dashboard/Header";

export default function CustomerLayout() {
  const user = (() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  })();

  return (
    <div className="flex min-h-screen">
      <Sidebar role="customer" />

      <div className="flex-1 flex flex-col">
        <Header user={user} />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
