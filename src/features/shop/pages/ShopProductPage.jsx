import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'
import RichTextContent from '../../../components/common/RichTextContent'
import MessengerOrderSheet from '../../../components/common/MessengerOrderSheet'
import ShopImage from '../../../components/common/ShopImage'
import { SHOP_IMAGES } from '../../../constants/shopImagery'
import { useCatalog, useCatalogProduct } from '../../../hooks/swr'
import { easeOut, fadeUp, stagger } from '../../../lib/motion'
import { formatMoney } from '../../../utils/money'
import { cloudinarySrcSet, cloudinaryUrl } from '../../../utils/cloudinaryUrl'
import ProductImagePager from '../components/ProductImagePager'

function ShopProductPage() {
  const { id } = useParams()
  const { product, isLoading, error } = useCatalogProduct(id)
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedColorId, setSelectedColorId] = useState('')
  const [orderSheetOpen, setOrderSheetOpen] = useState(false)

  const colors = useMemo(() => {
    if (!product) return []
    if (Array.isArray(product.colors) && product.colors.length > 0) {
      return product.colors.filter((color) => Array.isArray(color.images) && color.images.length > 0)
    }
    return []
  }, [product])

  const selectedColor = useMemo(() => {
    if (!colors.length) return null
    return colors.find((color) => color.id === selectedColorId) || colors[0]
  }, [colors, selectedColorId])

  const images = useMemo(() => {
    if (selectedColor?.images?.length) return selectedColor.images
    if (product?.images?.length) return product.images
    if (product?.mainImage) return [{ id: 'main', url: product.mainImage }]
    return []
  }, [selectedColor, product])

  const showColorPicker = colors.length > 0

  const goImage = useCallback(
    (direction) => {
      if (images.length < 2) return
      setActiveIndex((current) => {
        const next = current + direction
        if (next < 0 || next >= images.length) return current
        return next
      })
    },
    [images.length],
  )

  useEffect(() => {
    setActiveIndex(0)
    const firstColorId = product?.colors?.find((color) => color?.images?.length)?.id || ''
    setSelectedColorId(firstColorId)
  }, [product?.id, product?.colors])

  useEffect(() => {
    setActiveIndex(0)
  }, [selectedColorId])

  useEffect(() => {
    if (!product) return undefined
    const previous = document.title
    document.title = `${product.name} · QOA Florist`
    return () => {
      document.title = previous
    }
  }, [product])

  useEffect(() => {
    if (images.length < 2) return undefined
    function onKey(event) {
      if (event.key === 'ArrowRight') goImage(1)
      if (event.key === 'ArrowLeft') goImage(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goImage, images.length])

  const categoryId = product?.categories?.[0]?.id
  const { products: relatedSource } = useCatalog(
    {
      limit: 8,
      sort: categoryId ? 'newest' : 'popular',
      ...(categoryId ? { categoryId } : {}),
    },
    { isPaused: () => !product },
  )

  const related = (relatedSource || []).filter((item) => item.id !== product?.id).slice(0, 3)
  const hasDiscount =
    product && Number(product.listPrice) > 0 && Number(product.listPrice) > Number(product.price)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-8 sm:py-8 lg:px-16">
        <div className="h-3 w-20 animate-pulse rounded-full bg-surface-container-high sm:h-4 sm:w-28" />
        <div className="mt-4 grid gap-5 lg:mt-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
          <div className="-mx-4 aspect-[4/5] animate-pulse bg-surface-container-high sm:mx-0 sm:rounded-[2rem]" />
          <div className="space-y-3 sm:space-y-4">
            <div className="h-7 w-3/4 animate-pulse rounded-xl bg-surface-container-high sm:h-10 sm:rounded-2xl" />
            <div className="h-6 w-28 animate-pulse rounded-lg bg-surface-container-high sm:h-8 sm:w-40 sm:rounded-xl" />
            <div className="h-28 animate-pulse rounded-2xl bg-surface-container-high sm:h-40 sm:rounded-3xl" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-8 sm:py-20">
        <div className="glass-card rounded-2xl px-5 py-10 sm:rounded-[2rem] sm:px-6 sm:py-12">
          <MaterialIcon name="local_florist" className="text-4xl text-primary-fixed-dim" />
          <p className="mt-4 text-base font-semibold text-on-surface sm:text-lg">
            Không tìm thấy sản phẩm
          </p>
          <p className="mt-2 text-sm text-on-surface-variant">
            {error?.message || 'Bó hoa này có thể đã được ẩn hoặc đổi mã.'}
          </p>
          <Link to="/shop" className="btn-primary mt-6 !px-5 !py-2.5 text-[10px] sm:text-xs">
            Về danh sách sản phẩm
          </Link>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      key={product.id}
      className="mx-auto max-w-7xl px-4 pb-[5.5rem] pt-3 sm:px-8 sm:pb-20 sm:pt-6 lg:px-16"
      initial="hidden"
      animate="show"
      variants={stagger}
    >
      <motion.nav
        variants={fadeUp}
        className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-on-surface-variant sm:mb-6 sm:gap-2 sm:text-sm"
      >
        <Link to="/shop" className="inline-flex items-center gap-0.5 transition hover:text-primary sm:gap-1">
          <MaterialIcon name="arrow_back" className="text-sm sm:text-base" />
          Sản phẩm
        </Link>
        <span className="text-outline/50">/</span>
        <span className="line-clamp-1 text-on-surface">{product.name}</span>
      </motion.nav>

      <motion.div
        variants={stagger}
        className="grid items-start gap-5 sm:gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-14"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { duration: 0.55, ease: easeOut } },
          }}
          className="space-y-2.5 sm:space-y-3 lg:sticky lg:top-28"
        >
          <div className="group relative -mx-4 overflow-hidden border-y border-white/40 bg-surface-container-low shadow-none sm:mx-0 sm:rounded-[2rem] sm:border sm:border-white/60 sm:shadow-[0_24px_60px_rgba(74,48,32,0.12)]">
            <ProductImagePager
              images={images}
              activeIndex={activeIndex}
              onIndexChange={setActiveIndex}
              alt={product.name}
            />

            {images.length > 1 ? (
              <>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => goImage(-1)}
                  className="absolute top-1/2 left-2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/70 text-primary shadow-sm backdrop-blur-md hover:bg-white sm:left-4 sm:flex sm:h-11 sm:w-11"
                  aria-label="Ảnh trước"
                >
                  <MaterialIcon name="chevron_left" className="text-xl sm:text-2xl" />
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => goImage(1)}
                  className="absolute top-1/2 right-2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/70 text-primary shadow-sm backdrop-blur-md hover:bg-white sm:right-4 sm:flex sm:h-11 sm:w-11"
                  aria-label="Ảnh sau"
                >
                  <MaterialIcon name="chevron_right" className="text-xl sm:text-2xl" />
                </motion.button>
                <span className="pointer-events-none absolute right-3 bottom-3 rounded-full bg-on-surface/70 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-white backdrop-blur-md sm:right-4 sm:bottom-4 sm:px-3 sm:py-1 sm:text-[11px]">
                  {activeIndex + 1} / {images.length}
                </span>
              </>
            ) : null}
          </div>

          {images.length > 1 ? (
            <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:gap-2.5 sm:px-0">
              {images.map((image, index) => {
                const selected = index === activeIndex
                return (
                  <li key={image.id || image.url} className="shrink-0">
                    <motion.button
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      animate={{ scale: selected ? 1 : 0.94, opacity: selected ? 1 : 0.7 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25, ease: easeOut }}
                      className={[
                        'relative h-14 w-11 overflow-hidden rounded-xl border-2 sm:h-24 sm:w-20 sm:rounded-2xl',
                        selected
                          ? 'border-primary shadow-[0_8px_20px_rgba(74,48,32,0.16)]'
                          : 'border-transparent',
                      ].join(' ')}
                    >
                      <ShopImage
                        src={cloudinaryUrl(image.url, { width: 240 })}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="eager"
                        decoding="async"
                        fetchPriority="high"
                      />
                    </motion.button>
                  </li>
                )
              })}
            </ul>
          ) : null}
        </motion.div>

        <motion.div variants={fadeUp} className="relative">
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 -right-8 hidden h-48 w-48 rounded-full bg-primary/8 blur-3xl sm:block"
            animate={{ scale: [1, 1.12, 1], opacity: [0.55, 0.9, 0.55] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="relative space-y-4 sm:space-y-6"
          >
            <motion.div variants={fadeUp}>
              {product.code ? (
                <p className="mb-1 font-mono text-[10px] font-bold tracking-wider text-outline sm:hidden">
                  {product.code}
                </p>
              ) : null}
              <h1 className="font-display text-2xl leading-snug tracking-[-0.02em] text-on-surface sm:text-5xl sm:leading-[1.08] sm:tracking-[-0.03em]">
                {product.name}
              </h1>
              <div className="mt-2.5 flex flex-wrap items-end gap-2 sm:mt-4 sm:gap-3">
                <p className="text-xl font-semibold text-primary sm:text-3xl">
                  {formatMoney(product.price)}
                </p>
                {hasDiscount ? (
                  <p className="pb-0.5 text-xs text-outline line-through sm:pb-1 sm:text-sm">
                    {formatMoney(product.listPrice)}
                  </p>
                ) : null}
              </div>
            </motion.div>

            {showColorPicker ? (
              <motion.div variants={fadeUp} className="space-y-2.5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-on-surface">Chọn màu hoa</p>
                  {selectedColor ? (
                    <p className="text-xs text-on-surface-variant">
                      Đang chọn:{' '}
                      <span className="font-medium text-on-surface">
                        {selectedColor.name || selectedColor.hex || 'Màu hoa'}
                      </span>
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2.5" role="listbox" aria-label="Màu hoa">
                  {colors.map((color) => {
                    const selected = selectedColor?.id === color.id
                    const hex = color.hex || '#C4A484'
                    const label = color.name || hex
                    return (
                      <button
                        key={color.id}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => setSelectedColorId(color.id)}
                        className={[
                          'inline-flex min-h-11 items-center gap-2.5 rounded-2xl border px-3 py-2 text-sm font-medium transition',
                          selected
                            ? 'border-primary bg-primary/10 text-primary shadow-[0_6px_16px_rgba(74,48,32,0.12)]'
                            : 'border-outline-variant/40 bg-white text-on-surface hover:border-primary/40',
                        ].join(' ')}
                        title={label}
                      >
                        <span className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center">
                          <span
                            className="h-7 w-7 rounded-full border border-black/10 shadow-sm"
                            style={{ backgroundColor: hex }}
                          />
                          {selected ? (
                            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/25">
                              <MaterialIcon name="check" className="text-sm text-white" />
                            </span>
                          ) : null}
                        </span>
                        <span>{label}</span>
                      </button>
                    )
                  })}
                </div>
                <p className="text-[11px] leading-relaxed text-outline">
                  Ảnh bên trái sẽ đổi theo màu bạn chọn. Màu đã chọn được gửi kèm khi đặt hoa.
                </p>
              </motion.div>
            ) : null}

            {product.description ? (
              <motion.div
                variants={fadeUp}
                className="glass-card rounded-2xl p-3.5 sm:rounded-[1.75rem] sm:p-6"
              >
                <p className="label-caps text-[10px] text-primary sm:text-xs">Mô tả</p>
                <RichTextContent
                  className="mt-2 text-sm leading-relaxed sm:mt-3 sm:text-[0.95rem]"
                  html={product.description}
                />
              </motion.div>
            ) : null}

            {/* Desktop CTAs */}
            <motion.div variants={fadeUp} className="hidden flex-col gap-3 sm:flex sm:flex-row">
              <motion.button
                type="button"
                onClick={() => setOrderSheetOpen(true)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary flex-1 py-4"
              >
                <MaterialIcon name="chat_bubble" className="text-lg" />
                Đặt bó hoa này
              </motion.button>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Link to="/shop" className="btn-glass flex h-full w-full py-4">
                  Xem thêm mẫu khác
                </Link>
              </motion.div>
            </motion.div>
            <motion.p
              variants={fadeUp}
              className="hidden text-xs leading-relaxed text-outline sm:block"
            >
              Inbox Facebook Messenger để chốt màu, lời thiệp QR và giờ giao. Mỗi bó được làm theo
              đơn, nên số lượng có thể thay đổi theo ngày.
            </motion.p>
          </motion.div>
        </motion.div>
      </motion.div>

      {related.length ? (
        <motion.section
          className="mt-10 sm:mt-20"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.18 }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="mb-4 flex items-center justify-between gap-3 sm:mb-6 sm:items-end sm:gap-4">
            <div>
              <p className="label-caps hidden text-primary sm:block">Gợi ý thêm</p>
              <h2 className="font-display text-xl text-on-surface sm:mt-1 sm:text-3xl">
                Có thể bạn cũng thích
              </h2>
            </div>
            <Link
              to="/shop"
              className="label-caps shrink-0 text-[10px] text-primary hover:underline sm:text-xs"
            >
              Tất cả
            </Link>
          </motion.div>
          <ul className="grid grid-cols-2 gap-2.5 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <motion.li
                key={item.id}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3, ease: easeOut }}
                className="overflow-hidden rounded-xl sm:glass-card sm:rounded-none sm:group sm:hover:bg-surface-container-lowest/80"
              >
                <Link to={`/shop/product/${item.id}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-surface-container-low shadow-[0_8px_24px_rgba(74,48,32,0.07)] sm:rounded-none sm:shadow-none">
                    {item.mainImage ? (
                      <ShopImage
                        src={cloudinaryUrl(item.mainImage, { width: 800 })}
                        srcSet={cloudinarySrcSet(item.mainImage, [480, 720, 960, 1280])}
                        sizes="(min-width: 1024px) 30vw, 50vw"
                        alt={item.name}
                        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
                        loading="lazy"
                        decoding="async"
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
                          className="relative text-4xl text-white sm:text-5xl"
                        />
                      </div>
                    )}
                    {/* Mobile overlay */}
                    <div className="absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-black/70 via-black/35 to-transparent p-2.5 pt-8 sm:hidden">
                      <h3 className="font-display line-clamp-2 text-[13px] leading-tight text-white">
                        {item.name}
                      </h3>
                      <p className="mt-0.5 text-[11px] font-semibold text-white/95">
                        {formatMoney(item.price)}
                      </p>
                    </div>
                    {/* Desktop overlay — gradient như mobile */}
                    <div className="absolute inset-x-0 bottom-0 z-[2] hidden bg-gradient-to-t from-black/70 via-black/35 to-transparent p-4 pt-16 sm:block">
                      {item.code ? (
                        <p className="truncate font-mono text-[10px] font-bold tracking-wider text-white/70">
                          {item.code}
                        </p>
                      ) : null}
                      <h3 className="font-display mt-0.5 line-clamp-2 text-xl leading-tight text-white">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-white/95">
                        {formatMoney(item.price)}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.li>
            ))}
          </ul>
        </motion.section>
      ) : null}

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-outline-variant/20 bg-surface-container-lowest/95 px-4 pt-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] text-on-surface-variant">{product.name}</p>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-primary">{formatMoney(product.price)}</p>
              {selectedColor ? (
                <span className="inline-flex items-center gap-1 truncate text-[10px] text-on-surface-variant">
                  <span
                    className="inline-block h-3 w-3 rounded-full border border-black/10"
                    style={{ backgroundColor: selectedColor.hex || '#C4A484' }}
                  />
                  {selectedColor.name || selectedColor.hex}
                </span>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOrderSheetOpen(true)}
            className="btn-primary shrink-0 !px-4 !py-2.5 text-[10px]"
          >
            Đặt hoa
          </button>
        </div>
      </div>

      <MessengerOrderSheet
        open={orderSheetOpen}
        product={product}
        selectedColor={selectedColor}
        onClose={() => setOrderSheetOpen(false)}
      />
    </motion.div>
  )
}

export default ShopProductPage
