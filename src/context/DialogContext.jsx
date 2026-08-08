import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import MaterialIcon from '../components/common/MaterialIcon'
import { useScrollLock } from '../hooks/useScrollLock'
import { overlayFade, modalEnter } from '../lib/motion'

const DialogContext = createContext(null)

const VARIANT_META = {
  info: {
    icon: 'info',
    iconClass: 'text-sky-600',
    iconWrap: 'bg-primary-container/15',
    confirmClass: 'bg-primary hover:bg-primary-container text-white',
  },
  success: {
    icon: 'check_circle',
    iconClass: 'text-emerald-600',
    iconWrap: 'bg-emerald-50',
    confirmClass: 'bg-emerald-500 hover:bg-emerald-600 text-white',
  },
  error: {
    icon: 'error',
    iconClass: 'text-red-600',
    iconWrap: 'bg-red-50',
    confirmClass: 'bg-primary hover:bg-primary-container text-white',
  },
  danger: {
    icon: 'warning',
    iconClass: 'text-amber-600',
    iconWrap: 'bg-amber-50',
    confirmClass: 'bg-red-500 hover:bg-red-600 text-white',
  },
}

function AppDialog({ dialog, onResolve }) {
  const meta = VARIANT_META[dialog?.variant] || VARIANT_META.info
  const isConfirm = dialog?.mode === 'confirm'
  useScrollLock(Boolean(dialog))

  return (
    <AnimatePresence>
      {dialog ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          {...overlayFade}
        >
          <button
            type="button"
            className="absolute inset-0 bg-on-surface/50"
            aria-label="Đóng"
            onClick={() => onResolve(false)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-dialog-title"
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-surface-container-lowest shadow-2xl"
            {...modalEnter}
          >
            <div
              data-scroll-lock-scrollable
              className="max-h-[min(80dvh,var(--app-vvh,80dvh))] overflow-y-auto overscroll-contain p-5 sm:p-6"
            >
              <div className="flex gap-3">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${meta.iconWrap}`}
                >
                  <MaterialIcon name={meta.icon} className={`text-[1.5rem] ${meta.iconClass}`} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 id="app-dialog-title" className="text-lg font-semibold text-on-surface">
                    {dialog.title}
                  </h3>
                  {dialog.message ? (
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-on-surface-variant">
                      {dialog.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                {isConfirm ? (
                  <button
                    type="button"
                    onClick={() => onResolve(false)}
                    className="rounded-xl border border-outline-variant/25 px-4 py-2.5 text-sm font-medium text-on-surface-variant transition hover:bg-surface-container-low"
                  >
                    {dialog.cancelLabel || 'Hủy'}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => onResolve(true)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${meta.confirmClass}`}
                >
                  {dialog.confirmLabel || (isConfirm ? 'Xác nhận' : 'Đã hiểu')}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState(null)
  const resolverRef = useRef(null)

  const closeWith = useCallback((value) => {
    resolverRef.current?.(value)
    resolverRef.current = null
    setDialog(null)
  }, [])

  const openDialog = useCallback((config) => {
    return new Promise((resolve) => {
      resolverRef.current?.(false)
      resolverRef.current = resolve
      setDialog(config)
    })
  }, [])

  const alert = useCallback(
    ({ title = 'Thông báo', message = '', variant = 'info', confirmLabel } = {}) =>
      openDialog({
        mode: 'alert',
        title,
        message,
        variant,
        confirmLabel,
      }).then(() => undefined),
    [openDialog],
  )

  const confirm = useCallback(
    ({
      title = 'Xác nhận',
      message = '',
      variant = 'danger',
      confirmLabel = 'Xác nhận',
      cancelLabel = 'Hủy',
    } = {}) =>
      openDialog({
        mode: 'confirm',
        title,
        message,
        variant,
        confirmLabel,
        cancelLabel,
      }),
    [openDialog],
  )

  const value = useMemo(() => ({ alert, confirm }), [alert, confirm])

  return (
    <DialogContext.Provider value={value}>
      {children}
      <AppDialog dialog={dialog} onResolve={closeWith} />
    </DialogContext.Provider>
  )
}

export function useDialog() {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error('useDialog must be used within DialogProvider')
  }
  return context
}
