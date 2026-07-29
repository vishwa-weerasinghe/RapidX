import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, ShoppingCart, LogOut } from 'lucide-react'
import api from '../../axios'
import { useTheme } from '../../context/ThemeContext'
import ThemeModeIcon from '../ThemeModeIcon'

export function Header({ user }) {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [cartCount, setCartCount] = useState(0)
  const [newCartCount, setNewCartCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const customerName = user?.User_Name || 'Customer'

  const customerId = user?.Customer_ID

  useEffect(() => {
    if (!customerId) return

    api.get(`/cart/${customerId}`)
      .then((res) => {
        const total = Array.isArray(res.data) ? res.data.length : 0
        setCartCount(total)
        const lastSeen = parseInt(localStorage.getItem("lastSeenCartCount") || "0", 10)
        setNewCartCount(Math.max(0, total - lastSeen))
      })
      .catch(() => {
        setCartCount(0)
        setNewCartCount(0)
      })
  }, [customerId])

  const handleCartClick = () => {
    localStorage.setItem("lastSeenCartCount", String(cartCount))
    setNewCartCount(0)
    navigate('/user/cart')
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
    <header className="sticky top-0 z-50 w-full bg-[#f8f4eb] dark:bg-[#050505] backdrop-blur-md transition-colors duration-300 border-b border-[#dce8d7] dark:border-[#15311f]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0f3d2e] rounded-full flex items-center justify-center">
            <span className="text-[#f8f4eb] font-serif font-bold text-lg leading-none">
              W
            </span>
          </div>
          <span className="font-serif font-semibold text-xl text-[#0f3d2e] tracking-wide hidden sm:block">
            Wild Safari
          </span>
        </div>

        {/* Center Nav - Home & Book Now */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2 text-sm font-semibold text-white bg-[#0f3d2e] hover:bg-[#0c3327] transition-colors rounded-full shadow-sm"
          >
            Home
          </button>
          <button
            onClick={() => navigate('/user/packages')}
            className="px-5 py-2 text-sm font-semibold text-white bg-[#0f3d2e] hover:bg-[#0c3327] transition-colors rounded-full shadow-sm"
          >
            Book Now
          </button>
        </div>

        {/* Right Nav */}
        <div className="flex items-center gap-4">
          {/* Dark/Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center rounded-full p-1 transition-all duration-300 bg-slate-200 dark:bg-slate-700"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <ThemeModeIcon className="w-5 h-5" />
          </button>

          <button
            onClick={handleCartClick}
            className="p-2 text-[#4b5d47] hover:text-[#0f3d2e] dark:text-[#b3c4b1] dark:hover:text-[#0f3d2e] transition-colors relative"
          >
            <ShoppingCart className="w-5 h-5" />
            {newCartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#0f3d2e] text-[#f8f4eb] text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#f8f4eb] dark:border-[#050505]">
                {newCartCount}
              </span>
            )}
          </button>

          <div className="h-6 w-px bg-[#dce8d7] dark:bg-[#1f3b25] mx-1"></div>

          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex items-center gap-2 rounded-full border border-red-600 dark:border-red-500 bg-red-600 dark:bg-red-500 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 dark:hover:bg-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-4 h-4" />
            <span>{loading ? 'Logging out...' : 'Logout'}</span>
          </button>

          <button className="p-2 text-[#1f2b20] dark:text-[#f5f7f2] sm:hidden">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  )
}