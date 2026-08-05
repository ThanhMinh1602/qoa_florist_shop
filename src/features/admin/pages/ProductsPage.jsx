import { useCallback, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { overlayFade, sheetEnter } from '../../../lib/motion'
import LoadingOverlay from '../../../components/common/LoadingOverlay'
import {
  activateProductApi,
  bulkDeleteProductsApi,
  createProductApi,
  deactivateProductApi,
  deleteProductApi,
  updateProductApi,
} from '../../../api/productsApi'
import { deleteUploadedImageApi, uploadImagesApi } from '../../../api/uploadsApi'
import { useDialog } from '../../../context/DialogContext'
import { useAdminCategories, useProducts } from '../../../hooks/swr'
import { formatMoney } from '../../../utils/money'
import { resizeImageFiles } from '../../../utils/resizeImage'
import { useIsLgUp } from '../../../hooks/useMediaQuery'

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
  active: true,
}

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'

/** Mã SP: 8 chữ cái in hoa */
function generateProductCode(length = 8) {
  const chars = CODE_CHARS
  let code = ''
  const values = crypto.getRandomValues(new Uint8Array(length))
  for (let i = 0; i < length; i += 1) {
    code += chars[values[i] % chars.length]
  }
  return code
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
  'w-full rounded-xl border border-outline-variant/25 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20'

const actionBtnClass =
  'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/55 bg-white/40 text-xs font-semibold backdrop-blur-md transition hover:bg-white/70 hover:shadow-sm disabled:opacity-50'

function ProductActionButtons({ product, disabled, onEdit, onToggleActive, onDelete }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onEdit(product)}
        className={`${actionBtnClass} text-primary`}
        title="Sửa"
        aria-label="Sửa"
      >
        <MaterialIcon name="edit" className="text-base" />
      </button>

      {product.active ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onToggleActive(product, false)}
          className={`${actionBtnClass} text-on-surface-variant`}
          title="Ngừng bán"
          aria-label="Ngừng bán"
        >
          <MaterialIcon name="visibility_off" className="text-base" />
        </button>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onToggleActive(product, true)}
          className={`${actionBtnClass} text-emerald-700`}
          title="Bán lại"
          aria-label="Bán lại"
        >
          <MaterialIcon name="visibility" className="text-base" />
        </button>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => onDelete(product)}
        className={`${actionBtnClass} text-red-600 hover:border-red-200 hover:bg-red-50/70`}
        title="Xóa"
        aria-label="Xóa"
      >
        <MaterialIcon name="delete" className="text-base" />
      </button>
    </div>
  )
}

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
    active: product.active !== false,
  }
}

