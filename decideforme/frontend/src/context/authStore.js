/**
 * Auth Store (Zustand)
 * Global state for user authentication
 */

import { create } from 'zustand'
import api from '../utils/api'

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('dfm_token'),
  isLoading: true,
  isAuthenticated: false,

  // Initialize auth from stored token
  init: async () => {
    const token = localStorage.getItem('dfm_token')
    if (!token) {
      set({ isLoading: false, isAuthenticated: false })
      return
    }
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data.user, isAuthenticated: true, isLoading: false })
    } catch {
      localStorage.removeItem('dfm_token')
      set({ token: null, user: null, isAuthenticated: false, isLoading: false })
    }
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('dfm_token', data.token)
    set({ token: data.token, user: data.user, isAuthenticated: true })
    return data
  },

  register: async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password })
    localStorage.setItem('dfm_token', data.token)
    set({ token: data.token, user: data.user, isAuthenticated: true })
    return data
  },

  logout: () => {
    localStorage.removeItem('dfm_token')
    set({ token: null, user: null, isAuthenticated: false })
  },

  updateUser: (userData) => {
    set(state => ({ user: { ...state.user, ...userData } }))
  }
}))

export default useAuthStore
