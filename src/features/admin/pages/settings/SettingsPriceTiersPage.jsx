import { useEffect, useRef, useState } from 'react'
import { updateLandingSettingsApi } from '../../../../api/settingsApi'
import { deleteUploadedImageApi } from '../../../../api/uploadsApi'
import LoadingOverlay from '../../../../components/common/LoadingOverlay'
import { PRICE_TIERS, getPriceTierWithImages } from '../../../../constants/priceTiers'
import { useDialog } from '../../../../context/DialogContext'
import { useLandingSettings } from '../../../../hooks/swr'
import PriceTierCard from '../../../landing/components/priceTiers/PriceTierCard'
import ImageListEditor from '../../components/settings/ImageListEditor'
import SettingsSubpageShell from '../../components/settings/SettingsSubpageShell'
import {
  buildLandingPayload,
  emptyTierState,
  hydrateTierState,
  mapFilesToImages,
  moveInList,
  reorderList,
  resolveUploadedImages,
  revokePreviewUrl,
} from '../../components/settings/settingsHelpers'

function SettingsPriceTiersPage() {
  const { alert } = useDialog()
  const {
    settings,
    isLoading,
    error: settingsError,
    mutate: mutateSettings,
  } = useLandingSettings()

  const [tiers, setTiers] = useState(() => emptyTierState())
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [dragId, setDragId] = useState('')
  const removedPublicIdsRef = useRef([])
  const tiersRef = useRef(tiers)
  const hydratedRef = useRef(false)
  tiersRef.current = tiers

  useEffect(() => {
    if (!settings || hydratedRef.current) return
    hydratedRef.current = true
    setTiers(hydrateTierState(settings.priceTiers))
    removedPublicIdsRef.current = []
  }, [settings])

  useEffect(() => {
    if (settingsError) setError(settingsError.message || 'Không tải được cài đặt.')
  }, [settingsError])

  useEffect(() => {
    return () => {
      tiersRef.current.forEach((tier) => {
        ;(tier.images || []).forEach(revokePreviewUrl)
      })
    }
  }, [])

  function updateTierDescription(tierId, description) {
    setTiers((previous) =>
      previous.map((tier) => (tier.id === tierId ? { ...tier, description } : tier)),
    )
  }

  function updateTierImages(tierId, updater) {
    setTiers((previous) =>
      previous.map((tier) => {
        if (tier.id !== tierId) return tier
        const nextImages = typeof updater === 'function' ? updater(tier.images) : updater
        return { ...tier, images: nextImages }
      }),
    )
  }

  function handlePickFiles(tierId, event) {
    const files = Array.from(event.target.files || []).filter((file) =>
      file.type.startsWith('image/'),
    )
    event.target.value = ''
    if (!files.length) return
    updateTierImages(tierId, (images) => [...images, ...mapFilesToImages(files)])
    setError('')
  }

  function handleRemove(tierId, image) {
    updateTierImages(tierId, (images) => images.filter((item) => item.id !== image.id))
    revokePreviewUrl(image)
    if (image.publicId) removedPublicIdsRef.current.push(image.publicId)
  }

  async function handleSave() {
    setIsSaving(true)
    setError('')
    try {
      const priceTiers = await Promise.all(
        tiers.map(async (tier) => ({
          id: tier.id,
          description: String(tier.description || '').trim(),
          images: await resolveUploadedImages(tier.images || []),
        })),
      )

      const payload = buildLandingPayload(settings, { priceTiers })
      const result = await updateLandingSettingsApi(payload)

      const publicIdsToDelete = [...removedPublicIdsRef.current]
      removedPublicIdsRef.current = []
      await Promise.allSettled(
        publicIdsToDelete.map((publicId) => deleteUploadedImageApi(publicId)),
      )

      tiers.forEach((tier) => {
        ;(tier.images || []).forEach(revokePreviewUrl)
      })

      const nextSettings = result.data || payload
      setTiers(hydrateTierState(nextSettings.priceTiers))
      await mutateSettings(nextSettings, { revalidate: false })
      setIsSaving(false)
      await alert({
        title: 'Đã lưu',
        message: 'Giới thiệu theo mức giá đã được cập nhật.',
        variant: 'success',
      })
    } catch (err) {
      const message = err.message || 'Không lưu được cài đặt.'
      setError(message)
      setIsSaving(false)
      await alert({ title: 'Lưu thất bại', message, variant: 'error' })
    }
  }

  const previewTiers = getPriceTierWithImages(
    tiers.map((tier) => ({
      id: tier.id,
      description: tier.description,
      images: (tier.images || []).map((image) => ({
        id: image.id,
        url: image.url,
        publicId: image.publicId || '',
      })),
    })),
  )

  const saveButton = (
    <button
      type="button"
      onClick={handleSave}
      disabled={isSaving || isLoading}
      className="btn-primary w-full !py-3 text-[10px] disabled:opacity-60 lg:w-auto lg:!py-2.5 lg:text-sm"
    >
      {isSaving ? 'Đang lưu...' : 'Lưu mức giá'}
    </button>
  )

  return (
    <SettingsSubpageShell
      title="Giới thiệu theo mức giá"
      description="Ảnh và mô tả cho 4 mức giá trên trang chủ."
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
        <div className="grid gap-4 xl:grid-cols-2">
          {tiers.map((tier) => {
            const meta = PRICE_TIERS.find((item) => item.id === tier.id)
            const preview = previewTiers.find((item) => item.id === tier.id)
            return (
              <section
                key={tier.id}
                className="flex flex-col gap-4 rounded-xl border border-outline-variant/20 p-4 md:p-5"
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-semibold text-primary">
                      {meta?.label || tier.id}
                    </h3>
                    <p className="mt-0.5 text-xs text-on-surface-variant">
                      Ảnh đầu tiên là ảnh đại diện trên thẻ.
                    </p>
                  </div>

                  <label className="block">
                    <span className="label-caps text-on-surface-variant">Mô tả</span>
                    <textarea
                      rows={3}
                      value={tier.description}
                      onChange={(event) => updateTierDescription(tier.id, event.target.value)}
                      placeholder={meta?.description || ''}
                      className="input-glass mt-1.5 resize-y"
                    />
                  </label>

                  <ImageListEditor
                    images={tier.images}
                    emptyLabel="Chưa có ảnh — thẻ dùng nền gradient."
                    dragId={dragId}
                    onPickFiles={(event) => handlePickFiles(tier.id, event)}
                    onRemove={(image) => handleRemove(tier.id, image)}
                    onMove={(id, direction) =>
                      updateTierImages(tier.id, (images) => moveInList(images, id, direction))
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
                      updateTierImages(tier.id, (images) =>
                        reorderList(images, fromId, targetId),
                      )
                      setDragId('')
                    }}
                    onDragEnd={() => setDragId('')}
                  />
                </div>

                <div className="space-y-2 border-t border-outline-variant/15 pt-4">
                  <p className="text-sm font-semibold text-primary">Preview</p>
                  {preview ? <PriceTierCard tier={preview} size="tablet" preview /> : null}
                </div>
              </section>
            )
          })}
        </div>
      )}

      <LoadingOverlay open={isSaving} message="Đang upload & lưu mức giá..." />
    </SettingsSubpageShell>
  )
}

export default SettingsPriceTiersPage
