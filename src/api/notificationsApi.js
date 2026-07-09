const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '/api'

function getAuthHeaders() {
  const token = sessionStorage.getItem('qoa_admin_token')
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

export function fetchCustomRequestsApi(status = '') {
  const query = status ? `?status=${status}` : ''
  return request(`/custom-requests${query}`)
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
