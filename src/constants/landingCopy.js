/** Copy mặc định trang chủ — dùng khi Settings chưa set */
export const LANDING_COPY_DEFAULTS = {
  heroTitle: 'Hoa tươi chọn tay.\nThiệp số gắn QR.',
  heroSubtitle:
    'Trải nghiệm tặng hoa hoàn toàn mới với thông điệp cá nhân hóa được mã hóa qua QR code, mang đến bất ngờ tinh tế cho người nhận.',
  heroCtaPrimary: 'Khám phá bộ sưu tập',
  heroCtaSecondary: 'Tạo thiệp lời chúc',
  priceTiersTitle: 'Chọn theo mức giá',
  featuredTitle: 'Bán chạy',
  customCardTitle: 'Thiệp số',
  customCardEyebrow: 'QR Greeting',
  customCardHeading: 'Lời chúc mở ra\nkhi quét mã QR',
  customCardBody: 'Gắn thiệp số vào bó hoa — người nhận chỉ cần một lần quét.',
  customCardCta: 'Tạo thiệp ngay',
  footerBrand: 'QOA Florist',
  footerTagline: 'Hoa tươi chọn tay · Thiệp số gắn QR · Giao tận nơi',
  footerCopyright: 'Đánh thức vẻ đẹp tự nhiên.',
  footerEmail: 'hello@qoaflorist.com',
  footerZaloPhone: '',
}

export function mergeLandingCopy(saved = {}) {
  const next = { ...LANDING_COPY_DEFAULTS }
  for (const key of Object.keys(LANDING_COPY_DEFAULTS)) {
    const value = saved?.[key]
    if (typeof value === 'string' && value.trim()) {
      next[key] = value.trim()
    }
  }
  return next
}

/** Render title với xuống dòng (\n) */
export function splitLines(text = '') {
  return String(text)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
}
