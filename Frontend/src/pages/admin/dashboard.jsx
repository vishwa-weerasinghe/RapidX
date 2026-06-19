import { useState } from "react";

export default function AdminDashboard({ user }) {
    return (
        <div className="p-8 bg-slate-900 text-white min-h-screen">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="mt-4 text-slate-300">Welcome back, <strong className="text-emerald-400">{user?.User_Name || 'Administrator'}</strong>! This panel will manage bookings, packages, vehicles, and drivers.</p>
        </div>
    );
}
