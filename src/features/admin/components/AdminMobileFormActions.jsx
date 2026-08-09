import { useEffect, useState } from 'react'

function isEditableTarget(target) {
  if (!(target instanceof Element)) return false
  return Boolean(
    target.closest(
      'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="file"]), textarea, select, [contenteditable="true"]',
    ),
  )
}

/**
 * Footer CTA form mobile (lên đơn / sản phẩm / danh mục).
 * Ẩn khi đang focus ô nhập; hiện lại khi ẩn bàn phím / blur.
 */
function AdminMobileFormActions({ children, className = '' }) {
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    function syncFromActive() {
      setEditing(isEditableTarget(document.activeElement))
    }

    function onFocusIn(event) {
      if (isEditableTarget(event.target)) setEditing(true)
    }

    function onFocusOut() {
      window.setTimeout(syncFromActive, 160)
    }

    syncFromActive()
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    return () => {
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
    }
  }, [])

  if (editing) return null

  return (
    <div
      className={[
        'shrink-0 border-t border-outline-variant/20 bg-surface-container-lowest pb-[max(0.5rem,env(safe-area-inset-bottom))]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}

export default AdminMobileFormActions
