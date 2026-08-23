import { useEffect, useRef, useState } from 'react'
import { updateLandingSettingsApi } from '../../../../api/settingsApi'
import { deleteUploadedImageApi } from '../../../../api/uploadsApi'
import LoadingOverlay from '../../../../components/common/LoadingOverlay'
import { LANDING_COPY_DEFAULTS, mergeLandingCopy } from '../../../../constants/landingCopy'
import { useDialog } from '../../../../context/DialogContext'
import { useLandingSettings } from '../../../../hooks/swr'
import LandingHeroCarousel from '../../../landing/components/LandingHeroCarousel'
import ImageListEditor from '../../components/settings/ImageListEditor'
import SettingsSubpageShell from '../../components/settings/SettingsSubpageShell'
import {
  buildLandingPayload,
  mapFilesToImages,
  moveInList,
  reorderList,
  resolveUploadedImages,
  revokePreviewUrl,
} from '../../components/settings/settingsHelpers'

function SettingsHeroPage() {
  const { alert } = useDialog()
  const {
    settings,
    isLoading,
    error: settingsError,
    mutate: mutateSettings,
  } = useLandingSettings()

  const [images, setImages] = useState([])
  const [autoPlayMs, setAutoPlayMs] = useState(5000)
  const [copy, setCopy] = useState(() => ({ ...LANDING_COPY_DEFAULTS }))
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [dragId, setDragId] = useState('')
  const removedPublicIdsRef = useRef([])
  const imagesRef = useRef(images)
  const hydratedRef = useRef(false)
  imagesRef.current = images

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
    setAutoPlayMs(settings.heroAutoPlayMs || 5000)
    setCopy(mergeLandingCopy(settings))
    removedPublicIdsRef.current = []
  }, [settings])

  useEffect(() => {
    if (settingsError) setError(settingsError.message || 'Không tải được cài đặt.')
  }, [settingsError])

  useEffect(() => {
    return () => {
      imagesRef.current.forEach(revokePreviewUrl)
    }
  }, [])

  function updateCopyField(key, value) {
    setCopy((previous) => ({ ...previous, [key]: value }))
  }

  function handlePickFiles(event) {
    const files = Array.from(event.target.files || []).filter((file) =>
      file.type.startsWith('image/'),
    )
    event.target.value = ''
    if (!files.length) return
    setImages((previous) => [...previous, ...mapFilesToImages(files)])
    setError('')
  }

  function handleRemove(image) {
    setImages((previous) => previous.filter((item) => item.id !== image.id))
    revokePreviewUrl(image)
    if (image.publicId) removedPublicIdsRef.current.push(image.publicId)
  }

  async function handleSave() {
    setIsSaving(true)
    setError('')
    try {
      const heroImages = await resolveUploadedImages(images)
      const payload = buildLandingPayload(settings, {
        heroImages,
        heroAutoPlayMs: autoPlayMs,
        heroTitle: copy.heroTitle,
        heroSubtitle: copy.heroSubtitle,
        heroCtaPrimary: copy.heroCtaPrimary,
        heroCtaSecondary: copy.heroCtaSecondary,
      })
      const result = await updateLandingSettingsApi(payload)

      const publicIdsToDelete = [...removedPublicIdsRef.current]
      removedPublicIdsRef.current = []
      await Promise.allSettled(
        publicIdsToDelete.map((publicId) => deleteUploadedImageApi(publicId)),
      )

      images.forEach(revokePreviewUrl)
      const nextSettings = result.data || payload
      setImages(
        (nextSettings.heroImages || []).map((image) => ({
          id: image.id,
          url: image.url,
          publicId: image.publicId || '',
          file: null,
          previewUrl: null,
        })),
      )
      setAutoPlayMs(nextSettings.heroAutoPlayMs || autoPlayMs)
      setCopy(mergeLandingCopy(nextSettings))
      await mutateSettings(nextSettings, { revalidate: false })
      setIsSaving(false)
      await alert({
        title: 'Đã lưu',
        message: 'Banner / Hero đã được cập nhật.',
        variant: 'success',
      })
    } catch (err) {
      const message = err.message || 'Không lưu được cài đặt.'
      setError(message)
      setIsSaving(false)
      await alert({ title: 'Lưu thất bại', message, variant: 'error' })
    }
  }

  const saveButton = (
    <button
      type="button"
      onClick={handleSave}
      disabled={isSaving || isLoading}
      className="btn-primary w-full !py-3 text-[10px] disabled:opacity-60 lg:w-auto lg:!py-2.5 lg:text-sm"
    >
      {isSaving ? 'Đang lưu...' : 'Lưu banner'}
    </button>
  )

  return (
    <SettingsSubpageShell
      title="Banner / Hero"
      description="Ảnh slideshow, tiêu đề, phụ đề và nút CTA."
      actions={saveButton}
    >
      {error ? (
        <p className="rounded-xl bg-error-container/50 px-4 py-3 text-sm text-error" role="alert">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p className="py-12 text-center text-sm text-on-surface-variant">Đang tải...</p>
      ) : (
        <div className="grid h-full gap-6 xl:grid-cols-2">
          <div className="space-y-5">
            <label className="block">
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
                onPickFiles={handlePickFiles}
                onRemove={handleRemove}
                onMove={(id, direction) =>
                  setImages((previous) => moveInList(previous, id, direction))
                }
                onDragStart={(event, id) => {
                  event.dataTransfer.setData('text/plain', id)
                  event.dataTransfer.effectAllowed = 'move'
                  setDragId(id)
                }}
                onDragOver={(event) => {
                  event.preventDefault()
                  event.dataTransfer.dropEffect = 'move'
                }}
                onDrop={(event, targetId) => {
                  event.preventDefault()
                  const fromId = event.dataTransfer.getData('text/plain') || dragId
                  setImages((previous) => reorderList(previous, fromId, targetId))
                  setDragId('')
                }}
                onDragEnd={() => setDragId('')}
              />
            </div>
          </div>

          <div className="space-y-3 xl:sticky xl:top-0 xl:self-start">
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
      )}

      <LoadingOverlay open={isSaving} message="Đang upload & lưu banner..." />
    </SettingsSubpageShell>
  )
}

export default SettingsHeroPage
