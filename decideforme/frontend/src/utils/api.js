/**
 * Axios instance with auth interceptors
 */

import axios from 'axios'

function normalizeBaseURL(input) {
  if (!input) return null
  let url = String(input).trim()
  if (!url) return null
  url = url.replace(/\/+$/, '')
  // Allow either ".../api" or just backend root.
  if (!/\/api$/.test(url)) url = `${url}/api`
  return url
}

const api = axios.create({
  // Dev uses Vite proxy (/api). Production should set VITE_API_URL=https://<render-host>
  // This normalizes to "<render-host>/api".
  baseURL: normalizeBaseURL(import.meta.env.VITE_API_URL) || '/api',
  headers: { 'Content-Type': 'application/json' }
})

// Attach token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('dfm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('dfm_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
