import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import lottie from 'lottie-web'
import loadingAnimation from '../../assets/lottie/loading.json'
import { overlayFade, sheetEnter } from '../../lib/motion'

function LoadingOverlay({ open, message = 'Đang xử lý...' }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open || !containerRef.current) return undefined

    const animationData = loadingAnimation?.default ?? loadingAnimation
    const animation = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData,
    })

    return () => {
      animation.destroy()
    }
  }, [open])

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-on-surface/45 p-4"
          role="status"
          aria-live="polite"
          aria-busy="true"
          {...overlayFade}
        >
          <motion.div
            className="flex w-full max-w-[220px] flex-col items-center rounded-3xl bg-surface-container-lowest px-6 py-7 shadow-2xl"
            {...sheetEnter}
          >
            <div ref={containerRef} className="h-36 w-36" />
            <p className="mt-1 text-center text-sm font-medium text-on-surface">{message}</p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export default LoadingOverlay
