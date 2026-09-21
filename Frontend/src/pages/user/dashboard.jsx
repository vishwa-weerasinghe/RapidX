import React, { useState, useEffect } from 'react'
import { BookingProvider } from '../../context/BookingContext'
import { BookingCard } from "../../components/user-dashboard/BookingCard";
import { CartCard } from '../../components/user-dashboard/CartCard'
import { CancellationMessage } from '../../components/user-dashboard/Cancellation_Message'
import { HeroCountdown } from '../../components/user-dashboard/Upcoming-safari'
import SummaryStats from '../../components/user-dashboard/Summary-Card'
import { CompletedSafari } from '../../components/user-dashboard/Completed_safari'

export default function CustomerDashboard({ user: propUser }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : propUser;
    } catch {
      return propUser;
    }
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch { /* ignore */ }
  }, []);

        return (
    <BookingProvider>
      <div className="min-h-screen bg-offwhite dark:bg-bg-dark text-charcoal dark:text-white p-4 md:p-8 space-y-8 transition-colors duration-300">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Customer Dashboard</h1>
          <p className="mt-4 sm:mt-6 text-muted dark:text-gray-400">
            Welcome, <strong className="text-sacramento dark:text-amber-400">{currentUser?.User_Name || "Customer"}</strong>!  Explore exciting destinations and create unforgettable memories in the wild.
          </p>
        </div>

        {/* Hero cards — same max width during layout */}
        <div className="mx-auto w-full max-w-[820px] px-4 sm:px-6">
          <SummaryStats />
        </div>

        <div className="mx-auto w-full max-w-[820px] px-4 sm:px-6">
          <HeroCountdown user={currentUser} />
        </div>

        <div className="mx-auto w-full max-w-[820px] px-4 sm:px-6">
          <CompletedSafari />
        </div>

        {/* Two-column-grid of supporting cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <BookingCard user={currentUser} />
          <CartCard user={currentUser} />
          <CancellationMessage user={currentUser} />
        </div>
      </div>
    </BookingProvider>
  );
}