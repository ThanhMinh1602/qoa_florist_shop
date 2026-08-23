import { useEffect, useRef, useState } from 'react'
import { updateLandingSettingsApi } from '../../../../api/settingsApi'
import { LANDING_COPY_DEFAULTS, mergeLandingCopy } from '../../../../constants/landingCopy'
import { useDialog } from '../../../../context/DialogContext'
import { useLandingSettings } from '../../../../hooks/swr'
import SettingsSubpageShell from '../../components/settings/SettingsSubpageShell'
import { buildLandingPayload } from '../../components/settings/settingsHelpers'

const SECTION_FIELDS = [
  { key: 'priceTiersTitle', label: 'Mức giá', rows: 1 },
  { key: 'featuredTitle', label: 'Bán chạy', rows: 1 },
  { key: 'customCardTitle', label: 'Tiêu đề thiệp số', rows: 1 },
  { key: 'customCardEyebrow', label: 'Eyebrow thiệp số', rows: 1 },
  { key: 'customCardHeading', label: 'Heading trong panel', rows: 2, span: true },
  { key: 'customCardBody', label: 'Mô tả thiệp số', rows: 2, span: true },
  { key: 'customCardCta', label: 'Nút thiệp số', rows: 1 },
]

function SettingsSectionsPage() {
  const { alert } = useDialog()
  const {
    settings,
    isLoading,
    error: settingsError,
    mutate: mutateSettings,
  } = useLandingSettings()

  const [copy, setCopy] = useState(() => ({ ...LANDING_COPY_DEFAULTS }))
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const hydratedRef = useRef(false)

  useEffect(() => {
    if (!settings || hydratedRef.current) return
    hydratedRef.current = true
    setCopy(mergeLandingCopy(settings))
  }, [settings])

  useEffect(() => {
    if (settingsError) setError(settingsError.message || 'Không tải được cài đặt.')
  }, [settingsError])

  function updateCopyField(key, value) {
    setCopy((previous) => ({ ...previous, [key]: value }))
  }

  async function handleSave() {
    setIsSaving(true)
    setError('')
    try {
      const payload = buildLandingPayload(settings, {
        priceTiersTitle: copy.priceTiersTitle,
        featuredTitle: copy.featuredTitle,
        customCardTitle: copy.customCardTitle,
        customCardEyebrow: copy.customCardEyebrow,
        customCardHeading: copy.customCardHeading,
        customCardBody: copy.customCardBody,
        customCardCta: copy.customCardCta,
      })
      const result = await updateLandingSettingsApi(payload)
      const nextSettings = result.data || payload
      setCopy(mergeLandingCopy(nextSettings))
      await mutateSettings(nextSettings, { revalidate: false })
      setIsSaving(false)
      await alert({
        title: 'Đã lưu',
        message: 'Tiêu đề các section đã được cập nhật.',
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
      {isSaving ? 'Đang lưu...' : 'Lưu tiêu đề'}
    </button>
  )

  return (
    <SettingsSubpageShell
      title="Tiêu đề các section"
      description="Mức giá, bán chạy và khối thiệp số."
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
        <div className="space-y-8">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-primary">Section trang chủ</h3>
            <div className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {SECTION_FIELDS.filter((field) =>
                ['priceTiersTitle', 'featuredTitle'].includes(field.key),
              ).map((field) => (
                <label key={field.key} className="block">
                  <span className="label-caps text-on-surface-variant">{field.label}</span>
                  <input
                    type="text"
                    value={copy[field.key]}
                    onChange={(event) => updateCopyField(field.key, event.target.value)}
                    placeholder={LANDING_COPY_DEFAULTS[field.key]}
                    className="input-glass mt-1.5"
                  />
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-primary">Khối thiệp số</h3>
            <div className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {SECTION_FIELDS.filter((field) =>
                !['priceTiersTitle', 'featuredTitle'].includes(field.key),
              ).map((field) => (
                <label
                  key={field.key}
                  className={[
                    'block',
                    field.span ? 'sm:col-span-2 xl:col-span-3' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className="label-caps text-on-surface-variant">{field.label}</span>
                  {field.rows > 1 ? (
                    <textarea
                      rows={field.rows}
                      value={copy[field.key]}
                      onChange={(event) => updateCopyField(field.key, event.target.value)}
                      placeholder={LANDING_COPY_DEFAULTS[field.key]}
                      className="input-glass mt-1.5 resize-y"
                    />
                  ) : (
                    <input
                      type="text"
                      value={copy[field.key]}
                      onChange={(event) => updateCopyField(field.key, event.target.value)}
                      placeholder={LANDING_COPY_DEFAULTS[field.key]}
                      className="input-glass mt-1.5"
                    />
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </SettingsSubpageShell>
  )
}

export default SettingsSectionsPage
