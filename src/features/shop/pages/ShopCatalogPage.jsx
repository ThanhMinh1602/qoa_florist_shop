import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { easeOut, overlayFade, sheetEnter } from '../../../lib/motion'
import { CATALOG_PAGE_SIZE, CATALOG_PRICE_FILTERS } from '../../../constants/catalogFilters'
import { SHOP_IMAGES } from '../../../constants/shopImagery'
import { useCatalogInfinite, usePublicCategories } from '../../../hooks/swr'
import { formatMoney } from '../../../utils/money'

const SORT_OPTIONS = [
  { id: 'newest', label: 'Mới nhất' },
  { id: 'price_asc', label: 'Giá thấp đến cao' },
  { id: 'price_desc', label: 'Giá cao đến thấp' },
]

function FilterRow({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition',
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

function ProductCard({ product }) {
  return (
    <Link to={`/shop/product/${product.id}`} className="group block h-full">
      <div className="lift-card relative h-full overflow-hidden rounded-xl bg-surface-container-low shadow-[0_8px_24px_rgba(74,48,32,0.07)] sm:rounded-2xl sm:shadow-[0_10px_30px_rgba(74,48,32,0.08)]">
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
              <MaterialIcon name="local_florist" className="relative text-4xl text-white sm:text-5xl" />
            </div>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent p-2.5 pt-10 sm:hidden">
          <h3 className="font-display line-clamp-2 text-[13px] leading-tight text-white">
            {product.name}
          </h3>
          <p className="mt-0.5 text-[11px] font-semibold text-white/95">
            {formatMoney(product.price)}
          </p>
        </div>
      </div>
      <div className="hidden pt-3 sm:block">
        <h3 className="font-display line-clamp-2 text-lg leading-snug text-on-surface transition group-hover:text-primary">
          {product.name}
        </h3>
        <p className="mt-1 text-sm font-semibold text-primary">{formatMoney(product.price)}</p>
      </div>
    </Link>
  )
}

function DesktopFilterPanel({
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
  priceFilterId,
  onPriceFilterChange,
  categories,
  hasActiveFilters,
  onClear,
}) {
  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-white/75 p-4 shadow-[0_12px_40px_rgba(74,48,32,0.06)] backdrop-blur-xl sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="label-caps text-primary">Bộ lọc</p>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onClear}
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
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tên hoa, nguyên liệu..."
            className="input-glass with-leading-icon py-2.5 text-sm"
          />
        </div>
      </label>

      <div className="mt-5 border-t border-outline-variant/20 pt-4">
        <p className="mb-2 text-xs font-semibold text-on-surface-variant">Danh mục</p>
        <div className="space-y-0.5">
          <FilterRow selected={!categoryId} onClick={() => onCategoryChange('')}>
            Tất cả
          </FilterRow>
          {categories.map((category) => (
            <FilterRow
              key={category.id}
              selected={categoryId === category.id}
              onClick={() =>
                onCategoryChange(categoryId === category.id ? '' : category.id)
              }
            >
              {category.name}
            </FilterRow>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-outline-variant/20 pt-4">
        <p className="mb-2 text-xs font-semibold text-on-surface-variant">Khoảng giá</p>
        <div className="space-y-0.5">
          <FilterRow selected={!priceFilterId} onClick={() => onPriceFilterChange('')}>
            Mọi mức giá
          </FilterRow>
          {CATALOG_PRICE_FILTERS.map((filter) => (
            <FilterRow
              key={filter.id}
              selected={priceFilterId === filter.id}
              onClick={() =>
                onPriceFilterChange(priceFilterId === filter.id ? '' : filter.id)
              }
            >
              {filter.label}
            </FilterRow>
          ))}
        </div>
      </div>
    </div>
  )
}

function FilterBottomSheet({
  open,
  draftCategoryId,
  draftPriceFilterId,
  categories,
  onDraftCategoryChange,
  onDraftPriceChange,
  onClearDraft,
  onClose,
  onSubmit,
}) {
  const draftCount = Number(Boolean(draftCategoryId)) + Number(Boolean(draftPriceFilterId))

  useEffect(() => {
    if (!open) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center lg:hidden"
          {...overlayFade}
        >
          <button
            type="button"
            className="absolute inset-0 bg-on-surface/45"
            aria-label="Đóng bộ lọc"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-sheet-title"
            className="relative z-10 flex max-h-[min(88dvh,640px)] w-full flex-col rounded-t-3xl bg-surface-container-lowest shadow-2xl"
            {...sheetEnter}
          >
            <div className="flex shrink-0 flex-col items-center px-4 pt-3 pb-2">
              <span className="mb-3 h-1 w-10 rounded-full bg-outline-variant/50" aria-hidden="true" />
              <div className="flex w-full items-center justify-between gap-3">
                <h2 id="filter-sheet-title" className="font-display text-lg text-on-surface">
                  Bộ lọc
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high"
                  aria-label="Đóng"
                >
                  <MaterialIcon name="close" className="text-[20px]" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-3">
              <div className="border-t border-outline-variant/20 pt-4">
                <p className="mb-2 text-xs font-semibold text-on-surface-variant">Danh mục</p>
                <div className="space-y-0.5">
                  <FilterRow
                    selected={!draftCategoryId}
                    onClick={() => onDraftCategoryChange('')}
                  >
                    Tất cả
                  </FilterRow>
                  {categories.map((category) => (
                    <FilterRow
                      key={category.id}
                      selected={draftCategoryId === category.id}
                      onClick={() =>
                        onDraftCategoryChange(
                          draftCategoryId === category.id ? '' : category.id,
                        )
                      }
                    >
                      {category.name}
                    </FilterRow>
                  ))}
                </div>
              </div>

              <div className="mt-5 border-t border-outline-variant/20 pt-4">
                <p className="mb-2 text-xs font-semibold text-on-surface-variant">Khoảng giá</p>
                <div className="space-y-0.5">
                  <FilterRow
                    selected={!draftPriceFilterId}
                    onClick={() => onDraftPriceChange('')}
                  >
                    Mọi mức giá
                  </FilterRow>
                  {CATALOG_PRICE_FILTERS.map((filter) => (
                    <FilterRow
                      key={filter.id}
                      selected={draftPriceFilterId === filter.id}
                      onClick={() =>
                        onDraftPriceChange(
                          draftPriceFilterId === filter.id ? '' : filter.id,
                        )
                      }
                    >
                      {filter.label}
                    </FilterRow>
                  ))}
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-outline-variant/20 bg-surface-container-lowest px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClearDraft}
                  disabled={!draftCount}
                  className="btn-glass flex-1 !py-3 text-[10px] disabled:opacity-40"
                >
                  Xóa lọc
                </button>
                <button
                  type="button"
                  onClick={onSubmit}
                  className="btn-primary flex-[1.4] !py-3 text-[10px]"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function ShopCatalogPage() {
  const [searchParams] = useSearchParams()
  const initialPrice = CATALOG_PRICE_FILTERS.some((item) => item.id === searchParams.get('price'))
    ? searchParams.get('price')
    : ''
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [priceFilterId, setPriceFilterId] = useState(initialPrice)
  const [draftCategoryId, setDraftCategoryId] = useState('')
  const [draftPriceFilterId, setDraftPriceFilterId] = useState(initialPrice)
  const [sort, setSort] = useState('newest')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const { categories } = usePublicCategories()

  useEffect(() => {
    const nextPrice = searchParams.get('price') || ''
    if (!nextPrice || !CATALOG_PRICE_FILTERS.some((item) => item.id === nextPrice)) return
    setPriceFilterId(nextPrice)
    setDraftPriceFilterId(nextPrice)
  }, [searchParams])

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

  function openFilters() {
    setDraftCategoryId(categoryId)
    setDraftPriceFilterId(priceFilterId)
    setFiltersOpen(true)
  }

  function closeFilters() {
    setFiltersOpen(false)
  }

  function submitFilters() {
    setCategoryId(draftCategoryId)
    setPriceFilterId(draftPriceFilterId)
    setFiltersOpen(false)
  }

  function clearDraftFilters() {
    setDraftCategoryId('')
    setDraftPriceFilterId('')
  }

  function clearAppliedFilters() {
    setSearch('')
    setDebouncedSearch('')
    setCategoryId('')
    setPriceFilterId('')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-8 sm:py-10 lg:px-16">
      <div className="mb-3 flex items-center justify-between gap-3 sm:mb-8 sm:items-end">
        <div>
          <p className="label-caps hidden text-primary sm:block">Cửa hàng</p>
          <h1 className="font-display text-xl text-on-surface sm:mt-1 sm:text-4xl">Sản phẩm</h1>
        </div>
        <button
          type="button"
          onClick={openFilters}
          className={[
            'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border backdrop-blur-md transition lg:hidden',
            filtersOpen || activeFilterCount
              ? 'border-primary/30 bg-primary text-on-primary'
              : 'border-outline-variant/25 bg-white/70 text-on-surface',
          ].join(' ')}
          aria-label="Bộ lọc"
          aria-expanded={filtersOpen}
        >
          <MaterialIcon name="tune" className="text-[20px]" />
          {activeFilterCount ? (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-on-surface px-1 text-[9px] font-bold text-surface">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
        <p className="hidden shrink-0 pb-0.5 text-sm text-on-surface-variant lg:block">
          {isLoading ? 'Đang tải...' : `${total} sản phẩm`}
        </p>
      </div>

      <div className="mb-3 flex gap-2 lg:hidden">
        <div className="relative min-w-0 flex-1">
          <MaterialIcon
            name="search"
            className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-[18px] text-outline"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm hoa..."
            className="input-glass with-leading-icon h-10 w-full !rounded-xl py-0 text-sm"
          />
        </div>
        <label className="relative shrink-0">
          <span className="sr-only">Sắp xếp</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="h-10 max-w-[8rem] appearance-none rounded-xl border border-outline-variant/30 bg-white/70 py-0 pr-7 pl-2.5 text-[11px] text-on-surface outline-none backdrop-blur-md focus:ring-2 focus:ring-primary/15"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <MaterialIcon
            name="expand_more"
            className="pointer-events-none absolute top-1/2 right-1 -translate-y-1/2 text-base text-outline"
          />
        </label>
      </div>

      <div className="-mx-4 mb-4 overflow-x-auto px-4 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max items-center gap-2 pb-0.5">
          <button
            type="button"
            onClick={() => setPriceFilterId('')}
            className={[
              'shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-wide transition',
              !priceFilterId
                ? 'border-primary bg-primary text-on-primary'
                : 'border-outline-variant/30 bg-white/70 text-on-surface-variant backdrop-blur-md',
            ].join(' ')}
          >
            Tất cả
          </button>
          {CATALOG_PRICE_FILTERS.map((filter) => {
            const selected = priceFilterId === filter.id
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setPriceFilterId(selected ? '' : filter.id)}
                className={[
                  'shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-wide whitespace-nowrap transition',
                  selected
                    ? 'border-primary bg-primary text-on-primary'
                    : 'border-outline-variant/30 bg-white/70 text-on-surface-variant backdrop-blur-md',
                ].join(' ')}
              >
                {filter.label}
              </button>
            )
          })}
        </div>
      </div>

      <FilterBottomSheet
        open={filtersOpen}
        draftCategoryId={draftCategoryId}
        draftPriceFilterId={draftPriceFilterId}
        categories={categories}
        onDraftCategoryChange={setDraftCategoryId}
        onDraftPriceChange={setDraftPriceFilterId}
        onClearDraft={clearDraftFilters}
        onClose={closeFilters}
        onSubmit={submitFilters}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:gap-8">
        <aside className="hidden lg:sticky lg:top-28 lg:block">
          <DesktopFilterPanel
            search={search}
            onSearchChange={setSearch}
            categoryId={categoryId}
            onCategoryChange={setCategoryId}
            priceFilterId={priceFilterId}
            onPriceFilterChange={setPriceFilterId}
            categories={categories}
            hasActiveFilters={hasActiveFilters}
            onClear={clearAppliedFilters}
          />
        </aside>

        <section>
          <div className="mb-6 hidden items-center justify-end gap-3 lg:flex">
            <label className="inline-flex items-center gap-2 text-sm text-on-surface-variant">
              <span>Sắp xếp</span>
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

          <p className="mb-2.5 text-xs text-on-surface-variant lg:hidden">
            {isLoading ? 'Đang tải...' : `${total} sản phẩm`}
          </p>

          {error ? (
            <p className="mb-6 rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">
              {error.message || 'Không tải được sản phẩm.'}
            </p>
          ) : null}

          {isLoading ? (
            <ul className="grid grid-cols-2 gap-2.5 sm:gap-x-5 sm:gap-y-8 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <li key={index} className="animate-pulse">
                  <div className="aspect-[4/5] rounded-xl bg-surface-container-high sm:rounded-2xl" />
                  <div className="mt-3 hidden h-4 w-3/4 rounded-full bg-surface-container-high sm:block" />
                  <div className="mt-2 hidden h-4 w-1/3 rounded-full bg-surface-container-high sm:block" />
                </li>
              ))}
            </ul>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-outline-variant/20 bg-white/60 px-6 py-16 text-center sm:py-20">
              <MaterialIcon name="local_florist" className="text-4xl text-primary-fixed-dim" />
              <p className="mt-3 text-sm font-medium text-on-surface">Không có sản phẩm phù hợp</p>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearAppliedFilters}
                  className="mt-4 text-sm font-semibold text-primary hover:underline"
                >
                  Xóa bộ lọc
                </button>
              ) : null}
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-2.5 sm:gap-x-5 sm:gap-y-8 xl:grid-cols-3">
                {products.map((product, index) => (
                  <motion.li
                    key={product.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: Math.min(index, 8) * 0.035,
                      ease: easeOut,
                    }}
                  >
                    <ProductCard product={product} />
                  </motion.li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col items-center gap-3 sm:mt-10">
                {hasMore ? (
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={isLoadingMore || isValidating}
                    className="btn-primary min-w-[160px] !px-6 !py-2.5 text-[10px] disabled:opacity-60 sm:min-w-[180px] sm:text-xs"
                  >
                    {isLoadingMore ? 'Đang tải...' : 'Xem thêm'}
                  </button>
                ) : (
                  <p className="text-xs text-on-surface-variant sm:text-sm">
                    Đã hiển thị tất cả sản phẩm
                  </p>
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
