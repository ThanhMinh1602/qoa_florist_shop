/** Bộ lọc nhanh catalog công khai */
export const CATALOG_QUICK_FILTERS = [
  { id: 'popular', label: 'Bán chạy', sort: 'popular' },
  { id: 'gau-bong', label: 'Gấu bông', tag: 'gấu bông' },
  { id: 'hoa-kem', label: 'Hoa kẽm', tag: 'kẽm' },
  { id: 'hoa-sap', label: 'Hoa sáp', tag: 'sáp' },
  { id: 'under-100', label: 'Dưới 100k', maxPrice: 99999 },
  { id: '100-150', label: 'Từ 100k–150k', minPrice: 100000, maxPrice: 150000 },
  { id: '150-250', label: 'Từ 150k–250k', minPrice: 150000, maxPrice: 250000 },
  { id: 'over-250', label: 'Trên 250k', minPrice: 250001 },
]

export const CATALOG_PAGE_SIZE = 12

export function resolveQuickFilter(filterId) {
  return CATALOG_QUICK_FILTERS.find((item) => item.id === filterId) || null
}
