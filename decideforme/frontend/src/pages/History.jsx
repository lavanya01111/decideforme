

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { CATEGORY_CONFIG } from '../utils/theme'

export default function History() {
  const [decisions, setDecisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  useEffect(() => {
    fetchDecisions()
  }, [filter, page])

  const fetchDecisions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 10 })
      if (filter !== 'all') params.append('category', filter)
      const { data } = await api.get(`/decisions?${params}`)
      setDecisions(data.decisions)
      setPagination(data.pagination)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (val) => {
    setFilter(val)
    setPage(1)
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-zinc-900 dark:text-white">Decision History</h1>
          <p className="text-zinc-500 font-body mt-1">Review all your past AI decisions</p>
        </div>
        <Link to="/app/decide" className="btn-primary">+ New</Link>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[['all', 'All', '🔍'], ...Object.entries(CATEGORY_CONFIG).map(([k, v]) => [k, v.label, v.icon])].map(([val, label, icon]) => (
          <button
            key={val}
            onClick={() => handleFilterChange(val)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-body font-medium transition-all duration-150
              ${filter === val
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-primary-300'
              }`}
          >
            <span>{icon}</span> {label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : decisions.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-4">📭</p>
          <p className="font-display font-semibold text-zinc-700 dark:text-zinc-300 text-lg">No decisions found</p>
          <p className="text-zinc-500 font-body text-sm mt-1">
            {filter !== 'all' ? `No ${filter} decisions yet.` : 'Start making decisions!'}
          </p>
          <Link to="/app/decide" className="btn-primary inline-flex mt-4">Make one now →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {decisions.map((d, i) => {
            const cfg = CATEGORY_CONFIG[d.category]
            return (
              <div key={d._id} className="card hover:shadow-md transition-all duration-200 animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-start gap-4">
                  {/* Category icon */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${cfg.color}`}>
                    {cfg.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-body font-semibold text-zinc-800 dark:text-zinc-200 truncate">{d.title}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className={`badge text-xs ${cfg.color}`}>{cfg.label}</span>
                          {d.context?.mood && (
                            <span className="text-xs text-zinc-400 font-body">Mood: {d.context.mood}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-zinc-400 font-body flex-shrink-0">{formatDate(d.createdAt)}</span>
                    </div>

                    {/* Options → Result */}
                    <div className="mt-2 flex flex-wrap items-center gap-1">
                      {d.options?.map((opt, idx) => (
                        <span
                          key={idx}
                          className={`text-xs px-2 py-0.5 rounded-full font-body
                            ${opt.text === d.result?.chosen
                              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 font-semibold'
                              : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                            }`}
                        >
                          {opt.text === d.result?.chosen ? '✓ ' : ''}{opt.text}
                        </span>
                      ))}
                    </div>

                    {/* Confidence + feedback */}
                    <div className="mt-2 flex items-center gap-3">
                      {d.result?.confidence && (
                        <span className="text-xs text-zinc-400 font-mono">{d.result.confidence}% confident</span>
                      )}
                      {d.feedback?.followed !== undefined && (
                        <span className={`text-xs font-body ${d.feedback.followed ? 'text-green-500' : 'text-zinc-400'}`}>
                          {d.feedback.followed ? '👍 Followed' : '👎 Skipped'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Reason (collapsed) */}
                {d.result?.reason && (
                  <details className="mt-3 group">
                    <summary className="text-xs text-primary-500 cursor-pointer hover:underline font-body list-none">
                      View AI reasoning ↓
                    </summary>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 font-body leading-relaxed bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3">
                      {d.result.reason}
                    </p>
                  </details>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={page === 1}
            className="btn-ghost py-2 px-4 text-sm disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-sm text-zinc-500 font-body">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page === pagination.pages}
            className="btn-ghost py-2 px-4 text-sm disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
