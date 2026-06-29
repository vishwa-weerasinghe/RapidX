import Sidebar from "../../components/Sidebar";

export default function AdminDashboard({ user }) {
    return (
        <div className="flex min-h-screen bg-slate-900 text-white">
            <Sidebar role="admin" />

            <main className="flex-1 p-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="mt-4 text-slate-300">
                    Welcome back, <strong className="text-emerald-400">{user?.User_Name || "Admin"}</strong>!
                </p>
            </main>
        </div>
    );
}