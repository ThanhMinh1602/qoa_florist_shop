import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchLandingSettingsApi, updateLandingSettingsApi } from '../../../api/settingsApi'
import { deleteUploadedImageApi, uploadImagesApi } from '../../../api/uploadsApi'
import LoadingOverlay from '../../../components/common/LoadingOverlay'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { useDialog } from '../../../context/DialogContext'
import { resizeImageFiles } from '../../../utils/resizeImage'
import LandingHeroCarousel from '../../landing/components/LandingHeroCarousel'

function createLocalId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function revokePreviewUrl(image) {
  if (image?.previewUrl?.startsWith('blob:')) {
    URL.revokeObjectURL(image.previewUrl)
  }
}

function SiteSettingsPage() {
  const { alert } = useDialog()
  const [images, setImages] = useState([])
  const [autoPlayMs, setAutoPlayMs] = useState(5000)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [dragId, setDragId] = useState('')
  const removedPublicIdsRef = useRef([])
  const imagesRef = useRef(images)
  imagesRef.current = images

  const load = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const result = await fetchLandingSettingsApi()
      setImages((previous) => {
        previous.forEach(revokePreviewUrl)
        return (result.data?.heroImages || []).map((image) => ({
          id: image.id,
          url: image.url,
          publicId: image.publicId || '',
          file: null,
          previewUrl: null,
        }))
      })
      setAutoPlayMs(result.data?.heroAutoPlayMs || 5000)
      removedPublicIdsRef.current = []
    } catch (err) {
      setError(err.message || 'Không tải được cài đặt.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    return () => {
      imagesRef.current.forEach(revokePreviewUrl)
    }
  }, [])

  function handlePickFiles(event) {
    const files = Array.from(event.target.files || []).filter((file) =>
      file.type.startsWith('image/'),
    )
    event.target.value = ''
    if (!files.length) return

    const next = files.map((file) => {
      const previewUrl = URL.createObjectURL(file)
      return {
        id: createLocalId(),
        url: previewUrl,
        previewUrl,
        publicId: '',
        file,
      }
    })
    setImages((previous) => [...previous, ...next])
    setError('')
  }

  function handleRemove(image) {
    setImages((previous) => previous.filter((item) => item.id !== image.id))
    revokePreviewUrl(image)
    if (image.publicId) {
      removedPublicIdsRef.current.push(image.publicId)
    }
  }

  function moveImage(id, direction) {
    setImages((previous) => {
      const index = previous.findIndex((item) => item.id === id)
      if (index < 0) return previous
      const next = index + direction
      if (next < 0 || next >= previous.length) return previous
      const copy = [...previous]
      const [item] = copy.splice(index, 1)
      copy.splice(next, 0, item)
      return copy
    })
  }

  function reorderImage(fromId, toId) {
    if (!fromId || !toId || fromId === toId) return
    setImages((previous) => {
      const fromIndex = previous.findIndex((item) => item.id === fromId)
      const toIndex = previous.findIndex((item) => item.id === toId)
      if (fromIndex < 0 || toIndex < 0) return previous
      const copy = [...previous]
      const [item] = copy.splice(fromIndex, 1)
      copy.splice(toIndex, 0, item)
      return copy
    })
  }

  function handleDragStart(event, id) {
    event.dataTransfer.setData('text/plain', id)
    event.dataTransfer.effectAllowed = 'move'
    setDragId(id)
  }

  function handleDragOver(event) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  function handleDrop(event, targetId) {
    event.preventDefault()
    const fromId = event.dataTransfer.getData('text/plain') || dragId
    reorderImage(fromId, targetId)
    setDragId('')
  }

  function handleDragEnd() {
    setDragId('')
  }

  async function handleSave() {
    setIsSaving(true)
    setError('')
    try {
      const pending = images.filter((image) => image.file)
      let uploadedByIndex = []

      if (pending.length > 0) {
        const resized = await resizeImageFiles(
          pending.map((image) => image.file),
          { maxWidth: 1920, maxHeight: 1920, quality: 0.85 },
        )
        const result = await uploadImagesApi(resized)
        uploadedByIndex = result.data || []
        if (uploadedByIndex.length !== pending.length) {
          throw new Error('Upload ảnh không đủ số lượng.')
        }
      }

      let uploadIndex = 0
      const heroImages = images.map((image) => {
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

      const result = await updateLandingSettingsApi({
        heroImages,
        heroAutoPlayMs: autoPlayMs,
      })

      const publicIdsToDelete = [...removedPublicIdsRef.current]
      removedPublicIdsRef.current = []
      await Promise.allSettled(
        publicIdsToDelete.map((publicId) => deleteUploadedImageApi(publicId)),
      )

      images.forEach(revokePreviewUrl)
      setImages(
        (result.data?.heroImages || heroImages).map((image) => ({
          id: image.id,
          url: image.url,
          publicId: image.publicId || '',
          file: null,
          previewUrl: null,
        })),
      )
      setAutoPlayMs(result.data?.heroAutoPlayMs || autoPlayMs)

      await alert({
        title: 'Đã lưu',
        message: 'Cài đặt hero landing đã được cập nhật.',
        variant: 'success',
      })
    } catch (err) {
      const message = err.message || 'Không lưu được cài đặt.'
      setError(message)
      await alert({
        title: 'Lưu thất bại',
        message,
        variant: 'error',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-5 md:p-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl text-primary">Cài đặt web</h2>
          <p className="mt-1 text-sm text-on-surface-variant md:text-base">
            Chọn ảnh để xem trước — chỉ upload khi bấm Lưu cài đặt.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="btn-primary disabled:opacity-60"
        >
          {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </header>

      {error ? (
        <p className="rounded-xl bg-error-container/50 px-4 py-3 text-sm text-error" role="alert">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p className="py-12 text-center text-sm text-on-surface-variant">Đang tải...</p>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <section className="glass-card space-y-5 rounded-xl p-5 md:p-6">
            <div>
              <h3 className="text-lg font-semibold text-primary">Danh sách ảnh hero</h3>
              <p className="mt-1 text-sm text-on-surface-variant">
                Kéo thả hoặc dùng ↑↓ để sắp xếp. Thứ tự danh sách = thứ tự slideshow.
              </p>
            </div>

            <label className="btn-glass inline-flex cursor-pointer">
              <MaterialIcon name="upload" className="text-lg" />
              Thêm ảnh
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePickFiles}
              />
            </label>

            <label className="block max-w-xs">
              <span className="label-caps text-on-surface-variant">Tự chuyển ảnh (giây)</span>
              <input
                type="number"
                min={2}
                max={30}
                value={Math.round(autoPlayMs / 1000)}
                onChange={(event) => {
                  const seconds = Number(event.target.value) || 5
                  setAutoPlayMs(Math.min(30, Math.max(2, seconds)) * 1000)
                }}
                className="input-glass mt-1.5"
              />
            </label>

            {images.length === 0 ? (
              <div className="rounded-xl border border-dashed border-outline-variant/40 px-4 py-10 text-center">
                <MaterialIcon name="image" className="text-4xl text-outline" />
                <p className="mt-2 text-sm text-on-surface-variant">Chưa có ảnh — hero dùng nền kem.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {images.map((image, index) => (
                  <li
                    key={image.id}
                    draggable
                    onDragStart={(event) => handleDragStart(event, image.id)}
                    onDragOver={handleDragOver}
                    onDrop={(event) => handleDrop(event, image.id)}
                    onDragEnd={handleDragEnd}
                    className={[
                      'flex items-center gap-3 rounded-xl border bg-surface-container-lowest p-2 transition',
                      dragId === image.id
                        ? 'border-primary/50 opacity-60'
                        : 'border-outline-variant/25',
                    ].join(' ')}
                  >
                    <span
                      className="flex cursor-grab items-center gap-1 text-outline active:cursor-grabbing"
                      title="Kéo để sắp xếp"
                      aria-hidden="true"
                    >
                      <MaterialIcon name="drag_indicator" className="text-xl" />
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-container-low text-xs font-bold text-primary">
                        {index + 1}
                      </span>
                    </span>
                    <img
                      src={image.url}
                      alt=""
                      className="pointer-events-none h-16 w-24 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-on-surface">
                        Vị trí {index + 1}
                        {index === 0 ? ' · Ảnh đầu tiên' : ''}
                      </p>
                      <p className="truncate text-xs text-outline">
                        {image.file ? 'Chưa lưu — chỉ preview' : image.publicId || 'Đã lưu'}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveImage(image.id, -1)}
                        disabled={index === 0}
                        className="rounded-lg border border-outline-variant/30 p-2 text-on-surface-variant hover:bg-surface-container-low disabled:opacity-30"
                        aria-label="Đưa lên"
                        title="Đưa lên"
                      >
                        <MaterialIcon name="keyboard_arrow_up" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(image.id, 1)}
                        disabled={index === images.length - 1}
                        className="rounded-lg border border-outline-variant/30 p-2 text-on-surface-variant hover:bg-surface-container-low disabled:opacity-30"
                        aria-label="Đưa xuống"
                        title="Đưa xuống"
                      >
                        <MaterialIcon name="keyboard_arrow_down" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(image)}
                        className="rounded-lg p-2 text-error hover:bg-error-container/40"
                        aria-label="Xóa"
                        title="Xóa"
                      >
                        <MaterialIcon name="delete" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-primary">Preview trang chủ</h3>
              <span className="label-caps text-outline">Live</span>
            </div>
            <div className="overflow-hidden rounded-2xl border border-outline-variant/30 shadow-[0_12px_40px_rgba(74,48,32,0.08)]">
              <LandingHeroCarousel images={images} autoPlayMs={autoPlayMs} preview />
            </div>
            <p className="text-xs text-on-surface-variant">
              Preview dùng ảnh local ngay khi chọn. Chỉ khi Lưu mới upload Cloudinary + ghi DB.
            </p>
          </section>
        </div>
      )}

      <LoadingOverlay open={isSaving} message="Đang upload & lưu cài đặt..." />
    </div>
  )
}

export default SiteSettingsPage
