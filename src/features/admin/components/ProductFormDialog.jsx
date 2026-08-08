import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { overlayFade } from '../../../lib/motion'
import { uploadImagesApi } from '../../../api/uploadsApi'
import { useScrollLock } from '../../../hooks/useScrollLock'
import { cloudinaryUrl } from '../../../utils/cloudinaryUrl'
import { createId } from '../../../utils/id'
import { resizeImageFile, resizeImageFiles } from '../../../utils/resizeImage'

const EMPTY_FORM = {
  code: '',
  name: '',
  materials: '',
  description: '',
  images: [],
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
  const images = Array.isArray(product.images)
    ? product.images.map((image) => ({
        id: image.id,
        url: image.url,
        publicId: image.publicId || '',
        isMain: Boolean(image.isMain),
      }))
    : []

  const sortedImages = [...images].sort((a, b) => Number(b.isMain) - Number(a.isMain))

  return {
    code: product.code || '',
    name: product.name || '',
    materials: product.materials || '',
    description: product.description || '',
    images: withMainFirst(sortedImages),
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

function ProductImagesField({ images, onChange, disabled, onRemoveCloudImage }) {
  const inputId = `product-images-${useId().replace(/:/g, '')}`
  const listRef = useRef(null)
  const imagesRef = useRef(images)
  const dragIdRef = useRef(null)
  const [draggingId, setDraggingId] = useState(null)
  const [overId, setOverId] = useState(null)
  const [limitMessage, setLimitMessage] = useState('')
  const [isPicking, setIsPicking] = useState(false)
  const maxImages = 6
  const remainingSlots = Math.max(0, maxImages - images.length)
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

    const slots = Math.max(0, maxImages - imagesRef.current.length)
    if (slots <= 0) {
      setLimitMessage('Chỉ được tải tối đa 6 hình ảnh.')
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
        setLimitMessage(`Chỉ thêm được ${accepted.length} ảnh nữa (tối đa 6).`)
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
    <div className="space-y-3" ref={listRef}>
      {pickerInput}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-on-surface">Hình ảnh sản phẩm</p>
        </div>
        <label
          htmlFor={canAddMore ? inputId : undefined}
          aria-disabled={!canAddMore}
          aria-label={isPicking ? 'Đang thêm ảnh' : `Thêm ảnh (${images.length}/6)`}
          title={isPicking ? 'Đang thêm ảnh' : `Thêm ảnh (${images.length}/6)`}
          className={[
            'inline-flex cursor-pointer items-center gap-1 rounded-xl border border-outline-variant/40 bg-white px-3 py-2 text-sm font-medium text-primary',
            canAddMore ? 'hover:bg-surface-container-low' : 'pointer-events-none opacity-60',
          ].join(' ')}
        >
          <MaterialIcon name="add_photo_alternate" className="text-lg" />
          {isPicking ? '...' : `(${images.length}/6)`}
        </label>
      </div>

      {limitMessage ? (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800" role="status">
          {limitMessage}
        </p>
      ) : null}

      {images.length === 0 ? (
        <label
          htmlFor={canAddMore ? inputId : undefined}
          aria-disabled={!canAddMore}
          className={[
            'flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-outline-variant/40 bg-white px-4 py-8 text-sm text-on-surface-variant',
            canAddMore ? 'hover:bg-surface-container-low' : 'pointer-events-none opacity-60',
          ].join(' ')}
        >
          <MaterialIcon name="imagesmode" className="text-3xl text-primary-fixed-dim" />
          {isPicking ? 'Đang xử lý ảnh...' : 'Chọn ảnh từ thư viện (tối đa 6)'}
        </label>
      ) : (
        <ul className="grid grid-cols-3 gap-2 sm:gap-3">
          {images.map((image, index) => {
            const isMain = index === 0
            const isDragging = draggingId === image.id
            const isOver = overId === image.id && draggingId && draggingId !== image.id

            return (
              <li
                key={image.id}
                draggable={!disabled}
                onDragStart={(event) => handleDragStart(event, image)}
                onDragOver={(event) => handleDragOver(event, image)}
                onDragLeave={() => handleDragLeave(image)}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                className={[
                  'relative aspect-square overflow-hidden rounded-xl border-2 bg-white transition-all duration-200 ease-out',
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
                    <span className="rounded-full border border-white/50 bg-white/35 px-1.5 py-0.5 text-[8px] font-bold tracking-[0.12em] text-emerald-800 uppercase shadow-sm backdrop-blur-md sm:px-3 sm:py-1.5 sm:text-[11px] sm:tracking-[0.16em]">
                      Main
                    </span>
                  </span>
                ) : null}

                <button
                  type="button"
                  disabled={disabled || isPicking}
                  onClick={() => removeImage(image)}
                  onMouseDown={(event) => event.stopPropagation()}
                  onPointerDown={(event) => event.stopPropagation()}
                  className="absolute top-0 right-0 z-10 flex h-9 w-9 items-start justify-end p-0.5 sm:top-2 sm:right-2 sm:h-7 sm:w-7 sm:items-center sm:justify-center sm:p-0"
                  aria-label="Xóa ảnh"
                  title="Xóa ảnh"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/50 bg-black/40 text-white backdrop-blur-md transition hover:bg-red-500/90 sm:h-7 sm:w-7">
                    <MaterialIcon name="close" className="text-sm sm:text-base" />
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
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
  /** `dialog` = bottom sheet/modal (desktop). `page` = màn hình edit full (mobile). */
  mode = 'dialog',
}) {
  const isPage = mode === 'page'
  useScrollLock(!isPage && open)
  const selectedIds = Array.isArray(values.categoryIds) ? values.categoryIds : []
  const [quickCategoryOpen, setQuickCategoryOpen] = useState(false)
  const [quickCategoryName, setQuickCategoryName] = useState('')
  const [quickCategoryBusy, setQuickCategoryBusy] = useState(false)
  const [quickCategoryError, setQuickCategoryError] = useState('')
  const quickCategoryRef = useRef(null)

  useEffect(() => {
    if (!open) {
      setQuickCategoryOpen(false)
      setQuickCategoryName('')
      setQuickCategoryError('')
      setQuickCategoryBusy(false)
    }
  }, [open])

  useEffect(() => {
    if (!quickCategoryOpen) return undefined
    const timer = window.setTimeout(() => quickCategoryRef.current?.focus(), 40)
    return () => window.clearTimeout(timer)
  }, [quickCategoryOpen])

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

  const formBody = (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-on-surface">Mã SP</span>
          <div className="flex gap-2">
            <input
              value={values.code}
              onChange={(e) => onChange('code', normalizeCodeInput(e.target.value))}
              placeholder="Nhập mã hoặc bấm Random"
              maxLength={20}
              className={`${inputClass} font-mono font-bold tracking-wider text-on-surface`}
            />
            <button
              type="button"
              onClick={onRegenerateCode}
              className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-outline-variant/40 bg-white px-3 text-sm font-medium text-primary hover:bg-surface-container-low"
              title="Tạo mã ngẫu nhiên"
            >
              <MaterialIcon name="casino" className="text-lg" />
              <span className="hidden sm:inline">Random</span>
            </button>
          </div>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-on-surface">Tên sản phẩm</span>
          <input
            required
            value={values.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="VD: Bó hồng đỏ Valentine"
            className={inputClass}
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-on-surface">Mô tả sản phẩm</span>
        <textarea
          rows={4}
          value={values.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Mô tả hoa, ý nghĩa, kích thước, dịp phù hợp..."
          className={inputClass}
        />
      </label>

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

      <ProductImagesField
        images={values.images || []}
        onChange={(next) => onChange('images', next)}
        onRemoveCloudImage={onRemoveCloudImage}
        disabled={false}
      />

      <div className="grid grid-cols-2 gap-3">
        {[
          ['costPrice', 'Giá cost', 'Giá vốn'],
          ['sellPrice', 'Giá bán', 'Giá bán cho khách'],
          ['otherCost', 'Chi phí khác', 'Ship, phụ kiện…'],
          ['soldCount', 'Doanh số', 'Số đã bán'],
        ].map(([field, label, placeholder]) => (
          <label key={field} className="block text-sm">
            <span className="mb-1 block font-medium text-on-surface">{label}</span>
            <input
              type="number"
              min="0"
              step={field === 'soldCount' ? '1' : undefined}
              value={values[field]}
              onChange={(e) => onChange(field, e.target.value)}
              placeholder={placeholder}
              className={inputClass}
            />
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

  if (isPage) {
    if (!open) return null
    return (
      <div className="flex h-full min-h-0 flex-col bg-background">
        <header className="flex shrink-0 items-center gap-2 border-b border-outline-variant/20 bg-surface-container-lowest/95 px-3 py-2.5 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur-xl">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container"
            aria-label="Quay lại"
          >
            <MaterialIcon name="arrow_back" className="text-xl" />
          </button>
          <div className="min-w-0 flex-1">
            <h2
              id="product-form-page-title"
              className="font-display truncate text-lg text-primary"
            >
              {title}
            </h2>
          </div>
        </header>

        <div
          data-scroll-lock-scrollable
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch]"
        >
          <form id="product-form-page" onSubmit={onSubmit} className="space-y-4 px-4 py-4">
            {formBody}
          </form>
        </div>

        <div className="shrink-0 border-t border-outline-variant/20 bg-surface-container-lowest/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
          <div className="mx-auto grid w-full max-w-lg grid-cols-2 gap-2">
            {onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-xl border border-red-200/80 bg-red-50/50 px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                Xóa
              </button>
            ) : (
              <span />
            )}
            <button
              type="submit"
              form="product-form-page"
              className={[
                'rounded-xl bg-primary px-3 py-3 text-sm font-semibold text-white transition hover:bg-primary-container',
                onDelete ? '' : 'col-span-2',
              ].join(' ')}
            >
              Lưu
            </button>
          </div>
        </div>
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
            className="relative z-10 flex max-h-[min(92dvh,var(--app-vvh,92dvh))] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-surface-container-lowest shadow-2xl sm:rounded-2xl"
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
  prepareImagesPayload,
  revokeLocalPreviews,
  toForm,
}

export default ProductFormDialog
