import { apiRequest } from './client'

export function fetchPublicCategoriesApi() {
  return apiRequest('/categories/public')
}

/**
 * @param {object} [params] `{ q, page, limit, active }` — omit page/limit for full list
 */
export function fetchCategoriesApi(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || String(value).trim() === '') return
    if (typeof value === 'boolean') {
      search.set(key, value ? 'true' : 'false')
      return
    }
    search.set(key, String(value))
  })
  const query = search.toString()
  return apiRequest(`/categories${query ? `?${query}` : ''}`)
}

export function createCategoryApi(data) {
  return apiRequest('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateCategoryApi(id, data) {
  return apiRequest(`/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteCategoryApi(id) {
  return apiRequest(`/categories/${id}`, { method: 'DELETE' })
}

export function bulkDeleteCategoriesApi(ids) {
  return apiRequest('/categories/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  })
}
