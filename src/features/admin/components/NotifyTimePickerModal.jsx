import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { useScrollLock } from '../../../hooks/useScrollLock'
import { modalEnter, overlayFade } from '../../../lib/motion'

const PERIODS = [
  {
    id: 'morning',
    label: 'Buổi sáng',
    shortLabel: 'Sáng',
    hint: '05:00 – 11:59',
    icon: 'wb_sunny',
    startHour: 5,
    endHour: 11,
    accent: 'bg-amber-50 text-amber-800 ring-amber-200/80',
    active: 'bg-amber-500 text-white ring-amber-500 shadow-amber-500/25',
    iconIdle: 'text-amber-600',
  },
  {
    id: 'afternoon',
    label: 'Buổi chiều',
    shortLabel: 'Chiều',
    hint: '12:00 – 17:59',
    icon: 'wb_twilight',
    startHour: 12,
    endHour: 17,
    accent: 'bg-orange-50 text-orange-800 ring-orange-200/80',
    active: 'bg-orange-500 text-white ring-orange-500 shadow-orange-500/25',
    iconIdle: 'text-orange-600',
  },
  {
    id: 'evening',
    label: 'Buổi tối',
    shortLabel: 'Tối',
    hint: '18:00 – 22:59',
    icon: 'nights_stay',
    startHour: 18,
    endHour: 22,
    accent: 'bg-indigo-50 text-indigo-800 ring-indigo-200/80',
    active: 'bg-indigo-500 text-white ring-indigo-500 shadow-indigo-500/25',
    iconIdle: 'text-indigo-600',
  },
]

const MINUTES = ['00', '15', '30', '45']

function parseTime(value) {
  const match = String(value || '').match(/^([01]?\d|2[0-3]):([0-5]\d)$/)
  if (!match) return { hour: 8, minute: '00' }
  return {
    hour: Number(match[1]),
    minute: String(Number(match[2])).padStart(2, '0'),
  }
}

function periodIdForHour(hour) {
  if (hour >= 5 && hour <= 11) return 'morning'
  if (hour >= 12 && hour <= 17) return 'afternoon'
  if (hour >= 18 && hour <= 22) return 'evening'
  if (hour < 5) return 'morning'
  return 'evening'
}

function formatTime(hour, minute) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function normalizeCompare(value) {
  const parsed = parseTime(value)
  return formatTime(parsed.hour, parsed.minute)
}

export function periodMetaForTime(time) {
  const { hour } = parseTime(time)
  return PERIODS.find((item) => item.id === periodIdForHour(hour)) || PERIODS[0]
}

/**
 * Modal chọn khung giờ nhắc — Sáng / Chiều / Tối.
 */
