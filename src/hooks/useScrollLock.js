import { useEffect } from 'react'

let lockCount = 0
let snapshot = null

function isScrollableTarget(target) {
  if (!(target instanceof Element)) return false
  return Boolean(target.closest('[data-scroll-lock-scrollable]'))
}

function freezeRoots() {
  if (!snapshot) return
  for (const item of snapshot.roots) {
    if (item.el.scrollTop !== item.scrollTop) {
      item.el.scrollTop = item.scrollTop
    }
  }
  if (typeof window !== 'undefined' && window.scrollY !== 0) {
    window.scrollTo(0, 0)
  }
}

function onTouchMove(event) {
  if (isScrollableTarget(event.target)) return
  // Chặn cuộn nền khi kéo ngoài vùng sheet (đặc biệt lúc bàn phím mở)
  if (event.cancelable) event.preventDefault()
}

function onFocusIn() {
  // iOS kéo viewport khi focus input — kéo lại ngay về vị trí đã khóa
  requestAnimationFrame(() => {
    freezeRoots()
    if (snapshot?.bodyFixed) {
      document.body.style.top = `-${snapshot.scrollY}px`
    }
  })
}

function onVisualViewportChange() {
  freezeRoots()
  const height = window.visualViewport?.height || window.innerHeight
  document.documentElement.style.setProperty('--app-vvh', `${Math.round(height)}px`)
}

function applyLock() {
  if (lockCount > 0) {
    lockCount += 1
    return
  }

  const roots = Array.from(document.querySelectorAll('[data-scroll-root]'))
  const scrollY = window.scrollY || window.pageYOffset || 0

  snapshot = {
    roots: roots.map((el) => ({
      el,
      overflow: el.style.overflow,
      overscrollBehavior: el.style.overscrollBehavior,
      touchAction: el.style.touchAction,
      scrollTop: el.scrollTop,
    })),
    htmlOverflow: document.documentElement.style.overflow,
    htmlOverscroll: document.documentElement.style.overscrollBehavior,
    bodyOverflow: document.body.style.overflow,
    bodyPosition: document.body.style.position,
    bodyTop: document.body.style.top,
    bodyLeft: document.body.style.left,
    bodyRight: document.body.style.right,
    bodyWidth: document.body.style.width,
    bodyTouchAction: document.body.style.touchAction,
    scrollY,
    bodyFixed: true,
  }

  document.documentElement.style.overflow = 'hidden'
  document.documentElement.style.overscrollBehavior = 'none'
  document.body.style.overflow = 'hidden'
  document.body.style.touchAction = 'none'

  for (const item of snapshot.roots) {
    item.el.style.overflow = 'hidden'
    item.el.style.overscrollBehavior = 'none'
    item.el.style.touchAction = 'none'
  }

  // Luôn fixed body — ổn định hơn khi bàn phím mobile đẩy visual viewport
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollY}px`
  document.body.style.left = '0'
  document.body.style.right = '0'
  document.body.style.width = '100%'

  document.addEventListener('touchmove', onTouchMove, { passive: false })
  document.addEventListener('focusin', onFocusIn)
  onVisualViewportChange()
  window.visualViewport?.addEventListener('resize', onVisualViewportChange)
  window.visualViewport?.addEventListener('scroll', onVisualViewportChange)

  lockCount = 1
}

function releaseLock() {
  if (lockCount === 0) return
  lockCount -= 1
  if (lockCount > 0 || !snapshot) return

  document.removeEventListener('touchmove', onTouchMove)
  document.removeEventListener('focusin', onFocusIn)
  window.visualViewport?.removeEventListener('resize', onVisualViewportChange)
  window.visualViewport?.removeEventListener('scroll', onVisualViewportChange)

  document.documentElement.style.overflow = snapshot.htmlOverflow
  document.documentElement.style.overscrollBehavior = snapshot.htmlOverscroll
  document.body.style.overflow = snapshot.bodyOverflow
  document.body.style.position = snapshot.bodyPosition
  document.body.style.top = snapshot.bodyTop
  document.body.style.left = snapshot.bodyLeft
  document.body.style.right = snapshot.bodyRight
  document.body.style.width = snapshot.bodyWidth
  document.body.style.touchAction = snapshot.bodyTouchAction

  for (const item of snapshot.roots) {
    item.el.style.overflow = item.overflow
    item.el.style.overscrollBehavior = item.overscrollBehavior
    item.el.style.touchAction = item.touchAction
    item.el.scrollTop = item.scrollTop
  }

  window.scrollTo(0, snapshot.scrollY)
  document.documentElement.style.removeProperty('--app-vvh')
  snapshot = null
}

/**
 * Khóa cuộn trang nền khi modal / bottom sheet mở.
 * Nội dung trong dialog cần `data-scroll-lock-scrollable` để vẫn vuốt được (kể cả khi bàn phím mở).
 * Đặt `data-scroll-root` trên vùng cuộn chính (vd. admin `<main>`).
 */
export function useScrollLock(locked = false) {
  useEffect(() => {
    if (!locked) return undefined
    applyLock()
    return () => releaseLock()
  }, [locked])
}
