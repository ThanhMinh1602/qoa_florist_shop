import { useScrollLock } from '../../../hooks/useScrollLock'
import MaterialIcon from '../../../components/common/MaterialIcon'

function ImportProgressModal({
  open,
  total,
  done,
  createdCount,
  errorCount,
  phase = 'importing',
  currentLabel = '',
}) {
  useScrollLock(open)
  if (!open) return null

  const safeTotal = Math.max(1, Number(total) || 1)
  const safeDone = Math.min(safeTotal, Math.max(0, Number(done) || 0))
  const percent = Math.round((safeDone / safeTotal) * 100)
  const isDone = phase === 'done'
  const isError = phase === 'error'

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-progress-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <div
            className={[
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
              isError ? 'bg-red-50 text-red-600' : isDone ? 'bg-emerald-50 text-emerald-700' : 'bg-primary/10 text-primary',
            ].join(' ')}
          >
            <MaterialIcon
              name={isError ? 'error' : isDone ? 'check_circle' : 'cloud_upload'}
              className={isDone || isError ? 'text-2xl' : 'animate-pulse text-2xl'}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 id="import-progress-title" className="text-base font-semibold text-on-surface">
              {isError ? 'Import gặp lỗi' : isDone ? 'Import hoàn tất' : 'Đang import đơn…'}
            </h3>
            <p className="mt-0.5 text-sm text-on-surface-variant">
              {isError
                ? currentLabel || 'Không hoàn thành được lô đơn.'
                : isDone
                  ? `Đã xử lý ${safeDone}/${safeTotal} đơn`
                  : currentLabel || `Đang gửi lên hệ thống…`}
            </p>
          </div>
          <span className="tabular-nums text-sm font-semibold text-primary">{percent}%</span>
        </div>

        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-surface-container-high">
          <div
            className={[
              'h-full rounded-full transition-[width] duration-300 ease-out',
              isError ? 'bg-red-500' : isDone ? 'bg-emerald-500' : 'bg-primary',
            ].join(' ')}
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-on-surface-variant">
          <span className="tabular-nums">
            {safeDone} / {safeTotal} đơn
          </span>
          <span>
            OK {createdCount}
            {errorCount ? ` · lỗi ${errorCount}` : ''}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ImportProgressModal
