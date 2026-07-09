const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
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

export function submitCustomRequestApi(data) {
  return request('/custom-requests', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
