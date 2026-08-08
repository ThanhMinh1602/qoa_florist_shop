/**
 * Resize ảnh trên trình duyệt (canvas) trước khi upload Cloudinary.
 * Giữ tỉ lệ, giới hạn cạnh dài, xuất JPEG.
 */
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Không đọc được file ảnh.'))
    reader.readAsDataURL(file)
  })
}

function loadHtmlImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Không hiển thị được ảnh từ thư viện.'))
    img.src = src
  })
}

async function loadImageSource(file) {
  try {
    return await createImageBitmap(file)
  } catch {
    // ignore — thử fallback
  }

  const objectUrl = URL.createObjectURL(file)
  try {
    return await loadHtmlImage(objectUrl)
  } catch {
    // ignore
  } finally {
    URL.revokeObjectURL(objectUrl)
  }

  const dataUrl = await readFileAsDataUrl(file)
  return loadHtmlImage(dataUrl)
}

export async function resizeImageFile(
  file,
  {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    mimeType = 'image/jpeg',
  } = {},
) {
  const type = String(file?.type || '').toLowerCase()
  const looksLikeImage =
    type.startsWith('image/') ||
    !type ||
    type === 'application/octet-stream'

  if (!file || !looksLikeImage) {
    throw new Error('File không phải ảnh.')
  }

  let bitmap
  try {
    bitmap = await loadImageSource(file)
  } catch {
    throw new Error(
      'Không đọc được ảnh. Thử JPEG/PNG, hoặc trên iPhone tắt “High Efficiency” trong Cài đặt → Camera.',
    )
  }

  try {
    const sourceWidth = bitmap.width || bitmap.naturalWidth
    const sourceHeight = bitmap.height || bitmap.naturalHeight
    if (!sourceWidth || !sourceHeight) {
      throw new Error('Ảnh không hợp lệ.')
    }
    const scale = Math.min(1, maxWidth / sourceWidth, maxHeight / sourceHeight)
    const width = Math.max(1, Math.round(sourceWidth * scale))
    const height = Math.max(1, Math.round(sourceHeight * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Không thể xử lý ảnh trên trình duyệt này.')

    ctx.drawImage(bitmap, 0, 0, width, height)

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) resolve(result)
          else reject(new Error('Không thể nén ảnh.'))
        },
        mimeType,
        quality,
      )
    })

    const baseName = (file.name || 'image').replace(/\.[^.]+$/, '') || 'image'
    const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg'

    return new File([blob], `${baseName}.${ext}`, {
      type: mimeType,
      lastModified: Date.now(),
    })
  } finally {
    bitmap.close?.()
  }
}

export async function resizeImageFiles(files, options) {
  const list = Array.from(files || [])
  return Promise.all(list.map((file) => resizeImageFile(file, options)))
}