function ProductImagesField({ images, onChange, disabled, onRemoveCloudImage }) {
  const inputRef = useRef(null)
  const dragIdRef = useRef(null)
  const [draggingId, setDraggingId] = useState(null)
  const [overId, setOverId] = useState(null)
  const [limitMessage, setLimitMessage] = useState('')
  const maxImages = 6
  const remainingSlots = Math.max(0, maxImages - images.length)
  const canAddMore = remainingSlots > 0 && !disabled

  function handleFilesSelected(event) {
    const files = Array.from(event.target.files || []).filter((file) =>
      file.type.startsWith('image/'),
    )
    event.target.value = ''
    if (files.length === 0) return

    if (remainingSlots <= 0) {
      setLimitMessage('Chỉ được tải tối đa 6 hình ảnh.')
      return
    }

    const accepted = files.slice(0, remainingSlots)
    const next = [...images]
    for (const file of accepted) {
      next.push({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(file),
        publicId: '',
        isMain: false,
        file,
      })
    }
    onChange(withMainFirst(next))

    if (files.length > accepted.length) {
      setLimitMessage(`Chỉ thêm được ${accepted.length} ảnh nữa (tối đa 6).`)
    } else {
      setLimitMessage('')
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
    // Ghost nhẹ hơn
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

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-on-surface">Hình ảnh sản phẩm</p>
          <p className="text-xs text-outline">
            Ảnh đầu tiên là ảnh chính · kéo thả để sắp xếp · tối đa 6 ảnh
          </p>
        </div>
        <button
          type="button"
          disabled={!canAddMore}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1 rounded-xl border border-outline-variant/40 px-3 py-2 text-sm font-medium text-primary hover:bg-surface-container-low disabled:opacity-60"
        >
          <MaterialIcon name="add_photo_alternate" className="text-lg" />
          Thêm ảnh ({images.length}/6)
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFilesSelected}
        />
      </div>

      {limitMessage ? (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800" role="status">
          {limitMessage}
        </p>
      ) : null}

      {images.length === 0 ? (
        <button
          type="button"
          disabled={!canAddMore}
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-low/70 px-4 py-8 text-sm text-on-surface-variant hover:bg-surface-container-low disabled:opacity-60"
        >
          <MaterialIcon name="imagesmode" className="text-3xl text-primary-fixed-dim" />
          Chọn ảnh từ máy (tối đa 6)
        </button>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
                  'relative aspect-square touch-none overflow-hidden rounded-xl border-2 bg-surface-container-low transition-all duration-200 ease-out',
                  disabled ? 'cursor-default' : 'cursor-grab active:cursor-grabbing',
                  isMain
                    ? 'border-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]'
                    : 'border-outline-variant/25',
                  isDragging ? 'scale-[0.96] opacity-40 shadow-none' : 'scale-100',
                  isOver ? 'translate-y-0.5 border-primary/50 shadow-[0_10px_28px_rgba(74,48,32,0.16)]' : '',
                ].join(' ')}
              >
                <img
                  src={image.url}
                  alt=""
                  className="pointer-events-none h-full w-full object-cover"
                  draggable={false}
                />

                {isMain ? (
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="rounded-full border border-white/50 bg-white/35 px-3 py-1.5 text-[11px] font-bold tracking-[0.16em] text-emerald-800 uppercase shadow-sm backdrop-blur-md">
                      Main
                    </span>
                  </span>
                ) : null}

                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => removeImage(image)}
                  onMouseDown={(event) => event.stopPropagation()}
                  onPointerDown={(event) => event.stopPropagation()}
                  className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/50 bg-black/35 text-white backdrop-blur-md transition hover:bg-red-500/90 disabled:opacity-60"
                  aria-label="Xóa ảnh"
                  title="Xóa ảnh"
                >
                  <MaterialIcon name="close" className="text-base" />
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
  categoryOptions = [],
  isEditing,
  formError,
  title,
}) {
  const selectedIds = Array.isArray(values.categoryIds) ? values.categoryIds : []

  function toggleCategory(categoryId) {
    const next = selectedIds.includes(categoryId)
      ? selectedIds.filter((id) => id !== categoryId)
      : [...selectedIds, categoryId]
    onChange('categoryIds', next)
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
        {...sheetEnter}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-surface-container px-4 py-4 sm:px-6">
          <div>
            <h3 id="product-form-title" className="text-lg font-semibold text-on-surface">
              {title}
            </h3>
            <p className="mt-1 text-sm text-on-surface-variant">Thông tin sẽ được lưu khi bạn bấm Lưu.</p>
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
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-on-surface">Mã SP</span>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={values.code}
                    className={`${inputClass} font-mono font-bold tracking-wider text-on-surface bg-surface-container-low`}
                  />
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={onRegenerateCode}
                      className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-outline-variant/40 px-3 text-sm font-medium text-primary hover:bg-surface-container-low"
                      title="Tạo mã mới"
                    >
                      <MaterialIcon name="refresh" className="text-lg" />
                    </button>
                  ) : null}
                </div>
                <span className="mt-1 block text-xs text-outline">
                  {isEditing
                    ? 'Mã đã tạo — không đổi khi sửa.'
                    : 'Tự sinh 8 chữ in hoa.'}
                </span>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-on-surface">Tên sản phẩm</span>
                <input
                  required
                  value={values.name}
                  onChange={(e) => onChange('name', e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-on-surface">Nguyên liệu</span>
              <textarea
                rows={2}
                value={values.materials}
                onChange={(e) => onChange('materials', e.target.value)}
                placeholder="Ví dụ: 50 bông, giấy gói, ruy băng..."
                className={inputClass}
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-on-surface">Mô tả sản phẩm</span>
              <textarea
                rows={4}
                value={values.description}
                onChange={(e) => onChange('description', e.target.value)}
                placeholder={'Hỗ trợ Markdown, ví dụ:\n**In đậm**, *in nghiêng*\n- Mục 1\n- Mục 2'}
                className={inputClass}
              />
              <span className="mt-1 block text-xs text-outline">
                Hỗ trợ Markdown (in đậm, list, link…) — hiển thị đẹp trên trang chi tiết.
              </span>
            </label>

            <div>
              <p className="mb-2 text-sm font-medium text-on-surface">Danh mục</p>
              {categoryOptions.length === 0 ? (
                <p className="mt-1 text-xs text-outline">Chưa có danh mục — thêm ở tab Danh mục.</p>
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
                            : 'border-outline-variant/30 text-on-surface-variant hover:border-primary/25',
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

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['costPrice', 'Giá cost'],
                ['makeMinutes', 'Thời gian làm (phút)'],
                ['listPrice', 'Giá bán (lãi 70%)'],
                ['sellPrice', 'Giá chốt'],
                ['otherCost', 'Chi phí khác'],
              ].map(([field, label]) => (
                <label key={field} className="block text-sm">
                  <span className="mb-1 block font-medium text-on-surface">{label}</span>
                  <input
                    type="number"
                    min="0"
                    value={values[field]}
                    onChange={(e) => {
                      const next = e.target.value
                      if (field === 'costPrice') {
                        onChange('costPrice', next)
                        if (!values.listPrice) {
                          onChange(
                            'listPrice',
                            String(Math.round((Number(next) || 0) * 1.7)),
                          )
                        }
                      } else {
                        onChange(field, next)
                      }
                    }}
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
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 border-t border-surface-container px-4 py-4 sm:px-6">
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
          </div>
        </form>
      </motion.div>
    </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function ProductThumb({ product }) {
  const src = product.mainImage || product.images?.find((image) => image.isMain)?.url || product.images?.[0]?.url
  if (!src) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-low text-primary-fixed-dim">
        <MaterialIcon name="image" className="text-lg" />
      </div>
    )
  }
  return <img src={src} alt="" className="h-10 w-10 rounded-lg object-cover" />
}

function ProductsPage() {
  const { alert, confirm } = useDialog()
  const {
    products,
    isLoading,
    error: productsError,
    mutate: mutateProducts,
  } = useProducts()
  const { categories } = useAdminCategories()
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [isBusy, setIsBusy] = useState(false)
  const [busyMessage, setBusyMessage] = useState('Đang xử lý...')
  const [formError, setFormError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const isLgUp = useIsLgUp()
  const removedPublicIdsRef = useRef([])
  const error = productsError?.message || ''

  const load = useCallback(async () => {
    await mutateProducts()
  }, [mutateProducts])

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return products
    return products.filter((item) =>
      [item.code, item.name, item.description, item.materials, ...(item.categories || []).map((c) => c.name)]
        .join(' ')
        .toLowerCase()
        .includes(keyword),
    )
  }, [products, search])

  const filteredIds = useMemo(() => filtered.map((item) => item.id), [filtered])
  const allFilteredSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selectedIds.includes(id))
  const selectedCount = selectedIds.length

  function toggleSelect(id) {
    setSelectedIds((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id],
    )
  }

  function toggleSelectAllFiltered() {
    setSelectedIds((previous) => {
      if (allFilteredSelected) {
        return previous.filter((id) => !filteredIds.includes(id))
      }
      return [...new Set([...previous, ...filteredIds])]
    })
  }

  function clearSelection() {
    setSelectedIds([])
  }

  function dismissFormUi() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError('')
  }

  function closeForm() {
    revokeLocalPreviews(form.images)
    removedPublicIdsRef.current = []
    dismissFormUi()
  }

  function handleChange(field, value) {
    setFormError('')
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  function queueRemovedCloudImage(publicId) {
    if (!publicId) return
    if (!removedPublicIdsRef.current.includes(publicId)) {
      removedPublicIdsRef.current.push(publicId)
    }
  }

  function openCreate() {
    if (isBusy) return
    revokeLocalPreviews(form.images)
    removedPublicIdsRef.current = []
    setEditingId(null)
    setForm({ ...EMPTY_FORM, images: [], code: generateProductCode() })
    setFormError('')
    setShowForm(true)
  }

  function openEdit(product) {
    if (isBusy) return
    revokeLocalPreviews(form.images)
    removedPublicIdsRef.current = []
    setEditingId(product.id)
    setForm(toForm(product))
    setFormError('')
    setShowForm(true)
  }

  function regenerateCode() {
    setForm((previous) => ({ ...previous, code: generateProductCode() }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (isBusy) return

    const wasEdit = Boolean(editingId)
    const productId = editingId
    const snapshot = {
      ...form,
      images: [...(form.images || [])],
    }
    const toDelete = [...removedPublicIdsRef.current]
    removedPublicIdsRef.current = []

    // Đóng modal trước — resize/upload chạy lúc loading
    dismissFormUi()
    setBusyMessage(wasEdit ? 'Đang cập nhật sản phẩm...' : 'Đang thêm sản phẩm...')
    setIsBusy(true)
    // Cho overlay Lottie mount + paint trước khi resize chặn main thread
    await new Promise((resolve) => setTimeout(resolve, 80))

    try {
      const images = await prepareImagesPayload(snapshot.images)
      const payload = {
        ...snapshot,
        images,
        categoryIds: Array.isArray(snapshot.categoryIds) ? snapshot.categoryIds : [],
        costPrice: Number(snapshot.costPrice) || 0,
        makeMinutes: Number(snapshot.makeMinutes) || 0,
        listPrice: Number(snapshot.listPrice) || 0,
        sellPrice: Number(snapshot.sellPrice) || 0,
        otherCost: Number(snapshot.otherCost) || 0,
      }

      if (productId) {
        await updateProductApi(productId, payload)
      } else {
        await createProductApi(payload)
      }

      await Promise.all(
        toDelete.map((publicId) => deleteUploadedImageApi(publicId).catch(() => null)),
      )
      await load()
      setIsBusy(false)
      await alert({
        title: wasEdit ? 'Đã cập nhật' : 'Đã thêm sản phẩm',
        message: wasEdit
          ? 'Thông tin sản phẩm đã được cập nhật.'
          : 'Sản phẩm mới đã được thêm.',
        variant: 'success',
      })
    } catch (err) {
      revokeLocalPreviews(snapshot.images)
      setIsBusy(false)
      await alert({
        title: wasEdit ? 'Không thể cập nhật' : 'Không thể thêm sản phẩm',
        message: err.message || 'Không thể lưu sản phẩm.',
        variant: 'error',
      })
    }
  }

  async function handleDeactivate(product) {
    if (isBusy) return
    const ok = await confirm({
      title: 'Ngừng bán sản phẩm',
      message: `Ngừng bán “${product.name}”? Sản phẩm vẫn còn trong danh sách, chỉ không hiện trên shop.`,
      confirmLabel: 'Ngừng bán',
      variant: 'danger',
    })
    if (!ok) return
    try {
      await deactivateProductApi(product.id)
      await load()
    } catch (err) {
      await alert({
        title: 'Không thể cập nhật',
        message: err.message || 'Không thể cập nhật.',
        variant: 'error',
      })
    }
  }

  async function handleActivate(product) {
    if (isBusy) return
    try {
      await activateProductApi(product.id)
      await load()
    } catch (err) {
      await alert({
        title: 'Không thể cập nhật',
        message: err.message || 'Không thể cập nhật.',
        variant: 'error',
      })
    }
  }

  async function handleDelete(product) {
    if (isBusy) return
    const ok = await confirm({
      title: 'Xóa sản phẩm',
      message: `Xóa hẳn “${product.name}”?\nThao tác này không hoàn tác được.`,
      confirmLabel: 'Xóa sản phẩm',
      variant: 'danger',
    })
    if (!ok) return

    if (editingId === product.id || showForm) {
      closeForm()
    }

    setBusyMessage('Đang xóa sản phẩm...')
    setIsBusy(true)
    await new Promise((resolve) => setTimeout(resolve, 80))
    try {
      await deleteProductApi(product.id)
      setSelectedIds((previous) => previous.filter((id) => id !== product.id))
      await load()
      setIsBusy(false)
      await alert({
        title: 'Đã xóa',
        message: `“${product.name}” đã được xóa.`,
        variant: 'success',
      })
    } catch (err) {
      setIsBusy(false)
      await alert({
        title: 'Không thể xóa',
        message: err.message || 'Không thể xóa.',
        variant: 'error',
      })
    }
  }

  async function handleBulkDelete() {
    if (isBusy || selectedIds.length === 0) return
    const ok = await confirm({
      title: 'Xóa nhiều sản phẩm',
      message: `Xóa hẳn ${selectedIds.length} sản phẩm đã chọn?\nThao tác này không hoàn tác được.`,
      confirmLabel: `Xóa ${selectedIds.length} sản phẩm`,
      variant: 'danger',
    })
    if (!ok) return

    if (editingId && selectedIds.includes(editingId)) {
      closeForm()
    }

    const ids = [...selectedIds]
    setBusyMessage(`Đang xóa ${ids.length} sản phẩm...`)
    setIsBusy(true)
    await new Promise((resolve) => setTimeout(resolve, 80))
    try {
      const result = await bulkDeleteProductsApi(ids)
      clearSelection()
      await load()
      setIsBusy(false)
      await alert({
        title: 'Đã xóa',
        message: result.message || `Đã xóa ${ids.length} sản phẩm.`,
        variant: 'success',
      })
    } catch (err) {
      setIsBusy(false)
      await alert({
        title: 'Không thể xóa',
        message: err.message || 'Không thể xóa.',
        variant: 'error',
      })
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 p-5 md:p-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl text-primary">Quản lý sản phẩm</h2>
            <p className="mt-1 text-sm text-on-surface-variant md:text-base">
              Tổng quan và tùy chỉnh bộ sưu tập hoa.
            </p>
          </div>
          <button type="button" onClick={openCreate} className="btn-primary inline-flex items-center gap-2">
            <MaterialIcon name="add" className="text-lg" />
            Thêm sản phẩm
          </button>
        </header>

        <div className="glass-card flex flex-col gap-3 rounded-xl p-4 md:flex-row md:items-center md:justify-between">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mã, tên, nguyên liệu, mô tả, danh mục..."
            className="input-glass w-full max-w-md"
          />
          {selectedCount > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-xl border border-white/55 bg-white/40 px-3 py-2 text-sm font-medium text-on-surface backdrop-blur-md">
                Đã chọn {selectedCount}
              </span>
              <button
                type="button"
                onClick={clearSelection}
                className="rounded-xl border border-white/55 bg-white/40 px-3 py-2 text-sm font-medium text-on-surface-variant backdrop-blur-md hover:bg-white/70"
              >
                Bỏ chọn
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200/80 bg-red-50/70 px-3 py-2 text-sm font-semibold text-red-600 backdrop-blur-md hover:bg-red-100/80"
              >
                <MaterialIcon name="delete" className="text-base" />
                Xóa đã chọn
              </button>
            </div>
          ) : null}
        </div>

        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        {isLoading ? (
          <p className="py-12 text-center text-sm text-on-surface-variant">Đang tải...</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-lowest px-6 py-16 text-center">
            <MaterialIcon name="inventory_2" className="text-4xl text-outline" />
            <p className="mt-3 text-sm font-medium text-on-surface">Chưa có sản phẩm</p>
          </div>
        ) : isLgUp ? (
          <div className="glass-card overflow-hidden rounded-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/55 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                  <tr>
                    <th className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="accent-primary"
                        checked={allFilteredSelected}
                        onChange={toggleSelectAllFiltered}
                        aria-label="Chọn tất cả"
                      />
                    </th>
                    <th className="px-4 py-3">Ảnh</th>
                    <th className="px-4 py-3">Mã</th>
                    <th className="px-4 py-3">Tên / Nguyên liệu</th>
                    <th className="px-4 py-3">Danh mục</th>
                    <th className="px-4 py-3">Giá vốn</th>
                    <th className="px-4 py-3">Giá chốt</th>
                    <th className="px-4 py-3">Lợi nhuận</th>
                    <th className="px-4 py-3">Thời gian</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {filtered.map((product) => {
                    const checked = selectedIds.includes(product.id)
                    return (
                      <tr
                        key={product.id}
                        className={[
                          'transition-colors hover:bg-surface-container-low/60',
                          !product.active ? 'opacity-50' : '',
                          checked ? 'bg-primary/5' : '',
                        ].join(' ')}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            className="accent-primary"
                            checked={checked}
                            onChange={() => toggleSelect(product.id)}
                            aria-label={`Chọn ${product.name}`}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <ProductThumb product={product} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-bold">
                          {product.code}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-on-surface">{product.name}</p>
                          <p className="max-w-xs truncate text-xs text-on-surface-variant">
                            {product.materials || product.description || '—'}
                          </p>
                        </td>
                        <td className="max-w-[180px] px-4 py-3 text-xs text-on-surface-variant">
                          {(product.categories || []).length
                            ? product.categories.map((item) => item.name).join(', ')
                            : '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">{formatMoney(product.costPrice)}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-medium">
                          {formatMoney(product.sellPrice)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-emerald-700">
                          {formatMoney(product.profit)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-on-surface-variant">
                          {product.makeMinutes ? `${product.makeMinutes}'` : '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <ProductActionButtons
                            product={product}
                            disabled={isBusy}
                            onEdit={openEdit}
                            onToggleActive={(item, active) =>
                              active ? handleActivate(item) : handleDeactivate(item)
                            }
                            onDelete={handleDelete}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="glass-card inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-on-surface">
              <input
                type="checkbox"
                className="accent-primary"
                checked={allFilteredSelected}
                onChange={toggleSelectAllFiltered}
              />
              Chọn tất cả ({filtered.length})
            </label>
            {filtered.map((product) => {
              const checked = selectedIds.includes(product.id)
              return (
                <div
                  key={product.id}
                  className={[
                    'rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4 shadow-sm',
                    !product.active ? 'opacity-60' : '',
                    checked ? 'border-primary/30 bg-primary/5' : '',
                  ].join(' ')}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 accent-primary"
                      checked={checked}
                      onChange={() => toggleSelect(product.id)}
                      aria-label={`Chọn ${product.name}`}
                    />
                    <button type="button" onClick={() => openEdit(product)} className="min-w-0 flex-1 text-left">
                      <div className="flex items-start gap-3">
                        <ProductThumb product={product} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-mono text-[11px] font-bold text-on-surface-variant">{product.code}</p>
                              <p className="mt-1 font-semibold text-on-surface">{product.name}</p>
                            </div>
                            <p className="font-semibold text-primary">{formatMoney(product.sellPrice)}</p>
                          </div>
                          <p className="mt-2 text-xs text-on-surface-variant">
                            Giá vốn {formatMoney(product.costPrice)} · Lợi nhuận{' '}
                            {formatMoney(product.profit)}
                            {!product.active ? ' · Đã ngừng bán' : ''}
                          </p>
                          {(product.categories || []).length ? (
                            <p className="mt-1 text-xs text-primary/80">
                              {product.categories.map((item) => item.name).join(' · ')}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  </div>
                  <div className="mt-3 border-t border-surface-container pt-3 pl-7">
                    <ProductActionButtons
                      product={product}
                      disabled={isBusy}
                      onEdit={openEdit}
                      onToggleActive={(item, active) =>
                        active ? handleActivate(item) : handleDeactivate(item)
                      }
                      onDelete={handleDelete}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <ProductFormDialog
        open={showForm}
        values={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onClose={closeForm}
        onRegenerateCode={regenerateCode}
        onRemoveCloudImage={queueRemovedCloudImage}
        categoryOptions={categories}
        isEditing={Boolean(editingId)}
        onDelete={
          editingId
            ? () => {
                const product = products.find((item) => item.id === editingId)
                if (product) handleDelete(product)
              }
            : undefined
        }
        formError={formError}
        title={editingId ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
      />

      <LoadingOverlay open={isBusy} message={busyMessage} />
    </div>
  )
}

export default ProductsPage
