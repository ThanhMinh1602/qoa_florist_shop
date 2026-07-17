function triggerDownload(dataUrl, filename) {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}

/**
 * Tải ảnh QR. Nếu có `label` (tên khách hàng), vẽ tên bên dưới mã QR.
 */
export function downloadQrImage(canvas, filename, label) {
  if (!canvas) return false

  const name = typeof label === 'string' ? label.trim() : ''
  if (!name) {
    triggerDownload(canvas.toDataURL('image/png'), filename)
    return true
  }

  const padding = Math.round(canvas.width * 0.08)
  const fontSize = Math.max(20, Math.round(canvas.width * 0.075))
  const labelBlock = Math.round(fontSize * 1.6)

  const out = document.createElement('canvas')
  out.width = canvas.width + padding * 2
  out.height = canvas.height + padding * 2 + labelBlock

  const ctx = out.getContext('2d')
  if (!ctx) {
    triggerDownload(canvas.toDataURL('image/png'), filename)
    return true
  }

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, out.width, out.height)

  ctx.drawImage(canvas, padding, padding)

  ctx.fillStyle = '#1f2937'
  ctx.font = `600 ${fontSize}px "Segoe UI", system-ui, -apple-system, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const maxTextWidth = out.width - padding * 2
  let text = name
  while (ctx.measureText(text).width > maxTextWidth && text.length > 4) {
    text = text.slice(0, -2)
  }
  if (text !== name) text = `${text}…`

  ctx.fillText(text, out.width / 2, canvas.height + padding + labelBlock / 2 + padding * 0.1)

  triggerDownload(out.toDataURL('image/png'), filename)
  return true
}
