import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

function AdminFloatingMenu({ open, anchorRef, onClose, className = '', children }) {
  const menuRef = useRef(null)
  const [position, setPosition] = useState(null)

  useLayoutEffect(() => {
    if (!open) return undefined

    function updatePosition() {
      const anchor = anchorRef.current?.getBoundingClientRect()
      const menu = menuRef.current
      if (!anchor || !menu) return

      const gap = 4
      const edge = 8
      const menuHeight = menu.offsetHeight
      const menuWidth = menu.offsetWidth
      const spaceBelow = window.innerHeight - anchor.bottom - edge
      const spaceAbove = anchor.top - edge
      const openAbove = spaceBelow < menuHeight + gap && spaceAbove > spaceBelow
      const desiredTop = openAbove
        ? anchor.top - menuHeight - gap
        : anchor.bottom + gap

      setPosition({
        top: Math.max(edge, Math.min(desiredTop, window.innerHeight - menuHeight - edge)),
        left: Math.max(edge, Math.min(anchor.right - menuWidth, window.innerWidth - menuWidth - edge)),
        maxHeight: window.innerHeight - edge * 2,
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, anchorRef])

  useEffect(() => {
    if (!open) return undefined

    function onPointerDown(event) {
      if (!anchorRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) {
        onClose()
      }
    }
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, anchorRef, onClose])

  if (!open) return null

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      className={`fixed z-[100] overflow-y-auto rounded-xl border border-outline-variant/25 bg-surface-container-lowest py-1 shadow-xl shadow-primary/10 ${className}`}
      style={position || { visibility: 'hidden' }}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose()
        event.stopPropagation()
      }}
    >
      {children}
    </div>,
    document.body,
  )
}

export default AdminFloatingMenu
