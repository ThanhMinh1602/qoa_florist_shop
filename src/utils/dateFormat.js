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

/** Gõ dần: chỉ giữ số và thêm / */
export function maskDmYInput(raw) {
  const digits = String(raw || '')
    .replace(/\D/g, '')
    .slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}
