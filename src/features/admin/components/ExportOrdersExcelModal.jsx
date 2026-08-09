import { useEffect, useMemo, useState } from 'react'
import { useScrollLock } from '../../../hooks/useScrollLock'
import MaterialIcon from '../../../components/common/MaterialIcon'
import {
  downloadAllOrdersExcel,
  downloadOrdersExcel,
  filterOrdersByMonth,
  listOrderMonths,
} from '../../../utils/exportOrdersExcel'

function ExportOrdersExcelModal({ open, orders = [], onClose }) {
  useScrollLock(open)

  const months = useMemo(() => listOrderMonths(orders), [orders])
  const now = useMemo(() => new Date(), [])
  const [mode, setMode] = useState('month') // month | all
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [error, setError] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (!open) return
    setError('')
    setMode('month')
    if (months[0]) {
      setYear(months[0].year)
      setMonth(months[0].month)
    } else {
      const today = new Date()
      setYear(today.getFullYear())
      setMonth(today.getMonth() + 1)
    }
  }, [open, months])

  const monthCount = useMemo(
    () => filterOrdersByMonth(orders, year, month).length,
    [orders, year, month],
  )
  const allCount = orders.length
  const exportCount = mode === 'all' ? allCount : monthCount

  const yearOptions = useMemo(() => {
    const set = new Set(months.map((item) => item.year))
    set.add(now.getFullYear())
    return Array.from(set).sort((a, b) => b - a)
  }, [months, now])

  if (!open) return null

  async function handleExport() {
    setError('')
    setIsExporting(true)
    try {
      const result =
        mode === 'all'
          ? downloadAllOrdersExcel({ orders })
          : downloadOrdersExcel({ orders, year, month })
      onClose?.(result)
    } catch (err) {
      setError(err.message || 'Không xuất được file.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-orders-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-xl sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 id="export-orders-title" className="text-base font-semibold text-on-surface">
              Xuất Excel đơn hàng
            </h3>
            <p className="mt-0.5 text-sm text-on-surface-variant">
              Xuất theo tháng hoặc toàn bộ dữ liệu.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-low"
            aria-label="Đóng"
          >
            <MaterialIcon name="close" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-1.5 rounded-xl bg-surface-container-low p-1">
          <button
            type="button"
            onClick={() => {
              setMode('month')
              setError('')
            }}
            className={[
              'rounded-lg px-3 py-2 text-xs font-semibold transition',
              mode === 'month'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface',
            ].join(' ')}
          >
            Theo tháng
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('all')
              setError('')
            }}
            className={[
              'rounded-lg px-3 py-2 text-xs font-semibold transition',
              mode === 'all'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface',
            ].join(' ')}
          >
            Toàn bộ
          </button>
        </div>

        {mode === 'month' ? (
          <>
            {months.length > 0 ? (
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-on-surface-variant">Tháng có đơn</p>
                <div className="flex flex-wrap gap-1.5">
                  {months.map((item) => {
                    const active = item.year === year && item.month === month
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          setYear(item.year)
                          setMonth(item.month)
                          setError('')
                        }}
                        className={[
                          'rounded-lg px-2.5 py-1.5 text-xs font-medium transition',
                          active
                            ? 'bg-primary text-white'
                            : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high',
                        ].join(' ')}
                      >
                        {item.label}
                        <span className="ml-1 opacity-80">({item.count})</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="block text-xs font-medium text-on-surface-variant">
                Tháng
                <select
                  value={month}
                  onChange={(event) => {
                    setMonth(Number(event.target.value))
                    setError('')
                  }}
                  className="mt-1 w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 py-2.5 text-sm text-on-surface outline-none ring-primary/20 focus:ring-2"
                >
                  {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
                    <option key={value} value={value}>
                      Tháng {value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-medium text-on-surface-variant">
                Năm
                <select
                  value={year}
                  onChange={(event) => {
                    setYear(Number(event.target.value))
                    setError('')
                  }}
                  className="mt-1 w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 py-2.5 text-sm text-on-surface outline-none ring-primary/20 focus:ring-2"
                >
                  {yearOptions.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <p className="mt-3 text-sm text-on-surface-variant">
              Sẽ xuất{' '}
              <span className="font-semibold text-on-surface">{monthCount}</span> đơn · Tháng {month}/
              {year}
            </p>
          </>
        ) : (
          <div className="mt-4 rounded-xl border border-outline-variant/25 bg-surface-container-low/60 px-3 py-3">
            <p className="text-sm text-on-surface">
              Xuất{' '}
              <span className="font-semibold">{allCount}</span> đơn toàn hệ thống
            </p>
            <p className="mt-1 text-xs text-on-surface-variant">
              File gồm tab <strong className="font-medium text-on-surface">Tất cả</strong>
              {months.length > 0
                ? ` + ${months.length} tab theo tháng`
                : ''}
              .
            </p>
          </div>
        )}

        {error ? (
          <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-outline-variant/40 px-4 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={isExporting || exportCount === 0}
            onClick={() => void handleExport()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-container disabled:opacity-50"
          >
            <MaterialIcon name="download" className="text-lg" />
            {isExporting
              ? 'Đang xuất…'
              : mode === 'all'
                ? `Tải toàn bộ (${allCount})`
                : 'Tải Excel'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExportOrdersExcelModal
