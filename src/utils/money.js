import { toIsoDateInput } from './dateFormat'

export function formatMoney(value) {
  const amount = Number(value) || 0
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫'
}

export function formatMoneyInput(value) {
  const digits = String(value ?? '').replace(/[^\d]/g, '')
  return digits ? Number(digits) : 0
}

/** Rỗng giữ '', còn lại ra số — dùng cho ô tiền gõ tay */
export function parseMoneyInput(raw) {
  const digits = String(raw ?? '').replace(/[^\d]/g, '')
  return digits === '' ? '' : Number(digits)
}

export function formatMoneyTyping(value) {
  if (value === '' || value === null || value === undefined) return ''
  const digits = String(value).replace(/[^\d]/g, '')
  if (!digits) return ''
  return new Intl.NumberFormat('vi-VN').format(Number(digits))
}

export function toDateInputValue(value) {
  if (!value) return ''
  const fromKnown = toIsoDateInput(value)
  if (fromKnown) return fromKnown
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function summarizeItems(items = []) {
  if (!Array.isArray(items) || items.length === 0) return '—'
  return items
    .map((item) => {
      const name = item?.productName || item?.name || 'Sản phẩm'
      const color = item?.color ? ` (${item.color})` : ''
      const note = item?.note ? ` — ${item.note}` : ''
      return `${item?.quantity || 1}× ${name}${color}${note}`
    })
    .join(', ')
}

export function normalizeOrderItems(items = []) {
  if (!Array.isArray(items)) return []
  return items.map((item) => ({
    productId: item?.productId || '',
    productName: String(item?.productName || item?.name || '').trim(),
    quantity: Math.max(1, Number(item?.quantity) || 1),
    unitPrice: Math.max(0, Number(item?.unitPrice) || 0),
    unitCost: Math.max(0, Number(item?.unitCost) || 0),
    color: String(item?.color || '').trim(),
    note: String(item?.note || '').trim(),
  }))
}
