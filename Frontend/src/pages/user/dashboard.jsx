import React, { useState, useEffect } from 'react'
import { BookingCard } from "../../components/user-dashboard/BookingCard";
import { CartCard } from '../../components/user-dashboard/CartCard'

export default function CustomerDashboard({ user: propUser }) {
  const [currentUser, setCurrentUser] = useState(propUser);

  useEffect(() => {
    // If propUser is null (main.jsx evaluated before login), read directly from localStorage
    if (!propUser) {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          setCurrentUser(JSON.parse(stored));
        }
      } catch { /* ignore */ }
    }
  }, [propUser]);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <main className="p-8">
        <h1 className="text-3xl font-bold">Customer Dashboard</h1>
        <p className="mt-4 text-slate-300">
          Welcome, <strong className="text-emerald-400">{currentUser?.User_Name || "Customer"}</strong>! This panel will manage your bookings.
        </p>

        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          <BookingCard user={currentUser} />
          <CartCard user={currentUser} />
        </div>
      </main>
    </div>
  );
}
