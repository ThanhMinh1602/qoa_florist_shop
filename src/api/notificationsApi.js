import { getAuthToken } from '../utils/authStorage'

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '/api'

function getAuthHeaders() {
  const token = getAuthToken()
  if (!token) return {}

  return {
    Authorization: `Bearer ${token}`,
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.message || 'Yêu cầu thất bại.')
  }

  return payload
}

export function fetchNotificationsApi(limit = 20) {
  return request(`/notifications?limit=${limit}`)
}

export function fetchUnreadCountApi() {
  return request('/notifications/unread-count')
}

export function markNotificationReadApi(id) {
  return request(`/notifications/${id}/read`, { method: 'PATCH' })
}

export function markAllNotificationsReadApi() {
  return request('/notifications/read-all', { method: 'PATCH' })
}

export function fetchCustomRequestsApi(params = {}) {
  const queryParams = typeof params === 'string' ? { status: params } : { ...params }
  const search = new URLSearchParams()

  // Luôn gửi page/limit để phân trang server-side
  const page = Math.max(1, Number(queryParams.page) || 1)
  const limit = Math.max(1, Number(queryParams.limit) || 25)
  search.set('page', String(page))
  search.set('limit', String(limit))

  Object.entries(queryParams).forEach(([key, value]) => {
    if (key === 'page' || key === 'limit') return
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      search.set(key, String(value))
    }
  })

  return request(`/custom-requests?${search.toString()}`)
}

export function fetchCustomRequestByIdApi(id) {
  return request(`/custom-requests/${id}`)
}

export function updateCustomRequestStatusApi(id, status) {
  return request(`/custom-requests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function updateCustomRequestApi(id, data) {
  return request(`/custom-requests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteCustomRequestApi(id) {
  return request(`/custom-requests/${id}`, {
    method: 'DELETE',
  })
}

export function bulkDeleteCustomRequestsApi(ids) {
  return request('/custom-requests/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  })
}
