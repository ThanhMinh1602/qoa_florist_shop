import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'
import {
  CATALOG_PAGE_SIZE,
  buildQuickFilters,
  resolveQuickFilter,
} from '../../../constants/catalogFilters'
import { SHOP_IMAGES } from '../../../constants/shopImagery'
import { useCatalogInfinite, usePublicCategories } from '../../../hooks/swr'
import { formatMoney } from '../../../utils/money'

function ShopCatalogPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const { categories } = usePublicCategories()

  const quickFilters = useMemo(() => buildQuickFilters(categories), [categories])

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [search])

  const queryParams = useMemo(() => {
    const quick = resolveQuickFilter(activeFilter, quickFilters)
    const params = {
      limit: CATALOG_PAGE_SIZE,
      sort: quick?.sort || 'newest',
    }
    if (debouncedSearch) params.q = debouncedSearch
    if (quick?.categoryId) params.categoryId = quick.categoryId
    if (quick?.tag) params.tag = quick.tag
    if (quick?.minPrice != null) params.minPrice = quick.minPrice
    if (quick?.maxPrice != null) params.maxPrice = quick.maxPrice
    return params
  }, [activeFilter, debouncedSearch, quickFilters])

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

  function toggleFilter(filterId) {
    setActiveFilter((current) => (current === filterId ? '' : filterId))
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-16">
      <section className="glass-card mb-8 rounded-2xl p-5 sm:p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label-caps text-primary">Bộ sưu tập</p>
            <h1 className="font-display mt-1 text-3xl text-on-surface sm:text-4xl">
              Tất cả sản phẩm
            </h1>
          </div>
          <p className="text-sm text-on-surface-variant">
            {isLoading ? 'Đang tải...' : `${total} sản phẩm`}
          </p>
        </div>

        <label className="mt-6 block text-sm">
          <span className="label-caps mb-1.5 block text-on-surface-variant">Tìm kiếm</span>
          <div className="relative">
            <MaterialIcon
              name="search"
              className="absolute top-1/2 left-3 -translate-y-1/2 text-outline"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tên, mã, nguyên liệu, mô tả..."
              className="input-glass pl-10"
            />
          </div>
        </label>

        <div className="mt-5">
          <p className="label-caps mb-2.5 text-on-surface-variant">Lọc nhanh</p>
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((filter) => {
              const selected = activeFilter === filter.id
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => toggleFilter(filter.id)}
                  className={[
                    'rounded-full border px-3.5 py-2 text-xs font-semibold tracking-wide transition',
                    selected
                      ? 'border-primary/40 bg-primary text-on-primary shadow-[0_8px_24px_rgba(74,48,32,0.18)]'
                      : 'border-white/60 bg-white/45 text-on-surface-variant backdrop-blur-md hover:border-primary/30 hover:text-primary',
                  ].join(' ')}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {error ? (
        <p className="mb-6 rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">
          {error.message || 'Không tải được sản phẩm.'}
        </p>
      ) : null}

      {isLoading ? (
        <p className="py-20 text-center text-sm text-on-surface-variant">Đang tải sản phẩm...</p>
      ) : products.length === 0 ? (
        <div className="glass-card px-6 py-20 text-center">
          <MaterialIcon name="local_florist" className="text-4xl text-primary-fixed-dim" />
          <p className="mt-3 text-sm font-medium text-on-surface">Không có sản phẩm phù hợp</p>
        </div>
      ) : (
        <>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <li
                key={product.id}
                className="glass-card group overflow-hidden transition hover:-translate-y-1 hover:bg-surface-container-lowest/80"
              >
                <Link to={`/shop/product/${product.id}`} className="block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-surface-container-low">
                    {product.mainImage ? (
                      <img
                        src={product.mainImage}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
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
                    <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/55 bg-surface-container-lowest/55 p-3 backdrop-blur-xl">
                      <p className="font-mono text-[10px] font-bold tracking-wider text-outline">
                        {product.code}
                      </p>
                      <h3 className="font-display mt-0.5 line-clamp-2 text-xl leading-tight text-on-surface">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-primary">
                        {formatMoney(product.price)}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
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
    </div>
  )
}

export default ShopCatalogPage
