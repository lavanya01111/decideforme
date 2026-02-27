
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../utils/api'
import { CATEGORY_CONFIG } from '../utils/theme'

const COLORS = ['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#6b7280']

export default function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [daily, setDaily] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics').then(r => {
      setData(r.data.analytics)
      const entries = Object.entries(r.data.dailyActivity || {})
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({
          date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          decisions: count
        }))
      setDaily(entries)
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />)}
      </div>
    </div>
  )

  const pieData = data?.byCategory
    ? Object.entries(data.byCategory)
        .filter(([, v]) => v.count > 0)
        .map(([key, val], i) => ({
          name: CATEGORY_CONFIG[key]?.label || key,
          value: val.count,
          fill: COLORS[i % COLORS.length]
        }))
    : []

  const followRate = data && (data.decisionsFollowed + data.decisionsIgnored) > 0
    ? Math.round((data.decisionsFollowed / (data.decisionsFollowed + data.decisionsIgnored)) * 100)
    : 0

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-zinc-900 dark:text-white">Analytics</h1>
        <p className="text-zinc-500 font-body mt-1">Your decision habits and time saved</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Decisions', value: data?.totalDecisions || 0, icon: '🎯', sub: 'all time' },
          { label: 'Hours Saved', value: `${Math.round((data?.totalMinutesSaved || 0) / 60 * 10) / 10}h`, icon: '⏱️', sub: '~8 min each' },
          { label: 'Follow Rate', value: `${followRate}%`, icon: '✅', sub: 'decisions followed' },
          { label: 'Best Streak', value: `${data?.longestStreak || 0}d`, icon: '🔥', sub: 'consecutive days' }
        ].map((s, i) => (
          <div key={i} className="card animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
            <p className="text-2xl mb-2">{s.icon}</p>
            <p className="font-display font-bold text-2xl text-zinc-900 dark:text-white">{s.value}</p>
            <p className="text-xs font-body font-medium text-zinc-700 dark:text-zinc-300 mt-0.5">{s.label}</p>
            <p className="text-xs text-zinc-400 font-body">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Activity chart */}
      {daily.length > 0 && (
        <div className="card mb-6 animate-fade-up delay-200">
          <h2 className="font-display font-semibold text-zinc-900 dark:text-white mb-4">Last 7 Days Activity</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={daily}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={24} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: '#18181b', border: '1px solid #27272a',
                  borderRadius: '12px', fontSize: '12px', fontFamily: 'DM Sans'
                }}
                labelStyle={{ color: '#a1a1aa' }}
              />
              <Bar dataKey="decisions" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category breakdown */}
      {pieData.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6 animate-fade-up delay-300">
          <div className="card">
            <h2 className="font-display font-semibold text-zinc-900 dark:text-white mb-4">By Category</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#18181b', border: '1px solid #27272a',
                    borderRadius: '12px', fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="font-display font-semibold text-zinc-900 dark:text-white mb-4">Category Breakdown</h2>
            <div className="space-y-3">
              {pieData.map((item, i) => {
                const total = pieData.reduce((s, d) => s + d.value, 0)
                const pct = Math.round((item.value / total) * 100)
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-body text-zinc-700 dark:text-zinc-300">{item.name}</span>
                      <span className="text-xs font-mono text-zinc-400">{item.value} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: item.fill }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!data?.totalDecisions && (
        <div className="card text-center py-16 mt-4">
          <p className="text-5xl mb-4">📊</p>
          <p className="font-display font-semibold text-zinc-700 dark:text-zinc-300">No data yet</p>
          <p className="text-zinc-500 font-body text-sm mt-1">Make some decisions to see your analytics!</p>
        </div>
      )}
    </div>
  )
}
