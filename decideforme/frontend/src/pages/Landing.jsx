/**
 * Landing Page
 * Marketing page with hero, features, CTA
 */

import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

const DEMO_OPTIONS = ['🍕 Pizza', '🥗 Salad', '🍔 Burger']
const DEMO_RESULT = '🥗 Salad'
const DEMO_REASON = 'Based on your health goal and the fact it\'s evening, Salad gives you energy without feeling heavy.'

export default function Landing() {
  const [typed, setTyped] = useState('')
  const [showResult, setShowResult] = useState(false)
  const full = 'What should I eat for dinner?'

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      setTyped(full.slice(0, ++i))
      if (i === full.length) {
        clearInterval(timer)
        setTimeout(() => setShowResult(true), 600)
      }
    }, 45)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 overflow-x-hidden">

      {/* Nav */}
      <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-orange-400 rounded-xl flex items-center justify-center">
            <span className="text-white">⚡</span>
          </div>
          <span className="font-display font-bold text-zinc-900 dark:text-white text-lg">DecideForMe</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm py-2 px-4">Log in</Link>
          <Link to="/register" className="btn-primary text-sm py-2 px-5">Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-4 py-1.5 rounded-full text-sm font-body font-medium mb-8 animate-fade-up">
          <span>✨</span> AI-powered decision making
        </div>

        <h1 className="font-display font-extrabold text-5xl md:text-7xl text-zinc-900 dark:text-white leading-[1.05] mb-6 animate-fade-up delay-100">
          Stop wasting time<br />
          <span className="gradient-text">deciding.</span>
        </h1>

        <p className="text-xl text-zinc-500 dark:text-zinc-400 font-body max-w-2xl mx-auto mb-10 animate-fade-up delay-200">
          The average person makes 35,000 decisions per day. DecideForMe handles the trivial ones — instantly, intelligently, based on your habits and goals.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-up delay-300">
          <Link to="/register" className="btn-primary text-base py-3.5 px-8">
            Start deciding smarter →
          </Link>
          <Link to="/login" className="btn-ghost text-base py-3.5 px-8">
            Sign in
          </Link>
        </div>

        {/* Demo card */}
        <div className="mt-16 max-w-lg mx-auto animate-fade-up delay-400">
          <div className="card shadow-xl text-left">
            <p className="text-xs text-zinc-400 font-mono mb-3 uppercase tracking-wider">Live demo</p>

            {/* Typing input */}
            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 mb-4 border border-zinc-200 dark:border-zinc-700">
              <p className="font-body text-zinc-700 dark:text-zinc-200">
                {typed}
                <span className="inline-block w-0.5 h-5 bg-primary-500 ml-0.5 animate-pulse align-middle" />
              </p>
            </div>

            {/* Options */}
            <div className="flex flex-wrap gap-2 mb-4">
              {DEMO_OPTIONS.map(opt => (
                <span key={opt} className="badge bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm py-1.5 px-3">
                  {opt}
                </span>
              ))}
            </div>

            {/* Result */}
            {showResult && (
              <div className="bg-gradient-to-r from-primary-50 to-orange-50 dark:from-primary-900/20 dark:to-orange-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4 animate-scale-in">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{DEMO_RESULT}</span>
                  <div>
                    <p className="font-display font-bold text-zinc-900 dark:text-white">Salad it is!</p>
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-16 bg-primary-500 rounded-full" />
                      <span className="text-xs text-primary-600 dark:text-primary-400 font-mono">92% confident</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 font-body">{DEMO_REASON}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-display font-bold text-3xl text-center text-zinc-900 dark:text-white mb-12">
          Everything you need to decide less, live more
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="card hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-orange-100 dark:from-primary-900/30 dark:to-orange-900/30 rounded-2xl flex items-center justify-center text-2xl mb-4">
                {f.icon}
              </div>
              <h3 className="font-display font-semibold text-zinc-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-body leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-zinc-900 dark:bg-zinc-800 py-16">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          {[
            { value: '8 min', label: 'Saved per decision' },
            { value: '5 sec', label: 'AI response time' },
            { value: '∞', label: 'Decision categories' }
          ].map((s, i) => (
            <div key={i}>
              <p className="font-display font-extrabold text-4xl text-white mb-1">{s.value}</p>
              <p className="text-zinc-400 font-body text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h2 className="font-display font-bold text-4xl text-zinc-900 dark:text-white mb-4">
          Ready to end decision fatigue?
        </h2>
        <p className="text-zinc-500 font-body mb-8">Free to start. No credit card required.</p>
        <Link to="/register" className="btn-primary text-lg py-4 px-10">
          Create your free account →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8">
        <p className="text-center text-zinc-400 font-body text-sm">
          © 2024 DecideForMe — Built with ⚡ and AI
        </p>
      </footer>
    </div>
  )
}

const FEATURES = [
  { icon: '🧠', title: 'Smart AI Choices', desc: 'GPT-powered decisions that consider your mood, goals, budget, and past behavior.' },
  { icon: '📊', title: 'Preference Learning', desc: 'The more you use it, the smarter it gets. AI learns your patterns over time.' },
  { icon: '⏱️', title: 'Decision Timer', desc: 'Set a timer — if you can\'t decide, AI auto-chooses before time runs out.' },
  { icon: '👥', title: 'Group Voting', desc: 'Share a vote link with friends. AI breaks ties intelligently.' },
  { icon: '📈', title: 'Analytics Dashboard', desc: 'See how much time you\'ve saved and what decisions you make most.' },
  { icon: '🎯', title: '5 Categories', desc: 'Food, Outfit, Tasks, Entertainment, or any Custom category you create.' }
]
