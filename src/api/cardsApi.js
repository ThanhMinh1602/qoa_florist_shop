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

export function fetchCards(filters = {}) {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value?.toString().trim()) {
      params.set(key, value.toString().trim())
    }
  })

  const query = params.toString()
  return request(`/cards${query ? `?${query}` : ''}`)
}

export function fetchCardById(id) {
  return request(`/cards/${id}`)
}

export function createCardApi(cardData) {
  return request('/cards', {
    method: 'POST',
    body: JSON.stringify(cardData),
  })
}

export function updateCardApi(id, cardData) {
  return request(`/cards/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(cardData),
  })
}

export function deleteCardApi(id) {
  return request(`/cards/${id}`, {
    method: 'DELETE',
  })
}
