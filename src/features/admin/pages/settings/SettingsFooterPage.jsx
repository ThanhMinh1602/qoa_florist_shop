import { useEffect, useRef, useState } from 'react'
import { updateLandingSettingsApi } from '../../../../api/settingsApi'
import { LANDING_COPY_DEFAULTS, mergeLandingCopy } from '../../../../constants/landingCopy'
import { useDialog } from '../../../../context/DialogContext'
import { useLandingSettings } from '../../../../hooks/swr'
import SettingsSubpageShell from '../../components/settings/SettingsSubpageShell'
import { buildLandingPayload } from '../../components/settings/settingsHelpers'

function SettingsFooterPage() {
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
        footerBrand: copy.footerBrand,
        footerTagline: copy.footerTagline,
        footerCopyright: copy.footerCopyright,
        footerEmail: copy.footerEmail,
        footerZaloPhone: copy.footerZaloPhone,
      })
      const result = await updateLandingSettingsApi(payload)
      const nextSettings = result.data || payload
      setCopy(mergeLandingCopy(nextSettings))
      await mutateSettings(nextSettings, { revalidate: false })
      setIsSaving(false)
      await alert({
        title: 'Đã lưu',
        message: 'Footer đã được cập nhật.',
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
      {isSaving ? 'Đang lưu...' : 'Lưu footer'}
    </button>
  )

  return (
    <SettingsSubpageShell
      title="Footer"
      description="Brand, tagline, email và số Zalo."
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
        <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <label className="block sm:col-span-2 lg:col-span-3">
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
      )}
    </SettingsSubpageShell>
  )
}

export default SettingsFooterPage
