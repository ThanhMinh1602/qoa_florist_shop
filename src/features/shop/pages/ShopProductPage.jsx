import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchCatalogProductApi } from '../../../api/catalogApi'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { formatMoney } from '../../../utils/money'

function ShopProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [activeImage, setActiveImage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

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

  if (isLoading) {
    return <p className="py-16 text-center text-sm text-on-surface-variant">Đang tải...</p>
  }

  if (error || !product) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-6 text-center">
        <p className="text-sm text-red-600">{error || 'Không tìm thấy sản phẩm.'}</p>
        <Link to="/shop" className="mt-3 inline-block text-sm font-medium text-primary">
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
      <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary">
        <MaterialIcon name="arrow_back" className="text-base" />
        Sản phẩm
      </Link>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-[1.75rem] bg-surface-container-low shadow-[0_20px_50px_rgba(42,21,25,0.12)]">
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="relative flex h-full items-center justify-center overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80"
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-60"
                  aria-hidden="true"
                />
                <MaterialIcon name="local_florist" className="relative text-5xl text-white" />
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
                      'h-16 w-16 overflow-hidden rounded-xl border-2',
                      activeImage === image.url ? 'border-primary' : 'border-transparent',
                    ].join(' ')}
                  >
                    <img src={image.url} alt="" className="h-full w-full object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="space-y-5 rounded-[1.75rem] border border-white/70 bg-surface-container-lowest/80 p-6 shadow-sm backdrop-blur-md sm:p-8">
          <div>
            <p className="font-mono text-xs font-bold tracking-wider text-[#8b6670]">{product.code}</p>
            <h1 className="font-display mt-1 text-4xl leading-tight text-on-surface">{product.name}</h1>
            <p className="mt-3 text-2xl font-semibold text-primary">{formatMoney(product.price)}</p>
          </div>

          {product.materials ? (
            <div>
              <p className="text-sm font-medium text-on-surface">Nguyên liệu</p>
              <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{product.materials}</p>
            </div>
          ) : null}

          <Link to="/custom" className="btn-primary inline-flex">
            Tạo thiệp kèm hoa
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ShopProductPage
