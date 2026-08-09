import { useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useScrollLock } from '../../../hooks/useScrollLock'
import { adminMobileSlideTransition, easeOut } from '../../../lib/motion'

/**
 * Full-screen mobile overlay (giống chi tiết sản phẩm) — không hiện topbar/bottom nav.
 */
function AdminMobileOverlayShell({
  children,
  backTo = '/admin/manage',
  enabled = true,
}) {
  const navigate = useNavigate()
  const [leaving, setLeaving] = useState(false)

  useScrollLock(enabled)

  const finishLeave = useCallback(() => {
    navigate(backTo)
  }, [backTo, navigate])

  const requestClose = useCallback(() => {
    if (leaving) return
    setLeaving(true)
  }, [leaving])

  if (!enabled || typeof document === 'undefined') {
    return typeof children === 'function' ? children({ requestClose, leaving: false }) : children
  }

  const content = typeof children === 'function' ? children({ requestClose, leaving }) : children

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[80] flex h-[var(--app-vvh,100dvh)] max-h-[var(--app-vvh,100dvh)] min-h-0 flex-col overflow-hidden bg-background"
      initial={{ x: '100%' }}
      animate={{ x: leaving ? '100%' : 0 }}
      transition={leaving ? { duration: 0.26, ease: easeOut } : adminMobileSlideTransition}
      onAnimationComplete={() => {
        if (leaving) finishLeave()
      }}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{content}</div>
    </motion.div>,
    document.body,
  )
}

export default AdminMobileOverlayShell
