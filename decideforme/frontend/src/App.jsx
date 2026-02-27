/**
 * App.jsx - Root component with routing
 */

import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './context/authStore'
import { getInitialTheme, applyTheme } from './utils/theme'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import NewDecision from './pages/NewDecision'
import History from './pages/History'
import AnalyticsPage from './pages/AnalyticsPage'
import Settings from './pages/Settings'
import Layout from './components/Layout'

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) return <LoadingScreen />
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-500 font-body">Loading...</p>
      </div>
    </div>
  )
}

export default function App() {
  const init = useAuthStore(s => s.init)
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    init()
    applyTheme(theme)
  }, [])

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route path="/app" element={
          <ProtectedRoute>
            <Layout theme={theme} setTheme={setTheme} />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="decide" element={<NewDecision />} />
          <Route path="history" element={<History />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
