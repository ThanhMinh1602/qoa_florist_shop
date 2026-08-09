import { useEffect, useState } from 'react'

function readKeyboardInset() {
  const vv = window.visualViewport
  if (!vv) return 0
  // Chỉ dùng chênh lệch chiều cao — không theo offsetTop (tránh giật khi iOS pan lúc focus)
  return Math.max(0, Math.round(window.innerHeight - vv.height))
}

/**
 * Chiều cao bàn phím ước lượng. Chỉ cập nhật khi resize (mở/đóng), không listen scroll.
 */
export function useKeyboardInset() {
  const [inset, setInset] = useState(() =>
    typeof window === 'undefined' ? 0 : readKeyboardInset(),
  )

  useEffect(() => {
    const vv = window.visualViewport
    let raf = 0

    function update() {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const next = readKeyboardInset()
        setInset((prev) => (prev === next ? prev : next))
      })
    }

    update()
    vv?.addEventListener('resize', update)
    window.addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(raf)
      vv?.removeEventListener('resize', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return {
    inset,
    keyboardOpen: inset > 80,
  }
}

/** @deprecated dùng useKeyboardInset — giữ alias để không gãy import cũ */
export function useVisualViewportBox() {
  const { inset, keyboardOpen } = useKeyboardInset()
  const width = typeof window !== 'undefined' ? window.innerWidth : 0
  const height =
    typeof window !== 'undefined' ? Math.max(0, window.innerHeight - inset) : 0
  return {
    top: 0,
    left: 0,
    width,
    height,
    keyboardInset: inset,
    keyboardOpen,
  }
}
