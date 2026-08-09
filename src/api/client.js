import { getAuthToken } from '../utils/authStorage'
import { logger } from '../utils/logger'

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '/api'

function getAuthHeaders() {
  const token = getAuthToken()
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

export async function apiRequest(path, options = {}) {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  const headers = {
    'ngrok-skip-browser-warning': 'true',
    ...getAuthHeaders(),
    ...options.headers,
  }

  if (isFormData) {
    delete headers['Content-Type']
  } else if (!headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  const method = options.method || 'GET'
  const started = performance.now()

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    })

    const payload = await response.json().catch(() => ({}))
    const ms = Math.round(performance.now() - started)

    if (!response.ok) {
      logger.warn('API error', { method, path, status: response.status, ms, message: payload.message })
      throw new Error(payload.message || 'Yêu cầu thất bại.')
    }

    logger.debug('API ok', { method, path, status: response.status, ms })
    return payload
  } catch (err) {
    if (err instanceof Error && err.message !== 'Yêu cầu thất bại.') {
      logger.error('API failed', { method, path, message: err.message })
    }
    throw err
  }
}
