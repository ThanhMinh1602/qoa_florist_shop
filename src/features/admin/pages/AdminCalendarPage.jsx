import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCustomRequestsApi } from '../../../api/customRequestsApi'
import { fetchGoogleCalendarStatusApi } from '../../../api/googleCalendarApi'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { formatDeliverySlotDisplay, formatViDate } from '../../../utils/dateFormat'

const WEEKDAY_LABELS = [
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
  'Chủ Nhật',
]

const MONTH_LABELS = [
  'Tháng Một',
  'Tháng Hai',
  'Tháng Ba',
  'Tháng Tư',
  'Tháng Năm',
  'Tháng Sáu',
  'Tháng Bảy',
  'Tháng Tám',
  'Tháng Chín',
  'Tháng Mười',
  'Tháng Mười Một',
  'Tháng Mười Hai',
]

/** 4 màu: sắp tới · hôm nay · quá hạn · hoàn thành */
const TONE = {
  upcoming: {
    key: 'upcoming',
    label: 'Sắp tới',
    cell: 'border-[#b7cdd8] bg-[#e8f2f6]',
    cellHover: 'hover:border-[#8fb4c6] hover:bg-[#dceaf1]',
    dayBadge: 'bg-[#3d6f84] text-white',
    chip: 'bg-[#d7e8ef] text-[#2f5a6c] ring-[#aec9d6]',
    legend: 'bg-[#e8f2f6] border-[#b7cdd8]',
  },
  today: {
    key: 'today',
    label: 'Hôm nay',
    cell: 'border-[#c4a992] bg-[#f3ebe3]',
    cellHover: 'hover:border-[#a88468] hover:bg-[#efe4d8]',
    dayBadge: 'bg-[#4a3020] text-[#faf7f2]',
    chip: 'bg-[#e8ddd2] text-[#4a3020] ring-[#cbb8a6]',
    legend: 'bg-[#f3ebe3] border-[#c4a992]',
  },
  overdue: {
    key: 'overdue',
    label: 'Quá hạn',
    cell: 'border-[#d4a39a] bg-[#f7e9e6]',
    cellHover: 'hover:border-[#c0786c] hover:bg-[#f3dfda]',
    dayBadge: 'bg-[#a35448] text-white',
    chip: 'bg-[#efd5d0] text-[#8a3f36] ring-[#d4a39a]',
    legend: 'bg-[#f7e9e6] border-[#d4a39a]',
  },
  done: {
    key: 'done',
    label: 'Hoàn thành',
    cell: 'border-[#a8c0a8] bg-[#e8f0e8]',
    cellHover: 'hover:border-[#7fa07f] hover:bg-[#dce8dc]',
    dayBadge: 'bg-[#4f6b4f] text-white',
    chip: 'bg-[#d5e4d5] text-[#3d563d] ring-[#a8c0a8]',
    legend: 'bg-[#e8f0e8] border-[#a8c0a8]',
  },
  empty: {
    key: 'empty',
    label: '',
    cell: 'border-[#e8dfd5] bg-[#fbf8f4]',
    cellHover: 'hover:border-[#cbb8a6] hover:bg-[#f7f1ea]',
    dayBadge: 'text-[#5c4a3c]',
    chip: '',
    legend: '',
  },
}

function toIsoDay(value) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    const raw = String(value).trim()
    const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
    return iso ? `${iso[1]}-${iso[2]}-${iso[3]}` : ''
  }
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function todayIso() {
  return toIsoDay(new Date())
}

function monthBounds(year, month) {
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { from, to }
}

function buildOpenUrl(calendarId) {
  return `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(calendarId)}`
}

function isOrderDelivered(order) {
  return order?.shippingStatus === 'delivered' || order?.status === 'done'
}

/** Tone từng đơn: quá hạn chỉ khi chưa giao */
function getOrderTone(order, today) {
  if (isOrderDelivered(order)) return 'done'
  const iso = toIsoDay(order.shipDate || order.deliveryDate)
  if (!iso) return 'upcoming'
  if (iso < today) return 'overdue'
  if (iso === today) return 'today'
  return 'upcoming'
}

/** Tone ô ngày — ưu tiên: quá hạn > hôm nay > sắp tới > hoàn thành */
function getDayTone(dayOrders, iso, today) {
  if (!dayOrders.length) {
    return iso === today ? 'today' : 'empty'
  }
  const tones = dayOrders.map((order) => getOrderTone(order, today))
  if (tones.includes('overdue')) return 'overdue'
  if (iso === today) return 'today'
  if (tones.includes('upcoming') || tones.includes('today')) return 'upcoming'
  return 'done'
}

