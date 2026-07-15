import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchCatalogProductApi } from '../../../api/catalogApi'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { formatMoney } from '../../../utils/money'
import { useCart } from '../context/CartContext'

function ShopProductPage() {
  const { id } = useParams()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [activeImage, setActiveImage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      setError('')
      try {
        const result = await fetchCatalogProductApi(id)
        if (cancelled) return
        const data = result.data
        setProduct(data)
        setActiveImage(data.mainImage || data.images?.[0]?.url || '')
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
  }, [id])

  function handleAdd() {
    if (!product) return
    addItem(product, quantity)
    setToast('Đã thêm vào giỏ')
    window.setTimeout(() => setToast(''), 1600)
  }

  if (isLoading) {
    return <p className="py-16 text-center text-sm text-slate-500">Đang tải...</p>
  }

  if (error || !product) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-6 text-center">
        <p className="text-sm text-red-600">{error || 'Không tìm thấy sản phẩm.'}</p>
        <Link to="/shop" className="mt-3 inline-block text-sm font-medium text-rose-600">
          ← Về danh sách
        </Link>
      </div>
    )
  }

  const images = product.images?.length
    ? product.images
    : product.mainImage
      ? [{ id: 'main', url: product.mainImage }]
      : []

  return (
    <div className="space-y-4">
      <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-rose-600">
        <MaterialIcon name="arrow_back" className="text-base" />
        Sản phẩm
      </Link>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-3xl bg-rose-50">
            {activeImage ? (
              <img src={activeImage} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-rose-200">
                <MaterialIcon name="image" className="text-5xl" />
              </div>
            )}
          </div>
          {images.length > 1 ? (
            <ul className="flex gap-2 overflow-x-auto">
              {images.map((image) => (
                <li key={image.id || image.url}>
                  <button
                    type="button"
                    onClick={() => setActiveImage(image.url)}
                    className={[
                      'h-16 w-16 overflow-hidden rounded-xl border',
                      activeImage === image.url ? 'border-rose-400' : 'border-rose-100',
                    ].join(' ')}
                  >
                    <img src={image.url} alt="" className="h-full w-full object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="space-y-4">
          <div>
            <p className="font-mono text-xs font-bold tracking-wider text-slate-400">{product.code}</p>
            <h1 className="mt-1 font-[Georgia,serif] text-3xl text-slate-900">{product.name}</h1>
            <p className="mt-3 text-2xl font-semibold text-rose-600">{formatMoney(product.price)}</p>
          </div>

          {product.materials ? (
            <div>
              <p className="text-sm font-medium text-slate-700">Nguyên liệu</p>
              <p className="mt-1 text-sm text-slate-600">{product.materials}</p>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              Số lượng
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                className="w-20 rounded-xl border border-rose-100 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-100"
              />
            </label>
            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex items-center gap-1 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
            >
              <MaterialIcon name="add_shopping_cart" className="text-lg" />
              Thêm vào giỏ
            </button>
            <Link
              to="/shop/cart"
              className="rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-50"
            >
              Xem giỏ
            </Link>
          </div>
        </div>
      </div>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  )
}

export default ShopProductPage
