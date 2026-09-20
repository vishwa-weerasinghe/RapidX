import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { differenceInDays, format } from 'date-fns'
import { MapPin, Calendar, Compass, CalendarCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../axios'
import { useTheme } from '../../context/ThemeContext'
import upcomingSafariImg from '../../assets/upcomingsafari.jpg'

export function HeroCountdown({ user }) {
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const { theme } = useTheme()
  const navigate = useNavigate()

  const customerId = user?.Customer_ID
  const isDark = theme === 'dark'

  // Match the Summary-Card style: theme-tinted overlay + theme-aware text
  const cardClass = 'card relative isolate w-full overflow-hidden'
  const overlayTint = isDark ? 'bg-bg-dark/75' : 'bg-offwhite/45'
  const pillClass = `inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium backdrop-blur-sm ${
    isDark
      ? 'border-border-dark bg-surface/80 text-white'
      : 'border-border-light bg-white/70 text-charcoal'
  }`
  const panelClass = `rounded-2xl border p-4 sm:p-6 backdrop-blur-sm ${
    isDark
      ? 'border-border-dark bg-surface/80 text-white'
      : 'border-border-light bg-white/70 text-charcoal'
  }`
  const labelClass = isDark
    ? 'text-[15px] font-medium text-white/90'
    : 'text-[15px] font-medium text-charcoal'
  const pulseDot = isDark ? 'bg-sacramento-300' : 'bg-sacramento'

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
      <section className={`${cardClass} p-6 sm:p-10 lg:p-12`}>
        <p className={`text-lg font-medium ${labelClass}`}>
          Loading your upcoming safari...
        </p>
      </section>
    )
  }

  const safariDate = booking?.Booking_Date
    ? new Date(booking.Booking_Date)
    : null

  const isValid = safariDate && !isNaN(safariDate.getTime())

  if (!booking || !isValid) {
    return (
      <section className={`${cardClass} min-h-[380px] sm:min-h-[420px]`}>
        {/* Background Image + theme tint (same treatment as Summary-Card) */}
        <div className="absolute inset-0 z-0 h-full w-full">
          <img
            src={upcomingSafariImg}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-center"
          />
          <div className={`absolute inset-0 ${overlayTint}`} />
        </div>

        <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6 md:gap-8">
          {/* Left: Friendly Message + CTA */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Badge */}
              <div className={`${pillClass} mb-4`}>
                <span
                  className={`w-2 h-2 rounded-full ${pulseDot} animate-pulse`}
                ></span>

                Your Next Adventure
              </div>

              {/* Heading */}
              <h1
                className={`text-2xl sm:text-3xl lg:text-4xl font-serif mb-2 leading-tight ${
                  isDark ? 'text-white' : 'text-charcoal'
                }`}
              >
                No safari planned yet, ready for your next adventure?
              </h1>

              {/* Description */}
              <p className={`text-lg font-medium ${labelClass}`}>
                Explore our packages and start planning your unforgettable
                safari experience.
              </p>

              {/* CTA */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                onClick={() => navigate('/user/packages')}
                className="btn-primary rounded-xl px-5 py-2.5 text-[14px] font-semibold whitespace-nowrap mt-6"
              >
                <CalendarCheck size={18} />
                Book Now
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>
    )
  }

  const daysUntil = differenceInDays(safariDate, new Date())
  const pkg = booking.package

  return (
    <section className={`${cardClass} min-h-[420px] sm:min-h-[460px]`}>
      {/* Background Photo + theme tint (same treatment as Summary-Card) */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <img
          src={upcomingSafariImg}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-center"
        />
        <div className={`absolute inset-0 ${overlayTint}`} />
      </div>

      <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
        {/* Left: Destination & Countdown */}
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className={`${pillClass} mb-6`}>
              <span
                className={`w-2 h-2 rounded-full ${pulseDot} animate-pulse`}
              ></span>

              {daysUntil <= 0 ? 'Today' : 'Upcoming Safari'}
            </div>

            {/* Package Name */}
            <h1
              className={`text-4xl sm:text-5xl lg:text-6xl font-serif mb-4 leading-tight ${
                isDark ? 'text-white' : 'text-charcoal'
              }`}
            >
              {pkg?.Package_Name || 'Safari Adventure'}
            </h1>

            {/* Countdown */}
            <div className="flex items-baseline gap-3 mb-2">
              <span
                className={`text-6xl sm:text-7xl font-serif font-light tracking-tighter ${
                  isDark ? 'text-white' : 'text-sacramento'
                }`}
              >
                {daysUntil > 0 ? daysUntil : 0}
              </span>

              <span
                className={`text-xl sm:text-2xl font-medium ${
                  isDark ? 'text-sacramento-300' : 'text-sacramento'
                } uppercase tracking-widest`}
              >
                {daysUntil > 0 ? 'Days to go' : 'Today is the day!'}
              </span>
            </div>

            {/* Safari Date */}
            <p className={`text-lg font-medium ${labelClass}`}>
              Safari Date:{' '}
              {format(safariDate, 'MMMM do, yyyy')}
            </p>
          </motion.div>
        </div>

        {/* Right: Trip Facts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 ${panelClass}`}
        >
          {/* Date */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm">
              <Calendar
                className={`w-4 h-4 ${isDark ? 'text-sacramento-300' : 'text-sacramento'}`}
              />
              <span className={isDark ? 'text-white/80' : 'text-charcoal/75'}>
                Date
              </span>
            </div>

            <span
              className={`font-medium text-lg ${
                isDark ? 'text-white' : 'text-charcoal'
              }`}
            >
              {format(safariDate, 'MMM do')}
            </span>
          </div>

          {/* Guests */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm">
              <Compass
                className={`w-4 h-4 ${isDark ? 'text-sacramento-300' : 'text-sacramento'}`}
              />
              <span className={isDark ? 'text-white/80' : 'text-charcoal/75'}>
                Guests
              </span>
            </div>

            <span
              className={`font-medium text-lg ${
                isDark ? 'text-white' : 'text-charcoal'
              }`}
            >
              {Number(booking.No_of_adults) +
                Number(booking.No_of_child)}{' '}
              Guest(s)
            </span>
          </div>

          {/* Pickup */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm">
              <MapPin
                className={`w-4 h-4 ${isDark ? 'text-sacramento-300' : 'text-sacramento'}`}
              />
              <span className={isDark ? 'text-white/80' : 'text-charcoal/75'}>
                Pickup
              </span>
            </div>

            <span
              className={`font-medium text-lg truncate ${
                isDark ? 'text-white' : 'text-charcoal'
              }`}
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