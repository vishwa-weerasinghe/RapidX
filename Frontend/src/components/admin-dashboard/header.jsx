import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Bell, LogOut, Home } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import api from '../../axios'
import ThemeModeIcon from '../ThemeModeIcon'
export function Header({ user, toggleSidebar }) {
    const navigate = useNavigate()
    const { theme, toggleTheme } = useTheme()
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const [loading, setLoading] = useState(false)
    const adminName = user?.User_Name || 'Admin'
    const firstLetter = adminName.charAt(0).toUpperCase()
    const handleLogout = async () => {
        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            if (token) {
                await api.post(
                    "/logout",
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }
        } catch (err) {
            console.error(err);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setLoading(false);
            navigate("/");
        }
    };
    return (
        <header className="sticky top-0 z-50 w-full bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 transition-colors duration-300">
            <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

                {/* Brand & Mobile Menu */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 text-gray-500 hover:text-sacramento dark:text-gray-400 dark:hover:text-castleton-300 md:hidden rounded-lg hover:bg-castleton-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/admin')}>
                        <div className="w-8 h-8 bg-sacramento rounded-lg flex items-center justify-center shadow-sm">
                            <span className="text-white font-serif font-bold text-lg leading-none">W</span>
                        </div>
                        <span className="font-serif font-semibold text-xl text-sacramento dark:text-castleton-300 tracking-wide hidden sm:block">
                            Admin Portal
                        </span>
                    </div>
                </div>

                {/* Right Nav */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Navigate Home */}
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 text-gray-500 hover:text-sacramento dark:text-gray-400 dark:hover:text-castleton-300 transition-colors rounded-lg hover:bg-castleton-50 dark:hover:bg-neutral-800"
                        title="Go to Website Home"
                    >
                        <Home className="w-5 h-5" />
                    </button>
                    {/* Dark/Light Mode Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="flex items-center rounded-full p-1 transition-all duration-300 bg-slate-200 dark:bg-slate-700"
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        <ThemeModeIcon className="w-5 h-5" />
                    </button>
                    {/* Notifications */}
                    <button className="p-2 text-gray-500 hover:text-sacramento dark:text-gray-400 dark:hover:text-castleton-300 transition-colors rounded-lg hover:bg-castleton-50 dark:hover:bg-neutral-800 relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-neutral-900"></span>
                    </button>
                    <div className="h-6 w-px bg-gray-200 dark:bg-neutral-700 mx-1 hidden sm:block"></div>
                    {/* Admin Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={handleLogout}
                            disabled={loading}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {!loading && <LogOut className="w-4 h-4" />}
                            <span>{loading ? "Logging out..." : "Log Out"}</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}