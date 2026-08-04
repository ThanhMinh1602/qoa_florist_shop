import { Link, useParams } from 'react-router-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { useCatalogProduct } from '../../../hooks/swr'
import { formatMoney } from '../../../utils/money'
import { useEffect, useState } from 'react'

function ShopProductPage() {
  const { id } = useParams()
  const { product, isLoading, error } = useCatalogProduct(id)
  const [activeImage, setActiveImage] = useState('')

  useEffect(() => {
    if (!product) return
    setActiveImage(product.mainImage || product.images?.[0]?.url || '')
  }, [product])

  if (isLoading) {
    return <p className="py-16 text-center text-sm text-on-surface-variant">Đang tải...</p>
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8">
        <div className="glass-card rounded-2xl px-4 py-8">
          <p className="text-sm text-error">{error?.message || 'Không tìm thấy sản phẩm.'}</p>
          <Link to="/shop" className="mt-4 inline-block text-sm font-medium text-primary">
            ← Về danh sách
          </Link>
        </div>
      </div>
    )
  }

  const images = product.images?.length
    ? product.images
    : product.mainImage
      ? [{ id: 'main', url: product.mainImage }]
      : []

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-5 py-8 sm:px-8 lg:px-16">
      <Link
        to="/shop"
        className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary"
      >
        <MaterialIcon name="arrow_back" className="text-base" />
        Sản phẩm
      </Link>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-[1.75rem] border border-white/55 bg-surface-container-low shadow-[0_20px_50px_rgba(74,48,32,0.12)] backdrop-blur-sm">
            {activeImage ? (
              <img src={activeImage} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <MaterialIcon name="local_florist" className="text-5xl text-primary" />
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

        <div className="glass-card space-y-5 rounded-[1.75rem] p-6 sm:p-8">
          <div>
            <p className="font-mono text-xs font-bold tracking-wider text-outline">{product.code}</p>
            <h1 className="font-display mt-1 text-4xl leading-tight text-on-surface">
              {product.name}
            </h1>
            <p className="mt-3 text-2xl font-semibold text-primary">
              {formatMoney(product.price)}
            </p>
          </div>

          {product.materials ? (
            <div>
              <p className="text-sm font-medium text-on-surface">Nguyên liệu</p>
              <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
                {product.materials}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default ShopProductPage
