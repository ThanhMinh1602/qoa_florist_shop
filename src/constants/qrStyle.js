/** Màu và trái tim ở giữa mã QR (dùng chung cho các panel QR) */

export const QR_FG_COLOR = '#c81e3a'
export const QR_BG_COLOR = '#ffffff'

const HEART_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${QR_FG_COLOR}" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`

export const QR_HEART_SRC = `data:image/svg+xml,${encodeURIComponent(HEART_SVG)}`

/** imageSettings cho QRCodeCanvas — trái tim ở giữa, có khoét nền */
export function qrHeartImageSettings(qrSize) {
  const s = Math.round(qrSize * 0.22)
  return {
    src: QR_HEART_SRC,
    height: s,
    width: s,
    excavate: true,
  }
}
