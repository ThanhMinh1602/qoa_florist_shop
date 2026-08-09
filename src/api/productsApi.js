import { apiRequest } from './client'

/**
 * @param {boolean|object} [params]
 * - boolean: legacy `fetchProductsApi(true)` → `{ active: true }` (full list)
 * - object: `{ active, q, page, limit }` — pass page/limit for pagination
 */
export function fetchProductsApi(params) {
  const queryParams =
    typeof params === 'boolean'
      ? { active: params }
      : params && typeof params === 'object'
        ? { ...params }
        : {}

  const search = new URLSearchParams()
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value === undefined || value === null || String(value).trim() === '') return
    if (typeof value === 'boolean') {
      search.set(key, value ? 'true' : 'false')
      return
    }
    search.set(key, String(value))
  })
  const query = search.toString()
  return apiRequest(`/products${query ? `?${query}` : ''}`)
}

export function createProductApi(data) {
  return apiRequest('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateProductApi(id, data) {
  return apiRequest(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteProductApi(id) {
  return apiRequest(`/products/${id}`, { method: 'DELETE' })
}

export function bulkDeleteProductsApi(ids) {
  return apiRequest('/products/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  })
}

export function deactivateProductApi(id) {
  return updateProductApi(id, { active: false })
}

export function activateProductApi(id) {
  return updateProductApi(id, { active: true })
}
