/**
 * Settings Page
 * Profile, preferences, AI learning settings
 */

import { useState, useEffect } from 'react'
import useAuthStore from '../context/authStore'
import api from '../utils/api'

const DIET_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-free', 'Halal', 'Kosher', 'Keto', 'None']
const FITNESS_GOALS = ['Lose weight', 'Maintain weight', 'Gain muscle', 'Be healthy', 'No specific goal']
const WORK_STYLES = ['Deep work (long sessions)', 'Pomodoro (25/5)', 'Flexible', 'Sprint & rest']
const BUDGET_LEVELS = ['Low', 'Medium', 'High', 'Flexible']

export default function Settings() {
  const { user, updateUser } = useAuthStore()
  const [profile, setProfile] = useState({
    name: user?.name || '',
    timezone: user?.timezone || 'UTC',
    profile: {
      age: user?.profile?.age || '',
      dietaryRestrictions: user?.profile?.dietaryRestrictions || [],
      fitnessGoal: user?.profile?.fitnessGoal || '',
      workStyle: user?.profile?.workStyle || '',
      budget: {
        food: user?.profile?.budget?.food || 'medium',
        entertainment: user?.profile?.budget?.entertainment || 'medium'
      }
    }
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const { data } = await api.put('/auth/profile', profile)
      updateUser(data.user)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const toggleDiet = (diet) => {
    const current = profile.profile.dietaryRestrictions
    const updated = current.includes(diet)
      ? current.filter(d => d !== diet)
      : [...current, diet]
    setProfile(p => ({ ...p, profile: { ...p.profile, dietaryRestrictions: updated } }))
  }

  const TABS = ['profile', 'ai-context', 'account']

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-zinc-900 dark:text-white">Settings</h1>
        <p className="text-zinc-500 font-body mt-1">Customize your experience and AI context</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl mb-6">
        {['profile', 'ai-context', 'account'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-body font-medium transition-all capitalize
              ${activeTab === tab
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
          >
            {tab === 'ai-context' ? 'AI Context' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="card space-y-5 animate-fade-up">
          <h2 className="font-display font-semibold text-lg text-zinc-900 dark:text-white">Profile</h2>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 font-body">Name</label>
            <input
              className="input"
              value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 font-body">Age (helps AI personalize)</label>
            <input
              type="number"
              className="input"
              placeholder="Optional"
              value={profile.profile.age}
              onChange={e => setProfile(p => ({ ...p, profile: { ...p.profile, age: e.target.value } }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 font-body">Email</label>
            <input className="input opacity-60 cursor-not-allowed" value={user?.email} disabled />
            <p className="text-xs text-zinc-400 font-body mt-1">Email cannot be changed.</p>
          </div>

          <button onClick={handleSaveProfile} disabled={saving} className="btn-primary w-full">
            {saving ? 'Saving...' : saved ? '✅ Saved!' : 'Save Profile'}
          </button>
        </div>
      )}

      {/* AI Context tab */}
      {activeTab === 'ai-context' && (
        <div className="card space-y-6 animate-fade-up">
          <h2 className="font-display font-semibold text-lg text-zinc-900 dark:text-white">AI Context</h2>
          <p className="text-sm text-zinc-500 font-body -mt-2">
            This information is sent to the AI when making decisions. Better context = smarter choices.
          </p>

          {/* Dietary restrictions */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3 font-body">Dietary Restrictions</label>
            <div className="flex flex-wrap gap-2">
              {DIET_OPTIONS.map(diet => (
                <button
                  key={diet}
                  onClick={() => toggleDiet(diet)}
                  className={`px-3 py-1.5 rounded-xl border-2 text-sm font-body transition-all
                    ${profile.profile.dietaryRestrictions.includes(diet)
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                    }`}
                >
                  {diet}
                </button>
              ))}
            </div>
          </div>

          {/* Fitness goal */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3 font-body">Fitness Goal</label>
            <div className="space-y-2">
              {FITNESS_GOALS.map(goal => (
                <label key={goal} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="fitnessGoal"
                    value={goal}
                    checked={profile.profile.fitnessGoal === goal}
                    onChange={() => setProfile(p => ({ ...p, profile: { ...p.profile, fitnessGoal: goal } }))}
                    className="accent-primary-500"
                  />
                  <span className="text-sm font-body text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                    {goal}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Work style */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3 font-body">Work Style</label>
            <select
              className="input"
              value={profile.profile.workStyle}
              onChange={e => setProfile(p => ({ ...p, profile: { ...p.profile, workStyle: e.target.value } }))}
            >
              <option value="">Select your work style</option>
              {WORK_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 font-body">Food Budget</label>
              <select
                className="input"
                value={profile.profile.budget.food}
                onChange={e => setProfile(p => ({ ...p, profile: { ...p.profile, budget: { ...p.profile.budget, food: e.target.value } } }))}
              >
                {BUDGET_LEVELS.map(b => <option key={b} value={b.toLowerCase()}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 font-body">Entertainment Budget</label>
              <select
                className="input"
                value={profile.profile.budget.entertainment}
                onChange={e => setProfile(p => ({ ...p, profile: { ...p.profile, budget: { ...p.profile.budget, entertainment: e.target.value } } }))}
              >
                {BUDGET_LEVELS.map(b => <option key={b} value={b.toLowerCase()}>{b}</option>)}
              </select>
            </div>
          </div>

          <button onClick={handleSaveProfile} disabled={saving} className="btn-primary w-full">
            {saving ? 'Saving...' : saved ? '✅ Saved!' : 'Save AI Context'}
          </button>
        </div>
      )}

      {/* Account tab */}
      {activeTab === 'account' && (
        <div className="space-y-4 animate-fade-up">
          <div className="card">
            <h2 className="font-display font-semibold text-lg text-zinc-900 dark:text-white mb-4">Account Info</h2>
            <div className="space-y-3 text-sm font-body">
              <div className="flex justify-between">
                <span className="text-zinc-500">Member since</span>
                <span className="text-zinc-700 dark:text-zinc-300">{new Date(user?.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Total decisions</span>
                <span className="text-zinc-700 dark:text-zinc-300">{user?.stats?.totalDecisions || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Minutes saved</span>
                <span className="text-zinc-700 dark:text-zinc-300">{user?.stats?.minutesSaved || 0} min</span>
              </div>
            </div>
          </div>

          <div className="card border-red-200 dark:border-red-800">
            <h2 className="font-display font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h2>
            <p className="text-sm text-zinc-500 font-body mb-4">These actions are irreversible.</p>
            <button className="btn-ghost text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm py-2">
              Delete all decision history
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
