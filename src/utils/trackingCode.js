/**
 * Mã vận đơn luôn là chuỗi — tránh Excel/JS biến thành số (8.48E+13).
 */
export function normalizeTrackingCode(value) {
  if (value === null || value === undefined || value === '') return ''

  if (typeof value === 'bigint') {
    return value.toString()
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    // Số nguyên lớn từ Excel — tránh scientific notation
    return Number.isInteger(value)
      ? value.toLocaleString('fullwide', { useGrouping: false })
      : String(Math.trunc(value))
  }

  let text = String(value).trim()
  if (!text) return ''

  // Sheet đôi khi trả "8.48597E+13"
  if (/^\d+(?:\.\d+)?[eE][+-]?\d+$/.test(text)) {
    const num = Number(text)
    if (Number.isFinite(num)) {
      return Math.trunc(num).toLocaleString('fullwide', { useGrouping: false })
    }
  }

  // "148143415811.0" → "148143415811"
  if (/^\d+\.0+$/.test(text)) {
    return text.replace(/\.0+$/, '')
  }

  return text
}
