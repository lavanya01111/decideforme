
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import useAuthStore from '../context/authStore'

const NAV_ITEMS = [
  { to: '/app', icon: HomeIcon, label: 'Dashboard', end: true },
  { to: '/app/decide', icon: SparkIcon, label: 'Decide', end: false },
  { to: '/app/history', icon: ClockIcon, label: 'History', end: false },
  { to: '/app/analytics', icon: ChartIcon, label: 'Analytics', end: false },
  { to: '/app/settings', icon: GearIcon, label: 'Settings', end: false }
]

export default function Layout({ theme, setTheme }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800
        transform transition-transform duration-300 flex flex-col
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-lg">⚡</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-zinc-900 dark:text-white text-lg leading-none">DecideForMe</h1>
              <p className="text-xs text-zinc-400 font-body">AI Decision Assistant</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-2.5 rounded-xl font-body font-medium text-sm transition-all duration-150
                ${isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
                }
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-body text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors mb-2"
          >
            <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>

          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold font-display">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate font-body">{user?.name}</p>
              <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="text-zinc-400 hover:text-red-500 transition-colors p-1" title="Logout">
              <LogoutIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <MenuIcon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
          <span className="font-display font-bold text-zinc-900 dark:text-white">DecideForMe</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function HomeIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 21V12h6v9"/></svg>
}
function SparkIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
}
function ClockIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" strokeWidth={1.8}/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 7v5l3 3"/></svg>
}
function ChartIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18 20V10M12 20V4M6 20v-6"/></svg>
}
function GearIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.3 3.6A9 9 0 0 1 13.7 3.6L14.8 5.9a7 7 0 0 1 2.3 1.3l2.4-.5a9 9 0 0 1 1.7 2.9l-1.7 1.8a7 7 0 0 1 0 2.6l1.7 1.8a9 9 0 0 1-1.7 2.9l-2.4-.5a7 7 0 0 1-2.3 1.3l-1.1 2.3a9 9 0 0 1-3.4 0l-1.1-2.3a7 7 0 0 1-2.3-1.3l-2.4.5a9 9 0 0 1-1.7-2.9l1.7-1.8a7 7 0 0 1 0-2.6L3.6 9.7a9 9 0 0 1 1.7-2.9l2.4.5a7 7 0 0 1 2.3-1.3z"/><circle cx="12" cy="12" r="3" strokeWidth={1.8}/></svg>
}
function LogoutIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
}
function MenuIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16"/></svg>
}
