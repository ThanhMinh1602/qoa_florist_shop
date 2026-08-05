import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { CATALOG_PAGE_SIZE, CATALOG_PRICE_FILTERS } from '../../../constants/catalogFilters'
import { SHOP_IMAGES } from '../../../constants/shopImagery'
import { useCatalogInfinite, usePublicCategories } from '../../../hooks/swr'
import { formatMoney } from '../../../utils/money'

const SORT_OPTIONS = [
  { id: 'newest', label: 'Mới nhất' },
  { id: 'price_asc', label: 'Giá thấp đến cao' },
  { id: 'price_desc', label: 'Giá cao đến thấp' },
]

const easeOut = [0.22, 1, 0.36, 1]

function FilterRow({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition',
        selected
          ? 'bg-primary font-medium text-on-primary'
          : 'text-on-surface-variant hover:bg-surface-container-high/80 hover:text-on-surface',
      ].join(' ')}
    >
      <span className="truncate">{children}</span>
      {selected ? <MaterialIcon name="check" className="text-base" /> : null}
    </button>
  )
}

function ShopCatalogPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [priceFilterId, setPriceFilterId] = useState('')
  const [sort, setSort] = useState('newest')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const { categories } = usePublicCategories()

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [search])

  const priceFilter = useMemo(
    () => CATALOG_PRICE_FILTERS.find((item) => item.id === priceFilterId) || null,
    [priceFilterId],
  )

  const queryParams = useMemo(() => {
    const params = {
      limit: CATALOG_PAGE_SIZE,
      sort,
    }
    if (debouncedSearch) params.q = debouncedSearch
    if (categoryId) params.categoryId = categoryId
    if (priceFilter?.minPrice != null) params.minPrice = priceFilter.minPrice
    if (priceFilter?.maxPrice != null) params.maxPrice = priceFilter.maxPrice
    return params
  }, [categoryId, debouncedSearch, priceFilter, sort])

  const {
    products,
    total,
    hasMore,
    isLoading,
    isValidating,
    isLoadingMore,
    error,
    loadMore,
  } = useCatalogInfinite(queryParams)

  const activeFilterCount = Number(Boolean(categoryId)) + Number(Boolean(priceFilterId))
  const hasActiveFilters = Boolean(search.trim() || categoryId || priceFilterId)

  function clearFilters() {
    setSearch('')
    setDebouncedSearch('')
    setCategoryId('')
    setPriceFilterId('')
  }

  const filterPanel = (
    <div className="rounded-2xl border border-outline-variant/20 bg-white/75 p-4 shadow-[0_12px_40px_rgba(74,48,32,0.06)] backdrop-blur-xl sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="label-caps text-primary">Bộ lọc</p>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-semibold text-on-surface-variant hover:text-primary"
          >
            Xóa lọc
          </button>
        ) : null}
      </div>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Tìm kiếm</span>
        <div className="relative">
          <MaterialIcon
            name="search"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-outline"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tên hoa, nguyên liệu..."
            className="input-glass with-leading-icon py-2.5 text-sm"
          />
        </div>
      </label>

      <div className="mt-5 border-t border-outline-variant/20 pt-4">
        <p className="mb-2 text-xs font-semibold text-on-surface-variant">Danh mục</p>
        <div className="space-y-0.5">
          <FilterRow selected={!categoryId} onClick={() => setCategoryId('')}>
            Tất cả
          </FilterRow>
          {categories.map((category) => (
            <FilterRow
              key={category.id}
              selected={categoryId === category.id}
              onClick={() => setCategoryId((current) => (current === category.id ? '' : category.id))}
            >
              {category.name}
            </FilterRow>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-outline-variant/20 pt-4">
        <p className="mb-2 text-xs font-semibold text-on-surface-variant">Khoảng giá</p>
        <div className="space-y-0.5">
          <FilterRow selected={!priceFilterId} onClick={() => setPriceFilterId('')}>
            Mọi mức giá
          </FilterRow>
          {CATALOG_PRICE_FILTERS.map((filter) => (
            <FilterRow
              key={filter.id}
              selected={priceFilterId === filter.id}
              onClick={() =>
                setPriceFilterId((current) => (current === filter.id ? '' : filter.id))
              }
            >
              {filter.label}
            </FilterRow>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-16">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="label-caps text-primary">Cửa hàng</p>
          <h1 className="font-display mt-1 text-3xl text-on-surface sm:text-4xl">Sản phẩm</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-on-surface-variant">
            {isLoading ? 'Đang tải...' : `${total} sản phẩm`}
          </p>
          <label className="inline-flex items-center gap-2 text-sm text-on-surface-variant">
            <span className="hidden sm:inline">Sắp xếp</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="rounded-xl border border-outline-variant/30 bg-white/70 px-3 py-2 text-sm text-on-surface outline-none backdrop-blur-md focus:ring-2 focus:ring-primary/15"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:gap-8">
        <aside className="lg:sticky lg:top-28">
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            className="mb-3 flex w-full items-center justify-between rounded-2xl border border-outline-variant/25 bg-white/70 px-4 py-3 text-sm font-semibold text-on-surface backdrop-blur-md lg:hidden"
          >
            <span className="inline-flex items-center gap-2">
              <MaterialIcon name="tune" className="text-lg" />
              Bộ lọc
              {activeFilterCount ? (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] text-on-primary">
                  {activeFilterCount}
                </span>
              ) : null}
            </span>
            <MaterialIcon name={filtersOpen ? 'expand_less' : 'expand_more'} />
          </button>
          <div className={filtersOpen ? 'block' : 'hidden lg:block'}>{filterPanel}</div>
        </aside>

        <section>
          {error ? (
            <p className="mb-6 rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">
              {error.message || 'Không tải được sản phẩm.'}
            </p>
          ) : null}

          {isLoading ? (
            <ul className="grid gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <li key={index} className="animate-pulse">
                  <div className="aspect-[4/5] rounded-2xl bg-surface-container-high" />
                  <div className="mt-3 h-4 w-3/4 rounded-full bg-surface-container-high" />
                  <div className="mt-2 h-4 w-1/3 rounded-full bg-surface-container-high" />
                </li>
              ))}
            </ul>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-outline-variant/20 bg-white/60 px-6 py-20 text-center">
              <MaterialIcon name="local_florist" className="text-4xl text-primary-fixed-dim" />
              <p className="mt-3 text-sm font-medium text-on-surface">Không có sản phẩm phù hợp</p>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 text-sm font-semibold text-primary hover:underline"
                >
                  Xóa bộ lọc
                </button>
              ) : null}
            </div>
          ) : (
            <>
              <ul className="grid gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product, index) => (
                  <motion.li
                    key={product.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.04, ease: easeOut }}
                  >
                    <Link to={`/shop/product/${product.id}`} className="group block">
                      <div className="relative overflow-hidden rounded-2xl bg-surface-container-low shadow-[0_10px_30px_rgba(74,48,32,0.08)]">
                        <div className="aspect-[4/5]">
                          {product.mainImage ? (
                            <img
                              src={product.mainImage}
                              alt={product.name}
                              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
                              loading="lazy"
                            />
                          ) : (
                            <div className="relative flex h-full items-center justify-center">
                              <img
                                src={SHOP_IMAGES.moodPink}
                                alt=""
                                className="absolute inset-0 h-full w-full object-cover opacity-50"
                                aria-hidden="true"
                              />
                              <MaterialIcon
                                name="local_florist"
                                className="relative text-5xl text-white"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="pt-3">
                        <h3 className="font-display line-clamp-2 text-lg leading-snug text-on-surface transition group-hover:text-primary">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-sm font-semibold text-primary">
                          {formatMoney(product.price)}
                        </p>
                      </div>
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-10 flex flex-col items-center gap-3">
                {hasMore ? (
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={isLoadingMore || isValidating}
                    className="btn-primary min-w-[180px] disabled:opacity-60"
                  >
                    {isLoadingMore ? 'Đang tải...' : 'Xem thêm'}
                  </button>
                ) : (
                  <p className="text-sm text-on-surface-variant">Đã hiển thị tất cả sản phẩm</p>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}

export default ShopCatalogPage
