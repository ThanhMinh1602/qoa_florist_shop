import { apiRequest } from './client'

export function submitCustomRequestApi(data) {
  return apiRequest('/custom-requests', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function importCustomRequestsBulkApi(payload) {
  return apiRequest('/custom-requests/bulk', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchCustomRequestsApi(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      search.set(key, String(value))
    }
  })
  const query = search.toString()
  return apiRequest(`/custom-requests${query ? `?${query}` : ''}`)
}
