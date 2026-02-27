

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import { CATEGORY_CONFIG, MOOD_OPTIONS, TIME_OPTIONS, PRIORITY_OPTIONS } from '../utils/theme'

const STEPS = ['category', 'options', 'context', 'result']

export default function NewDecision() {
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const [form, setForm] = useState({
    title: '',
    category: searchParams.get('category') || '',
    customCategory: '',
    options: ['', ''],
    context: {
      mood: 'neutral',
      timeAvailable: '30min',
      priority: 'balanced',
      notes: ''
    }
  })

  const [timerActive, setTimerActive] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(30)
  const [timeLeft, setTimeLeft] = useState(30)
  const timerRef = useRef(null)

  useEffect(() => {
    if (searchParams.get('category')) setStep(1)
  }, [])

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    } else if (timerActive && timeLeft === 0) {
      handleSubmit(true) 
    }
    return () => clearTimeout(timerRef.current)
  }, [timerActive, timeLeft])

  const updateForm = (key, value) => setForm(f => ({ ...f, [key]: value }))
  const updateContext = (key, value) => setForm(f => ({ ...f, context: { ...f.context, [key]: value } }))

  const addOption = () => {
    if (form.options.length < 10) {
      setForm(f => ({ ...f, options: [...f.options, ''] }))
    }
  }

  const removeOption = (idx) => {
    if (form.options.length > 2) {
      setForm(f => ({ ...f, options: f.options.filter((_, i) => i !== idx) }))
    }
  }

  const updateOption = (idx, value) => {
    setForm(f => ({ ...f, options: f.options.map((o, i) => i === idx ? value : o) }))
  }

  const canProceed = () => {
    if (step === 0) return !!form.category
    if (step === 1) return form.title.length >= 3 && form.options.filter(o => o.trim()).length >= 2
    return true
  }

  const handleSubmit = async (autoChosen = false) => {
    setLoading(true)
    setError('')
    clearTimeout(timerRef.current)
    setTimerActive(false)

    try {
      const cleanOptions = form.options.filter(o => o.trim())
      const { data } = await api.post('/decisions', {
        ...form,
        options: cleanOptions,
        mode: timerActive ? 'timer' : 'instant',
        autoChosen
      })
      setResult(data.decision)
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const submitFeedback = async (followed) => {
    if (!result) return
    try {
      await api.put(`/decisions/${result._id}/feedback`, { followed })
    } catch { /* silent */ }
  }

  const reset = () => {
    setStep(0)
    setResult(null)
    setError('')
    setTimerActive(false)
    setTimeLeft(timerSeconds)
    setForm({
      title: '', category: '', customCategory: '',
      options: ['', ''],
      context: { mood: 'neutral', timeAvailable: '30min', priority: 'balanced', notes: '' }
    })
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-zinc-900 dark:text-white mb-1">New Decision</h1>
        <p className="text-zinc-500 font-body">Let AI choose the best option for you</p>
      </div>

      {/* Progress */}
      {step < 3 && (
        <div className="flex gap-2 mb-8">
          {['Category', 'Options', 'Context'].map((label, i) => (
            <div key={i} className="flex-1">
              <div className={`h-1.5 rounded-full transition-all duration-300 ${i <= step ? 'bg-primary-500' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
              <p className={`text-xs mt-1.5 font-body ${i <= step ? 'text-primary-500' : 'text-zinc-400'}`}>{label}</p>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-body mb-6">
          {error}
        </div>
      )}

      {/* Step 0: Category */}
      {step === 0 && (
        <div className="animate-fade-up">
          <h2 className="font-display font-semibold text-xl text-zinc-800 dark:text-zinc-200 mb-4">What are you deciding about?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => { updateForm('category', key); setStep(1) }}
                className={`card text-center py-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer
                  ${form.category === key ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : ''}`}
              >
                <p className="text-3xl mb-2">{cfg.icon}</p>
                <p className="font-body font-medium text-sm text-zinc-700 dark:text-zinc-300">{cfg.label}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Options */}
      {step === 1 && (
        <div className="animate-fade-up">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">{CATEGORY_CONFIG[form.category]?.icon}</span>
            <h2 className="font-display font-semibold text-xl text-zinc-800 dark:text-zinc-200">
              What's your decision?
            </h2>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 font-body">
              Describe what you're deciding
            </label>
            <input
              className="input"
              placeholder="e.g. What should I eat for dinner?"
              value={form.title}
              onChange={e => updateForm('title', e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3 font-body">
              Your options (min 2, max 10)
            </label>
            <div className="space-y-2">
              {form.options.map((opt, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    className="input flex-1"
                    placeholder={idx < 2
                      ? `Option ${idx + 1} — ${CATEGORY_CONFIG[form.category]?.placeholder?.split(', ')[idx] || `e.g. Option ${idx + 1}`}`
                      : `Option ${idx + 1}`
                    }
                    value={opt}
                    onChange={e => updateOption(idx, e.target.value)}
                  />
                  {form.options.length > 2 && (
                    <button onClick={() => removeOption(idx)} className="p-3 text-zinc-400 hover:text-red-500 transition-colors">
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            {form.options.length < 10 && (
              <button onClick={addOption} className="mt-2 text-sm text-primary-500 hover:underline font-body flex items-center gap-1">
                + Add option
              </button>
            )}
          </div>

          {/* Timer toggle */}
          <div className="card bg-zinc-50 dark:bg-zinc-800/50 border-dashed mb-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-body font-medium text-sm text-zinc-700 dark:text-zinc-300">⏱️ Decision Timer</p>
                <p className="text-xs text-zinc-400 font-body">AI auto-picks if you haven't decided in time</p>
              </div>
              <button
                onClick={() => setTimerActive(a => !a)}
                className={`relative w-12 h-6 rounded-full transition-colors ${timerActive ? 'bg-primary-500' : 'bg-zinc-200 dark:bg-zinc-600'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${timerActive ? 'translate-x-6' : ''}`} />
              </button>
            </div>
            {timerActive && (
              <div className="flex items-center gap-3 mt-3">
                <input
                  type="range" min="10" max="120" step="10"
                  value={timerSeconds}
                  onChange={e => { setTimerSeconds(+e.target.value); setTimeLeft(+e.target.value) }}
                  className="flex-1 accent-primary-500"
                />
                <span className="font-mono text-primary-500 font-bold w-16 text-right">{timerSeconds}s</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="btn-ghost">← Back</button>
            <button onClick={() => setStep(2)} disabled={!canProceed()} className="btn-primary flex-1">
              Next: Add Context →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Context */}
      {step === 2 && (
        <div className="animate-fade-up">
          <h2 className="font-display font-semibold text-xl text-zinc-800 dark:text-zinc-200 mb-6">
            Help AI decide better (optional)
          </h2>

          {/* Mood */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3 font-body">Current mood</label>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map(m => (
                <button
                  key={m.value}
                  onClick={() => updateContext('mood', m.value)}
                  className={`px-4 py-2 rounded-xl border-2 text-sm font-body transition-all duration-150
                    ${form.context.mood === m.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                    }`}
                >
                  {m.emoji} {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3 font-body">Time available</label>
            <div className="flex flex-wrap gap-2">
              {TIME_OPTIONS.map(t => (
                <button
                  key={t.value}
                  onClick={() => updateContext('timeAvailable', t.value)}
                  className={`px-4 py-2 rounded-xl border-2 text-sm font-body transition-all duration-150
                    ${form.context.timeAvailable === t.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3 font-body">Prioritize</label>
            <div className="flex flex-wrap gap-2">
              {PRIORITY_OPTIONS.map(p => (
                <button
                  key={p.value}
                  onClick={() => updateContext('priority', p.value)}
                  className={`px-4 py-2 rounded-xl border-2 text-sm font-body transition-all duration-150
                    ${form.context.priority === p.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                    }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 font-body">
              Any extra context? <span className="text-zinc-400">(optional)</span>
            </label>
            <textarea
              className="input h-20 resize-none"
              placeholder="e.g. I had pizza yesterday, I'm on a diet this week..."
              value={form.context.notes}
              onChange={e => updateContext('notes', e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-ghost">← Back</button>
            <button
              onClick={() => handleSubmit()}
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  AI is deciding...
                </>
              ) : '⚡ Decide for me!'}
            </button>
          </div>

          {/* Timer display */}
          {timerActive && !loading && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-4 py-2 rounded-full text-sm font-mono font-bold">
                ⏱️ Auto-deciding in {timeLeft}s
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Result */}
      {step === 3 && result && (
        <ResultView result={result} onReset={reset} onFeedback={submitFeedback} />
      )}
    </div>
  )
}

function ResultView({ result, onReset, onFeedback }) {
  const [feedbackGiven, setFeedbackGiven] = useState(false)
  const cfg = CATEGORY_CONFIG[result.category]
  const confidence = result.result?.confidence || 0
  const confidenceColor = confidence >= 80 ? 'text-green-500' : confidence >= 60 ? 'text-yellow-500' : 'text-red-500'

  const handleFeedback = (followed) => {
    onFeedback(followed)
    setFeedbackGiven(true)
  }

  return (
    <div className="animate-scale-in">
      {/* Winner card */}
      <div className="card bg-gradient-to-br from-primary-50 via-orange-50 to-amber-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 border-primary-200 dark:border-primary-800 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-400">
            ⚡ AI Decision
          </span>
          <span className={`badge bg-zinc-100 dark:bg-zinc-800 font-mono ${confidenceColor}`}>
            {confidence}% confident
          </span>
          {result.autoChosen && (
            <span className="badge bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
              ⏱️ Auto-chosen
            </span>
          )}
        </div>

        <div className="flex items-start gap-4 mb-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${cfg.color}`}>
            {cfg.icon}
          </div>
          <div>
            <p className="text-sm text-zinc-500 font-body mb-1">Best choice for you</p>
            <h2 className="font-display font-extrabold text-3xl text-zinc-900 dark:text-white">
              {result.result?.chosen}
            </h2>
          </div>
        </div>

        {/* Confidence bar */}
        <div className="mb-4">
          <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-orange-400 rounded-full transition-all duration-700"
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>

        {/* Reason */}
        <div className="bg-white/80 dark:bg-zinc-800/80 rounded-xl p-4 mb-4">
          <p className="text-xs text-zinc-400 font-body mb-1 uppercase tracking-wider">Why this choice</p>
          <p className="text-zinc-700 dark:text-zinc-300 font-body leading-relaxed">{result.result?.reason}</p>
        </div>

        {/* Tags */}
        {result.result?.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {result.result.tags.map(tag => (
              <span key={tag} className="badge bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 text-xs">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Alternatives */}
      {result.result?.alternatives?.length > 0 && (
        <div className="card mb-4">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 font-body mb-3">Runner-ups</p>
          <div className="space-y-2">
            {result.result.alternatives.map((alt, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="text-zinc-300 dark:text-zinc-600 font-mono">#{i + 2}</span>
                <div>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">{alt.option}</span>
                  {alt.note && <span className="text-zinc-400 font-body"> — {alt.note}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback */}
      {!feedbackGiven ? (
        <div className="card text-center mb-4">
          <p className="font-body text-zinc-600 dark:text-zinc-400 mb-3 text-sm">Will you follow this recommendation?</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => handleFeedback(true)} className="btn-primary py-2 px-6 text-sm">
              👍 Yes, I will!
            </button>
            <button onClick={() => handleFeedback(false)} className="btn-ghost py-2 px-6 text-sm">
              👎 Nah, skipping
            </button>
          </div>
        </div>
      ) : (
        <div className="card text-center mb-4 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
          <p className="text-green-700 dark:text-green-400 font-body">✅ Thanks for the feedback! AI is learning from this.</p>
        </div>
      )}

      <button onClick={onReset} className="btn-primary w-full">
        ⚡ Make another decision
      </button>
    </div>
  )
}
