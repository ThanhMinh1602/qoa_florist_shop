import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { adminMobileSlideTransition, easeOut } from '../../../lib/motion'

/**
 * Overlay mobile dùng chung (lên đơn / sửa đơn / sản phẩm / danh mục).
 * fixed inset-0 — để trình duyệt xử lý bàn phím, không chỉnh layout bằng JS.
 */
function AdminMobileOverlayShell({
  children,
  backTo = '/admin/manage',
  enabled = true,
  onBeforeLeave,
  zIndexClass = 'z-[80]',
}) {
  const navigate = useNavigate()
  const [leaving, setLeaving] = useState(false)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (leaving) setEntered(false)
  }, [leaving])

  const finishLeave = useCallback(() => {
    onBeforeLeave?.()
    navigate(backTo)
  }, [backTo, navigate, onBeforeLeave])

  const requestClose = useCallback(() => {
    if (leaving) return
    setLeaving(true)
  }, [leaving])

  if (!enabled || typeof document === 'undefined') {
    return typeof children === 'function' ? children({ requestClose, leaving: false }) : children
  }

  const content = typeof children === 'function' ? children({ requestClose, leaving }) : children

  const body = (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">{content}</div>
  )

  // Sau animation vào: bỏ transform để cuộn/focus ổn định (giống lên đơn)
  if (entered && !leaving) {
    return createPortal(
      <div className={['fixed inset-0 overflow-hidden bg-background', zIndexClass].join(' ')}>
        {body}
      </div>,
      document.body,
    )
  }

  return createPortal(
    <motion.div
      className={['fixed inset-0 overflow-hidden bg-background', zIndexClass].join(' ')}
      initial={leaving ? false : { x: '100%' }}
      animate={{ x: leaving ? '100%' : 0 }}
      transition={leaving ? { duration: 0.26, ease: easeOut } : adminMobileSlideTransition}
      onAnimationComplete={() => {
        if (leaving) finishLeave()
        else setEntered(true)
      }}
    >
      {body}
    </motion.div>,
    document.body,
  )
}

export default AdminMobileOverlayShell
