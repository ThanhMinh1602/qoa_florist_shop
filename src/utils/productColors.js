import { createId } from './id'

export const MAX_IMAGES_PER_COLOR = 3
export const DEFAULT_COLOR_HEX = '#C4A484'

export function createEmptyColor(overrides = {}) {
  return {
    id: createId(),
    name: '',
    hex: DEFAULT_COLOR_HEX,
    images: [],
    ...overrides,
  }
}

function mapImage(image) {
  return {
    id: image.id || createId(),
    url: image.url,
    publicId: image.publicId || '',
    isMain: Boolean(image.isMain),
    ...(image.file ? { file: image.file } : {}),
  }
}

function withMainFirst(list = []) {
  return list.map((image, index) => ({
    ...image,
    isMain: index === 0,
  }))
}

export function colorsFromProduct(product = {}) {
  if (Array.isArray(product.colors) && product.colors.length > 0) {
    return product.colors.map((color, colorIndex) => ({
      id: color.id || createId(),
      name: color.name || (colorIndex === 0 ? 'Mặc định' : `Màu ${colorIndex + 1}`),
      hex: normalizeHexInput(color.hex) || DEFAULT_COLOR_HEX,
      images: withMainFirst((color.images || []).map(mapImage).slice(0, MAX_IMAGES_PER_COLOR)),
    }))
  }

  const images = Array.isArray(product.images) ? product.images.map(mapImage) : []
  if (images.length === 0) {
    return [createEmptyColor({ name: 'Mặc định' })]
  }

  const sorted = [...images].sort((a, b) => Number(b.isMain) - Number(a.isMain))
  const colors = []
  for (let index = 0; index < sorted.length; index += MAX_IMAGES_PER_COLOR) {
    const chunk = sorted.slice(index, index + MAX_IMAGES_PER_COLOR)
    colors.push(
      createEmptyColor({
        name: colors.length === 0 ? 'Mặc định' : `Màu ${colors.length + 1}`,
        images: withMainFirst(chunk),
      }),
    )
  }
  return colors
}

export function flattenColorsToImages(colors = []) {
  const images = []
  colors.forEach((color, colorIndex) => {
    ;(color.images || []).forEach((image, imageIndex) => {
      images.push({
        ...image,
        isMain: colorIndex === 0 && imageIndex === 0,
      })
    })
  })
  return images
}

export function collectColorImages(colors = []) {
  return colors.flatMap((color) => color.images || [])
}

export function normalizeHexInput(value) {
  let hex = String(value || '')
    .trim()
    .toUpperCase()
  if (!hex) return ''
  if (!hex.startsWith('#')) hex = `#${hex}`
  hex = hex.replace(/[^#0-9A-F]/g, '').slice(0, 7)
  if (/^#[0-9A-F]{3}$/.test(hex)) {
    hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
  }
  if (/^#[0-9A-F]{6}$/.test(hex)) return hex
  return hex
}

export async function prepareColorsPayload(colors, prepareImagesPayload) {
  const next = []
  for (const color of colors || []) {
    const images = await prepareImagesPayload(color.images || [])
    next.push({
      id: color.id || createId(),
      name: String(color.name || '').trim(),
      hex: normalizeHexInput(color.hex) || DEFAULT_COLOR_HEX,
      images: withMainFirst(images).slice(0, MAX_IMAGES_PER_COLOR),
    })
  }
  return next.filter((color) => color.images.length > 0 || color.name || color.hex)
}
