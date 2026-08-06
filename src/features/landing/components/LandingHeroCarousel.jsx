import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { fadeUp, stagger } from '../../../lib/motion'

/**
 * Hero carousel — dùng chung Landing + preview admin.
 * @param {{ images: { id?: string, url: string }[], autoPlayMs?: number, preview?: boolean, onExplore?: () => void, onCustom?: () => void }} props
 */
function LandingHeroCarousel({
  images = [],
  autoPlayMs = 5000,
  preview = false,
  onExplore,
  onCustom,
}) {
  const slides = images.filter((item) => item?.url)
  const [index, setIndex] = useState(0)
  const pauseUntilRef = useRef(0)
  const count = slides.length

  const go = useCallback(
    (direction) => {
      if (count < 2) return
      pauseUntilRef.current = Date.now() + Math.max(autoPlayMs, 4000)
      setIndex((current) => (current + direction + count) % count)
    },
    [autoPlayMs, count],
  )

  useEffect(() => {
    setIndex(0)
  }, [count])

  useEffect(() => {
    if (count < 2) return undefined
    const timer = window.setInterval(() => {
      if (Date.now() < pauseUntilRef.current) return
      setIndex((current) => (current + 1) % count)
    }, autoPlayMs)
    return () => window.clearInterval(timer)
  }, [autoPlayMs, count])

  const hasSlides = count > 0
  const sizeClass = preview
    ? 'min-h-[320px] w-full sm:min-h-[380px] rounded-2xl'
    : 'h-[33.333dvh] min-h-[220px] w-full md:h-dvh md:min-h-dvh'

  return (
    <section
      className={[
        'relative z-10 flex flex-col items-center justify-center overflow-hidden px-4 text-center sm:px-8 lg:px-16',
        sizeClass,
      ].join(' ')}
    >
      {hasSlides ? (
        <>
          {slides.map((slide, slideIndex) => (
            <img
              key={slide.id || slide.url}
              src={slide.url}
              alt=""
              className={[
                'absolute inset-0 h-full w-full object-cover transition-opacity duration-700',
                slideIndex === index ? 'opacity-100' : 'opacity-0',
              ].join(' ')}
              aria-hidden={slideIndex !== index}
              decoding="async"
              fetchPriority={slideIndex === 0 ? 'high' : 'low'}
            />
          ))}
          {/* Overlay nhẹ toàn ảnh + vignette đáy để chữ nổi, nền vẫn rõ */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/45"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-1/3 bottom-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent"
            aria-hidden="true"
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-surface-container-low" aria-hidden="true" />
      )}

      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute top-1/2 left-2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/25 text-white backdrop-blur-md transition hover:bg-white/40 sm:left-6 sm:h-11 sm:w-11"
            aria-label="Ảnh trước"
          >
            <MaterialIcon name="chevron_left" className="text-xl sm:text-2xl" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute top-1/2 right-2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/25 text-white backdrop-blur-md transition hover:bg-white/40 sm:right-6 sm:h-11 sm:w-11"
            aria-label="Ảnh sau"
          >
            <MaterialIcon name="chevron_right" className="text-xl sm:text-2xl" />
          </button>
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 sm:bottom-5 sm:gap-2">
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.id || `${slide.url}-dot`}
                type="button"
                aria-label={`Chuyển tới ảnh ${slideIndex + 1}`}
                onClick={() => {
                  pauseUntilRef.current = Date.now() + Math.max(autoPlayMs, 4000)
                  setIndex(slideIndex)
                }}
                className={[
                  'h-1.5 rounded-full transition-all sm:h-2',
                  slideIndex === index ? 'w-5 bg-white sm:w-6' : 'w-1.5 bg-white/50 hover:bg-white/80 sm:w-2',
                ].join(' ')}
              />
            ))}
          </div>
        </>
      ) : null}

      <motion.div
        className="relative z-10 mx-auto flex max-w-4xl flex-col items-center py-4 md:py-16"
        initial={preview ? false : 'hidden'}
        animate="show"
        variants={stagger}
      >
        <motion.h1
          variants={fadeUp}
          className={[
            'mb-2 font-display font-semibold leading-[1.08] tracking-[-0.03em] md:mb-6',
            preview ? 'text-3xl sm:text-4xl' : 'text-2xl md:text-6xl lg:text-[5.25rem]',
            hasSlides
              ? 'text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.55),0_1px_4px_rgba(0,0,0,0.45)]'
              : 'text-primary',
          ].join(' ')}
        >
          Hoa tươi chọn tay.
          <br />
          Thiệp số gắn QR.
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className={[
            'mb-3 hidden max-w-2xl text-base md:mb-10 md:block md:text-lg',
            hasSlides
              ? 'text-white/95 [text-shadow:0_1px_12px_rgba(0,0,0,0.5),0_1px_3px_rgba(0,0,0,0.4)]'
              : 'text-on-surface-variant',
          ].join(' ')}
        >
          Trải nghiệm tặng hoa hoàn toàn mới với thông điệp cá nhân hóa được mã hóa qua QR code,
          mang đến bất ngờ tinh tế cho người nhận.
        </motion.p>
        <motion.div
          variants={fadeUp}
          className="flex flex-row flex-wrap items-stretch justify-center gap-2 md:gap-4"
        >
          {preview || !onExplore ? (
            <span className="btn-primary pointer-events-none box-border h-10 min-h-10 border border-transparent !px-4 !py-0 text-[10px] shadow-lg shadow-black/25 opacity-90 md:h-12 md:min-h-12 md:!px-8 md:text-xs">
              Khám phá bộ sưu tập
            </span>
          ) : (
            <button
              type="button"
              onClick={onExplore}
              className="btn-primary box-border h-10 min-h-10 border border-transparent !px-4 !py-0 text-[10px] shadow-lg shadow-black/25 md:h-12 md:min-h-12 md:!px-8 md:text-xs"
            >
              Khám phá bộ sưu tập
            </button>
          )}
          {preview || !onCustom ? (
            <span
              className={[
                'pointer-events-none box-border inline-flex h-10 min-h-10 items-center justify-center !px-4 !py-0 text-[10px] font-bold tracking-[0.1em] uppercase opacity-90 md:h-12 md:min-h-12 md:!px-8 md:text-xs',
                hasSlides
                  ? 'rounded-[var(--radius-control)] border border-white/55 bg-white/20 text-white backdrop-blur-md'
                  : 'btn-glass',
              ].join(' ')}
            >
              Tạo thiệp lời chúc
            </span>
          ) : (
            <button
              type="button"
              onClick={onCustom}
              className={
                hasSlides
                  ? 'box-border inline-flex h-10 min-h-10 items-center justify-center rounded-[var(--radius-control)] border border-white/55 bg-white/20 !px-4 !py-0 text-[10px] font-bold tracking-[0.1em] text-white uppercase backdrop-blur-md transition hover:bg-white/30 md:h-12 md:min-h-12 md:!px-8 md:text-xs'
                  : 'btn-glass box-border h-10 min-h-10 !px-4 !py-0 text-[10px] md:h-12 md:min-h-12 md:!px-8 md:text-xs'
              }
            >
              Tạo thiệp lời chúc
            </button>
          )}
        </motion.div>
      </motion.div>
    </section>
  )
}

export default LandingHeroCarousel
