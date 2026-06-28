import Sidebar from "../../components/Sidebar";

export default function CustomerDashboard({ user }) {
  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      <Sidebar role="customer" />

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold">Customer Dashboard</h1>
        <p className="mt-4 text-slate-300">
          Welcome, <strong className="text-emerald-400">{user?.User_Name || "Customer"}</strong>! This panel will manage your bookings.
        </p>
      </main>
    </div>
  );
}