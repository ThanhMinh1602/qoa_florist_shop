import { apiRequest } from './client'

export function fetchProductsApi(active) {
  const query = active === undefined ? '' : `?active=${active}`
  return apiRequest(`/products${query}`)
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

export function deactivateProductApi(id) {
  return updateProductApi(id, { active: false })
}

export function activateProductApi(id) {
  return updateProductApi(id, { active: true })
}
