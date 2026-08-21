import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  disconnectGoogleCalendarApi,
  fetchGoogleCalendarConnectUrlApi,
  fetchGoogleCalendarStatusApi,
  syncGoogleCalendarSharesApi,
  updateGoogleCalendarSettingsApi,
} from '../../../api/googleCalendarApi'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { useDialog } from '../../../context/DialogContext'

const DEFAULT_TIMES = ['08:00', '13:00', '17:00']
const MAX_TIMES = 10

function emailsToText(emails = []) {
  return (emails || []).join('\n')
}

function textToEmails(text) {
  return String(text || '')
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3)
}

function normalizeTimeValue(value) {
  const raw = String(value || '').trim()
  const match = raw.match(/^([01]?\d|2[0-3]):([0-5]\d)$/)
  if (!match) return ''
  return `${String(Number(match[1])).padStart(2, '0')}:${match[2]}`
}

function GoogleCalendarSettingsSection({ open, onToggle }) {
  const { alert, confirm } = useDialog()
  const [searchParams, setSearchParams] = useSearchParams()
  const [status, setStatus] = useState(null)
  const [calendarId, setCalendarId] = useState('')
  const [emailsText, setEmailsText] = useState('')
  const [notifyTimes, setNotifyTimes] = useState(() => [...DEFAULT_TIMES])
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')

  const maxTimes = status?.maxNotifyTimes || MAX_TIMES

  const loadStatus = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await fetchGoogleCalendarStatusApi()
      const data = result.data
      setStatus(data)
      setCalendarId(data.calendarId || '')
      setEmailsText(emailsToText(data.notifyEmails))
      setNotifyTimes(
        Array.isArray(data.notifyTimes) && data.notifyTimes.length > 0
          ? data.notifyTimes
          : [...(data.defaultNotifyTimes || DEFAULT_TIMES)],
      )
      setEnabled(Boolean(data.enabled))
    } catch (err) {
      setError(err.message || 'Không tải được trạng thái Google Calendar.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadStatus()
  }, [loadStatus])

  useEffect(() => {
    const google = searchParams.get('google')
    if (!google) return

    const message = searchParams.get('message') || ''
    const next = new URLSearchParams(searchParams)
    next.delete('google')
    next.delete('message')
    setSearchParams(next, { replace: true })

    if (google === 'connected') {
      void loadStatus()
      void alert({
        title: 'Đã kết nối Google',
        message: 'Tài khoản Google đã liên kết. Hãy điền Calendar ID, Gmail và khung giờ nhắc.',
        variant: 'success',
      })
      return
    }

    void alert({
      title: 'Kết nối Google thất bại',
      message: message || 'Không kết nối được Google Calendar.',
      variant: 'error',
    })
  }, [alert, loadStatus, searchParams, setSearchParams])

  function updateTimeAt(index, value) {
    setNotifyTimes((previous) => {
      const next = [...previous]
      next[index] = value
      return next
    })
  }

  function addTimeSlot() {
    setNotifyTimes((previous) => {
      if (previous.length >= maxTimes) return previous
      return [...previous, '09:00']
    })
  }

  function removeTimeSlot(index) {
    setNotifyTimes((previous) => {
      if (previous.length <= 1) return previous
      return previous.filter((_, i) => i !== index)
    })
  }

  function resetDefaultTimes() {
    setNotifyTimes([...(status?.defaultNotifyTimes || DEFAULT_TIMES)])
  }

  async function handleConnect() {
    setConnecting(true)
    try {
      const result = await fetchGoogleCalendarConnectUrlApi()
      const authUrl = result.data?.authUrl
      if (!authUrl) throw new Error('Không nhận được URL đăng nhập Google.')
      window.location.href = authUrl
    } catch (err) {
      setConnecting(false)
      await alert({
        title: 'Không mở được Google',
        message: err.message || 'Kiểm tra GOOGLE_CLIENT_ID trên API.',
        variant: 'error',
      })
    }
  }

  async function handleDisconnect() {
    const ok = await confirm({
      title: 'Ngắt kết nối Google?',
      message: 'Đơn mới sẽ không còn đồng bộ lên Calendar cho đến khi Connect lại.',
      confirmLabel: 'Ngắt kết nối',
      variant: 'danger',
    })
    if (!ok) return

    setSaving(true)
    try {
      const result = await disconnectGoogleCalendarApi()
      setStatus(result.data)
      setEnabled(false)
      await alert({
        title: 'Đã ngắt kết nối',
        message: 'Google Calendar đã được disconnect.',
        variant: 'success',
      })
    } catch (err) {
      await alert({
        title: 'Lỗi',
        message: err.message || 'Không ngắt được kết nối.',
        variant: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleSave() {
    const cleanedTimes = [
      ...new Set(notifyTimes.map(normalizeTimeValue).filter(Boolean)),
    ]
      .sort()
      .slice(0, maxTimes)

    if (cleanedTimes.length === 0) {
      await alert({
        title: 'Thiếu khung giờ',
        message: 'Hãy thêm ít nhất 1 khung giờ nhắc hợp lệ (vd. 08:00).',
        variant: 'error',
      })
      return
    }

    setSaving(true)
    try {
      const result = await updateGoogleCalendarSettingsApi({
        calendarId: calendarId.trim(),
        notifyEmails: textToEmails(emailsText),
        notifyTimes: cleanedTimes,
        enabled,
        syncShares: true,
      })
      setStatus(result.data)
      setCalendarId(result.data.calendarId || '')
      setEmailsText(emailsToText(result.data.notifyEmails))
      setNotifyTimes(
        Array.isArray(result.data.notifyTimes) && result.data.notifyTimes.length > 0
          ? result.data.notifyTimes
          : cleanedTimes,
      )
      setEnabled(Boolean(result.data.enabled))

      const share = result.data.shareResult
      const shareMsg = share
        ? `Share: +${(share.added || []).length} / −${(share.removed || []).length}`
        : 'Chưa sync share'
      await alert({
        title: 'Đã lưu Google Calendar',
        message: `${cleanedTimes.length} khung giờ nhắc · ${shareMsg}`,
        variant: 'success',
      })
    } catch (err) {
      await alert({
        title: 'Lưu thất bại',
        message: err.message || 'Không lưu được cài đặt Calendar.',
        variant: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleSyncShares() {
    setSaving(true)
    try {
      const result = await syncGoogleCalendarSharesApi()
      setStatus(result.data)
      const share = result.data.shareResult
      await alert({
        title: 'Đã sync share',
        message: share?.ok
          ? `Đã cập nhật quyền cho ${(result.data.notifyEmails || []).length} Gmail.`
          : share?.message || 'Sync xong nhưng có lỗi.',
        variant: share?.ok === false ? 'error' : 'success',
      })
    } catch (err) {
      await alert({
        title: 'Sync thất bại',
        message: err.message || 'Không sync được quyền share.',
        variant: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  const connected = Boolean(status?.connected)
  const summary = loading
    ? 'Đang tải...'
    : connected
      ? `${enabled ? 'Đang đồng bộ' : 'Tắt đồng bộ'} · ${notifyTimes.length} giờ nhắc · ${(status?.notifyEmails || []).length}/3 mail`
      : status?.configured
        ? 'Chưa Connect Google'
        : 'Chưa cấu hình env API'

  return (
    <section className="glass-card overflow-hidden rounded-xl">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-surface-container-low/50 md:px-6 md:py-5"
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-primary md:text-lg">Google Calendar</h3>
          <p className="mt-0.5 text-xs text-on-surface-variant md:text-sm">
            Đồng bộ đơn giao, share Gmail, và đặt nhiều khung giờ nhắc trong ngày (tối đa {maxTimes}).
          </p>
          <p
            className={[
              'truncate text-xs text-outline transition-[opacity,margin,max-height] duration-300 ease-out',
              open ? 'mt-0 max-h-0 opacity-0' : 'mt-1.5 max-h-6 opacity-100',
            ].join(' ')}
          >
            {summary}
          </p>
        </div>
        <span
          className={[
            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-low text-primary transition-transform duration-300 ease-out',
            open ? 'rotate-180' : '',
          ].join(' ')}
        >
          <MaterialIcon name="expand_more" />
        </span>
      </button>

      {open ? (
        <div className="space-y-4 border-t border-outline-variant/20 px-5 py-5 md:px-6">
          {error ? (
            <p className="rounded-xl bg-error-container/50 px-4 py-3 text-sm text-error" role="alert">
              {error}
            </p>
          ) : null}

          {loading ? (
            <p className="text-sm text-on-surface-variant">Đang tải trạng thái...</p>
          ) : (
            <>
              <div className="rounded-xl bg-surface-container-low/70 px-4 py-3 text-sm text-on-surface-variant">
                <p>
                  Env API:{' '}
                  <span className="font-medium text-on-surface">
                    {status?.configured ? 'Đã cấu hình' : 'Thiếu CLIENT_ID / SECRET / API_PUBLIC_URL'}
                  </span>
                </p>
                <p className="mt-1">
                  Google:{' '}
                  <span className="font-medium text-on-surface">
                    {connected
                      ? `Đã kết nối (${status?.connectedEmail || 'OK'})`
                      : 'Chưa kết nối'}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={!status?.configured || connecting || saving}
                  className="btn-primary disabled:opacity-60"
                >
                  {connecting ? 'Đang mở Google...' : connected ? 'Connect lại' : 'Connect Google'}
                </button>
                {connected ? (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    disabled={saving}
                    className="btn-glass disabled:opacity-60"
                  >
                    Disconnect
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={handleSyncShares}
                  disabled={!connected || saving}
                  className="btn-glass disabled:opacity-60"
                >
                  Sync share 3 Gmail
                </button>
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-outline-variant/25 px-4 py-3">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(event) => setEnabled(event.target.checked)}
                  disabled={!connected}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-sm text-on-surface">
                  Bật đồng bộ đơn hàng → Google Calendar
                </span>
              </label>

              <label className="block">
                <span className="label-caps text-on-surface-variant">Calendar ID</span>
                <input
                  type="text"
                  value={calendarId}
                  onChange={(event) => setCalendarId(event.target.value)}
                  placeholder="xxxx@group.calendar.google.com hoặc primary"
                  className="input-glass mt-1.5"
                />
              </label>

              <label className="block">
                <span className="label-caps text-on-surface-variant">
                  3 Gmail nhận lịch (mỗi dòng 1 mail)
                </span>
                <textarea
                  rows={3}
                  value={emailsText}
                  onChange={(event) => setEmailsText(event.target.value)}
                  placeholder={'mail1@gmail.com\nmail2@gmail.com\nmail3@gmail.com'}
                  className="input-glass mt-1.5 resize-y font-mono text-sm"
                />
              </label>

              <div className="rounded-xl border border-outline-variant/25 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="label-caps text-on-surface-variant">
                      Khung giờ nhắc trong ngày
                    </p>
                    <p className="mt-1 text-xs text-outline">
                      Giống báo thức: nếu ngày đó còn đơn chưa giao, Calendar sẽ nhắc đúng các giờ
                      này. Tối đa {maxTimes} khung · mặc định 08:00, 13:00, 17:00.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetDefaultTimes}
                    className="btn-glass px-2.5 py-1 text-xs"
                  >
                    Đặt lại mặc định
                  </button>
                </div>

                <ul className="mt-3 space-y-2">
                  {notifyTimes.map((time, index) => (
                    <li key={`notify-time-${index}`} className="flex items-center gap-2">
                      <span className="w-6 text-center text-xs font-semibold text-outline">
                        {index + 1}
                      </span>
                      <input
                        type="time"
                        value={time}
                        onChange={(event) => updateTimeAt(index, event.target.value)}
                        className="input-glass max-w-[10rem]"
                      />
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(index)}
                        disabled={notifyTimes.length <= 1}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-error-container/40 hover:text-error disabled:opacity-30"
                        aria-label={`Xóa khung giờ ${index + 1}`}
                      >
                        <MaterialIcon name="delete" className="text-lg" />
                      </button>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={addTimeSlot}
                  disabled={notifyTimes.length >= maxTimes}
                  className="btn-glass mt-3 inline-flex items-center gap-1.5 disabled:opacity-40"
                >
                  <MaterialIcon name="alarm_add" className="text-lg" />
                  Thêm khung giờ ({notifyTimes.length}/{maxTimes})
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || loading}
                  className="btn-primary disabled:opacity-60"
                >
                  {saving ? 'Đang lưu...' : 'Lưu Google Calendar'}
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}
    </section>
  )
}

export default GoogleCalendarSettingsSection
