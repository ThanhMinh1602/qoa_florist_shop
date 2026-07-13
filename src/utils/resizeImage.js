/**
 * Resize ảnh trên trình duyệt (canvas) trước khi upload Cloudinary.
 * Giữ tỉ lệ, giới hạn cạnh dài, xuất JPEG.
 */
export async function resizeImageFile(
  file,
  {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    mimeType = 'image/jpeg',
  } = {},
) {
  if (!file?.type?.startsWith('image/')) {
    throw new Error('File không phải ảnh.')
  }

  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height)
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))

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
