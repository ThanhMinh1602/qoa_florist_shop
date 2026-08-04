import { apiRequest } from './client'

export function fetchPublicCategoriesApi() {
  return apiRequest('/categories/public')
}

export function fetchCategoriesApi() {
  return apiRequest('/categories')
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