function NotifyTimePickerModal({
  open,
  mode = 'add',
  initialTime = '08:00',
  existingTimes = [],
  onClose,
  onConfirm,
}) {
  useScrollLock(open)

  const seed = parseTime(initialTime)
  const [periodId, setPeriodId] = useState(() => periodIdForHour(seed.hour))
  const [hour, setHour] = useState(seed.hour)
  const [minute, setMinute] = useState(MINUTES.includes(seed.minute) ? seed.minute : '00')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    const parsed = parseTime(initialTime)
    setPeriodId(periodIdForHour(parsed.hour))
    setHour(parsed.hour)
    setMinute(MINUTES.includes(parsed.minute) ? parsed.minute : '00')
    setError('')
  }, [open, initialTime])

  const period = PERIODS.find((item) => item.id === periodId) || PERIODS[0]

  const hours = useMemo(() => {
    const list = []
    for (let h = period.startHour; h <= period.endHour; h += 1) list.push(h)
    return list
  }, [period.endHour, period.startHour])

  useEffect(() => {
    if (!hours.includes(hour)) setHour(hours[0] ?? period.startHour)
  }, [hour, hours, period.startHour])

  const preview = formatTime(hour, minute)
  const isEdit = mode === 'edit'

  function handleConfirm() {
    const next = formatTime(hour, minute)
    const editingSame = isEdit && next === normalizeCompare(initialTime)
    const duplicate = existingTimes.some((time) => time === next)
    if (duplicate && !editingSame) {
      setError('Khung giờ này đã có trong danh sách.')
      return
    }
    onConfirm?.(next)
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[110] flex items-end justify-center p-0 sm:items-center sm:p-4"
          {...overlayFade}
        >
          <button
            type="button"
            className="absolute inset-0 bg-on-surface/45 backdrop-blur-[2px]"
            aria-label="Đóng"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="notify-time-modal-title"
            className="relative z-10 flex max-h-[min(92dvh,40rem)] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
            {...modalEnter}
          >
            <div className="shrink-0 border-b border-outline-variant/15 px-5 pb-4 pt-4 sm:px-6 sm:pt-5">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-outline-variant/40 sm:hidden" />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-outline">
                    {isEdit ? 'Chỉnh sửa' : 'Thêm mới'}
                  </p>
                  <h3
                    id="notify-time-modal-title"
                    className="mt-0.5 font-display text-xl text-primary"
                  >
                    Chọn giờ nhắc
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant transition hover:bg-surface-container"
                  aria-label="Đóng"
                >
                  <MaterialIcon name="close" className="text-xl" />
                </button>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-primary/8 via-amber-50/80 to-orange-50/60 px-4 py-4">
                <MaterialIcon name={period.icon} className={`text-2xl ${period.iconIdle}`} />
                <p className="font-display text-4xl tracking-tight text-primary tabular-nums">
                  {preview}
                </p>
                <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium text-on-surface-variant">
                  {period.label}
                </span>
              </div>
            </div>

            <div
              data-scroll-lock-scrollable
              className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6"
            >
              <div>
                <p className="mb-2 text-xs font-semibold text-on-surface-variant">Buổi trong ngày</p>
                <div className="grid grid-cols-3 gap-2">
                  {PERIODS.map((item) => {
                    const active = item.id === periodId
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPeriodId(item.id)}
                        className={[
                          'flex flex-col items-center gap-1 rounded-2xl px-2 py-3 text-center ring-1 transition',
                          active
                            ? `${item.active} shadow-lg`
                            : `${item.accent} hover:brightness-[0.98]`,
                        ].join(' ')}
                      >
                        <MaterialIcon
                          name={item.icon}
                          className={['text-xl', active ? 'text-white' : item.iconIdle].join(' ')}
                        />
                        <span className="text-xs font-semibold">{item.shortLabel}</span>
                        <span
                          className={['text-[10px]', active ? 'text-white/80' : 'opacity-70'].join(
                            ' ',
                          )}
                        >
                          {item.hint}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-on-surface-variant">Giờ</p>
                <div className="flex flex-wrap gap-2">
                  {hours.map((h) => {
                    const active = h === hour
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => {
                          setHour(h)
                          setError('')
                        }}
                        className={[
                          'h-10 min-w-[2.75rem] rounded-xl px-2 text-sm font-semibold tabular-nums transition',
                          active
                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                            : 'bg-surface-container-low text-on-surface hover:bg-surface-container',
                        ].join(' ')}
                      >
                        {String(h).padStart(2, '0')}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-on-surface-variant">Phút</p>
                <div className="grid grid-cols-4 gap-2">
                  {MINUTES.map((m) => {
                    const active = m === minute
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setMinute(m)
                          setError('')
                        }}
                        className={[
                          'h-11 rounded-xl text-sm font-semibold tabular-nums transition',
                          active
                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                            : 'bg-surface-container-low text-on-surface hover:bg-surface-container',
                        ].join(' ')}
                      >
                        :{m}
                      </button>
                    )
                  })}
                </div>
              </div>

              {error ? (
                <p className="rounded-xl bg-error-container/50 px-3 py-2 text-xs text-error" role="alert">
                  {error}
                </p>
              ) : null}
            </div>

            <div className="shrink-0 border-t border-outline-variant/15 bg-white px-5 py-4 sm:px-6">
              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="btn-glass flex-1 !py-3 text-sm">
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="btn-primary flex-[1.4] !py-3 text-sm"
                >
                  {isEdit ? 'Cập nhật giờ' : 'Thêm giờ nhắc'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export default NotifyTimePickerModal
