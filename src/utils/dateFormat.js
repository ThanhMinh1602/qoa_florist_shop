/** yyyy-mm-dd → dd/mm/yyyy */
export function isoToDmY(iso) {
  if (!iso) return ''
  const match = String(iso).trim().match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return ''
  return `${match[3]}/${match[2]}/${match[1]}`
}

/** dd/mm/yyyy (hoặc d/m/yyyy) → yyyy-mm-dd; không hợp lệ → null */
export function dmYToIso(display) {
  const cleaned = String(display || '')
    .trim()
    .replace(/[.\-\s]/g, '/')
  const match = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!match) return null

  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > 31) return null

  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** Chuỗi bất kỳ → yyyy-mm-dd nếu nhận ra được ngày */
export function toIsoDateInput(value) {
  if (!value) return ''
  const raw = String(value).trim()
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`
  return dmYToIso(raw) || ''
}

/** Nhận diện chuỗi Date.toString() / ISO dài (không phải khung giờ người nhập) */
export function isRawDateTimeText(value) {
  const raw = String(value || '').trim()
  if (!raw) return false
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return true
  if (/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/i.test(raw)) return true
  if (/\bGMT[+-]\d{4}\b/i.test(raw) || /\bIndochina Time\b/i.test(raw)) return true
  if (/T\d{2}:\d{2}/.test(raw) && !Number.isNaN(Date.parse(raw))) return true
  return false
}

/** Ngày → dd/mm/yyyy (dễ nhìn cho người Việt) */
export function formatViDate(value) {
  if (!value) return ''
  const iso = toIsoDateInput(value)
  if (iso) return isoToDmY(iso)

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

/**
 * Khung giờ / ghi chú ship để hiện UI:
 * - Chuỗi ngày thô (Date English) → '' hoặc chỉ giờ nếu có giờ thật
 * - Text người nhập (vd. "14h–16h", "Minh ship") → giữ nguyên
 */
export function formatDeliverySlotDisplay(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''

  if (!isRawDateTimeText(raw)) return raw

  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return ''

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)
  const hour = parts.find((part) => part.type === 'hour')?.value
  const minute = parts.find((part) => part.type === 'minute')?.value
  if (hour == null || minute == null) return ''
  if (hour === '00' && minute === '00') return ''
  return `${hour}:${minute}`
}


/** Gõ dần: chỉ giữ số và thêm / */
export function maskDmYInput(raw) {
  const digits = String(raw || '')
    .replace(/\D/g, '')
    .slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}
