/**
 * Register Page
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../context/authStore'
import { AuthLayout } from './Login'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const register = useAuthStore(s => s.register)
  const navigate = useNavigate()

  const getErrorMessage = (err) => {
    const apiMessage = err?.response?.data?.error || err?.response?.data?.message
    if (apiMessage) return apiMessage
    if (err?.request) return 'Network/CORS error. Check VITE_API_URL and Render CORS settings.'
    return err?.message || 'Registration failed. Please try again.'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.')
    }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/app')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Create account" subtitle="Start making smarter decisions today">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-body">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 font-body">Name</label>
          <input
            type="text"
            className="input"
            placeholder="Your name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
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
            placeholder="Min. 6 characters"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            required
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
          {loading ? 'Creating account...' : 'Create free account'}
        </button>
        <p className="text-center text-sm text-zinc-500 font-body">
          Already have an account? <Link to="/login" className="text-primary-600 hover:underline font-medium">Log in</Link>
        </p>
      </form>
    </AuthLayout>
  )
}
