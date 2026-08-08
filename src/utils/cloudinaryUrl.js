/**
 * Cloudinary delivery URL helpers — resize/format on CDN so UI không tải full ~1600px.
 * Non-Cloudinary / blob / data URLs được trả nguyên.
 */

function isCloudinaryUploadUrl(url) {
  return typeof url === 'string' && url.includes('/image/upload/')
}

function stripExistingTransforms(afterUpload) {
  // upload/[transforms/]v123/...  hoặc  upload/[transforms/]folder/...
  const slash = afterUpload.indexOf('/')
  if (slash < 0) return afterUpload
  const first = afterUpload.slice(0, slash)
  const looksLikeTransform =
    /^(?:[a-z]+_[^,/\s]+,)*[a-z]+_[^,/\s]+$/.test(first) &&
    /(?:^|,)(?:w_|h_|c_|f_|q_|dpr_|g_)/.test(first)
  if (looksLikeTransform) return afterUpload.slice(slash + 1)
  return afterUpload
}

/**
 * @param {string} url
 * @param {{ width?: number, height?: number, crop?: string, quality?: string | number }} [opts]
 */
export function cloudinaryUrl(url, { width, height, crop = 'fill', quality = 'auto' } = {}) {
  if (!url || typeof url !== 'string') return url || ''
  if (url.startsWith('blob:') || url.startsWith('data:')) return url
  if (!isCloudinaryUploadUrl(url)) return url

  const marker = '/image/upload/'
  const idx = url.indexOf(marker)
  if (idx < 0) return url

  const before = url.slice(0, idx + marker.length)
  const after = stripExistingTransforms(url.slice(idx + marker.length))

  const parts = []
  if (width) parts.push(`w_${Math.round(width)}`)
  if (height) parts.push(`h_${Math.round(height)}`)
  if (crop && (width || height)) parts.push(`c_${crop}`)
  parts.push('f_auto', `q_${quality}`)

  return `${before}${parts.join(',')}/${after}`
}

/** srcset cho card / gallery responsive */
export function cloudinarySrcSet(url, widths = [320, 480, 640, 960]) {
  if (!isCloudinaryUploadUrl(url)) return undefined
  return widths.map((w) => `${cloudinaryUrl(url, { width: w })} ${w}w`).join(', ')
}
