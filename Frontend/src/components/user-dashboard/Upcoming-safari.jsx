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

  const primaryBg = isDark ? 'bg-[#101813]' : 'bg-[#F8F6F0]'
  const primaryGradient = isDark ? 'from-[#1D2B22] via-[#2F4437]/80 to-transparent' : 'from-[#E6E2D8] via-[#F8F6F0]/80 to-transparent'
  const badgeBg = isDark ? 'bg-[#1D2B22]/70' : 'bg-[#FFFFFF]/80'
  const badgeBorder = isDark ? 'border-[#2F4437]' : 'border-[#E6E2D8]'
  const infoBg = isDark ? 'bg-[#1D2B22]/80' : 'bg-[#FFFFFF]/70'
  const infoBorder = isDark ? 'border-[#2F4437]' : 'border-[#E6E2D8]'
  const accentText = isDark ? 'text-[#E6C15A]' : 'text-[#D4A017]'
  const countdownNum = isDark ? 'text-[#F5F5F5]' : 'text-[#263238]'
  const pulseDot = isDark ? 'bg-[#66BB6A]' : 'bg-[#2E7D32]'
  const textMuted = isDark ? 'text-[#F5F5F5]/80' : 'text-[#263238]/75'

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
      <section className={`relative w-full overflow-hidden rounded-3xl border ${primaryBg} ${isDark ? 'border-[#2F4437] text-[#F5F5F5]' : 'border-[#E6E2D8] text-[#263238]'} shadow-xl p-6 sm:p-10 lg:p-12`}>
        <p className={`${textMuted} text-lg`}>Loading your upcoming safari...</p>
      </section>
    )
  }

  if (!booking) {
    return null
  }

  const safariDate = booking?.Booking_Date ? new Date(booking.Booking_Date) : null
  const isValid = safariDate && !isNaN(safariDate.getTime())

  if (!booking || !isValid) {
    return null
  }

  const daysUntil = differenceInDays(safariDate, new Date())
  const pkg = booking.package
  const vehicle = booking.vehicle

  return (
    <section className={`relative w-full overflow-hidden rounded-3xl border ${primaryBg} ${isDark ? 'border-[#2F4437] text-[#F5F5F5]' : 'border-[#E6E2D8] text-[#263238]'} shadow-xl`}>
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
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${badgeBg} backdrop-blur-sm ${badgeBorder} border text-sm font-medium mb-6`}>
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
          className={`grid grid-cols-2 gap-4 sm:gap-6 ${infoBg} backdrop-blur-md p-6 rounded-2xl border ${infoBorder}`}
        >
          <div className="flex flex-col gap-1">
            <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-[#F5F5F5]/60' : 'text-[#263238]/60'}`}>
              <Calendar className="w-4 h-4" />
              <span>Date</span>
            </div>
            <span className="font-medium text-lg">
              {format(safariDate, 'MMM do')}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-[#F5F5F5]/60' : 'text-[#263238]/60'}`}>
              <Truck className="w-4 h-4" />
              <span>Vehicle</span>
            </div>
            <span className="font-medium text-lg">
              {vehicle?.Vehicle_No || 'Assigned'}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-[#F5F5F5]/60' : 'text-[#263238]/60'}`}>
              <Compass className="w-4 h-4" />
              <span>Guests</span>
            </div>
            <span className="font-medium text-lg">
              {Number(booking.No_of_adults) + Number(booking.No_of_child)} Guest(s)
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-[#F5F5F5]/60' : 'text-[#263238]/60'}`}>
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