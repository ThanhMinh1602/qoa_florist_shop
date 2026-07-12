import { apiRequest } from './client'

export function fetchCashbookApi(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value)
    }
  })
  const suffix = query.toString() ? `?${query}` : ''
  return apiRequest(`/cashbook${suffix}`)
}

export function createCashEntryApi(data) {
  return apiRequest('/cashbook', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateCashEntryApi(id, data) {
  return apiRequest(`/cashbook/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteCashEntryApi(id) {
  return apiRequest(`/cashbook/${id}`, { method: 'DELETE' })
}
