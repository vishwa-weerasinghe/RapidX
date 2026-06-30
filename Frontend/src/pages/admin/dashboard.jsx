export default function AdminDashboard({ user }) {
    return (
    <div className="min-h-screen bg-slate-900 text-white">
      <main className="p-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-4 text-slate-300">
          Welcome, <strong className="text-emerald-400">{user?.User_Name || "Admin"}</strong>
        </p>
      </main>
    </div>
  );
}