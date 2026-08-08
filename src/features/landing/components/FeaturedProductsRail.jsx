import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'
import ShopImage from '../../../components/common/ShopImage'
import { SHOP_IMAGES } from '../../../constants/shopImagery'
import { cloudinarySrcSet, cloudinaryUrl } from '../../../utils/cloudinaryUrl'
import { formatMoney } from '../../../utils/money'

function ProductCard({ product, onClickCapture }) {
  return (
    <Link
      to={`/shop/product/${product.id}`}
      className="block w-[11.5rem] shrink-0 overflow-hidden rounded-[1.25rem] bg-transparent sm:w-[15.5rem] sm:rounded-[1.5rem] lg:w-[17rem]"
      onClickCapture={onClickCapture}
      draggable={false}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-transparent">
        {product.mainImage ? (
          <ShopImage
            src={cloudinaryUrl(product.mainImage, { width: 800 })}
            srcSet={cloudinarySrcSet(product.mainImage, [400, 640, 800, 1024, 1280])}
            sizes="(min-width: 1024px) 272px, (min-width: 640px) 248px, 184px"
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover transition duration-700 hover:scale-[1.04]"
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        ) : (
          <div className="relative flex h-full items-center justify-center bg-surface-variant/40">
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
        <div className="absolute inset-x-2 bottom-2 z-[2] rounded-xl border border-white/35 bg-white/12 p-2 backdrop-blur-md sm:inset-x-3 sm:bottom-3 sm:rounded-2xl sm:p-3">
          {product.code ? (
            <p className="font-mono text-[8px] font-bold tracking-wider text-white/70 sm:text-[10px]">
              {product.code}
            </p>
          ) : null}
          <h3 className="font-display mt-0.5 line-clamp-2 text-[13px] leading-tight text-white sm:text-lg lg:text-xl">
            {product.name}
          </h3>
          <p className="mt-0.5 text-[11px] font-semibold text-white/90 sm:mt-1 sm:text-sm">
            {formatMoney(product.price)}
          </p>
        </div>
      </div>
    </Link>
  )
}

/**
 * Hàng bán chạy — marquee bằng transform (GPU), không đụng scrollLeft
 * để tránh giật khi vuốt trang trên mobile/web.
 */
function FeaturedProductsRail({ products = [] }) {
  const viewportRef = useRef(null)
  const trackRef = useRef(null)
  const offsetRef = useRef(0)
  const halfWidthRef = useRef(0)
  const pausedRef = useRef(false)
  const pageScrollingRef = useRef(false)
  const inViewRef = useRef(true)
  const draggingRef = useRef(false)
  const didDragRef = useRef(false)
  const dragStartX = useRef(0)
  const dragStartOffset = useRef(0)
  const resumeTimerRef = useRef(0)
  const [isPaused, setIsPaused] = useState(false) 

  const loopItems = products.length > 1 ? [...products, ...products] : products
  const canMarquee = products.length > 1

  useEffect(() => {
    pausedRef.current = isPaused
  }, [isPaused])

  useEffect(() => {
    const track = trackRef.current
    const viewport = viewportRef.current
    if (!track || !viewport || !canMarquee) return undefined

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return undefined

    function measure() {
      // Một nửa track = 1 vòng sản phẩm (đã nhân đôi)
      halfWidthRef.current = track.scrollWidth / 2
    }

    measure()
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(track)

    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry?.isIntersecting ?? false
      },
      { root: null, threshold: 0.05, rootMargin: '40px 0px' },
    )
    io.observe(viewport)

    let frameId = 0
    let lastTs = 0
    const speed = 0.045 // px / ms — chậm, mượt hơn

    function wrapOffset() {
      const half = halfWidthRef.current
      if (half <= 0) return
      while (offsetRef.current >= half) offsetRef.current -= half
      while (offsetRef.current < 0) offsetRef.current += half
    }

    function applyTransform() {
      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`
    }

    function tick(ts) {
      if (!lastTs) lastTs = ts
      const delta = Math.min(ts - lastTs, 40)
      lastTs = ts

      const shouldRun =
        inViewRef.current &&
        !pausedRef.current &&
        !draggingRef.current &&
        !pageScrollingRef.current

      if (shouldRun) {
        offsetRef.current += speed * delta
        wrapOffset()
        applyTransform()
      }

      frameId = window.requestAnimationFrame(tick)
    }

    applyTransform()
    frameId = window.requestAnimationFrame(tick)

    // Tạm dừng marquee khi user đang vuốt/scroll trang → hết giật
    function onPageScroll() {
      pageScrollingRef.current = true
      window.clearTimeout(resumeTimerRef.current)
      resumeTimerRef.current = window.setTimeout(() => {
        pageScrollingRef.current = false
        lastTs = 0
      }, 140)
    }

    window.addEventListener('scroll', onPageScroll, { passive: true, capture: true })
    window.addEventListener('touchmove', onPageScroll, { passive: true, capture: true })

    return () => {
      window.cancelAnimationFrame(frameId)
      window.clearTimeout(resumeTimerRef.current)
      resizeObserver.disconnect()
      io.disconnect()
      window.removeEventListener('scroll', onPageScroll, { capture: true })
      window.removeEventListener('touchmove', onPageScroll, { capture: true })
    }
  }, [canMarquee, products])

  function pause() {
    setIsPaused(true)
  }

  function resume() {
    if (!draggingRef.current) setIsPaused(false)
  }

  function onPointerDown(event) {
    if (!canMarquee) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    draggingRef.current = true
    didDragRef.current = false
    pause()
    dragStartX.current = event.clientX
    dragStartOffset.current = offsetRef.current
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  function onPointerMove(event) {
    if (!draggingRef.current || !trackRef.current) return
    const dx = event.clientX - dragStartX.current
    if (Math.abs(dx) > 6) didDragRef.current = true
    offsetRef.current = dragStartOffset.current - dx
    const half = halfWidthRef.current
    if (half > 0) {
      while (offsetRef.current >= half) offsetRef.current -= half
      while (offsetRef.current < 0) offsetRef.current += half
    }
    trackRef.current.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`
  }

  function onPointerUp(event) {
    draggingRef.current = false
    event.currentTarget.releasePointerCapture?.(event.pointerId)
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
      className="relative bg-transparent"
      onMouseEnter={canMarquee ? pause : undefined}
      onMouseLeave={canMarquee ? resume : undefined}
      onFocusCapture={canMarquee ? pause : undefined}
      onBlurCapture={
        canMarquee
          ? (event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) resume()
            }
          : undefined
      }
    >
      <div
        ref={viewportRef}
        className="overflow-hidden touch-pan-y bg-transparent"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="list"
        aria-label="Sản phẩm bán chạy"
      >
        <div
          ref={trackRef}
          className="flex w-max gap-3 bg-transparent sm:gap-5"
          style={{
            transform: 'translate3d(0, 0, 0)',
            backgroundColor: 'transparent',
          }}
        >
          {loopItems.map((product, index) => (
            <div
              key={`${product.id}-${index}`}
              role="listitem"
              className="shrink-0 bg-transparent"
            >
              <ProductCard product={product} onClickCapture={blockClickIfDragged} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FeaturedProductsRail
