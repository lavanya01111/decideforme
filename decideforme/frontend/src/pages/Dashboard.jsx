/**
 * Dashboard Page
 * Shows stats, recent decisions, quick action
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../context/authStore'
import api from '../utils/api'
import { CATEGORY_CONFIG } from '../utils/theme'

export default function Dashboard() {
  const { user } = useAuthStore()
  const [analytics, setAnalytics] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/analytics'),
      api.get('/decisions?limit=5')
    ]).then(([a, d]) => {
      setAnalytics(a.data.analytics)
      setRecent(d.data.decisions)
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-8 animate-fade-up">
        <div>
          <h1 className="font-display font-bold text-3xl text-zinc-900 dark:text-white">
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-zinc-500 font-body mt-1">Ready to make some decisions?</p>
        </div>
        <Link to="/app/decide" className="btn-primary flex items-center gap-2">
          <span>⚡</span> New Decision
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Decisions', value: analytics?.totalDecisions || 0, icon: '🎯', color: 'text-primary-500' },
          { label: 'Minutes Saved', value: analytics?.totalMinutesSaved || 0, icon: '⏱️', color: 'text-green-500' },
          { label: 'Decisions Followed', value: analytics?.decisionsFollowed || 0, icon: '✅', color: 'text-blue-500' },
          { label: 'Current Streak', value: `${analytics?.currentStreak || 0}d`, icon: '🔥', color: 'text-orange-500' }
        ].map((stat, i) => (
          <div key={i} className={`card animate-fade-up`} style={{ animationDelay: `${i * 80}ms` }}>
            <p className="text-2xl mb-2">{stat.icon}</p>
            <p className={`font-display font-bold text-2xl ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-zinc-500 font-body mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8 animate-fade-up delay-200">
        <h2 className="font-display font-semibold text-lg text-zinc-900 dark:text-white mb-4">Quick Decide</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
            <Link
              key={key}
              to={`/app/decide?category=${key}`}
              className="card text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer p-4"
            >
              <p className="text-3xl mb-2">{cfg.icon}</p>
              <p className="font-body font-medium text-sm text-zinc-700 dark:text-zinc-300">{cfg.label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Decisions */}
      <div className="animate-fade-up delay-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg text-zinc-900 dark:text-white">Recent Decisions</h2>
          <Link to="/app/history" className="text-sm text-primary-500 hover:underline font-body">View all →</Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card h-16 animate-pulse bg-zinc-100 dark:bg-zinc-800 border-0" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-4xl mb-3">🤔</p>
            <p className="font-display font-semibold text-zinc-700 dark:text-zinc-300">No decisions yet!</p>
            <p className="text-zinc-500 font-body text-sm mt-1 mb-4">Make your first AI-powered decision now.</p>
            <Link to="/app/decide" className="btn-primary inline-flex">Make a decision →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map(d => (
              <DecisionCard key={d._id} decision={d} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DecisionCard({ decision }) {
  const cfg = CATEGORY_CONFIG[decision.category]
  const timeAgo = getTimeAgo(decision.createdAt)

  return (
    <div className="card flex items-center gap-4 py-4 hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${cfg.color}`}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-body font-medium text-zinc-800 dark:text-zinc-200 truncate">{decision.title}</p>
        <p className="text-sm text-zinc-500 font-body truncate">
          Chose: <span className="text-primary-600 dark:text-primary-400 font-medium">{decision.result?.chosen}</span>
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        {decision.result?.confidence && (
          <span className="badge bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 mb-1">
            {decision.result.confidence}% confident
          </span>
        )}
        <p className="text-xs text-zinc-400 font-body">{timeAgo}</p>
      </div>
    </div>
  )
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
