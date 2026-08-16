import { ORDER_STATUS_OPTIONS } from '../constants/orderStatus'
import {
  PAYMENT_STATUS_OPTIONS,
  SHIPPING_STATUS_OPTIONS,
} from '../constants/customRequestDefaults'

export const EMPTY_ORDER_FILTERS = {
  q: '',
  status: '',
  shippingStatus: '',
  paymentStatus: '',
  dateField: 'shipDate',
  from: '',
  to: '',
}

export const ORDER_DATE_FIELD_OPTIONS = [
  { value: 'shipDate', label: 'Ngày ship' },
  { value: 'orderDate', label: 'Ngày đặt' },
]

export const ORDER_DATE_PRESETS = [
  { id: 'today', label: 'Hôm nay' },
  { id: 'tomorrow', label: 'Ngày mai' },
  { id: 'week', label: 'Tuần này' },
  { id: 'month', label: 'Tháng này' },
]

const DATE_FIELDS = ORDER_DATE_FIELD_OPTIONS.map((item) => item.value)

function pad(value) {
  return String(value).padStart(2, '0')
}

function toIsoDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function startOfLocalDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function getOrderDatePresetRange(preset, now = new Date()) {
  const today = startOfLocalDay(now)

  if (preset === 'today') {
    const iso = toIsoDate(today)
    return { from: iso, to: iso }
  }

  if (preset === 'tomorrow') {
    const next = new Date(today)
    next.setDate(today.getDate() + 1)
    const iso = toIsoDate(next)
    return { from: iso, to: iso }
  }

  if (preset === 'week') {
    const weekday = today.getDay()
    const mondayOffset = weekday === 0 ? -6 : 1 - weekday
    const start = new Date(today)
    start.setDate(today.getDate() + mondayOffset)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return { from: toIsoDate(start), to: toIsoDate(end) }
  }

  if (preset === 'month') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    return { from: toIsoDate(start), to: toIsoDate(end) }
  }

  return { from: '', to: '' }
}

export function matchOrderDatePreset(from, to, now = new Date()) {
  if (!from && !to) return ''
  for (const item of ORDER_DATE_PRESETS) {
    const range = getOrderDatePresetRange(item.id, now)
    if (range.from === from && range.to === to) return item.id
  }
  return 'custom'
}

export function parseOrderFiltersFromSearch(searchParams) {
  const dateFieldRaw = searchParams.get('dateField')
  const from = searchParams.get('from') || ''
  const to = searchParams.get('to') || ''
  return {
    q: searchParams.get('q') || '',
    status: searchParams.get('status') || '',
    shippingStatus: searchParams.get('shippingStatus') || '',
    paymentStatus: searchParams.get('paymentStatus') || '',
    dateField: DATE_FIELDS.includes(dateFieldRaw) ? dateFieldRaw : 'shipDate',
    from,
    to,
    preset: matchOrderDatePreset(from, to),
  }
}

export function serializeOrderFilters(filters) {
  const params = new URLSearchParams()
  if (filters.q?.trim()) params.set('q', filters.q.trim())
  if (filters.status) params.set('status', filters.status)
  if (filters.shippingStatus) params.set('shippingStatus', filters.shippingStatus)
  if (filters.paymentStatus) params.set('paymentStatus', filters.paymentStatus)
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  if (filters.dateField && filters.dateField !== 'shipDate') {
    params.set('dateField', filters.dateField)
  }
  return params
}

export function countActiveOrderFilters(filters) {
  let count = 0
  if (filters.q?.trim()) count += 1
  if (filters.status) count += 1
  if (filters.shippingStatus) count += 1
  if (filters.paymentStatus) count += 1
  if (filters.from || filters.to) count += 1
  return count
}

function shortIso(iso) {
  const match = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return iso || ''
  return `${match[3]}/${match[2]}`
}

export function summarizeActiveOrderFilters(filters) {
  const chips = []
  const preset = ORDER_DATE_PRESETS.find((item) => item.id === filters.preset)
  if (preset) {
    chips.push({ id: 'date', label: preset.label })
  } else if (filters.from || filters.to) {
    const field =
      ORDER_DATE_FIELD_OPTIONS.find((item) => item.value === filters.dateField)?.label || 'Ngày'
    const from = shortIso(filters.from)
    const to = shortIso(filters.to)
    const range = from && to && from === to ? from : [from, to].filter(Boolean).join('–')
    chips.push({ id: 'date', label: range ? `${field} ${range}` : field })
  }

  const status = ORDER_STATUS_OPTIONS.find((item) => item.value === filters.status)
  if (status) chips.push({ id: 'status', label: status.label })

  const shipping = SHIPPING_STATUS_OPTIONS.find((item) => item.value === filters.shippingStatus)
  if (shipping) chips.push({ id: 'shipping', label: shipping.label })

  const payment = PAYMENT_STATUS_OPTIONS.find((item) => item.value === filters.paymentStatus)
  if (payment) chips.push({ id: 'payment', label: payment.label })

  return chips
}

export function toOrderListQuery(filters, { page, limit }) {
  return {
    page,
    limit,
    q: filters.q,
    status: filters.status,
    shippingStatus: filters.shippingStatus,
    paymentStatus: filters.paymentStatus,
    from: filters.from,
    to: filters.to,
    dateField: filters.from || filters.to ? filters.dateField : '',
  }
}
