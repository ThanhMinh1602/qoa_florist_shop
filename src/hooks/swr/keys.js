/** Cache keys SWR — dùng chung để invalidate giữa các màn. */
export const swrKeys = {
  landingSettings: ['settings', 'landing'],
  catalog: (params = {}) => ['catalog', params],
  catalogProduct: (id) => (id ? ['catalog', 'product', id] : null),
  card: (id) => (id ? ['cards', id] : null),
  cards: (filters = {}) => ['cards', 'list', filters],
  products: (active) => ['products', active ?? 'all'],
  publicCategories: ['categories', 'public'],
  adminCategories: ['categories', 'admin'],
  statsOverview: ['stats', 'overview'],
  cashbook: (params = {}) => ['cashbook', params],
}
