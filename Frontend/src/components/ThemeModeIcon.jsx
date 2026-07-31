import { useTheme } from '../context/ThemeContext'

export default function ThemeModeIcon({ className = 'w-5 h-5' }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div
      className={`flex items-center rounded-full p-1 transition-all duration-300 ${
        isDark ? 'bg-[var(--primary)] justify-end' : 'bg-[var(--primary)]/40 justify-start'
      }`}
    >
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm shadow-md">
        {isDark ? '🌙' : '☀️'}
      </div>
    </div>
  )
}
