/**
 * Theme utility functions
 */

export function getInitialTheme() {
  const stored = localStorage.getItem('dfm_theme')
  if (stored) return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
  localStorage.setItem('dfm_theme', theme)
}

export const CATEGORY_CONFIG = {
  food: {
    label: 'Food',
    icon: '🍽️',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    placeholder: 'e.g. Pizza, Salad, Burger'
  },
  outfit: {
    label: 'Outfit',
    icon: '👔',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    placeholder: 'e.g. Blue shirt, Black hoodie, Formal suit'
  },
  task: {
    label: 'Task',
    icon: '✅',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    placeholder: 'e.g. Write report, Fix bug, Reply emails'
  },
  entertainment: {
    label: 'Entertainment',
    icon: '🎬',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    placeholder: 'e.g. Watch Netflix, Read book, Play game'
  },
  custom: {
    label: 'Custom',
    icon: '⚡',
    color: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
    placeholder: 'e.g. Option A, Option B, Option C'
  }
}

export const MOOD_OPTIONS = [
  { value: 'energetic', label: 'Energetic', emoji: '⚡' },
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'tired', label: 'Tired', emoji: '😴' },
  { value: 'stressed', label: 'Stressed', emoji: '😰' }
]

export const TIME_OPTIONS = [
  { value: '15min', label: '15 min' },
  { value: '30min', label: '30 min' },
  { value: '1hr', label: '1 hour' },
  { value: 'all day', label: 'All day' }
]

export const PRIORITY_OPTIONS = [
  { value: 'health', label: '🥗 Health' },
  { value: 'speed', label: '⚡ Speed' },
  { value: 'cost', label: '💰 Cost' },
  { value: 'enjoyment', label: '🎉 Enjoyment' },
  { value: 'balanced', label: '⚖️ Balanced' }
]
