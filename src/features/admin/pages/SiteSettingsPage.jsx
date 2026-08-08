import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { updateLandingSettingsApi } from '../../../api/settingsApi'
import { deleteUploadedImageApi, uploadImagesApi } from '../../../api/uploadsApi'
import LoadingOverlay from '../../../components/common/LoadingOverlay'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { LANDING_COPY_DEFAULTS, mergeLandingCopy } from '../../../constants/landingCopy'
import { PRICE_TIERS, getPriceTierWithImages } from '../../../constants/priceTiers'
import { useDialog } from '../../../context/DialogContext'
import { useLandingSettings } from '../../../hooks/swr'
import { resizeImageFiles } from '../../../utils/resizeImage'
import LandingHeroCarousel from '../../landing/components/LandingHeroCarousel'
import PriceTierCard from '../../landing/components/priceTiers/PriceTierCard'

const COPY_FIELD_KEYS = Object.keys(LANDING_COPY_DEFAULTS)

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

function CollapsiblePanel({ open, children, className = '' }) {
  const contentRef = useRef(null)
  const [contentHeight, setContentHeight] = useState(0)
  const [canAnimate, setCanAnimate] = useState(false)

  useLayoutEffect(() => {
    const el = contentRef.current
    if (!el) return undefined

    const measure = () => {
      setContentHeight(el.scrollHeight)
    }
    measure()

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    ro?.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [children])

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setCanAnimate(true))
    return () => window.cancelAnimationFrame(id)
  }, [])

  return (
    <div
      className="overflow-hidden"
      style={{
        height: open ? contentHeight : 0,
        transition: canAnimate ? 'height 380ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
      }}
      aria-hidden={!open}
    >
      <div
        ref={contentRef}
        className={className}
        style={{
          opacity: open ? 1 : 0,
          transition: canAnimate ? 'opacity 260ms ease' : 'none',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  )
}

function SettingsSection({ title, description, open, onToggle, children, summary }) {
  return (
    <section className="glass-card overflow-hidden rounded-xl">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-surface-container-low/50 md:px-6 md:py-5"
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-primary md:text-lg">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-xs text-on-surface-variant md:text-sm">{description}</p>
          ) : null}
          {summary ? (
            <p
              className={[
                'truncate text-xs text-outline transition-[opacity,margin,max-height] duration-300 ease-out',
                open ? 'mt-0 max-h-0 opacity-0' : 'mt-1.5 max-h-6 opacity-100',
              ].join(' ')}
            >
              {summary}
            </p>
          ) : null}
        </div>
        <span
          className={[
            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-low text-primary transition-transform duration-300 ease-out',
            open ? 'rotate-180' : '',
          ].join(' ')}
          aria-hidden="true"
        >
          <MaterialIcon name="expand_more" className="text-xl" />
        </span>
      </button>

      <CollapsiblePanel
        open={open}
        className="space-y-5 border-t border-outline-variant/20 px-5 py-5 md:px-6 md:py-6"
      >
        {children}
      </CollapsiblePanel>
    </section>
  )
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
  const [copy, setCopy] = useState(() => ({ ...LANDING_COPY_DEFAULTS }))
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [dragId, setDragId] = useState('')
  const [openSections, setOpenSections] = useState(() => new Set(['hero']))
  const [openTierIds, setOpenTierIds] = useState(() => new Set())
  const removedPublicIdsRef = useRef([])
  const imagesRef = useRef(images)
  const priceTiersRef = useRef(priceTiers)
  const hydratedRef = useRef(false)
  imagesRef.current = images
  priceTiersRef.current = priceTiers

  function updateCopyField(key, value) {
    setCopy((previous) => ({ ...previous, [key]: value }))
  }

  function toggleSection(id) {
    setOpenSections((previous) => (previous.has(id) ? new Set() : new Set([id])))
  }

  function toggleTier(id) {
    setOpenTierIds((previous) => (previous.has(id) ? new Set() : new Set([id])))
  }

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
    setCopy(mergeLandingCopy(settings))
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

      const copyPayload = Object.fromEntries(
        COPY_FIELD_KEYS.map((key) => [key, String(copy[key] || '').trim()]),
      )

      const result = await updateLandingSettingsApi({
        heroImages,
        heroAutoPlayMs: autoPlayMs,
        priceTiers: nextPriceTiers,
        ...copyPayload,
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
        ...mergeLandingCopy(result.data || copyPayload),
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
      setCopy(mergeLandingCopy(nextSettings))
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
            Ảnh hero, chữ banner, section trang chủ và footer.
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
        <div className="space-y-3 lg:space-y-4">
          <SettingsSection
            title="Banner / Hero"
            description="Ảnh slideshow, tiêu đề, phụ đề và nút CTA."
            summary={`${images.length} ảnh · ${Math.round(autoPlayMs / 1000)}s`}
            open={openSections.has('hero')}
            onToggle={() => toggleSection('hero')}
          >
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
              <div className="space-y-5">
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

                <label className="block">
                  <span className="label-caps text-on-surface-variant">Tiêu đề banner</span>
                  <textarea
                    rows={2}
                    value={copy.heroTitle}
                    onChange={(event) => updateCopyField('heroTitle', event.target.value)}
                    placeholder={LANDING_COPY_DEFAULTS.heroTitle}
                    className="input-glass mt-1.5 resize-y"
                  />
                  <span className="mt-1 block text-xs text-outline">
                    Xuống dòng = xuống dòng trên banner.
                  </span>
                </label>

                <label className="block">
                  <span className="label-caps text-on-surface-variant">Phụ đề banner</span>
                  <textarea
                    rows={3}
                    value={copy.heroSubtitle}
                    onChange={(event) => updateCopyField('heroSubtitle', event.target.value)}
                    placeholder={LANDING_COPY_DEFAULTS.heroSubtitle}
                    className="input-glass mt-1.5 resize-y"
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="label-caps text-on-surface-variant">Nút chính</span>
                    <input
                      type="text"
                      value={copy.heroCtaPrimary}
                      onChange={(event) => updateCopyField('heroCtaPrimary', event.target.value)}
                      placeholder={LANDING_COPY_DEFAULTS.heroCtaPrimary}
                      className="input-glass mt-1.5"
                    />
                  </label>
                  <label className="block">
                    <span className="label-caps text-on-surface-variant">Nút phụ</span>
                    <input
                      type="text"
                      value={copy.heroCtaSecondary}
                      onChange={(event) => updateCopyField('heroCtaSecondary', event.target.value)}
                      placeholder={LANDING_COPY_DEFAULTS.heroCtaSecondary}
                      className="input-glass mt-1.5"
                    />
                  </label>
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium text-on-surface">Danh sách ảnh</p>
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
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-primary">Preview</h4>
                  <span className="label-caps text-outline">Live</span>
                </div>
                <div className="overflow-hidden rounded-2xl border border-outline-variant/30 shadow-[0_12px_40px_rgba(74,48,32,0.08)]">
                  <LandingHeroCarousel
                    images={images}
                    autoPlayMs={autoPlayMs}
                    preview
                    title={copy.heroTitle}
                    subtitle={copy.heroSubtitle}
                    ctaPrimary={copy.heroCtaPrimary}
                    ctaSecondary={copy.heroCtaSecondary}
                  />
                </div>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            title="Tiêu đề các section"
            description="Mức giá, bán chạy và khối thiệp số."
            summary={`${copy.priceTiersTitle} · ${copy.featuredTitle} · ${copy.customCardTitle}`}
            open={openSections.has('sections')}
            onToggle={() => toggleSection('sections')}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="label-caps text-on-surface-variant">Mức giá</span>
                <input
                  type="text"
                  value={copy.priceTiersTitle}
                  onChange={(event) => updateCopyField('priceTiersTitle', event.target.value)}
                  placeholder={LANDING_COPY_DEFAULTS.priceTiersTitle}
                  className="input-glass mt-1.5"
                />
              </label>
              <label className="block">
                <span className="label-caps text-on-surface-variant">Bán chạy</span>
                <input
                  type="text"
                  value={copy.featuredTitle}
                  onChange={(event) => updateCopyField('featuredTitle', event.target.value)}
                  placeholder={LANDING_COPY_DEFAULTS.featuredTitle}
                  className="input-glass mt-1.5"
                />
              </label>
              <label className="block">
                <span className="label-caps text-on-surface-variant">Tiêu đề thiệp số</span>
                <input
                  type="text"
                  value={copy.customCardTitle}
                  onChange={(event) => updateCopyField('customCardTitle', event.target.value)}
                  placeholder={LANDING_COPY_DEFAULTS.customCardTitle}
                  className="input-glass mt-1.5"
                />
              </label>
              <label className="block">
                <span className="label-caps text-on-surface-variant">Eyebrow thiệp số</span>
                <input
                  type="text"
                  value={copy.customCardEyebrow}
                  onChange={(event) => updateCopyField('customCardEyebrow', event.target.value)}
                  placeholder={LANDING_COPY_DEFAULTS.customCardEyebrow}
                  className="input-glass mt-1.5"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="label-caps text-on-surface-variant">Heading trong panel</span>
                <textarea
                  rows={2}
                  value={copy.customCardHeading}
                  onChange={(event) => updateCopyField('customCardHeading', event.target.value)}
                  placeholder={LANDING_COPY_DEFAULTS.customCardHeading}
                  className="input-glass mt-1.5 resize-y"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="label-caps text-on-surface-variant">Mô tả thiệp số</span>
                <textarea
                  rows={2}
                  value={copy.customCardBody}
                  onChange={(event) => updateCopyField('customCardBody', event.target.value)}
                  placeholder={LANDING_COPY_DEFAULTS.customCardBody}
                  className="input-glass mt-1.5 resize-y"
                />
              </label>
              <label className="block">
                <span className="label-caps text-on-surface-variant">Nút thiệp số</span>
                <input
                  type="text"
                  value={copy.customCardCta}
                  onChange={(event) => updateCopyField('customCardCta', event.target.value)}
                  placeholder={LANDING_COPY_DEFAULTS.customCardCta}
                  className="input-glass mt-1.5"
                />
              </label>
            </div>
          </SettingsSection>

          <SettingsSection
            title="Footer"
            description="Brand, tagline, email và số Zalo."
            summary={`${copy.footerBrand} · ${copy.footerEmail}`}
            open={openSections.has('footer')}
            onToggle={() => toggleSection('footer')}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="label-caps text-on-surface-variant">Tên brand</span>
                <input
                  type="text"
                  value={copy.footerBrand}
                  onChange={(event) => updateCopyField('footerBrand', event.target.value)}
                  placeholder={LANDING_COPY_DEFAULTS.footerBrand}
                  className="input-glass mt-1.5"
                />
              </label>
              <label className="block">
                <span className="label-caps text-on-surface-variant">Dòng copyright</span>
                <input
                  type="text"
                  value={copy.footerCopyright}
                  onChange={(event) => updateCopyField('footerCopyright', event.target.value)}
                  placeholder={LANDING_COPY_DEFAULTS.footerCopyright}
                  className="input-glass mt-1.5"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="label-caps text-on-surface-variant">Tagline</span>
                <input
                  type="text"
                  value={copy.footerTagline}
                  onChange={(event) => updateCopyField('footerTagline', event.target.value)}
                  placeholder={LANDING_COPY_DEFAULTS.footerTagline}
                  className="input-glass mt-1.5"
                />
              </label>
              <label className="block">
                <span className="label-caps text-on-surface-variant">Email liên hệ</span>
                <input
                  type="email"
                  value={copy.footerEmail}
                  onChange={(event) => updateCopyField('footerEmail', event.target.value)}
                  placeholder={LANDING_COPY_DEFAULTS.footerEmail}
                  className="input-glass mt-1.5"
                />
              </label>
              <label className="block">
                <span className="label-caps text-on-surface-variant">Số Zalo (để trống = dùng env)</span>
                <input
                  type="text"
                  value={copy.footerZaloPhone}
                  onChange={(event) => updateCopyField('footerZaloPhone', event.target.value)}
                  placeholder="0798334803"
                  className="input-glass mt-1.5"
                />
              </label>
            </div>
          </SettingsSection>

          <SettingsSection
            title="Giới thiệu theo mức giá"
            description="Ảnh đại diện và mô tả cho 4 mức giá trên trang chủ."
            summary={`${priceTiers.reduce((sum, tier) => sum + (tier.images?.length || 0), 0)} ảnh · 4 mức`}
            open={openSections.has('priceTiers')}
            onToggle={() => toggleSection('priceTiers')}
          >
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
              <div className="space-y-3">
                {PRICE_TIERS.map((meta) => {
                  const tier = priceTiers.find((item) => item.id === meta.id) || {
                    id: meta.id,
                    description: meta.description,
                    images: [],
                  }
                  const tierOpen = openTierIds.has(meta.id)
                  return (
                    <div
                      key={meta.id}
                      className="overflow-hidden rounded-xl border border-outline-variant/25 bg-surface-container-lowest/60"
                    >
                      <button
                        type="button"
                        onClick={() => toggleTier(meta.id)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-surface-container-low/40"
                        aria-expanded={tierOpen}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-variant">
                          <MaterialIcon name={meta.icon} className="text-xl text-primary" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-primary">{meta.label}</h4>
                          <p className="truncate text-xs text-outline">
                            {tier.images.length} ảnh
                            {tier.description ? ` · ${tier.description}` : ''}
                          </p>
                        </div>
                        <span
                          className={[
                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-container-low text-primary transition-transform duration-300',
                            tierOpen ? 'rotate-180' : '',
                          ].join(' ')}
                          aria-hidden="true"
                        >
                          <MaterialIcon name="expand_more" className="text-lg" />
                        </span>
                      </button>

                      <CollapsiblePanel
                        open={tierOpen}
                        className="space-y-3 border-t border-outline-variant/20 px-4 py-4"
                      >
                        <label className="block">
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
                      </CollapsiblePanel>
                    </div>
                  )
                })}
              </div>

              <div className="space-y-3 xl:sticky xl:top-4 xl:self-start">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-primary">Preview</h4>
                  <span className="label-caps text-outline">Live</span>
                </div>
                <div className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-background p-4 shadow-[0_12px_40px_rgba(74,48,32,0.08)] sm:p-5">
                  <div className="mb-4 flex items-end justify-between gap-3">
                    <h5 className="font-display text-lg text-primary sm:text-xl">
                      {copy.priceTiersTitle || LANDING_COPY_DEFAULTS.priceTiersTitle}
                    </h5>
                    <span className="label-caps shrink-0 text-[10px] text-primary/70">Xem tất cả →</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    {getPriceTierWithImages(priceTiers).map((tier) => (
                      <PriceTierCard key={tier.id} tier={tier} size="mobile" preview />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </SettingsSection>
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
