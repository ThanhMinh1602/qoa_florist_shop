import { useEffect, useRef } from 'react'
import lottie from 'lottie-web'
import loadingAnimation from '../../assets/lottie/loading.json'

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

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/45 p-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex w-full max-w-[220px] flex-col items-center rounded-3xl bg-white px-6 py-7 shadow-2xl">
        <div ref={containerRef} className="h-36 w-36" />
        <p className="mt-1 text-center text-sm font-medium text-slate-700">{message}</p>
      </div>
    </div>
  )
}

export default LoadingOverlay
