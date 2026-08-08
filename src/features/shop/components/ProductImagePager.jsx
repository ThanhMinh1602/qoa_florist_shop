import { useEffect, useRef } from 'react'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { SHOP_IMAGES } from '../../../constants/shopImagery'
import { cloudinarySrcSet, cloudinaryUrl } from '../../../utils/cloudinaryUrl'

/**
 * Gallery vuốt ngang (CSS scroll-snap).
 * Khung aspect bên ngoài + scroller absolute → tránh height 0 / màn trắng trên mobile.
 */
function ProductImagePager({ images = [], activeIndex = 0, onIndexChange, alt = '' }) {
  const scrollerRef = useRef(null)
  const skipScrollSync = useRef(false)
  const activeIndexRef = useRef(activeIndex)
  activeIndexRef.current = activeIndex

  useEffect(() => {
    const el = scrollerRef.current
    if (!el || images.length === 0) return undefined

    const width = el.clientWidth
    if (width <= 0) return undefined

    const target = activeIndex * width
    if (Math.abs(el.scrollLeft - target) < 4) return undefined

    skipScrollSync.current = true
    el.scrollTo({ left: target, behavior: 'smooth' })
    const timer = window.setTimeout(() => {
      skipScrollSync.current = false
    }, 420)
    return () => window.clearTimeout(timer)
  }, [activeIndex, images.length])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el || images.length < 2) return undefined

    let debounce = 0

    const commitIndex = () => {
      if (skipScrollSync.current) return
      const width = el.clientWidth
      if (width <= 0) return
      const next = Math.max(0, Math.min(images.length - 1, Math.round(el.scrollLeft / width)))
      if (next !== activeIndexRef.current) onIndexChange?.(next)
    }

    const onScroll = () => {
      window.clearTimeout(debounce)
      debounce = window.setTimeout(commitIndex, 60)
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    el.addEventListener('scrollend', commitIndex)
    return () => {
      window.clearTimeout(debounce)
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('scrollend', commitIndex)
    }
  }, [images.length, onIndexChange])

  if (!images.length) {
    return (
      <div className="relative aspect-[4/5] bg-surface-container-low sm:aspect-[5/6]">
        <div className="relative flex h-full items-center justify-center">
          <img
            src={SHOP_IMAGES.moodPink}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-50"
            aria-hidden="true"
            draggable={false}
          />
          <MaterialIcon name="local_florist" className="relative text-5xl text-white sm:text-6xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative aspect-[4/5] bg-surface-container-low sm:aspect-[5/6]">
      <div
        ref={scrollerRef}
        className={[
          'absolute inset-0 flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden',
          'overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          '[-webkit-overflow-scrolling:touch]',
        ].join(' ')}
      >
        {images.map((image, index) => (
          <div
            key={image.id || `${image.url}-${index}`}
            className="relative h-full w-full min-w-full shrink-0 snap-center snap-always"
          >
            <img
              src={cloudinaryUrl(image.url, { width: 1200 })}
              srcSet={cloudinarySrcSet(image.url, [640, 960, 1200, 1600])}
              sizes="(min-width: 1024px) 480px, 100vw"
              alt={index === activeIndex ? alt : ''}
              draggable={false}
              fetchPriority={index === 0 ? 'high' : 'low'}
              decoding="async"
              loading={index === 0 ? 'eager' : 'lazy'}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductImagePager
