import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, ShoppingCart, Sun, Moon, LogOut } from 'lucide-react'
import api from '../../axios'
import { useTheme } from '../../context/ThemeContext'

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
    <header className="sticky top-0 z-50 w-full bg-stone-50 dark:bg-neutral-900 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-safari-green dark:bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-safari-sand dark:text-black font-serif font-bold text-lg leading-none">
              W
            </span>
          </div>
          <span className="font-serif font-semibold text-xl text-safari-green dark:text-yellow-400 tracking-wide hidden sm:block">
            Wild Safari
          </span>
        </div>

        {/* Center Nav - Home & Book Now */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2 text-sm font-semibold text-white bg-safari-green dark:bg-yellow-500 hover:bg-safari-green/90 dark:hover:bg-yellow-400 transition-colors rounded-full shadow-sm"
          >
            Home
          </button>
          <button
            onClick={() => navigate('/user/packages')}
            className="px-5 py-2 text-sm font-semibold text-white bg-safari-green dark:bg-yellow-500 hover:bg-safari-green/90 dark:hover:bg-yellow-400 transition-colors rounded-full shadow-sm"
          >
            Book Now
          </button>
        </div>

        {/* Right Nav */}
        <div className="flex items-center gap-4">
          {/* Dark/Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-safari-muted hover:text-safari-green dark:text-gray-400 dark:hover:text-yellow-400 transition-colors rounded-lg hover:bg-safari-green/5 dark:hover:bg-yellow-500/10"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={handleCartClick}
            className="p-2 text-safari-muted hover:text-safari-green dark:text-gray-400 dark:hover:text-yellow-400 transition-colors relative"
          >
            <ShoppingCart className="w-5 h-5" />
            {newCartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-safari-terracotta dark:bg-yellow-400 text-white dark:text-black text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-safari-bone dark:border-black">
                {newCartCount}
              </span>
            )}
          </button>

          <div className="h-6 w-px bg-safari-border/50 dark:bg-gray-700 mx-1"></div>

          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex items-center gap-2 rounded-full border border-safari-border/60 dark:border-gray-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 shadow-sm hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-4 h-4" />
            <span>{loading ? 'Logging out...' : 'Logout'}</span>
          </button>

          <button className="p-2 text-safari-text dark:text-gray-200 sm:hidden">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  )
}