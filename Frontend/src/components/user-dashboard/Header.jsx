import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Menu, LogOut, ChevronDown, UserRound, FileText, ShieldCheck, Home } from 'lucide-react'
import api from '../../axios'
import { useTheme } from '../../context/ThemeContext'
import ThemeModeIcon from '../ThemeModeIcon'

export function Header({ user, toggleSidebar }) {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  const [loading, setLoading] = useState(false)
  const [unreadBookings, setUnreadBookings] = useState(0)
  const [bookingNotifications, setBookingNotifications] = useState([])
  const [showBookingNotifications, setShowBookingNotifications] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const accountMenuRef = useRef(null)

  const customerName = [user?.First_Name, user?.Last_Name].filter(Boolean).join(' ') || user?.User_Name || ''
  const customerInitials = customerName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((namePart) => namePart.charAt(0).toUpperCase())
    .join('')

  const customerId = user?.Customer_ID

  const fetchUnreadBookings = async () => {
    if (!customerId) return;
    const token = localStorage.getItem('token');
    if (!token) {
      setUnreadBookings(0);
      return;
    }

    try {
      const response = await api.get(`/customer/${customerId}/booking-notifications/unread-count`);
      setUnreadBookings(response.data.count || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!customerId || !token) return;
    fetchUnreadBookings();
    const interval = setInterval(fetchUnreadBookings, 30000);
    return () => clearInterval(interval);
  }, [customerId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setShowAccountMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleBookingNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await api.get(`/customer/${customerId}/booking-notifications`);
      setBookingNotifications(response.data || []);
      setShowBookingNotifications((current) => !current);
      await api.post(`/customer/${customerId}/booking-notifications/mark-seen`);
      setUnreadBookings(0);
    } catch (err) {
      console.error(err);
    }
  };





  const handleLogout = async () => {
    setLoading(true)

    try {
      const token = localStorage.getItem('token')

      if (token) {
        await api.post(
          '/logout',
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      }
    } catch (err) {
      console.error(err)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setLoading(false)
      navigate('/')
    }
  }

  const handleMenuAction = (path) => {
    setShowAccountMenu(false)
    navigate(path)
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-offwhite backdrop-blur-md transition-colors duration-300 border-b border-border-light dark:bg-bg-dark dark:border-border-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Mobile Menu */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 text-muted hover:text-sacramento dark:text-gray-400 dark:hover:text-sacramento-300 md:hidden rounded-lg hover:bg-sacramento/10 dark:hover:bg-surface-2 transition-colors"
            title="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-sacramento dark:bg-sacramento-400">
              <span className="text-white font-serif font-bold text-lg leading-none">
                W
              </span>
            </div>
            <span className="font-serif font-semibold text-xl text-charcoal dark:text-white tracking-wide hidden sm:block">
              Wild Safari
            </span>
          </div>
        </div>

        {/* Center Nav - Book Now */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => navigate('/user/packages')}
            className="btn-primary rounded-full"
          >
            Book Now
          </button>
        </div>

        {/* Right Nav */}
        <div className="flex items-center gap-4">
          {/* Home */}
          <button
            onClick={() => navigate('/')}
            className="p-2 text-muted hover:text-sacramento dark:text-gray-400 dark:hover:text-sacramento-300 transition-colors rounded-lg hover:bg-sacramento/10 dark:hover:bg-surface-2"
            title="Go to Website Home"
          >
            <Home className="w-5 h-5" />
          </button>

          {/* Dark/Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center rounded-full p-1 transition-all duration-300 bg-border-light dark:bg-border-dark"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <ThemeModeIcon className="w-5 h-5" />
          </button>



          <div className="mx-1 h-6 w-px bg-border-light dark:bg-border-dark"></div>

          <div className="relative">
            <button
              type="button"
              onClick={handleBookingNotifications}
              className="relative rounded-full p-2 text-sacramento hover:bg-border-light dark:text-white dark:hover:bg-border-dark"
              title="Booking notifications"
              aria-label="Booking notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadBookings > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                  {unreadBookings}
                </span>
              )}
            </button>
          </div>

          <div className="relative" ref={accountMenuRef}>
            <button
              type="button"
              onClick={() => setShowAccountMenu((current) => !current)}
              className="flex items-center gap-2 rounded-full border border-border-light bg-white px-2.5 py-2 text-sm font-semibold text-charcoal shadow-sm transition hover:bg-offwhite-100 dark:border-border-dark dark:bg-surface-2 dark:text-white dark:hover:bg-surface-3 sm:px-3"
              aria-label="Account menu"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sacramento text-xs font-bold text-white dark:bg-sacramento-400">
                {customerInitials}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {showAccountMenu && (
              <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border border-border-light bg-white shadow-xl dark:border-border-dark dark:bg-bg-dark">
                <button
                  type="button"
                  onClick={() => handleMenuAction('/user/profile/edit')}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-charcoal transition hover:bg-offwhite-100 dark:text-white dark:hover:bg-surface-2"
                >
                  <UserRound className="h-4 w-4 text-sacramento dark:text-amber-400" />
                  Edit Profile
                </button>

                <button
                  type="button"
                  onClick={() => handleMenuAction('/privacy-policy')}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-charcoal transition hover:bg-offwhite-100 dark:text-white dark:hover:bg-surface-2"
                >
                  <ShieldCheck className="h-4 w-4 text-sacramento dark:text-amber-400" />
                  Privacy Policy
                </button>

                <button
                  type="button"
                  onClick={() => handleMenuAction('/terms-and-conditions')}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-charcoal transition hover:bg-offwhite-100 dark:text-white dark:hover:bg-surface-2"
                >
                  <FileText className="h-4 w-4 text-sacramento dark:text-amber-400" />
                  Terms and Conditions
                </button>

                <div className="border-t border-border-light dark:border-border-dark">
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loading}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    <LogOut className="h-4 w-4" />
                    {loading ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showBookingNotifications && (
        <div className="absolute right-2 md:right-6 top-16 z-50 w-80 max-w-[calc(100vw-1rem)] rounded-xl border border-border-light bg-white p-3 shadow-xl dark:border-border-dark dark:bg-bg-dark">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold text-charcoal dark:text-white">Notifications</h2>
            <button
              type="button"
              onClick={() => navigate('/user/bookings')}
              className="text-xs font-semibold text-sacramento hover:underline"
            >
              View bookings
            </button>
          </div>
          {bookingNotifications.length === 0 ? (
            <p className="py-3 text-sm text-muted">No booking notifications.</p>
          ) : (
            <div className="max-h-[400px] sm:max-h-[500px] space-y-2 overflow-y-auto">
              {bookingNotifications.map((notification) => (
                <button
                  type="button"
                  key={notification.Booking_ID}
                  onClick={() => navigate('/user/bookings')}
                  className="w-full rounded-lg border border-border-light p-3 text-left hover:bg-offwhite-100 dark:border-border-dark dark:hover:bg-surface-2"
                >
                  <p className="text-xs font-bold text-red-600 dark:text-red-400">
                    {notification.package?.Package_Name || 'Safari package'} - {notification.Status}
                  </p>
                  <p className="mt-1 text-sm text-charcoal dark:text-white break-words whitespace-pre-line">
                    {notification.Customer_Message}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Safari date: {notification.Booking_Date}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  )
}