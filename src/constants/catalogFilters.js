/** Lọc giá cố định — danh mục lấy từ API */
export const CATALOG_PRICE_FILTERS = [
  { id: 'under-100', label: 'Dưới 100k', maxPrice: 99999 },
  { id: '100-150', label: 'Từ 100k–150k', minPrice: 100000, maxPrice: 150000 },
  { id: '150-250', label: 'Từ 150k–250k', minPrice: 150000, maxPrice: 250000 },
  { id: 'over-250', label: 'Trên 250k', minPrice: 250001 },
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
