/**
 * Login Page
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../context/authStore'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore(s => s.login)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/app')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to your DecideForMe account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-body">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 font-body">Email</label>
          <input
            type="email"
            className="input"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 font-body">Password</label>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            required
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
          {loading ? 'Logging in...' : 'Log in'}
        </button>
        <p className="text-center text-sm text-zinc-500 font-body">
          No account? <Link to="/register" className="text-primary-600 hover:underline font-medium">Sign up free</Link>
        </p>
      </form>
    </AuthLayout>
  )
}

export function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-orange-400 rounded-xl flex items-center justify-center">
            <span className="text-white">⚡</span>
          </div>
          <span className="font-display font-bold text-zinc-900 dark:text-white text-xl">DecideForMe</span>
        </Link>
        <div className="card shadow-xl">
          <h1 className="font-display font-bold text-2xl text-zinc-900 dark:text-white mb-1">{title}</h1>
          <p className="text-sm text-zinc-500 font-body mb-6">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  )
}