function buildMonthCells(year, month) {
  const first = new Date(year, month - 1, 1)
  const daysInMonth = new Date(year, month, 0).getDate()
  const mondayIndex = (first.getDay() + 6) % 7
  const cells = []

  for (let i = 0; i < mondayIndex; i += 1) {
    const date = new Date(year, month - 1, 1 - (mondayIndex - i))
    cells.push({
      key: `pad-prev-${i}`,
      day: date.getDate(),
      iso: toIsoDay(date),
      inMonth: false,
    })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    cells.push({ key: iso, day, iso, inMonth: true })
  }

  let nextDay = 1
  while (cells.length % 7 !== 0) {
    const date = new Date(year, month, nextDay)
    cells.push({
      key: `pad-next-${nextDay}`,
      day: date.getDate(),
      iso: toIsoDay(date),
      inMonth: false,
    })
    nextDay += 1
  }

  const weeks = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }
  return weeks
}

function formatVietnameseDate(iso) {
  if (!iso) return ''
  const date = new Date(`${iso}T12:00:00+07:00`)
  const weekday = WEEKDAY_LABELS[(date.getDay() + 6) % 7]
  const day = date.getDate()
  const month = MONTH_LABELS[date.getMonth()]
  const year = date.getFullYear()
  return `${weekday}, ngày ${day} ${month} năm ${year}`
}

function orderChipText(order) {
  const code = order.invoiceCode || 'Đơn'
  const slot = formatDeliverySlotDisplay(order.deliveryTimeSlot)
  const name = String(order.deliveryRecipientName || order.customerName || '').trim()
  if (slot) return `${code} · ${slot}`
  if (name) return `${code} · ${name}`
  return code
}

function orderDetailMeta(order) {
  const parts = [
    formatDeliverySlotDisplay(order.deliveryTimeSlot),
    String(order.deliveryAddress || '').trim(),
    String(order.customerPhone || order.deliveryPhone || '').trim(),
  ].filter(Boolean)
  return parts.join(' · ') || 'Không có địa chỉ / số điện thoại'
}

