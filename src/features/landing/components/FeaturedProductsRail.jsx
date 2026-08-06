import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { SHOP_IMAGES } from '../../../constants/shopImagery'
import { formatMoney } from '../../../utils/money'

function ProductCard({ product, onClickCapture }) {
  return (
    <Link
      to={`/shop/product/${product.id}`}
      className="glass-card block w-[11.5rem] shrink-0 overflow-hidden sm:w-[15.5rem] lg:w-[17rem]"
      onClickCapture={onClickCapture}
      draggable={false}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-container-low">
        {product.mainImage ? (
          <img
            src={product.mainImage}
            alt={product.name}
            className="h-full w-full object-cover transition duration-700 hover:scale-[1.04]"
            loading="lazy"
            draggable={false}
          />
        ) : (
          <div className="relative flex h-full items-center justify-center">
            <img
              src={SHOP_IMAGES.moodPink}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-50"
              aria-hidden="true"
              draggable={false}
            />
            <MaterialIcon name="local_florist" className="relative text-4xl text-white sm:text-5xl" />
          </div>
        )}
        <div className="absolute inset-x-2 bottom-2 rounded-xl border border-white/55 bg-surface-container-lowest/55 p-2 backdrop-blur-xl sm:inset-x-3 sm:bottom-3 sm:rounded-2xl sm:p-3">
          {product.code ? (
            <p className="font-mono text-[8px] font-bold tracking-wider text-outline sm:text-[10px]">
              {product.code}
            </p>
          ) : null}
          <h3 className="font-display mt-0.5 line-clamp-2 text-[13px] leading-tight text-on-surface sm:text-lg lg:text-xl">
            {product.name}
          </h3>
          <p className="mt-0.5 text-[11px] font-semibold text-primary sm:mt-1 sm:text-sm">
            {formatMoney(product.price)}
          </p>
        </div>
      </div>
    </Link>
  )
}

/** Hàng bán chạy: card nhỏ như cũ, cuộn ngang tự động. */
function FeaturedProductsRail({ products = [] }) {
  const trackRef = useRef(null)
  const pausedRef = useRef(false)
  const draggingRef = useRef(false)
  const didDragRef = useRef(false)
  const dragStartX = useRef(0)
  const dragStartScroll = useRef(0)
  const [isPaused, setIsPaused] = useState(false)

  const loopItems = products.length > 1 ? [...products, ...products] : products

  useEffect(() => {
    pausedRef.current = isPaused
  }, [isPaused])

  useEffect(() => {
    const el = trackRef.current
    if (!el || products.length < 2) return undefined

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return undefined

    let frameId = 0
    let lastTs = 0
    const speed = 0.08

    function tick(ts) {
      if (!lastTs) lastTs = ts
      const delta = Math.min(ts - lastTs, 32)
      lastTs = ts

      if (!pausedRef.current && !draggingRef.current) {
        el.scrollLeft += speed * delta
        const half = el.scrollWidth / 2
        if (half > 0 && el.scrollLeft >= half - 1) {
          el.scrollLeft -= half
        }
      }

      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frameId)
  }, [products])

  function pause() {
    setIsPaused(true)
  }

  function resume() {
    if (!draggingRef.current) setIsPaused(false)
  }

  function onPointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    const el = trackRef.current
    if (!el) return
    draggingRef.current = true
    didDragRef.current = false
    pause()
    dragStartX.current = event.clientX
    dragStartScroll.current = el.scrollLeft
    el.setPointerCapture?.(event.pointerId)
  }

  function onPointerMove(event) {
    if (!draggingRef.current || !trackRef.current) return
    const dx = event.clientX - dragStartX.current
    if (Math.abs(dx) > 6) didDragRef.current = true
    trackRef.current.scrollLeft = dragStartScroll.current - dx
  }

  function onPointerUp(event) {
    const el = trackRef.current
    draggingRef.current = false
    el?.releasePointerCapture?.(event.pointerId)
    resume()
  }

  function blockClickIfDragged(event) {
    if (didDragRef.current) {
      event.preventDefault()
      event.stopPropagation()
      didDragRef.current = false
    }
  }

  if (products.length === 0) return null

  return (
    <div
      className="relative"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocusCapture={pause}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) resume()
      }}
    >
      <div
        ref={trackRef}
        className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-5 [&::-webkit-scrollbar]:hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="list"
        aria-label="Sản phẩm bán chạy"
      >
        {loopItems.map((product, index) => (
          <div key={`${product.id}-${index}`} role="listitem" className="shrink-0">
            <ProductCard product={product} onClickCapture={blockClickIfDragged} />
          </div>
        ))}
      </div>

      <div
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-14 bg-gradient-to-r from-background to-transparent sm:block"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-14 bg-gradient-to-l from-background to-transparent sm:block"
        aria-hidden="true"
      />
    </div>
  )
}

export default FeaturedProductsRail
