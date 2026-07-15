import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCatalogApi } from '../../../api/catalogApi'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { formatMoney } from '../../../utils/money'
import { useCart } from '../context/CartContext'

const SORT_OPTIONS = [
  { value: 'name', label: 'Tên A–Z' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
  { value: 'newest', label: 'Mới nhất' },
]

function ShopCatalogPage() {
  const { addItem } = useCart()
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sort, setSort] = useState('name')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      setError('')
      try {
        const result = await fetchCatalogApi({
          q: debouncedSearch,
          minPrice,
          maxPrice,
          sort,
        })
        if (!cancelled) setProducts(result.data || [])
      } catch (err) {
        if (!cancelled) setError(err.message || 'Không tải được sản phẩm.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [debouncedSearch, minPrice, maxPrice, sort])

  const priceHint = useMemo(() => {
    if (!products.length) return null
    const prices = products.map((item) => item.price)
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    }
  }, [products])

  function handleAdd(product) {
    addItem(product, 1)
    setToast(`Đã thêm “${product.name}” vào giỏ`)
    window.setTimeout(() => setToast(''), 1800)
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-500 via-rose-400 to-pink-300 px-6 py-10 text-white shadow-lg sm:px-10 sm:py-14">
        <div className="relative z-10 max-w-xl">
          <p className="text-sm uppercase tracking-[0.2em] text-white/80">QOA Florist</p>
          <h1 className="mt-2 font-[Georgia,serif] text-3xl leading-tight sm:text-4xl">
            Chọn hoa đẹp, đặt ngay online
          </h1>
          <p className="mt-3 text-sm text-white/90 sm:text-base">
            Tìm bó hoa phù hợp, thêm vào giỏ và chat Zalo với shop để xác nhận đơn.
          </p>
        </div>
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
      </section>

      <div className="grid gap-3 rounded-2xl border border-rose-100 bg-white p-4 shadow-sm sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Tìm kiếm</span>
          <div className="relative">
            <MaterialIcon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tên, mã, nguyên liệu..."
              className="w-full rounded-xl border border-rose-100 py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-rose-100"
            />
          </div>
        </label>

        <div className="grid grid-cols-2 gap-2 sm:w-56">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Giá từ</span>
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full rounded-xl border border-rose-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-100"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">đến</span>
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded-xl border border-rose-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-100"
            />
          </label>
        </div>

        <label className="block text-sm sm:w-44">
          <span className="mb-1 block font-medium text-slate-700">Sắp xếp</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full rounded-xl border border-rose-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-100"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {priceHint ? (
        <p className="text-xs text-slate-500">
          Đang hiện {products.length} sản phẩm · khoảng giá {formatMoney(priceHint.min)} –{' '}
          {formatMoney(priceHint.max)}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      ) : null}

      {isLoading ? (
        <p className="py-16 text-center text-sm text-slate-500">Đang tải sản phẩm...</p>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-rose-200 bg-white px-6 py-16 text-center">
          <MaterialIcon name="local_florist" className="text-4xl text-rose-200" />
          <p className="mt-3 text-sm font-medium text-slate-700">Không có sản phẩm phù hợp</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li
              key={product.id}
              className="overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <Link to={`/shop/product/${product.id}`} className="block">
                <div className="aspect-[4/3] bg-rose-50">
                  {product.mainImage ? (
                    <img
                      src={product.mainImage}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-rose-200">
                      <MaterialIcon name="image" className="text-4xl" />
                    </div>
                  )}
                </div>
                <div className="space-y-1 px-4 pt-3">
                  <p className="font-mono text-[10px] font-bold tracking-wider text-slate-400">
                    {product.code}
                  </p>
                  <h2 className="line-clamp-2 font-semibold text-slate-900">{product.name}</h2>
                  <p className="line-clamp-2 text-xs text-slate-500">{product.materials || '—'}</p>
                  <p className="pt-1 text-base font-semibold text-rose-600">
                    {formatMoney(product.price)}
                  </p>
                </div>
              </Link>
              <div className="px-4 pb-4 pt-2">
                <button
                  type="button"
                  onClick={() => handleAdd(product)}
                  className="inline-flex w-full items-center justify-center gap-1 rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
                >
                  <MaterialIcon name="add_shopping_cart" className="text-lg" />
                  Thêm giỏ
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  )
}

export default ShopCatalogPage