function AdminCalendarPage() {
  const now = new Date()
  const [status, setStatus] = useState(null)
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState('')
  const [selectedIso, setSelectedIso] = useState(() => todayIso())

  const calendarId = status?.calendarId || ''
  const googleReady = Boolean(status?.connected && calendarId)

  const loadStatus = useCallback(async () => {
    try {
      const result = await fetchGoogleCalendarStatusApi()
      setStatus(result.data)
    } catch {
      setStatus(null)
    }
  }, [])

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true)
    setOrdersError('')
    try {
      const { from, to } = monthBounds(year, month)
      const result = await fetchCustomRequestsApi({
        page: 1,
        limit: 300,
        dateField: 'shipDate',
        from,
        to,
      })
      setOrders(Array.isArray(result.data) ? result.data : [])
    } catch (err) {
      setOrdersError(err.message || 'Không tải được đơn theo tháng.')
      setOrders([])
    } finally {
      setOrdersLoading(false)
    }
  }, [month, year])

  useEffect(() => {
    void loadStatus()
  }, [loadStatus])

  useEffect(() => {
    void loadOrders()
  }, [loadOrders])

  const monthLabel = `${MONTH_LABELS[month - 1]} năm ${year}`
  const weeks = useMemo(() => buildMonthCells(year, month), [month, year])
  const today = todayIso()

  const ordersByDay = useMemo(() => {
    const map = new Map()
    for (const order of orders) {
      const iso = toIsoDay(order.shipDate || order.deliveryDate)
      if (!iso) continue
      if (!map.has(iso)) map.set(iso, [])
      map.get(iso).push(order)
    }
    for (const list of map.values()) {
      list.sort((a, b) => {
        const sa = formatDeliverySlotDisplay(a.deliveryTimeSlot)
        const sb = formatDeliverySlotDisplay(b.deliveryTimeSlot)
        if (sa && sb) return sa.localeCompare(sb)
        return String(a.invoiceCode || '').localeCompare(String(b.invoiceCode || ''))
      })
    }
    return map
  }, [orders])

  const selectedOrders = selectedIso ? ordersByDay.get(selectedIso) || [] : []
  const selectedDayToneKey = selectedIso
    ? getDayTone(selectedOrders, selectedIso, today)
    : 'empty'
  const selectedDayTone = TONE[selectedDayToneKey] || TONE.empty

  function goToToday() {
    const iso = todayIso()
    const date = new Date()
    setYear(date.getFullYear())
    setMonth(date.getMonth() + 1)
    setSelectedIso(iso)
  }

  function shiftMonth(delta) {
    const date = new Date(year, month - 1 + delta, 1)
    const nextYear = date.getFullYear()
    const nextMonth = date.getMonth() + 1
    setYear(nextYear)
    setMonth(nextMonth)
    setSelectedIso((prev) => {
      if (prev) {
        const [y, m] = prev.split('-').map(Number)
        if (y === nextYear && m === nextMonth) return prev
      }
      return `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`
    })
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 pb-4 lg:flex-row lg:gap-4 lg:p-6 lg:pb-6">
        <section className="glass-card flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-outline-variant/20 px-4 py-3 sm:px-5">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-primary">{monthLabel}</h3>
              <p className="text-xs text-on-surface-variant">
                {ordersLoading ? 'Đang tải đơn...' : `${orders.length} đơn trong tháng`}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low"
                aria-label="Tháng trước"
              >
                <MaterialIcon name="chevron_left" />
              </button>
              <button
                type="button"
                onClick={goToToday}
                className="btn-glass px-3 py-1.5 text-xs"
              >
                Hôm nay
              </button>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low"
                aria-label="Tháng sau"
              >
                <MaterialIcon name="chevron_right" />
              </button>
              <span className="mx-0.5 hidden h-5 w-px bg-outline-variant/30 sm:block" aria-hidden />
              {googleReady ? (
                <a
                  href={buildOpenUrl(calendarId)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-glass inline-flex items-center gap-1.5"
                >
                  <MaterialIcon name="open_in_new" className="text-lg" />
                  <span className="hidden sm:inline">Google Calendar</span>
                </a>
              ) : (
                <Link
                  to="/admin/settings/google-calendar"
                  className="btn-glass inline-flex items-center gap-1.5"
                >
                  <MaterialIcon name="link" className="text-lg" />
                  <span className="hidden sm:inline">Kết nối Google</span>
                </Link>
              )}
              <Link
                to="/admin/settings/google-calendar"
                className="btn-glass inline-flex items-center gap-1.5"
              >
                <MaterialIcon name="tune" className="text-lg" />
                <span className="hidden sm:inline">Cấu hình</span>
              </Link>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 border-b border-outline-variant/15 px-4 py-2.5 sm:px-5">
            {['upcoming', 'today', 'overdue', 'done'].map((key) => {
              const tone = TONE[key]
              return (
                <span
                  key={key}
                  className={[
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium text-on-surface',
                    tone.legend,
                  ].join(' ')}
                >
                  <span className={['h-2 w-2 rounded-full', tone.dayBadge].join(' ')} />
                  {tone.label}
                </span>
              )
            })}
          </div>

          {ordersError ? (
            <p className="mx-4 mt-3 shrink-0 rounded-xl bg-error-container/50 px-3 py-2 text-sm text-error sm:mx-5">
              {ordersError}
            </p>
          ) : null}

          <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden p-2 sm:p-3 lg:p-4">
            <div className="flex h-full min-h-0 min-w-[640px] flex-col lg:min-w-0">
              <div className="mb-1 grid shrink-0 grid-cols-7 gap-1">
                {WEEKDAY_LABELS.map((label) => (
                  <div
                    key={label}
                    className="px-1 py-1 text-center text-[10px] font-semibold text-on-surface-variant sm:py-1.5 sm:text-[11px]"
                  >
                    {label}
                  </div>
                ))}
              </div>

              <div
                className="grid min-h-0 flex-1 grid-cols-7 gap-1"
                style={{
                  gridTemplateRows: `repeat(${weeks.length}, minmax(0, 1fr))`,
                }}
              >
                {weeks.flat().map((cell) => {
                  const dayOrders = cell.inMonth ? ordersByDay.get(cell.iso) || [] : []
                  const dayToneKey = cell.inMonth
                    ? getDayTone(dayOrders, cell.iso, today)
                    : 'empty'
                  const tone = TONE[dayToneKey] || TONE.empty
                  const isSelected = cell.iso === selectedIso
                  const visible = dayOrders.slice(0, 2)
                  const more = dayOrders.length - visible.length

                  return (
                    <button
                      key={cell.key}
                      type="button"
                      onClick={() => cell.inMonth && setSelectedIso(cell.iso)}
                      disabled={!cell.inMonth}
                      className={[
                        'flex h-full min-h-0 flex-col overflow-hidden rounded-xl border p-1 text-left transition sm:p-1.5',
                        cell.inMonth
                          ? [tone.cell, tone.cellHover].join(' ')
                          : 'cursor-default border-transparent bg-[#f3eee8]/50 opacity-50',
                        isSelected
                          ? 'shadow-[inset_0_0_0_2px_rgba(74,48,32,0.35)]'
                          : '',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'mb-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold sm:mb-1 sm:h-6 sm:w-6 sm:text-xs',
                          cell.inMonth && dayToneKey !== 'empty'
                            ? tone.dayBadge
                            : cell.inMonth
                              ? 'text-[#5c4a3c]'
                              : 'text-[#a89888]',
                        ].join(' ')}
                      >
                        {cell.day}
                      </span>

                      <div className="relative flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden">
                        {visible.map((order) => {
                          const orderTone = TONE[getOrderTone(order, today)]
                          return (
                            <span
                              key={order.id}
                              className={[
                                'truncate rounded-md px-1 py-0.5 text-[9px] font-medium leading-tight ring-1 ring-inset sm:text-[10px]',
                                orderTone.chip,
                              ].join(' ')}
                              title={`${order.invoiceCode} · ${orderTone.label} · ${order.deliveryRecipientName || order.customerName || ''}`}
                            >
                              {orderChipText(order)}
                            </span>
                          )
                        })}
                        {more > 0 ? (
                          <span className="pointer-events-none absolute bottom-0 right-0 rounded-md bg-white/85 px-1 py-0.5 text-[9px] font-semibold leading-none text-[#7a5c48] sm:text-[10px]">
                            +{more}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <aside className="glass-card flex min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-2xl max-lg:max-h-[40%] lg:w-[22rem] xl:w-[26rem]">
          <div className="shrink-0 border-b border-outline-variant/15 px-4 py-3 sm:px-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-primary">Chi tiết ngày</h3>
                <p className="mt-0.5 text-xs text-on-surface-variant">
                  {formatVietnameseDate(selectedIso)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                {selectedDayToneKey !== 'empty' ? (
                  <span
                    className={[
                      'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                      selectedDayTone.legend,
                    ].join(' ')}
                  >
                    {selectedDayTone.label}
                  </span>
                ) : null}
                <p className="text-xs text-outline">{selectedOrders.length} đơn</p>
              </div>
            </div>
            {selectedIso === today ? null : (
              <button
                type="button"
                onClick={goToToday}
                className="mt-2 text-xs font-medium text-primary hover:underline"
              >
                Về hôm nay
              </button>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 sm:px-5">
            {ordersLoading ? (
              <p className="py-6 text-sm text-on-surface-variant">Đang tải...</p>
            ) : selectedOrders.length === 0 ? (
              <p className="py-6 text-sm text-on-surface-variant">Không có đơn giao ngày này.</p>
            ) : (
              <ul className="divide-y divide-outline-variant/20">
                {selectedOrders.map((order) => {
                  const orderTone = TONE[getOrderTone(order, today)]
                  return (
                    <li key={order.id}>
                      <Link
                        to={`/admin/manage?highlight=${encodeURIComponent(order.id)}`}
                        className="flex items-start gap-3 py-3 transition hover:bg-surface-container-low/60"
                      >
                        <span
                          className={[
                            'mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset',
                            orderTone.chip,
                          ].join(' ')}
                        >
                          {orderTone.label}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-on-surface">
                            {order.invoiceCode || '—'} ·{' '}
                            {order.deliveryRecipientName || order.customerName}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-on-surface-variant">
                            {orderDetailMeta(order)}
                          </span>
                          {formatViDate(order.shipDate || order.deliveryDate) ? (
                            <span className="mt-0.5 block text-[11px] text-outline">
                              Ngày giao: {formatViDate(order.shipDate || order.deliveryDate)}
                            </span>
                          ) : null}
                        </span>
                        <MaterialIcon name="chevron_right" className="mt-0.5 text-outline" />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default AdminCalendarPage
