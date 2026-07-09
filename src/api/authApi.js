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

export function loginApi(username, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function fetchMeApi() {
  return request('/auth/me')
}

export function changePasswordApi({ currentPassword, newPassword, confirmPassword }) {
  return request('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
  })
}
