/** Lọc giá cố định — đồng bộ với PRICE_TIERS trang chủ */
export const CATALOG_PRICE_FILTERS = [
  { id: 'under-100', label: 'Dưới 100k', maxPrice: 99999 },
  { id: '100-150', label: 'Từ 100k–150k', minPrice: 100000, maxPrice: 150000 },
  { id: '150-200', label: 'Từ 150k–200k', minPrice: 150000, maxPrice: 200000 },
  { id: 'over-200', label: 'Trên 200k', minPrice: 200001 },
]

export const CATALOG_PAGE_SIZE = 12

export function buildQuickFilters(categories = []) {
  const categoryFilters = categories.map((category) => ({
    id: `cat-${category.id}`,
    label: category.name,
    categoryId: category.id,
  }))
  return [...categoryFilters, ...CATALOG_PRICE_FILTERS]
}

export function resolveQuickFilter(filterId, filters = []) {
  return filters.find((item) => item.id === filterId) || null
}
