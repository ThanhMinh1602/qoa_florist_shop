import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCatalogApi } from '../../../api/catalogApi'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { SHOP_IMAGES } from '../../../constants/shopImagery'
import { formatMoney } from '../../../utils/money'

const SORT_OPTIONS = [
  { value: 'name', label: 'Tên A–Z' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
  { value: 'newest', label: 'Mới nhất' },
]

function ShopCatalogPage() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sort, setSort] = useState('name')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

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

  return (
    <div>
      <section className="relative z-10 flex min-h-[80vh] flex-col items-center justify-center px-5 pb-16 pt-10 text-center sm:px-8 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-4xl"
        >
          <h1 className="font-display text-4xl leading-tight text-primary sm:text-6xl md:text-[80px]">
            Hoa tươi chọn tay.  
            <br />
            Thiệp số gắn QR.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-on-surface-variant sm:text-lg">
            Trải nghiệm tặng hoa hoàn toàn mới với thông điệp cá nhân hóa được mã hóa qua QR code,
            mang đến bất ngờ tinh tế cho người nhận.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="#bo-suu-tap" className="btn-primary px-8 py-4">
              Khám phá bộ sưu tập
            </a>
            <Link to="/custom" className="btn-glass px-8 py-4">
              Tạo thiệp lời chúc
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              icon: 'local_florist',
              title: 'Chọn hoa',
              text: 'Lựa chọn những bó hoa tươi đẹp nhất từ bộ sưu tập của chúng tôi.',
            },
            {
              icon: 'qr_code_2',
              title: 'Gắn thiệp QR',
              text: 'Tạo thông điệp cá nhân — video, audio hoặc chữ — gắn vào mã QR trên bó hoa.',
            },
            {
              icon: 'local_shipping',
              title: 'Giao tận tay',
              text: 'Giao nhanh, an toàn — giữ hoa tươi và cảm xúc nguyên vẹn đến tay người nhận.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="glass-card flex flex-col items-center rounded-[1.5rem] p-8 text-center"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-surface-variant">
                <MaterialIcon name={item.icon} className="text-[32px] text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-primary">{item.title}</h3>
              <p className="text-sm text-on-surface-variant">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="bo-suu-tap" className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-8 sm:px-8 lg:px-16">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label-caps text-primary">Bộ sưu tập nổi bật</p>
            <h2 className="font-display mt-1 text-3xl text-on-surface sm:text-4xl">
              Chọn bó hoa của bạn
            </h2>
          </div>
          {priceHint ? (
            <p className="text-sm text-on-surface-variant">
              {products.length} sản phẩm · {formatMoney(priceHint.min)} –{' '}
              {formatMoney(priceHint.max)}
            </p>
          ) : null}
        </div>

        <div className="glass-card mb-8 grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <label className="block text-sm">
            <span className="label-caps mb-1.5 block text-on-surface-variant">Tìm kiếm</span>
            <div className="relative">
              <MaterialIcon
                name="search"
                className="absolute top-1/2 left-3 -translate-y-1/2 text-outline"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tên, mã, nguyên liệu..."
                className="input-glass pl-10"
              />
            </div>
          </label>

          <div className="grid grid-cols-2 gap-2 sm:w-56">
            <label className="block text-sm">
              <span className="label-caps mb-1.5 block text-on-surface-variant">Giá từ</span>
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="input-glass"
              />
            </label>
            <label className="block text-sm">
              <span className="label-caps mb-1.5 block text-on-surface-variant">đến</span>
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="input-glass"
              />
            </label>
          </div>

          <label className="block text-sm sm:w-44">
            <span className="label-caps mb-1.5 block text-on-surface-variant">Sắp xếp</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-glass">
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error ? (
          <p className="rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">
            {error}
          </p>
        ) : null}

        {isLoading ? (
          <p className="py-16 text-center text-sm text-on-surface-variant">Đang tải sản phẩm...</p>
        ) : products.length === 0 ? (
          <div className="glass-card px-6 py-20 text-center">
            <MaterialIcon name="local_florist" className="text-4xl text-primary-fixed-dim" />
            <p className="mt-3 text-sm font-medium text-on-surface">Không có sản phẩm phù hợp</p>
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
              <motion.li
                key={product.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.24) }}
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
                        <MaterialIcon name="local_florist" className="relative text-5xl text-white" />
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
              </motion.li>
            ))}
          </ul>
        )}
      </section>

      <section className="mx-auto mt-10 max-w-7xl px-5 sm:px-8 lg:px-16">
        <div className="glass-card flex flex-col items-start gap-4 bg-surface-container-low/70 px-6 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <div className="max-w-lg">
            <p className="font-display text-3xl text-primary sm:text-4xl">Thiệp số, cảm xúc thật</p>
            <p className="mt-2 text-sm text-on-surface-variant">
              Tạo thiệp số với mã QR — dán lên bó hoa, người nhận mở ra một khoảnh khắc đặc biệt.
            </p>
          </div>
          <Link to="/custom" className="btn-primary shrink-0 px-6 py-3">
            Tạo thiệp ngay
            <MaterialIcon name="arrow_forward" className="text-base" />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default ShopCatalogPage
