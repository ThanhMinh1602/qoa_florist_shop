import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import MaterialIcon from '../../../components/common/MaterialIcon'
import RichTextContent from '../../../components/common/RichTextContent'
import RichTextEditor from '../../../components/common/RichTextEditor'
import { overlayFade } from '../../../lib/motion'
import { uploadImagesApi } from '../../../api/uploadsApi'
import { useScrollLock } from '../../../hooks/useScrollLock'
import { cloudinaryUrl } from '../../../utils/cloudinaryUrl'
import { createId } from '../../../utils/id'
import { resizeImageFile, resizeImageFiles } from '../../../utils/resizeImage'
import AdminMobileFormActions from './AdminMobileFormActions'
import MoneyInput from './MoneyInput'
import { formatMoney, parseMoneyInput } from '../../../utils/money'
import {
  MAX_IMAGES_PER_COLOR,
  collectColorImages,
  colorsFromProduct,
  createEmptyColor,
  flattenColorsToImages,
  normalizeHexInput,
  prepareColorsPayload,
} from '../../../utils/productColors'

const EMPTY_FORM = {
  code: '',
  name: '',
  materials: '',
  description: '',
  images: [],
  colors: [createEmptyColor({ name: 'Mặc định' })],
  categoryIds: [],
  costPrice: '',
  makeMinutes: '',
  listPrice: '',
  sellPrice: '',
  otherCost: '',
  soldCount: '',
  active: true,
}

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'

/** Mã SP: 8 chữ cái in hoa (random) */
function generateProductCode(length = 8) {
  const chars = CODE_CHARS
  let code = ''
  const values = crypto.getRandomValues(new Uint8Array(length))
  for (let i = 0; i < length; i += 1) {
    code += chars[values[i] % chars.length]
  }
  return code
}

function normalizeCodeInput(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 20)
}

function revokeLocalPreview(image) {
  if (image?.url?.startsWith('blob:')) {
    URL.revokeObjectURL(image.url)
  }
}

function revokeLocalPreviews(images = []) {
  for (const image of images) revokeLocalPreview(image)
}

function revokeFormMedia(form) {
  revokeLocalPreviews(collectColorImages(form?.colors))
  // legacy flat images (nếu còn)
  if (Array.isArray(form?.images)) revokeLocalPreviews(form.images)
}

/** Resize + upload ảnh local; giữ nguyên ảnh đã có trên Cloudinary */
async function prepareImagesPayload(images = []) {
  const pending = images.filter((image) => image.file)
  let uploaded = []

  if (pending.length > 0) {
    const resized = await resizeImageFiles(
      pending.map((image) => image.file),
      { maxWidth: 1600, maxHeight: 1600, quality: 0.82 },
    )
    const result = await uploadImagesApi(resized, { folder: 'products' })
    uploaded = result.data || []
    if (uploaded.length !== pending.length) {
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
        isMain: Boolean(image.isMain),
      }
    }

    const cloud = uploaded[uploadIndex]
    uploadIndex += 1
    revokeLocalPreview(image)
    return {
      id: image.id,
      url: cloud.url,
      publicId: cloud.publicId,
      isMain: Boolean(image.isMain),
    }
  })
}

const inputClass =
  'w-full rounded-xl border border-outline-variant/25 bg-white px-3 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20'

function withMainFirst(list = []) {
  return list.map((image, index) => ({
    ...image,
    isMain: index === 0,
  }))
}

function toForm(product) {
  const colors = colorsFromProduct(product)
  const images = withMainFirst(flattenColorsToImages(colors))

  return {
    code: product.code || '',
    name: product.name || '',
    materials: product.materials || '',
    description: product.description || '',
    images,
    colors,
    categoryIds: Array.isArray(product.categoryIds) ? [...product.categoryIds] : [],
    costPrice: product.costPrice ?? '',
    makeMinutes: product.makeMinutes ?? '',
    listPrice: product.listPrice ?? '',
    sellPrice: product.sellPrice ?? '',
    otherCost: product.otherCost ?? '',
    soldCount: product.soldCount ?? 0,
    active: product.active !== false,
  }
}

function isLikelyImageFile(file) {
  if (!file) return false
  const type = String(file.type || '').toLowerCase()
  if (type.startsWith('image/')) return true
  // Thư viện điện thoại thường trả type rỗng
  if (!type || type === 'application/octet-stream') return true
  return false
}

async function preparePickedImage(file) {
  // Chuyển sang JPEG ngay → preview ổn định trên mobile (HEIC/type rỗng)
  const jpegFile = await resizeImageFile(file, {
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 0.82,
    mimeType: 'image/jpeg',
  })
  return {
    id: createId(),
    url: URL.createObjectURL(jpegFile),
    publicId: '',
    isMain: false,
    file: jpegFile,
  }
}

