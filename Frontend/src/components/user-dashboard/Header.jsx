import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Menu, LogOut } from 'lucide-react'
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

  const customerName = user?.User_Name || 'Customer'

  const customerId = user?.Customer_ID

  const fetchUnreadBookings = async () => {
    if (!customerId) return

    try {
      const response = await api.get(`/customer/${customerId}/booking-notifications/unread-count`)
      setUnreadBookings(response.data.count || 0)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchUnreadBookings()
    const interval = setInterval(fetchUnreadBookings, 5000)
    return () => clearInterval(interval)
  }, [customerId])

  const handleBookingNotifications = async () => {
    try {
      const response = await api.get(`/customer/${customerId}/booking-notifications`)
      setBookingNotifications(response.data || [])
      setShowBookingNotifications((current) => !current)
      await api.post(`/customer/${customerId}/booking-notifications/mark-seen`)
      setUnreadBookings(0)
    } catch (err) {
      console.error(err)
    }
  }

  

  

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

        {/* Center Nav - Home & Book Now */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="btn-primary rounded-full"
          >
            Home
          </button>
          <button
            onClick={() => navigate('/user/packages')}
            className="btn-primary rounded-full"
          >
            Book Now
          </button>
        </div>

        {/* Right Nav */}
        <div className="flex items-center gap-4">
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

          <button
            onClick={handleLogout}
            disabled={loading}
            className="btn-danger rounded-full"
          >
            <LogOut className="w-4 h-4" />
            <span>{loading ? 'Logging out...' : 'Logout'}</span>
          </button>
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