import { apiRequest } from './client'

export function fetchCatalogApi({
  q,
  minPrice,
  maxPrice,
  sort,
  tag,
  page,
  limit,
} = {}) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (minPrice !== undefined && minPrice !== '') params.set('minPrice', String(minPrice))
  if (maxPrice !== undefined && maxPrice !== '') params.set('maxPrice', String(maxPrice))
  if (sort) params.set('sort', sort)
  if (tag) params.set('tag', tag)
  if (page) params.set('page', String(page))
  if (limit) params.set('limit', String(limit))
  const query = params.toString()
  return apiRequest(`/products/catalog${query ? `?${query}` : ''}`)
}

export function fetchCatalogProductApi(id) {
  return apiRequest(`/products/catalog/${id}`)
}