function ProductImagesField({
  images,
  onChange,
  disabled,
  onRemoveCloudImage,
  compact = false,
  hideTitle = false,
  maxImages = MAX_IMAGES_PER_COLOR,
  title = 'Hình ảnh sản phẩm',
}) {
  const inputId = `product-images-${useId().replace(/:/g, '')}`
  const listRef = useRef(null)
  const imagesRef = useRef(images)
  const dragIdRef = useRef(null)
  const [draggingId, setDraggingId] = useState(null)
  const [overId, setOverId] = useState(null)
  const [limitMessage, setLimitMessage] = useState('')
  const [isPicking, setIsPicking] = useState(false)
  const limit = Math.max(1, Number(maxImages) || MAX_IMAGES_PER_COLOR)
  const remainingSlots = Math.max(0, limit - images.length)
  const canAddMore = remainingSlots > 0 && !disabled && !isPicking

  imagesRef.current = images

  async function handleFilesSelected(event) {
    const input = event.target
    const rawFiles = Array.from(input.files || [])
    // Đọc xong mới clear — tránh race trên một số trình duyệt mobile
    const files = rawFiles.filter(isLikelyImageFile)
    input.value = ''

    if (rawFiles.length > 0 && files.length === 0) {
      setLimitMessage('Không nhận được ảnh hợp lệ. Thử chọn JPEG/PNG từ Thư viện.')
      return
    }
    if (files.length === 0) return

    const slots = Math.max(0, limit - imagesRef.current.length)
    if (slots <= 0) {
      setLimitMessage(`Chỉ được tải tối đa ${limit} hình ảnh.`)
      return
    }

    const accepted = files.slice(0, slots)
    setIsPicking(true)
    setLimitMessage(accepted.length > 1 ? `Đang xử lý ${accepted.length} ảnh...` : 'Đang xử lý ảnh...')

    try {
      const prepared = []
      for (const file of accepted) {
        prepared.push(await preparePickedImage(file))
      }
      onChange(withMainFirst([...imagesRef.current, ...prepared]))
      if (files.length > accepted.length) {
        setLimitMessage(`Chỉ thêm được ${accepted.length} ảnh nữa (tối đa ${limit}).`)
      } else {
        setLimitMessage('')
      }
      requestAnimationFrame(() => {
        listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      })
    } catch (err) {
      setLimitMessage(
        err?.message ||
          'Không đọc được ảnh. Thử chọn ảnh JPEG/PNG, hoặc tắt định dạng High Efficiency trên iPhone.',
      )
    } finally {
      setIsPicking(false)
    }
  }

  function removeImage(image) {
    const next = withMainFirst(images.filter((item) => item.id !== image.id))
    onChange(next)
    revokeLocalPreview(image)
    if (image.publicId) onRemoveCloudImage?.(image.publicId)
    setLimitMessage('')
  }

  function reorderById(fromId, toId) {
    if (!fromId || !toId || fromId === toId) return
    const fromIndex = images.findIndex((item) => item.id === fromId)
    const toIndex = images.findIndex((item) => item.id === toId)
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return
    const next = [...images]
    const [item] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, item)
    onChange(withMainFirst(next))
  }

  function handleDragStart(event, image) {
    if (disabled) return
    dragIdRef.current = image.id
    setDraggingId(image.id)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', image.id)
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.style.opacity = '0.45'
    }
  }

  function handleDragOver(event, image) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    const fromId = dragIdRef.current
    if (!fromId || fromId === image.id) return
    setOverId(image.id)
    reorderById(fromId, image.id)
  }

  function handleDragLeave(image) {
    if (overId === image.id) setOverId(null)
  }

  function handleDrop(event) {
    event.preventDefault()
    setOverId(null)
  }

  function handleDragEnd(event) {
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.style.opacity = ''
    }
    dragIdRef.current = null
    setDraggingId(null)
    setOverId(null)
  }

  const pickerInput =
    typeof document !== 'undefined'
      ? createPortal(
          <input
            id={inputId}
            type="file"
            accept="image/*"
            multiple
            // Gắn ngoài modal (body) để iOS Safari vẫn fire onChange sau khi đóng thư viện
            className="pointer-events-none fixed top-0 left-0 h-px w-px opacity-0"
            tabIndex={-1}
            aria-hidden="true"
            onChange={handleFilesSelected}
          />,
          document.body,
        )
      : null

  return (
    <div className={compact ? 'space-y-1.5' : 'space-y-3'} ref={listRef}>
      {pickerInput}
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        {hideTitle ? (
          <span className="text-xs text-on-surface-variant">{images.length}/{limit} ảnh</span>
        ) : (
          <p
            className={
              compact ? 'text-xs font-medium text-on-surface' : 'text-sm font-medium text-on-surface'
            }
          >
            {title}
          </p>
        )}
        {!disabled ? (
          <label
            htmlFor={canAddMore ? inputId : undefined}
            aria-disabled={!canAddMore}
            aria-label={isPicking ? 'Đang thêm ảnh' : `Thêm ảnh (${images.length}/${limit})`}
            title={isPicking ? 'Đang thêm ảnh' : `Thêm ảnh (${images.length}/${limit})`}
            className={[
              'inline-flex cursor-pointer items-center gap-1 border border-outline-variant/40 bg-white font-medium text-primary',
              compact ? 'rounded-lg px-2 py-1 text-[11px]' : 'rounded-xl px-3 py-2 text-sm',
              canAddMore ? 'hover:bg-surface-container-low' : 'pointer-events-none opacity-60',
            ].join(' ')}
          >
            <MaterialIcon name="add_photo_alternate" className={compact ? 'text-base' : 'text-lg'} />
            {isPicking ? '...' : 'Thêm'}
          </label>
        ) : null}
      </div>

      {limitMessage ? (
        <p
          className={[
            'bg-amber-50 text-amber-800',
            compact ? 'rounded-lg px-2 py-1.5 text-[11px]' : 'rounded-xl px-3 py-2 text-xs',
          ].join(' ')}
          role="status"
        >
          {limitMessage}
        </p>
      ) : null}

      {images.length === 0 ? (
        disabled ? (
          <div
            className={[
              'flex w-full flex-col items-center justify-center border border-dashed border-outline-variant/40 bg-surface-container-low/50 text-on-surface-variant',
              compact ? 'gap-1 rounded-xl px-3 py-4 text-xs' : 'gap-2 rounded-2xl px-4 py-8 text-sm',
            ].join(' ')}
          >
            <MaterialIcon
              name="imagesmode"
              className={compact ? 'text-2xl opacity-40' : 'text-3xl opacity-40'}
            />
            Chưa có ảnh
          </div>
        ) : (
          <label
            htmlFor={canAddMore ? inputId : undefined}
            aria-disabled={!canAddMore}
            className={[
              'flex w-full cursor-pointer flex-col items-center justify-center border border-dashed border-outline-variant/40 bg-white text-on-surface-variant',
              compact
                ? 'gap-1 rounded-xl px-3 py-4 text-xs'
                : 'gap-2 rounded-2xl px-4 py-8 text-sm',
              canAddMore ? 'hover:bg-surface-container-low' : 'pointer-events-none opacity-60',
            ].join(' ')}
          >
            <MaterialIcon
              name="imagesmode"
              className={
                compact ? 'text-2xl text-primary-fixed-dim' : 'text-3xl text-primary-fixed-dim'
              }
            />
            {isPicking
              ? 'Đang xử lý ảnh...'
              : compact
                ? `Thêm ảnh (tối đa ${limit})`
                : `Chọn ảnh từ thư viện (tối đa ${limit})`}
          </label>
        )
      ) : (
        <ul
          className={
            compact
              ? 'grid grid-cols-4 gap-1.5'
              : 'flex w-fit max-w-full flex-wrap gap-1.5 sm:gap-2'
          }
        >
          {images.map((image, index) => {
            const isMain = index === 0
            const isDragging = draggingId === image.id
            const isOver = overId === image.id && draggingId && draggingId !== image.id

            return (
              <li
                key={image.id}
                draggable={!disabled && !compact}
                onDragStart={(event) => handleDragStart(event, image)}
                onDragOver={(event) => handleDragOver(event, image)}
                onDragLeave={() => handleDragLeave(image)}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                className={[
                  'relative aspect-square shrink-0 overflow-hidden border-2 bg-white transition-all duration-200 ease-out',
                  compact ? 'rounded-lg' : 'h-28 w-28 rounded-xl sm:h-32 sm:w-32',
                  disabled ? 'cursor-default' : 'cursor-grab active:cursor-grabbing',
                  isMain
                    ? 'border-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]'
                    : 'border-outline-variant/25',
                  isDragging ? 'scale-[0.96] opacity-40 shadow-none' : 'scale-100',
                  isOver ? 'translate-y-0.5 border-primary/50 shadow-[0_10px_28px_rgba(74,48,32,0.16)]' : '',
                ].join(' ')}
              >
                <img
                  src={cloudinaryUrl(image.url, { width: 320 })}
                  alt=""
                  className="pointer-events-none h-full w-full object-cover"
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                />

                {isMain ? (
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span
                      className={[
                        'rounded-full border border-white/50 bg-white/35 font-bold tracking-[0.12em] text-emerald-800 uppercase shadow-sm backdrop-blur-md',
                        compact
                          ? 'px-1 py-0.5 text-[7px]'
                          : 'px-1.5 py-0.5 text-[8px] sm:px-3 sm:py-1.5 sm:text-[11px] sm:tracking-[0.16em]',
                      ].join(' ')}
                    >
                      Main
                    </span>
                  </span>
                ) : null}

                {!disabled ? (
                  <button
                    type="button"
                    disabled={isPicking}
                    onClick={() => removeImage(image)}
                    onMouseDown={(event) => event.stopPropagation()}
                    onPointerDown={(event) => event.stopPropagation()}
                    className={[
                      'absolute top-0 right-0 z-10 flex items-start justify-end p-0.5',
                      compact
                        ? 'h-7 w-7'
                        : 'h-9 w-9 sm:top-2 sm:right-2 sm:h-7 sm:w-7 sm:items-center sm:justify-center sm:p-0',
                    ].join(' ')}
                    aria-label="Xóa ảnh"
                    title="Xóa ảnh"
                  >
                    <span
                      className={[
                        'flex items-center justify-center rounded-full border border-white/50 bg-black/40 text-white backdrop-blur-md transition hover:bg-red-500/90',
                        compact ? 'h-4 w-4' : 'h-5 w-5 sm:h-7 sm:w-7',
                      ].join(' ')}
                    >
                      <MaterialIcon
                        name="close"
                        className={compact ? 'text-xs' : 'text-sm sm:text-base'}
                      />
                    </span>
                  </button>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}


function ProductColorsField({
  colors = [],
  onChange,
  disabled = false,
  onRemoveCloudImage,
  compact = false,
  readOnly = false,
}) {
  const list = Array.isArray(colors) && colors.length > 0 ? colors : [createEmptyColor({ name: 'Mặc định' })]

  function commit(nextColors) {
    const normalized = nextColors.length > 0 ? nextColors : [createEmptyColor({ name: 'Mặc định' })]
    onChange(normalized, flattenColorsToImages(normalized))
  }

  function updateColor(colorId, patch) {
    commit(
      list.map((color) => (color.id === colorId ? { ...color, ...patch } : color)),
    )
  }

  function updateColorImages(colorId, nextImages) {
    updateColor(colorId, { images: withMainFirst(nextImages).slice(0, MAX_IMAGES_PER_COLOR) })
  }

  function addColor() {
    commit([...list, createEmptyColor({ name: `Màu ${list.length + 1}` })])
  }

  function removeColor(colorId) {
    const target = list.find((color) => color.id === colorId)
    if (target) revokeLocalPreviews(target.images || [])
    commit(list.filter((color) => color.id !== colorId))
  }

  return (
    <div className={compact ? 'w-fit max-w-full space-y-3' : 'w-fit max-w-full space-y-4'}>
      {list.map((color, index) => {
        const hexValue = normalizeHexInput(color.hex) || '#C4A484'
        const pickerValue = /^#[0-9A-F]{6}$/i.test(hexValue) ? hexValue : '#C4A484'
        return (
          <div
            key={color.id}
            className="w-fit max-w-full rounded-xl border border-outline-variant/25 bg-white p-3 sm:p-3.5"
          >
            <div className="w-[calc(3*7rem+2*0.5rem)] max-w-full sm:w-[calc(3*8rem+2*0.5rem)]">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold tracking-wide text-on-surface-variant uppercase">
                  Màu {index + 1}
                </p>
                {!readOnly && !disabled && list.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeColor(color.id)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    <MaterialIcon name="delete" className="text-base" />
                    Xóa màu
                  </button>
                ) : null}
              </div>
              {readOnly || disabled ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className="inline-block h-7 w-7 rounded-full border border-outline-variant/40 shadow-sm"
                    style={{ backgroundColor: pickerValue }}
                    title={pickerValue}
                  />
                  <span className="text-sm font-medium text-on-surface">
                    {color.name || 'Không tên'}
                  </span>
                  <span className="font-mono text-xs text-on-surface-variant">{pickerValue}</span>
                </div>
              ) : (
                <div className="mt-2 flex w-full min-w-0 items-center gap-1.5">
                  <input
                    value={color.name || ''}
                    onChange={(event) => updateColor(color.id, { name: event.target.value })}
                    placeholder="Tên màu"
                    className="min-w-0 flex-1 basis-0 rounded-lg border border-outline-variant/30 bg-white px-2.5 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <input
                    type="color"
                    value={pickerValue}
                    onChange={(event) =>
                      updateColor(color.id, { hex: normalizeHexInput(event.target.value) })
                    }
                    className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-outline-variant/30 bg-white p-0.5"
                    title="Chọn mã màu"
                    aria-label="Chọn mã màu"
                  />
                  <input
                    value={color.hex || ''}
                    onChange={(event) =>
                      updateColor(color.id, { hex: normalizeHexInput(event.target.value) })
                    }
                    placeholder="#C4A484"
                    maxLength={7}
                    className="w-[5.75rem] shrink-0 rounded-lg border border-outline-variant/30 bg-white px-2 py-2 font-mono text-xs uppercase outline-none focus:ring-2 focus:ring-primary/20"
                    aria-label="Mã màu hex"
                  />
                </div>
              )}
            </div>

            <div className="mt-3 w-fit max-w-full">
              <ProductImagesField
                images={color.images || []}
                onChange={(next) => updateColorImages(color.id, next)}
                onRemoveCloudImage={onRemoveCloudImage}
                disabled={disabled || readOnly}
                compact={compact}
                hideTitle
                maxImages={MAX_IMAGES_PER_COLOR}
                title={`Ảnh màu (${(color.images || []).length}/${MAX_IMAGES_PER_COLOR})`}
              />
            </div>
          </div>
        )
      })}

      {!readOnly && !disabled ? (
        <button
          type="button"
          onClick={addColor}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-outline-variant/50 bg-surface-container-low/30 px-3 py-2.5 text-sm font-medium text-primary hover:bg-surface-container-low"
        >
          <MaterialIcon name="add_circle" className="text-lg" />
          Thêm màu hoa
        </button>
      ) : null}
    </div>
  )
}

function ProductFormDialog({
  open,
  values,
  onChange,
  onSubmit,
  onClose,
  onDelete,
  onRegenerateCode,
  onRemoveCloudImage,
  onQuickCreateCategory,
  categoryOptions = [],
  isEditing,
  formError,
  title,
  formId = 'product-form-page',
  readOnly = false,
  /**
   * `dialog` = bottom sheet/modal (desktop).
   * `page` = màn hình edit full (mobile overlay).
   * `embedded` = form fields only (parent page shell + header actions).
   */
  mode = 'dialog',
}) {
  const isPage = mode === 'page'
  const isEmbedded = mode === 'embedded'
  useScrollLock(!isPage && !isEmbedded && open)
  const selectedIds = Array.isArray(values.categoryIds) ? values.categoryIds : []
  const [quickCategoryOpen, setQuickCategoryOpen] = useState(false)
  const [quickCategoryName, setQuickCategoryName] = useState('')
  const [quickCategoryBusy, setQuickCategoryBusy] = useState(false)
  const [quickCategoryError, setQuickCategoryError] = useState('')
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false)
  const quickCategoryRef = useRef(null)
  const categoryMenuRef = useRef(null)

  const useCompactFields = isPage || isEmbedded
  const fieldClass = useCompactFields
    ? 'w-full rounded-lg border border-outline-variant/25 px-3 py-2.5 text-[15px] text-on-surface outline-none transition placeholder:text-outline/55 focus:border-primary/40 focus:ring-2 focus:ring-primary/20'
    : inputClass
  const labelClass = useCompactFields
    ? 'mb-1 block text-xs font-medium text-on-surface'
    : 'mb-1 block font-medium text-on-surface'
  const sectionTitleClass =
    'text-[10px] font-semibold tracking-wide text-on-surface-variant uppercase'

  useEffect(() => {
    if (!open) {
      setQuickCategoryOpen(false)
      setQuickCategoryName('')
      setQuickCategoryError('')
      setQuickCategoryBusy(false)
      setCategoryMenuOpen(false)
    }
  }, [open])

  useEffect(() => {
    if (!quickCategoryOpen) return undefined
    const timer = window.setTimeout(() => quickCategoryRef.current?.focus(), 40)
    return () => window.clearTimeout(timer)
  }, [quickCategoryOpen])

  useEffect(() => {
    if (!categoryMenuOpen) return undefined
    function onPointerDown(event) {
      if (categoryMenuRef.current?.contains(event.target)) return
      setCategoryMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [categoryMenuOpen])

  function toggleCategory(categoryId) {
    const next = selectedIds.includes(categoryId)
      ? selectedIds.filter((id) => id !== categoryId)
      : [...selectedIds, categoryId]
    onChange('categoryIds', next)
  }

  async function handleQuickCreateCategory(event) {
    event.preventDefault()
    event.stopPropagation()
    const name = quickCategoryName.trim()
    if (!name || !onQuickCreateCategory) return
    setQuickCategoryBusy(true)
    setQuickCategoryError('')
    try {
      const created = await onQuickCreateCategory(name)
      if (created?.id) {
        const nextIds = selectedIds.includes(created.id)
          ? selectedIds
          : [...selectedIds, created.id]
        onChange('categoryIds', nextIds)
      }
      setQuickCategoryName('')
      setQuickCategoryOpen(false)
    } catch (err) {
      setQuickCategoryError(err.message || 'Không tạo được danh mục.')
    } finally {
      setQuickCategoryBusy(false)
    }
  }

  const selectedCategoryNames = categoryOptions
    .filter((category) => selectedIds.includes(category.id))
    .map((category) => category.name)
  const categorySummary =
    selectedCategoryNames.length === 0
      ? 'Chọn danh mục'
      : selectedCategoryNames.length <= 2
        ? selectedCategoryNames.join(', ')
        : `${selectedCategoryNames.slice(0, 2).join(', ')} +${selectedCategoryNames.length - 2}`

  const categoryField = useCompactFields ? (
    <div ref={categoryMenuRef} className="relative">
      <div className="mb-1.5 flex items-center justify-between gap-1.5">
        <h3 className={sectionTitleClass}>Danh mục</h3>
        <button
          type="button"
          onClick={() => {
            setQuickCategoryOpen((prev) => !prev)
            setQuickCategoryError('')
            setCategoryMenuOpen(true)
          }}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-outline-variant/35 bg-white text-primary"
          aria-label="Tạo nhanh danh mục"
          title="Tạo nhanh danh mục"
        >
          <MaterialIcon name="add" className="text-base" />
        </button>
      </div>

      {quickCategoryOpen ? (
        <div className="mb-2 rounded-lg border border-outline-variant/25 bg-white p-2">
          <div className="flex gap-2">
            <input
              ref={quickCategoryRef}
              value={quickCategoryName}
              onChange={(e) => setQuickCategoryName(e.target.value)}
              placeholder="Tên danh mục mới"
              className={fieldClass}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleQuickCreateCategory(e)
                }
              }}
            />
            <button
              type="button"
              disabled={quickCategoryBusy || !quickCategoryName.trim()}
              onClick={handleQuickCreateCategory}
              className="btn-primary shrink-0 !rounded-lg !px-3 !py-2 text-[10px] disabled:opacity-50"
            >
              {quickCategoryBusy ? '...' : 'Thêm'}
            </button>
          </div>
          {quickCategoryError ? (
            <p className="mt-1.5 text-xs text-error">{quickCategoryError}</p>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setCategoryMenuOpen((openMenu) => !openMenu)}
        className={[
          fieldClass,
          'flex items-center justify-between gap-2 text-left',
          selectedCategoryNames.length ? 'text-on-surface' : 'text-on-surface-variant',
        ].join(' ')}
        aria-expanded={categoryMenuOpen}
        aria-haspopup="listbox"
      >
        <span className="min-w-0 flex-1 truncate">{categorySummary}</span>
        <MaterialIcon
          name={categoryMenuOpen ? 'expand_less' : 'expand_more'}
          className="shrink-0 text-lg text-on-surface-variant"
        />
      </button>

      {categoryMenuOpen ? (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-20 mt-1 max-h-44 w-full overflow-y-auto rounded-lg border border-outline-variant/25 bg-surface-container-lowest py-1 shadow-lg"
        >
          {categoryOptions.length === 0 ? (
            <p className="px-2.5 py-2 text-xs text-outline">Chưa có danh mục — bấm + để tạo.</p>
          ) : (
            categoryOptions.map((category) => {
              const checked = selectedIds.includes(category.id)
              return (
                <label
                  key={category.id}
                  role="option"
                  aria-selected={checked}
                  className={[
                    'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-surface-container-low',
                    checked ? 'text-primary' : 'text-on-surface',
                    !category.active ? 'opacity-50' : '',
                  ].join(' ')}
                >
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={checked}
                    onChange={() => toggleCategory(category.id)}
                  />
                  <span className="min-w-0 flex-1 truncate">{category.name}</span>
                </label>
              )
            })
          )}
        </div>
      ) : null}
    </div>
  ) : (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-on-surface">Danh mục</p>
        <button
          type="button"
          onClick={() => {
            setQuickCategoryOpen((prev) => !prev)
            setQuickCategoryError('')
          }}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-outline-variant/35 bg-white text-primary transition hover:bg-primary/10"
          aria-label="Tạo nhanh danh mục"
          title="Tạo nhanh danh mục"
        >
          <MaterialIcon name="add" className="text-lg" />
        </button>
      </div>

      {quickCategoryOpen ? (
        <div className="mb-3 rounded-xl border border-outline-variant/25 bg-white p-2.5">
          <div className="flex gap-2">
            <input
              ref={quickCategoryRef}
              value={quickCategoryName}
              onChange={(e) => setQuickCategoryName(e.target.value)}
              placeholder="Tên danh mục mới"
              className={`${inputClass} !py-2`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleQuickCreateCategory(e)
                }
              }}
            />
            <button
              type="button"
              disabled={quickCategoryBusy || !quickCategoryName.trim()}
              onClick={handleQuickCreateCategory}
              className="btn-primary shrink-0 !px-3 !py-2 text-[10px] disabled:opacity-50"
            >
              {quickCategoryBusy ? '...' : 'Thêm'}
            </button>
          </div>
          {quickCategoryError ? (
            <p className="mt-1.5 text-xs text-error">{quickCategoryError}</p>
          ) : null}
        </div>
      ) : null}

      {categoryOptions.length === 0 ? (
        <p className="mt-1 text-xs text-outline">Chưa có danh mục — bấm + để tạo nhanh.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {categoryOptions.map((category) => {
            const checked = selectedIds.includes(category.id)
            return (
              <label
                key={category.id}
                className={[
                  'inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition',
                  checked
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-outline-variant/30 bg-white text-on-surface-variant hover:border-primary/25',
                  !category.active ? 'opacity-50' : '',
                ].join(' ')}
              >
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={checked}
                  onChange={() => toggleCategory(category.id)}
                />
                {category.name}
              </label>
            )
          })}
        </div>
      )}
    </div>
  )

  const formBodyPage = (
    <>
      <section className="overflow-hidden rounded-xl border border-outline-variant/25 bg-surface-container-lowest">
        <div className="border-b border-outline-variant/20 p-2.5">
          <h3 className={sectionTitleClass}>Thông tin</h3>
          <div className="mt-1.5 space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <label className="block min-w-0">
                <span className={labelClass}>Mã SP</span>
                <div className="flex gap-1.5">
                  <input
                    value={values.code}
                    onChange={(e) => onChange('code', normalizeCodeInput(e.target.value))}
                    placeholder="Mã"
                    maxLength={20}
                    className={`${fieldClass} min-w-0 font-mono font-bold tracking-wider`}
                  />
                  <button
                    type="button"
                    onClick={onRegenerateCode}
                    className="inline-flex h-[42px] w-10 shrink-0 items-center justify-center rounded-lg border border-outline-variant/40 bg-white text-primary"
                    title="Tạo mã ngẫu nhiên"
                  >
                    <MaterialIcon name="casino" className="text-lg" />
                  </button>
                </div>
              </label>
              <label className="block min-w-0">
                <span className={labelClass}>
                  Tên SP <span className="text-primary">*</span>
                </span>
                <input
                  required
                  value={values.name}
                  onChange={(e) => onChange('name', e.target.value)}
                  placeholder="Tên sản phẩm"
                  className={fieldClass}
                />
              </label>
            </div>
            <label className="block">
              <span className={labelClass}>Mô tả</span>
              <RichTextEditor
                value={values.description}
                onChange={(next) => onChange('description', next)}
                placeholder="Mô tả hoa, ý nghĩa, kích thước..."
                minHeightClass="min-h-[100px]"
              />
            </label>
          </div>
        </div>

        <div className="border-b border-outline-variant/20 p-2.5">{categoryField}</div>

        <div className="p-2.5">
          <h3 className={sectionTitleClass}>Màu hoa & ảnh</h3>
          <p className="mt-1 text-[11px] text-on-surface-variant">Mỗi màu tối đa 3 ảnh</p>
          <div className="mt-1.5">
            <ProductColorsField
              colors={values.colors || []}
              onChange={(nextColors, nextImages) => {
                onChange('colors', nextColors)
                onChange('images', nextImages)
              }}
              onRemoveCloudImage={onRemoveCloudImage}
              disabled={false}
              compact
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-2.5">
        <h3 className={sectionTitleClass}>Giá & bán</h3>
        <div className="mt-1.5 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            {[
              ['costPrice', 'Giá cost', '0'],
              ['sellPrice', 'Giá bán', '0'],
              ['otherCost', 'Chi phí khác', '0'],
              ['soldCount', 'Doanh số', '0'],
            ].map(([field, label, placeholder]) => (
              <label key={field} className="block">
                <span className={labelClass}>{label}</span>
                {field === 'soldCount' ? (
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={
                      values.soldCount === '' || values.soldCount == null
                        ? ''
                        : String(values.soldCount)
                    }
                    onChange={(e) => onChange(field, parseMoneyInput(e.target.value))}
                    placeholder={placeholder}
                    className={`${fieldClass} tabular-nums`}
                  />
                ) : (
                  <MoneyInput
                    value={values[field]}
                    onChange={(next) => onChange(field, next)}
                    placeholder={placeholder}
                    className={fieldClass}
                  />
                )}
              </label>
            ))}
          </div>
          <label className="flex items-center gap-2.5 text-sm text-on-surface">
            <input
              type="checkbox"
              className="accent-primary"
              checked={values.active}
              onChange={(e) => onChange('active', e.target.checked)}
            />
            Đang bán
          </label>
        </div>
      </section>

      {formError ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
          {formError}
        </p>
      ) : null}
    </>
  )

  const formBody = (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className={labelClass}>Mã SP</span>
          <div className="flex gap-1.5">
            <input
              value={values.code}
              onChange={(e) => onChange('code', normalizeCodeInput(e.target.value))}
              placeholder="Nhập mã hoặc bấm Random"
              maxLength={20}
              className={`${fieldClass} font-mono font-bold tracking-wider text-on-surface`}
            />
            <button
              type="button"
              onClick={onRegenerateCode}
              className="inline-flex shrink-0 items-center justify-center gap-1 rounded-xl border border-outline-variant/40 bg-white px-3 text-sm font-medium text-primary hover:bg-surface-container-low"
              title="Tạo mã ngẫu nhiên"
            >
              <MaterialIcon name="casino" className="text-lg" />
              <span className="hidden sm:inline">Random</span>
            </button>
          </div>
        </label>
        <label className="block text-sm">
          <span className={labelClass}>Tên sản phẩm</span>
          <input
            required
            value={values.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="VD: Bó hồng đỏ Valentine"
            className={fieldClass}
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className={labelClass}>Mô tả sản phẩm</span>
        <RichTextEditor
          value={values.description}
          onChange={(next) => onChange('description', next)}
          placeholder="Mô tả hoa, ý nghĩa, kích thước, dịp phù hợp..."
          minHeightClass="min-h-[140px]"
        />
      </label>

      {categoryField}

      <ProductColorsField
        colors={values.colors || []}
        onChange={(nextColors, nextImages) => {
          onChange('colors', nextColors)
          onChange('images', nextImages)
        }}
        onRemoveCloudImage={onRemoveCloudImage}
        disabled={false}
      />

      <div className="grid grid-cols-2 gap-3">
        {[
          ['costPrice', 'Giá cost', '0'],
          ['sellPrice', 'Giá bán', '0'],
          ['otherCost', 'Chi phí khác', '0'],
          ['soldCount', 'Doanh số', '0'],
        ].map(([field, label, placeholder]) => (
          <label key={field} className="block text-sm">
            <span className={labelClass}>{label}</span>
            {field === 'soldCount' ? (
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={
                  values.soldCount === '' || values.soldCount == null
                    ? ''
                    : String(values.soldCount)
                }
                onChange={(e) => onChange(field, parseMoneyInput(e.target.value))}
                placeholder={placeholder}
                className={`${fieldClass} tabular-nums`}
              />
            ) : (
              <MoneyInput
                value={values[field]}
                onChange={(next) => onChange(field, next)}
                placeholder={placeholder}
                className={fieldClass}
              />
            )}
          </label>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm text-on-surface">
        <input
          type="checkbox"
          checked={values.active}
          onChange={(e) => onChange('active', e.target.checked)}
        />
        Đang bán
      </label>

      {formError ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
          {formError}
        </p>
      ) : null}
    </>
  )

  const formActions = (
    <>
      <button
        type="submit"
        className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-container"
      >
        Lưu
      </button>
      <button
        type="button"
        onClick={onClose}
        className="rounded-xl border border-outline-variant/25 px-4 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container"
      >
        Hủy
      </button>
      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 sm:ml-auto"
        >
          Xóa sản phẩm
        </button>
      ) : null}
    </>
  )

  const selectedCategoryLabels = categoryOptions
    .filter((category) => (values.categoryIds || []).includes(category.id))
    .map((category) => category.name)

  const readValueClass =
    'mt-1 min-h-[42px] rounded-lg border border-transparent bg-surface-container-low/60 px-3 py-2.5 text-[15px] text-on-surface'

  const formBodyEmbedded = (
    <div className="flex w-full flex-col gap-5 lg:flex-row lg:items-start lg:gap-6 xl:gap-8">
      <section className="w-fit max-w-full shrink-0 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 sm:p-5">
        <div className="w-[calc(3*7rem+2*0.5rem)] max-w-full sm:w-[calc(3*8rem+2*0.5rem)]">
          <h3 className={sectionTitleClass}>Màu hoa & ảnh</h3>
          {!readOnly ? (
            <p className="mt-1 text-xs text-on-surface-variant">
              Mỗi màu tối đa 3 ảnh · ảnh đầu của màu đầu là ảnh chính
            </p>
          ) : null}
        </div>
        <div className="mt-3">
          <ProductColorsField
              colors={values.colors || []}
              onChange={(nextColors, nextImages) => {
                onChange('colors', nextColors)
                onChange('images', nextImages)
              }}
              onRemoveCloudImage={onRemoveCloudImage}
              disabled={readOnly}
              readOnly={readOnly}
            />
        </div>
      </section>

      <div className="min-w-0 flex-1 space-y-4">
        <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 sm:p-5">
          <h3 className={sectionTitleClass}>Thông tin</h3>
          <div className="mt-3 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="min-w-0">
                <span className={labelClass}>Mã SP</span>
                {readOnly ? (
                  <p className={`${readValueClass} font-mono font-bold tracking-wider`}>
                    {values.code || '—'}
                  </p>
                ) : (
                  <div className="flex gap-1.5">
                    <input
                      value={values.code}
                      onChange={(e) => onChange('code', normalizeCodeInput(e.target.value))}
                      placeholder="Mã"
                      maxLength={20}
                      className={`${fieldClass} min-w-0 font-mono font-bold tracking-wider`}
                    />
                    <button
                      type="button"
                      onClick={onRegenerateCode}
                      className="inline-flex h-[42px] w-10 shrink-0 items-center justify-center rounded-lg border border-outline-variant/40 bg-white text-primary"
                      title="Tạo mã ngẫu nhiên"
                    >
                      <MaterialIcon name="casino" className="text-lg" />
                    </button>
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <span className={labelClass}>
                  Tên SP {!readOnly ? <span className="text-primary">*</span> : null}
                </span>
                {readOnly ? (
                  <p className={readValueClass}>{values.name || '—'}</p>
                ) : (
                  <input
                    required
                    value={values.name}
                    onChange={(e) => onChange('name', e.target.value)}
                    placeholder="Tên sản phẩm"
                    className={fieldClass}
                  />
                )}
              </div>
            </div>
            <div>
              <span className={labelClass}>Mô tả</span>
              {readOnly ? (
                values.description?.trim() ? (
                  <div className={`${readValueClass} min-h-[120px]`}>
                    <RichTextContent html={values.description} />
                  </div>
                ) : (
                  <p className={`${readValueClass} min-h-[120px]`}>—</p>
                )
              ) : (
                <RichTextEditor
                  value={values.description}
                  onChange={(next) => onChange('description', next)}
                  placeholder="Mô tả hoa, ý nghĩa, kích thước..."
                  minHeightClass="min-h-[120px]"
                />
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 sm:p-5">
          {readOnly ? (
            <div>
              <h3 className={sectionTitleClass}>Danh mục</h3>
              {selectedCategoryLabels.length ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {selectedCategoryLabels.map((name) => (
                    <span
                      key={name}
                      className="rounded-lg bg-surface-container-low px-2.5 py-1 text-xs font-medium text-on-surface"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-on-surface-variant">Chưa gán danh mục</p>
              )}
            </div>
          ) : (
            categoryField
          )}
        </section>

        <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 sm:p-5">
          <h3 className={sectionTitleClass}>Giá & bán</h3>
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['costPrice', 'Giá cost', '0'],
                ['sellPrice', 'Giá bán', '0'],
                ['otherCost', 'Chi phí khác', '0'],
                ['soldCount', 'Doanh số', '0'],
              ].map(([field, label, placeholder]) => (
                <div key={field} className="min-w-0">
                  <span className={labelClass}>{label}</span>
                  {readOnly ? (
                    <p className={`${readValueClass} tabular-nums`}>
                      {field === 'soldCount'
                        ? String(values.soldCount ?? 0)
                        : formatMoney(values[field])}
                    </p>
                  ) : field === 'soldCount' ? (
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={
                        values.soldCount === '' || values.soldCount == null
                          ? ''
                          : String(values.soldCount)
                      }
                      onChange={(e) => onChange(field, parseMoneyInput(e.target.value))}
                      placeholder={placeholder}
                      className={`${fieldClass} tabular-nums`}
                    />
                  ) : (
                    <MoneyInput
                      value={values[field]}
                      onChange={(next) => onChange(field, next)}
                      placeholder={placeholder}
                      className={fieldClass}
                    />
                  )}
                </div>
              ))}
            </div>
            {readOnly ? (
              <p className="text-sm text-on-surface">
                Trạng thái:{' '}
                <span
                  className={
                    values.active
                      ? 'font-medium text-emerald-700'
                      : 'font-medium text-on-surface-variant'
                  }
                >
                  {values.active ? 'Đang bán' : 'Đã ẩn'}
                </span>
              </p>
            ) : (
              <label className="flex items-center gap-2.5 text-sm text-on-surface">
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={values.active}
                  onChange={(e) => onChange('active', e.target.checked)}
                />
                Đang bán
              </label>
            )}
          </div>
        </section>

        {!readOnly && formError ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
            {formError}
          </p>
        ) : null}
      </div>
    </div>
  )

  if (isEmbedded) {
    if (!open) return null
    if (readOnly) {
      return <div className="w-full">{formBodyEmbedded}</div>
    }
    return (
      <form id={formId} onSubmit={onSubmit} className="w-full">
        {formBodyEmbedded}
      </form>
    )
  }

  if (isPage) {
    if (!open) return null
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
        <header className="flex shrink-0 items-center gap-2 border-b border-outline-variant/25 bg-surface-container-lowest px-3 py-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low"
            aria-label="Quay lại"
          >
            <MaterialIcon name="arrow_back" className="text-xl" />
          </button>
          <h2
            id="product-form-page-title"
            className="min-w-0 flex-1 truncate font-display text-base text-primary"
          >
            {title}
          </h2>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch]">
          <form id={formId} onSubmit={onSubmit} className="space-y-2.5 px-2.5 py-2.5 pb-4">
            {formBodyPage}
          </form>
        </div>

        <AdminMobileFormActions className="px-3 pt-2">
          <div className="grid grid-cols-2 gap-2">
            {onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-xl border border-red-200/80 bg-red-50/50 px-4 py-3 text-sm font-medium text-red-600 transition active:bg-red-50"
              >
                Xóa
              </button>
            ) : (
              <span />
            )}
            <button
              type="submit"
              form={formId}
              className={[
                'rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(74,48,32,0.22)] transition active:bg-primary-container',
                onDelete ? '' : 'col-span-2',
              ].join(' ')}
            >
              Lưu
            </button>
          </div>
        </AdminMobileFormActions>
      </div>
    )
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4"
          {...overlayFade}
        >
          <button
            type="button"
            className="absolute inset-0 bg-on-surface/50"
            aria-label="Đóng"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-form-title"
            className="relative z-10 flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-surface-container-lowest shadow-2xl sm:rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-surface-container px-4 py-4 sm:px-6">
              <div>
                <h3 id="product-form-title" className="text-lg font-semibold text-on-surface">
                  {title}
                </h3>
                <p className="mt-1 hidden text-sm text-on-surface-variant lg:block">
                  Thông tin sẽ được lưu khi bạn bấm Lưu.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-outline transition hover:bg-surface-container hover:text-on-surface-variant"
                aria-label="Đóng"
              >
                <MaterialIcon name="close" className="text-xl" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
              <div
                data-scroll-lock-scrollable
                className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6"
              >
                {formBody}
              </div>

              <div className="flex shrink-0 flex-wrap gap-2 border-t border-surface-container px-4 py-4 sm:px-6">
                {formActions}
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export {
  EMPTY_FORM,
  generateProductCode,
  prepareColorsPayload,
  prepareImagesPayload,
  revokeFormMedia,
  revokeLocalPreviews,
  toForm,
}

export default ProductFormDialog
