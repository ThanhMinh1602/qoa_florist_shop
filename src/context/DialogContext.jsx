import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import MaterialIcon from '../components/common/MaterialIcon'

const DialogContext = createContext(null)

const VARIANT_META = {
  info: {
    icon: 'info',
    iconClass: 'text-sky-600',
    iconWrap: 'bg-sky-50',
    confirmClass: 'bg-rose-500 hover:bg-rose-600 text-white',
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
    confirmClass: 'bg-rose-500 hover:bg-rose-600 text-white',
  },
  danger: {
    icon: 'warning',
    iconClass: 'text-amber-600',
    iconWrap: 'bg-amber-50',
    confirmClass: 'bg-red-500 hover:bg-red-600 text-white',
  },
}

function AppDialog({ dialog, onResolve }) {
  if (!dialog) return null

  const meta = VARIANT_META[dialog.variant] || VARIANT_META.info
  const isConfirm = dialog.mode === 'confirm'

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        aria-label="Đóng"
        onClick={() => onResolve(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-dialog-title"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="p-5 sm:p-6">
          <div className="flex gap-3">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${meta.iconWrap}`}
            >
              <MaterialIcon name={meta.icon} className={`text-[1.5rem] ${meta.iconClass}`} />
            </span>
            <div className="min-w-0 flex-1">
              <h3 id="app-dialog-title" className="text-lg font-semibold text-slate-900">
                {dialog.title}
              </h3>
              {dialog.message ? (
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
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
                className="rounded-xl border border-rose-100 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
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
      </div>
    </div>
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
