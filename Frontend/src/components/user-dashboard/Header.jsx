import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, LogOut } from 'lucide-react'
import api from '../../axios'
import { useTheme } from '../../context/ThemeContext'
import ThemeModeIcon from '../ThemeModeIcon'

export function Header({ user }) {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  
  const [loading, setLoading] = useState(false)

  const customerName = user?.User_Name || 'Customer'

  const customerId = user?.Customer_ID

  

  

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
        {/* Brand */}
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

          <button
            onClick={handleLogout}
            disabled={loading}
            className="btn-danger rounded-full"
          >
            <LogOut className="w-4 h-4" />
            <span>{loading ? 'Logging out...' : 'Logout'}</span>
          </button>

          <button className="p-2 text-sacramento dark:text-white sm:hidden">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  )
}