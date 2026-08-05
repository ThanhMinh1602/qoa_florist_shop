import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'
import MarkdownContent from '../../../components/common/MarkdownContent'
import { SHOP_IMAGES } from '../../../constants/shopImagery'
import { useCatalog, useCatalogProduct } from '../../../hooks/swr'
import { formatMoney } from '../../../utils/money'

const easeOut = [0.22, 1, 0.36, 1]

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeOut } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
}

function splitMaterials(value) {
  return String(value || '')
    .split(/[,;•|/\n]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function ShopProductPage() {
  const { id } = useParams()
  const { product, isLoading, error } = useCatalogProduct(id)
  const [activeIndex, setActiveIndex] = useState(0)

  const images = useMemo(() => {
    if (!product) return []
    if (product.images?.length) return product.images
    if (product.mainImage) return [{ id: 'main', url: product.mainImage }]
    return []
  }, [product])

  useEffect(() => {
    setActiveIndex(0)
  }, [product?.id])

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
      if (event.key === 'ArrowRight') setActiveIndex((current) => (current + 1) % images.length)
      if (event.key === 'ArrowLeft') {
        setActiveIndex((current) => (current - 1 + images.length) % images.length)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [images.length])

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
  const activeImage = images[activeIndex]?.url || ''
  const materials = splitMaterials(product?.materials)
  const hasDiscount =
    product && Number(product.listPrice) > 0 && Number(product.listPrice) > Number(product.price)
  const orderMail = product
    ? `mailto:hello@qoaflorist.com?subject=${encodeURIComponent(`Đặt hoa: ${product.name}`)}&body=${encodeURIComponent(
        `Mình muốn đặt bó hoa:\n- Tên: ${product.name}\n- Mã: ${product.code}\n- Giá: ${formatMoney(product.price)}\n\nGhi chú thêm: `,
      )}`
    : ''

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-16">
        <div className="h-4 w-28 animate-pulse rounded-full bg-surface-container-high" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
          <div className="aspect-[4/5] animate-pulse rounded-[2rem] bg-surface-container-high" />
          <div className="space-y-4">
            <div className="h-3 w-24 animate-pulse rounded-full bg-surface-container-high" />
            <div className="h-10 w-3/4 animate-pulse rounded-2xl bg-surface-container-high" />
            <div className="h-8 w-40 animate-pulse rounded-xl bg-surface-container-high" />
            <div className="h-40 animate-pulse rounded-3xl bg-surface-container-high" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
        <div className="glass-card rounded-[2rem] px-6 py-12">
          <MaterialIcon name="local_florist" className="text-4xl text-primary-fixed-dim" />
          <p className="mt-4 text-lg font-semibold text-on-surface">Không tìm thấy sản phẩm</p>
          <p className="mt-2 text-sm text-on-surface-variant">
            {error?.message || 'Bó hoa này có thể đã được ẩn hoặc đổi mã.'}
          </p>
          <Link to="/shop" className="btn-primary mt-6">
            Về danh sách sản phẩm
          </Link>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      key={product.id}
      className="mx-auto max-w-7xl px-5 pb-20 pt-4 sm:px-8 sm:pt-6 lg:px-16"
      initial="hidden"
      animate="show"
      variants={stagger}
    >
      <motion.nav
        variants={fadeUp}
        className="mb-6 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant"
      >
        <Link to="/shop" className="inline-flex items-center gap-1 transition hover:text-primary">
          <MaterialIcon name="arrow_back" className="text-base" />
          Sản phẩm
        </Link>
        <span className="text-outline/50">/</span>
        <span className="line-clamp-1 text-on-surface">{product.name}</span>
      </motion.nav>

      <motion.div
        variants={stagger}
        className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-14"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { duration: 0.55, ease: easeOut } },
          }}
          className="space-y-3 lg:sticky lg:top-28"
        >
          <div className="group relative overflow-hidden rounded-[2rem] border border-white/60 bg-surface-container-low shadow-[0_24px_60px_rgba(74,48,32,0.12)]">
            <div className="relative aspect-[4/5] sm:aspect-[5/6]">
              <AnimatePresence mode="wait">
                {activeImage ? (
                  <motion.img
                    key={activeImage}
                    src={activeImage}
                    alt={product.name}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.45, ease: easeOut }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="relative flex h-full items-center justify-center">
                    <img
                      src={SHOP_IMAGES.moodPink}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover opacity-50"
                      aria-hidden="true"
                    />
                    <MaterialIcon name="local_florist" className="relative text-6xl text-white" />
                  </div>
                )}
              </AnimatePresence>
            </div>

            {images.length > 1 ? (
              <>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() =>
                    setActiveIndex((current) => (current - 1 + images.length) % images.length)
                  }
                  className="absolute top-1/2 left-3 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/70 text-primary shadow-sm backdrop-blur-md hover:bg-white sm:left-4"
                  aria-label="Ảnh trước"
                >
                  <MaterialIcon name="chevron_left" className="text-2xl" />
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setActiveIndex((current) => (current + 1) % images.length)}
                  className="absolute top-1/2 right-3 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/70 text-primary shadow-sm backdrop-blur-md hover:bg-white sm:right-4"
                  aria-label="Ảnh sau"
                >
                  <MaterialIcon name="chevron_right" className="text-2xl" />
                </motion.button>
                <span className="absolute right-4 bottom-4 rounded-full bg-on-surface/70 px-3 py-1 text-[11px] font-semibold tracking-wide text-white backdrop-blur-md">
                  {activeIndex + 1} / {images.length}
                </span>
              </>
            ) : null}
          </div>

          {images.length > 1 ? (
            <ul className="flex gap-2.5 overflow-x-auto pb-1">
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
                        'h-20 w-16 overflow-hidden rounded-2xl border-2 sm:h-24 sm:w-20',
                        selected
                          ? 'border-primary shadow-[0_8px_20px_rgba(74,48,32,0.16)]'
                          : 'border-transparent',
                      ].join(' ')}
                    >
                      <img src={image.url} alt="" className="h-full w-full object-cover" />
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
            className="pointer-events-none absolute -top-10 -right-8 h-48 w-48 rounded-full bg-primary/8 blur-3xl"
            animate={{ scale: [1, 1.12, 1], opacity: [0.55, 0.9, 0.55] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.div variants={stagger} initial="hidden" animate="show" className="relative space-y-6">
            <motion.div variants={fadeUp}>
              <h1 className="font-display text-4xl leading-[1.08] tracking-[-0.03em] text-on-surface sm:text-5xl">
                {product.name}
              </h1>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <p className="text-3xl font-semibold text-primary">{formatMoney(product.price)}</p>
                {hasDiscount ? (
                  <p className="pb-1 text-sm text-outline line-through">
                    {formatMoney(product.listPrice)}
                  </p>
                ) : null}
              </div>
            </motion.div>

            {product.description ? (
              <motion.div variants={fadeUp} className="glass-card rounded-[1.75rem] p-5 sm:p-6">
                <p className="label-caps text-primary">Mô tả</p>
                <MarkdownContent className="mt-3 text-[0.95rem] leading-relaxed">
                  {product.description}
                </MarkdownContent>
              </motion.div>
            ) : null}

            {materials.length ? (
              <motion.div variants={fadeUp}>
                <p className="label-caps text-primary">Nguyên liệu</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {materials.map((item, index) => (
                    <motion.span
                      key={item}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 + index * 0.05, duration: 0.35, ease: easeOut }}
                      className="rounded-full border border-outline-variant/40 bg-surface-container-lowest/80 px-3 py-1.5 text-sm text-on-surface"
                    >
                      {item}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            ) : null}

            <motion.div variants={fadeUp} className="flex flex-col gap-3 sm:flex-row">
              <motion.a
                href={orderMail}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary flex-1 py-4"
              >
                <MaterialIcon name="chat_bubble" className="text-lg" />
                Đặt bó hoa này
              </motion.a>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Link to="/shop" className="btn-glass flex h-full w-full py-4">
                  Xem thêm mẫu khác
                </Link>
              </motion.div>
            </motion.div>
            <motion.p variants={fadeUp} className="text-xs leading-relaxed text-outline">
              Inbox hoặc gửi email để chốt màu, lời thiệp QR và giờ giao. Mỗi bó được làm theo đơn,
              nên số lượng có thể thay đổi theo ngày.
            </motion.p>
          </motion.div>
        </motion.div>
      </motion.div>

      {related.length ? (
        <motion.section
          className="mt-16 sm:mt-20"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.18 }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="label-caps text-primary">Gợi ý thêm</p>
              <h2 className="font-display mt-1 text-2xl text-on-surface sm:text-3xl">
                Có thể bạn cũng thích
              </h2>
            </div>
            <Link to="/shop" className="label-caps shrink-0 text-primary hover:underline">
              Tất cả
            </Link>
          </motion.div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <motion.li
                key={item.id}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3, ease: easeOut }}
                className="glass-card group overflow-hidden hover:bg-surface-container-lowest/80"
              >
                <Link to={`/shop/product/${item.id}`} className="block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-surface-container-low">
                    {item.mainImage ? (
                      <img
                        src={item.mainImage}
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
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
                        {item.code}
                      </p>
                      <h3 className="font-display mt-0.5 line-clamp-2 text-xl leading-tight text-on-surface">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-primary">
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
    </motion.div>
  )
}

export default ShopProductPage
