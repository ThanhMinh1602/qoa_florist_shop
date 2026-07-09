export function downloadQrImage(canvas, filename) {
  if (!canvas) return false

  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
  return true
}
