import { uploadImagesApi } from '../../../../api/uploadsApi'
import { LANDING_COPY_DEFAULTS, mergeLandingCopy } from '../../../../constants/landingCopy'
import { PRICE_TIERS } from '../../../../constants/priceTiers'
import { resizeImageFiles } from '../../../../utils/resizeImage'

export const COPY_FIELD_KEYS = Object.keys(LANDING_COPY_DEFAULTS)

export function createLocalId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function revokePreviewUrl(image) {
  if (image?.previewUrl?.startsWith('blob:')) {
    URL.revokeObjectURL(image.previewUrl)
  }
}

export function emptyTierState() {
  return PRICE_TIERS.map((tier) => ({
    id: tier.id,
    description: tier.description,
    images: [],
  }))
}

export function hydrateTierState(savedTiers = []) {
  const byId = new Map((savedTiers || []).map((tier) => [tier.id, tier]))
  return PRICE_TIERS.map((tier) => {
    const saved = byId.get(tier.id)
    return {
      id: tier.id,
      description: saved?.description?.trim() || tier.description,
      images: (saved?.images || []).map((image) => ({
        id: image.id,
        url: image.url,
        publicId: image.publicId || '',
        file: null,
        previewUrl: null,
      })),
    }
  })
}

export function mapFilesToImages(files) {
  return files.map((file) => {
    const previewUrl = URL.createObjectURL(file)
    return {
      id: createLocalId(),
      url: previewUrl,
      previewUrl,
      publicId: '',
      file,
    }
  })
}

export async function resolveUploadedImages(images) {
  const pending = images.filter((image) => image.file)
  let uploadedByIndex = []

  if (pending.length > 0) {
    const resized = await resizeImageFiles(
      pending.map((image) => image.file),
      { maxWidth: 1920, maxHeight: 1920, quality: 0.85 },
    )
    const result = await uploadImagesApi(resized, { folder: 'settings' })
    uploadedByIndex = result.data || []
    if (uploadedByIndex.length !== pending.length) {
      throw new Error('Upload ảnh không đủ số lượng.')
    }
  }

  let uploadIndex = 0
  return images.map((image) => {
    if (!image.file) {
      return {
        id: image.id,
        url: image.url,
        publicId: image.publicId || '',
      }
    }
    const uploaded = uploadedByIndex[uploadIndex]
    uploadIndex += 1
    return {
      id: uploaded.id || image.id,
      url: uploaded.url,
      publicId: uploaded.publicId || '',
    }
  })
}

export function reorderList(list, fromId, toId) {
  if (!fromId || !toId || fromId === toId) return list
  const fromIndex = list.findIndex((item) => item.id === fromId)
  const toIndex = list.findIndex((item) => item.id === toId)
  if (fromIndex < 0 || toIndex < 0) return list
  const next = [...list]
  const [item] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, item)
  return next
}

export function moveInList(list, id, direction) {
  const index = list.findIndex((item) => item.id === id)
  if (index < 0) return list
  const nextIndex = index + direction
  if (nextIndex < 0 || nextIndex >= list.length) return list
  const next = [...list]
  const [item] = next.splice(index, 1)
  next.splice(nextIndex, 0, item)
  return next
}

/** PUT /settings/landing luôn ghi đè heroImages — luôn gửi đủ payload từ settings hiện tại. */
export function buildLandingPayload(settings = {}, patch = {}) {
  const copy = mergeLandingCopy({ ...settings, ...patch })
  return {
    heroImages: patch.heroImages ?? settings.heroImages ?? [],
    heroAutoPlayMs: patch.heroAutoPlayMs ?? settings.heroAutoPlayMs ?? 5000,
    priceTiers: patch.priceTiers ?? settings.priceTiers ?? [],
    ...Object.fromEntries(COPY_FIELD_KEYS.map((key) => [key, String(copy[key] || '').trim()])),
  }
}

export const SETTINGS_MENU_ITEMS = [
  {
    to: 'google-calendar',
    icon: 'calendar_month',
    title: 'Google Calendar',
    description: 'Kết nối, Calendar ID, Gmail share và giờ nhắc.',
  },
  {
    to: 'hero',
    icon: 'view_carousel',
    title: 'Banner / Hero',
    description: 'Ảnh slideshow, tiêu đề, phụ đề và nút CTA.',
  },
  {
    to: 'sections',
    icon: 'title',
    title: 'Tiêu đề các section',
    description: 'Mức giá, bán chạy và khối thiệp số.',
  },
  {
    to: 'footer',
    icon: 'vertical_align_bottom',
    title: 'Footer',
    description: 'Brand, tagline, email và số Zalo.',
  },
  {
    to: 'price-tiers',
    icon: 'sell',
    title: 'Giới thiệu theo mức giá',
    description: 'Ảnh và mô tả cho 4 mức giá trên trang chủ.',
  },
]
