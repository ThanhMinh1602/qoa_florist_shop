/**
 * Cloudinary delivery URL helpers — resize/format on CDN.
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
 * @param {{
 *   width?: number
 *   height?: number
 *   crop?: string
 *   quality?: string | number
 *   dpr?: boolean | number | string
 * }} [opts]
 */
export function cloudinaryUrl(
  url,
  { width, height, crop = 'limit', quality = 'auto:good', dpr = false } = {},
) {
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
  if (dpr === true) parts.push('dpr_auto')
  else if (dpr) parts.push(`dpr_${dpr}`)
  parts.push('f_auto', `q_${quality}`)

  return `${before}${parts.join(',')}/${after}`
}

/**
 * srcset cho card / gallery responsive.
 * Không gắn dpr_auto — browser đã chọn width theo DPR qua `sizes`.
 */
export function cloudinarySrcSet(url, widths = [480, 720, 960, 1280], opts = {}) {
  if (!isCloudinaryUploadUrl(url)) return undefined
  return widths
    .map((w) => `${cloudinaryUrl(url, { width: w, dpr: false, ...opts })} ${w}w`)
    .join(', ')
}
