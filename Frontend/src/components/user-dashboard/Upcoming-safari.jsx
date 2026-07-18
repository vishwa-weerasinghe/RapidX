import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { differenceInDays, format } from 'date-fns'
import { MapPin, Truck, Calendar, Compass } from 'lucide-react'
import api from '../../axios'
import { useTheme } from '../../context/ThemeContext'

export function HeroCountdown({ user }) {
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const { theme } = useTheme()

  const customerId = user?.Customer_ID
  const isDark = theme === 'dark'

  // Dark mode: golden brown background + chocolate brown content
  // Light mode: olive green background + hunter green content
  const primaryBg = isDark ? 'bg-amber-700' : 'bg-emerald-700'
  const primaryGradient = isDark
    ? 'from-amber-700 via-amber-700/60 to-transparent'
    : 'from-emerald-700 via-emerald-700/60 to-transparent'
  const badgeBg = isDark ? 'bg-amber-800/40' : 'bg-emerald-800/40'
  const badgeBorder = isDark ? 'border-amber-600/30' : 'border-emerald-600/30'
  const infoBg = isDark ? 'bg-amber-800/40' : 'bg-emerald-800/40'
  const infoBorder = isDark ? 'border-amber-600/20' : 'border-emerald-600/20'
  const accentText = isDark ? 'text-amber-200' : 'text-emerald-200'
  const countdownNum = isDark ? 'text-amber-200' : 'text-emerald-200'
  const pulseDot = isDark ? 'bg-amber-300' : 'bg-emerald-300'
  const textMuted = isDark ? 'text-amber-100/70' : 'text-emerald-100/70'

  useEffect(() => {
    if (!customerId) {
      setLoading(false)
      return
    }

    api.get(`/user-upcoming-booking/${customerId}`)
      .then((res) => {
        setBooking(res.data)
        setLoading(false)
      })
      .catch(() => {
        setBooking(null)
        setLoading(false)
      })
  }, [customerId])

  if (loading) {
    return (
      <section className={`relative w-full rounded-3xl overflow-hidden ${primaryBg} text-white shadow-xl p-6 sm:p-10 lg:p-12`}>
        <p className={`${textMuted} text-lg`}>Loading your upcoming safari...</p>
      </section>
    )
  }

  if (!booking) {
    return null
  }

  const safariDate = new Date(booking.Booking_Date)
  const daysUntil = differenceInDays(safariDate, new Date())
  const pkg = booking.package
  const vehicle = booking.vehicle

  return (
    <section className={`relative w-full rounded-3xl overflow-hidden ${primaryBg} text-white shadow-xl`}>
      {/* Background Gradient */}
      <div className="absolute inset-0 w-full h-full">
        <div className={`absolute inset-0 bg-gradient-to-t ${primaryGradient}`}></div>
      </div>

      <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        {/* Left: Destination & Countdown */}
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${badgeBg} backdrop-blur-sm ${badgeBorder} text-sm font-medium mb-6`}>
              <span className={`w-2 h-2 rounded-full ${pulseDot} animate-pulse`}></span>
              {daysUntil <= 0 ? 'Today' : 'Upcoming Safari'}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif mb-4 leading-tight">
              {pkg?.Package_Name || 'Safari Adventure'}
            </h1>

            <div className="flex items-baseline gap-3 mb-2">
              <span className={`text-6xl sm:text-7xl font-serif font-light tracking-tighter ${countdownNum}`}>
                {daysUntil > 0 ? daysUntil : 0}
              </span>
              <span className={`text-xl sm:text-2xl font-medium ${accentText} uppercase tracking-widest`}>
                {daysUntil > 0 ? 'Days to go' : 'Today is the day!'}
              </span>
            </div>
            <p className={textMuted + ' text-lg'}>
              Safari Date: {format(safariDate, 'MMMM do, yyyy')}
            </p>
          </motion.div>
        </div>

        {/* Right: Trip Facts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`grid grid-cols-2 gap-4 sm:gap-6 ${infoBg} backdrop-blur-md p-6 rounded-2xl ${infoBorder}`}
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Calendar className="w-4 h-4" />
              <span>Date</span>
            </div>
            <span className="font-medium text-lg">
              {format(safariDate, 'MMM do')}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Truck className="w-4 h-4" />
              <span>Vehicle</span>
            </div>
            <span className="font-medium text-lg">
              {vehicle?.Vehicle_No || 'Assigned'}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Compass className="w-4 h-4" />
              <span>Guests</span>
            </div>
            <span className="font-medium text-lg">
              {Number(booking.No_of_adults) + Number(booking.No_of_child)} Guest(s)
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <MapPin className="w-4 h-4" />
              <span>Pickup</span>
            </div>
            <span
              className="font-medium text-lg truncate"
              title={booking.Pickup_Location}
            >
              {booking.Pickup_Location}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}