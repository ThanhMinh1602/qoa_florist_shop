import { useEffect, useRef, useState } from 'react'
import { updateLandingSettingsApi } from '../../../api/settingsApi'
import { deleteUploadedImageApi, uploadImagesApi } from '../../../api/uploadsApi'
import LoadingOverlay from '../../../components/common/LoadingOverlay'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { PRICE_TIERS } from '../../../constants/priceTiers'
import { useDialog } from '../../../context/DialogContext'
import { useLandingSettings } from '../../../hooks/swr'
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

function emptyTierState() {
  return PRICE_TIERS.map((tier) => ({
    id: tier.id,
    description: tier.description,
    images: [],
  }))
}

function hydrateTierState(savedTiers = []) {
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

function mapFilesToImages(files) {
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

async function resolveUploadedImages(images) {
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

function ImageListEditor({
  images,
  emptyLabel,
  dragId,
  onPickFiles,
  onRemove,
  onMove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) {
  return (
    <div className="space-y-3">
      <label className="btn-glass inline-flex cursor-pointer">
        <MaterialIcon name="upload" className="text-lg" />
        Thêm ảnh
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onPickFiles}
        />
      </label>

      {images.length === 0 ? (
        <div className="rounded-xl border border-dashed border-outline-variant/40 px-4 py-8 text-center">
          <MaterialIcon name="image" className="text-3xl text-outline" />
          <p className="mt-2 text-sm text-on-surface-variant">{emptyLabel}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {images.map((image, index) => (
            <li
              key={image.id}
              draggable
              onDragStart={(event) => onDragStart(event, image.id)}
              onDragOver={onDragOver}
              onDrop={(event) => onDrop(event, image.id)}
              onDragEnd={onDragEnd}
              className={[
                'flex items-center gap-3 rounded-xl border bg-surface-container-lowest p-2 transition',
                dragId === image.id ? 'border-primary/50 opacity-60' : 'border-outline-variant/25',
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
                  {index === 0 ? ' · Ảnh đại diện' : ''}
                </p>
                <p className="truncate text-xs text-outline">
                  {image.file ? 'Chưa lưu — chỉ preview' : image.publicId || 'Đã lưu'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => onMove(image.id, -1)}
                  disabled={index === 0}
                  className="rounded-lg border border-outline-variant/30 p-2 text-on-surface-variant hover:bg-surface-container-low disabled:opacity-30"
                  aria-label="Đưa lên"
                >
                  <MaterialIcon name="keyboard_arrow_up" />
                </button>
                <button
                  type="button"
                  onClick={() => onMove(image.id, 1)}
                  disabled={index === images.length - 1}
                  className="rounded-lg border border-outline-variant/30 p-2 text-on-surface-variant hover:bg-surface-container-low disabled:opacity-30"
                  aria-label="Đưa xuống"
                >
                  <MaterialIcon name="keyboard_arrow_down" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(image)}
                  className="rounded-lg p-2 text-error hover:bg-error-container/40"
                  aria-label="Xóa"
                >
                  <MaterialIcon name="delete" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SiteSettingsPage() {
  const { alert } = useDialog()
  const {
    settings,
    isLoading,
    error: settingsError,
    mutate: mutateSettings,
  } = useLandingSettings()
  const [images, setImages] = useState([])
  const [priceTiers, setPriceTiers] = useState(emptyTierState)
  const [autoPlayMs, setAutoPlayMs] = useState(5000)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [dragId, setDragId] = useState('')
  const removedPublicIdsRef = useRef([])
  const imagesRef = useRef(images)
  const priceTiersRef = useRef(priceTiers)
  const hydratedRef = useRef(false)
  imagesRef.current = images
  priceTiersRef.current = priceTiers

  useEffect(() => {
    if (!settings || hydratedRef.current) return
    hydratedRef.current = true
    setImages(
      (settings.heroImages || []).map((image) => ({
        id: image.id,
        url: image.url,
        publicId: image.publicId || '',
        file: null,
        previewUrl: null,
      })),
    )
    setPriceTiers(hydrateTierState(settings.priceTiers))
    setAutoPlayMs(settings.heroAutoPlayMs || 5000)
    removedPublicIdsRef.current = []
  }, [settings])

  useEffect(() => {
    if (settingsError) {
      setError(settingsError.message || 'Không tải được cài đặt.')
    }
  }, [settingsError])

  useEffect(() => {
    return () => {
      imagesRef.current.forEach(revokePreviewUrl)
      priceTiersRef.current.forEach((tier) => tier.images.forEach(revokePreviewUrl))
    }
  }, [])

  function trackRemoved(image) {
    if (image.publicId) {
      removedPublicIdsRef.current.push(image.publicId)
    }
  }

  function reorderList(list, fromId, toId) {
    if (!fromId || !toId || fromId === toId) return list
    const fromIndex = list.findIndex((item) => item.id === fromId)
    const toIndex = list.findIndex((item) => item.id === toId)
    if (fromIndex < 0 || toIndex < 0) return list
    const copy = [...list]
    const [item] = copy.splice(fromIndex, 1)
    copy.splice(toIndex, 0, item)
    return copy
  }

  function moveInList(list, id, direction) {
    const index = list.findIndex((item) => item.id === id)
    if (index < 0) return list
    const next = index + direction
    if (next < 0 || next >= list.length) return list
    const copy = [...list]
    const [item] = copy.splice(index, 1)
    copy.splice(next, 0, item)
    return copy
  }

  function handlePickHeroFiles(event) {
    const files = Array.from(event.target.files || []).filter((file) =>
      file.type.startsWith('image/'),
    )
    event.target.value = ''
    if (!files.length) return
    setImages((previous) => [...previous, ...mapFilesToImages(files)])
    setError('')
  }

  function handlePickTierFiles(tierId, event) {
    const files = Array.from(event.target.files || []).filter((file) =>
      file.type.startsWith('image/'),
    )
    event.target.value = ''
    if (!files.length) return
    setPriceTiers((previous) =>
      previous.map((tier) =>
        tier.id === tierId
          ? { ...tier, images: [...tier.images, ...mapFilesToImages(files)] }
          : tier,
      ),
    )
    setError('')
  }

  function handleRemoveHero(image) {
    setImages((previous) => previous.filter((item) => item.id !== image.id))
    revokePreviewUrl(image)
    trackRemoved(image)
  }

  function handleRemoveTierImage(tierId, image) {
    setPriceTiers((previous) =>
      previous.map((tier) =>
        tier.id === tierId
          ? { ...tier, images: tier.images.filter((item) => item.id !== image.id) }
          : tier,
      ),
    )
    revokePreviewUrl(image)
    trackRemoved(image)
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

  function handleDragEnd() {
    setDragId('')
  }

  async function handleSave() {
    setIsSaving(true)
    setError('')
    try {
      const heroImages = await resolveUploadedImages(images)
      const nextPriceTiers = []
      for (const tier of priceTiers) {
        nextPriceTiers.push({
          id: tier.id,
          description: tier.description.trim(),
          images: await resolveUploadedImages(tier.images),
        })
      }

      const result = await updateLandingSettingsApi({
        heroImages,
        heroAutoPlayMs: autoPlayMs,
        priceTiers: nextPriceTiers,
      })

      const publicIdsToDelete = [...removedPublicIdsRef.current]
      removedPublicIdsRef.current = []
      await Promise.allSettled(
        publicIdsToDelete.map((publicId) => deleteUploadedImageApi(publicId)),
      )

      images.forEach(revokePreviewUrl)
      priceTiers.forEach((tier) => tier.images.forEach(revokePreviewUrl))

      const nextSettings = {
        heroImages: result.data?.heroImages || heroImages,
        heroAutoPlayMs: result.data?.heroAutoPlayMs || autoPlayMs,
        priceTiers: result.data?.priceTiers || nextPriceTiers,
      }
      setImages(
        nextSettings.heroImages.map((image) => ({
          id: image.id,
          url: image.url,
          publicId: image.publicId || '',
          file: null,
          previewUrl: null,
        })),
      )
      setPriceTiers(hydrateTierState(nextSettings.priceTiers))
      setAutoPlayMs(nextSettings.heroAutoPlayMs)
      await mutateSettings(nextSettings, { revalidate: false })

      setIsSaving(false)
      await alert({
        title: 'Đã lưu',
        message: 'Cài đặt trang chủ đã được cập nhật.',
        variant: 'success',
      })
    } catch (err) {
      const message = err.message || 'Không lưu được cài đặt.'
      setError(message)
      setIsSaving(false)
      await alert({
        title: 'Lưu thất bại',
        message,
        variant: 'error',
      })
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pb-24 lg:gap-6 lg:p-10 lg:pb-10">
      <header className="flex flex-wrap items-center justify-between gap-3 lg:items-end lg:gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-xl text-primary lg:text-3xl">Cài đặt web</h2>
          <p className="mt-0.5 text-xs text-on-surface-variant lg:mt-1 lg:text-base">
            Hero slideshow và ảnh giới thiệu 4 mức giá trên trang chủ.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="btn-primary hidden disabled:opacity-60 lg:inline-flex"
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
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <section className="glass-card space-y-5 rounded-xl p-5 md:p-6">
              <div>
                <h3 className="text-lg font-semibold text-primary">Danh sách ảnh hero</h3>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Kéo thả hoặc dùng ↑↓ để sắp xếp. Thứ tự danh sách = thứ tự slideshow.
                </p>
              </div>

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

              <ImageListEditor
                images={images}
                emptyLabel="Chưa có ảnh — hero dùng nền kem."
                dragId={dragId}
                onPickFiles={handlePickHeroFiles}
                onRemove={handleRemoveHero}
                onMove={(id, direction) =>
                  setImages((previous) => moveInList(previous, id, direction))
                }
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={(event, targetId) => {
                  event.preventDefault()
                  const fromId = event.dataTransfer.getData('text/plain') || dragId
                  setImages((previous) => reorderList(previous, fromId, targetId))
                  setDragId('')
                }}
                onDragEnd={handleDragEnd}
              />
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-primary">Preview hero</h3>
                <span className="label-caps text-outline">Live</span>
              </div>
              <div className="overflow-hidden rounded-2xl border border-outline-variant/30 shadow-[0_12px_40px_rgba(74,48,32,0.08)]">
                <LandingHeroCarousel images={images} autoPlayMs={autoPlayMs} preview />
              </div>
            </section>
          </div>

          <section className="glass-card space-y-5 rounded-xl p-5 md:p-6">
            <div>
              <h3 className="text-lg font-semibold text-primary">Giới thiệu theo mức giá</h3>
              <p className="mt-1 text-sm text-on-surface-variant">
                Ảnh đầu tiên là ảnh đại diện trên trang chủ. Có thể thêm nhiều ảnh nổi bật cho mỗi
                mức giá.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {PRICE_TIERS.map((meta) => {
                const tier = priceTiers.find((item) => item.id === meta.id) || {
                  id: meta.id,
                  description: meta.description,
                  images: [],
                }
                return (
                  <div
                    key={meta.id}
                    className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest/60 p-4"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-variant">
                        <MaterialIcon name={meta.icon} className="text-xl text-primary" />
                      </span>
                      <div>
                        <h4 className="font-semibold text-primary">{meta.label}</h4>
                        <p className="text-xs text-outline">Mức giá trên trang chủ</p>
                      </div>
                    </div>

                    <label className="mb-3 block">
                      <span className="label-caps text-on-surface-variant">Mô tả ngắn</span>
                      <textarea
                        rows={2}
                        value={tier.description}
                        onChange={(event) => {
                          const value = event.target.value
                          setPriceTiers((previous) =>
                            previous.map((item) =>
                              item.id === meta.id ? { ...item, description: value } : item,
                            ),
                          )
                        }}
                        className="input-glass mt-1.5 resize-y"
                      />
                    </label>

                    <ImageListEditor
                      images={tier.images}
                      emptyLabel="Chưa có ảnh tượng trưng."
                      dragId={dragId}
                      onPickFiles={(event) => handlePickTierFiles(meta.id, event)}
                      onRemove={(image) => handleRemoveTierImage(meta.id, image)}
                      onMove={(id, direction) =>
                        setPriceTiers((previous) =>
                          previous.map((item) =>
                            item.id === meta.id
                              ? { ...item, images: moveInList(item.images, id, direction) }
                              : item,
                          ),
                        )
                      }
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={(event, targetId) => {
                        event.preventDefault()
                        const fromId = event.dataTransfer.getData('text/plain') || dragId
                        setPriceTiers((previous) =>
                          previous.map((item) =>
                            item.id === meta.id
                              ? {
                                  ...item,
                                  images: reorderList(item.images, fromId, targetId),
                                }
                              : item,
                          ),
                        )
                        setDragId('')
                      }}
                      onDragEnd={handleDragEnd}
                    />
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      )}

      <LoadingOverlay open={isSaving} message="Đang upload & lưu cài đặt..." />

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-outline-variant/20 bg-surface-container-lowest/95 px-4 pt-2.5 pb-[calc(4.75rem+env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="btn-primary w-full !py-3 text-[10px] disabled:opacity-60"
        >
          {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>
    </div>
  )
}

export default SiteSettingsPage
