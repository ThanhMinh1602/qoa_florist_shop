export function formatMoney(value) {
  const amount = Number(value) || 0
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫'
}

export function formatMoneyInput(value) {
  const digits = String(value ?? '').replace(/[^\d]/g, '')
  return digits ? Number(digits) : 0
}

export function toDateInputValue(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function summarizeItems(items = []) {
  if (!items.length) return '—'
  return items
    .map((item) => `${item.quantity || 1}× ${item.productName}`)
    .join(', ')
}
