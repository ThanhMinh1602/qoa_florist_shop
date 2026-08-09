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
  const queryParams = { ...params }
  const search = new URLSearchParams()
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
  return apiRequest(`/custom-requests?${search.toString()}`)
}
