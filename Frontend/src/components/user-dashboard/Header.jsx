import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, ShoppingCart, Sun, Moon } from 'lucide-react'
import api from '../../axios'
import { useTheme } from '../../context/ThemeContext'

export function Header({ user, toggleSidebar }) {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [cartCount, setCartCount] = useState(0)

  const customerName = user?.User_Name || 'Customer'
  const firstLetter = customerName.charAt(0).toUpperCase()

  const customerId = user?.Customer_ID

  useEffect(() => {
    if (!customerId) return

    api.get(`/cart/${customerId}`)
      .then((res) => {
        setCartCount(Array.isArray(res.data) ? res.data.length : 0)
      })
      .catch(() => {
        setCartCount(0)
      })
  }, [customerId])

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
            onClick={() => navigate('/user/cart')}
            className="p-2 text-safari-muted hover:text-safari-green dark:text-gray-400 dark:hover:text-yellow-400 transition-colors relative"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-safari-terracotta dark:bg-yellow-400 text-white dark:text-black text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-safari-bone dark:border-black">
                {cartCount}
              </span>
            )}
          </button>

          <div className="h-6 w-px bg-safari-border/50 dark:bg-gray-700 mx-1"></div>

          <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-safari-text dark:text-gray-200">
                {customerName}
              </div>
              <div className="text-xs text-safari-muted dark:text-gray-400">My Account</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-safari-green dark:bg-yellow-400 flex items-center justify-center text-white dark:text-black font-bold text-sm shadow-sm">
              {firstLetter}
            </div>
          </button>

          <button 
            onClick={toggleSidebar}
            className="p-2 text-safari-text dark:text-gray-200 md:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  )
}