import { useEffect } from 'react'

let lockCount = 0
let snapshot = null

/**
 * Khóa cuộn nền đơn giản (kiểu web thông thường).
 * Không theo dõi visualViewport / không chặn touchmove — tránh giật khi bàn phím mở.
 * Vùng form tự cuộn với overflow-y-auto + data-scroll-lock-scrollable.
 */
function applyLock() {
  if (lockCount > 0) {
    lockCount += 1
    return
  }

  const scrollY = window.scrollY || window.pageYOffset || 0
  snapshot = {
    htmlOverflow: document.documentElement.style.overflow,
    bodyOverflow: document.body.style.overflow,
    bodyPosition: document.body.style.position,
    bodyTop: document.body.style.top,
    bodyWidth: document.body.style.width,
    scrollY,
  }

  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollY}px`
  document.body.style.width = '100%'

  lockCount = 1
}

function releaseLock() {
  if (lockCount === 0) return
  lockCount -= 1
  if (lockCount > 0 || !snapshot) return

  document.documentElement.style.overflow = snapshot.htmlOverflow
  document.body.style.overflow = snapshot.bodyOverflow
  document.body.style.position = snapshot.bodyPosition
  document.body.style.top = snapshot.bodyTop
  document.body.style.width = snapshot.bodyWidth
  window.scrollTo(0, snapshot.scrollY)
  snapshot = null
}

export function useScrollLock(locked = false) {
  useEffect(() => {
    if (!locked) return undefined
    applyLock()
    return () => releaseLock()
  }, [locked])
}
