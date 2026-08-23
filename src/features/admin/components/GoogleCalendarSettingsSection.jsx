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
import NotifyTimePickerModal, { periodMetaForTime } from './NotifyTimePickerModal'

const DEFAULT_TIMES = ['08:00', '13:00', '17:00']
const MAX_TIMES = 10

function emailsToText(emails = []) {
  return (emails || []).join(', ')
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

function GoogleCalendarSettingsSection({ bindActions }) {
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
  const [timeModal, setTimeModal] = useState(null)

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

  function openAddTimeModal() {
    if (notifyTimes.length >= maxTimes) return
    setTimeModal({ mode: 'add', index: -1, time: '08:00' })
  }

  function openEditTimeModal(index) {
    setTimeModal({
      mode: 'edit',
      index,
      time: notifyTimes[index] || '08:00',
    })
  }

  function handleConfirmTime(nextTime) {
    const cleaned = normalizeTimeValue(nextTime)
    if (!cleaned) return

    setNotifyTimes((previous) => {
      if (timeModal?.mode === 'edit' && timeModal.index >= 0) {
        const next = [...previous]
        next[timeModal.index] = cleaned
        return [...new Set(next.map(normalizeTimeValue).filter(Boolean))].sort()
      }
      if (previous.includes(cleaned) || previous.length >= maxTimes) return previous
      return [...previous, cleaned].sort()
    })
    setTimeModal(null)
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

  const handleSave = useCallback(async () => {
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
  }, [alert, calendarId, emailsText, enabled, maxTimes, notifyTimes])

  useEffect(() => {
    if (!bindActions) return undefined
    bindActions(
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || loading}
        className="btn-primary w-full !py-3 text-[10px] disabled:opacity-60 lg:w-auto lg:!py-2.5 lg:text-sm"
      >
        {saving ? 'Đang lưu...' : 'Lưu'}
      </button>,
    )
    return () => bindActions(null)
  }, [bindActions, handleSave, loading, saving])

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

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-5">
      {error ? (
        <p className="rounded-xl bg-error-container/50 px-4 py-3 text-sm text-error" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="py-16 text-center text-sm text-on-surface-variant">Đang tải...</p>
      ) : (
        <div className="grid flex-1 gap-6 xl:grid-cols-2 xl:gap-8">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-outline-variant/20 bg-surface-container-lowest/60 px-4 py-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-outline">
                  Kết nối
                </p>
                <p className="mt-0.5 text-sm text-on-surface-variant">
                  {!status?.configured ? (
                    <span className="text-error">Thiếu env API</span>
                  ) : connected ? (
                    <>
                      <span className="font-medium text-on-surface">Đã kết nối</span>
                      {status?.connectedEmail ? (
                        <span className="text-outline"> · {status.connectedEmail}</span>
                      ) : null}
                    </>
                  ) : (
                    <span>Chưa kết nối Google</span>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={!status?.configured || connecting || saving}
                  className="btn-primary px-2.5 py-1.5 text-xs disabled:opacity-60"
                >
                  {connecting ? '...' : connected ? 'Connect lại' : 'Connect'}
                </button>
                {connected ? (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    disabled={saving}
                    className="btn-glass px-2.5 py-1.5 text-xs disabled:opacity-60"
                  >
                    Ngắt
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={handleSyncShares}
                  disabled={!connected || saving}
                  className="btn-glass px-2.5 py-1.5 text-xs disabled:opacity-60"
                >
                  Sync share
                </button>
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-outline-variant/20 px-4 py-3">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(event) => setEnabled(event.target.checked)}
                disabled={!connected}
                className="h-4 w-4 accent-primary"
              />
              <span className="text-sm text-on-surface">Bật đồng bộ đơn hàng → Calendar</span>
            </label>

            <label className="block">
              <span className="label-caps text-on-surface-variant">Calendar ID</span>
              <input
                type="text"
                value={calendarId}
                onChange={(event) => setCalendarId(event.target.value)}
                placeholder="xxx@group.calendar.google.com"
                className="input-glass mt-1.5 h-11 text-sm"
              />
            </label>

            <label className="block">
              <span className="label-caps text-on-surface-variant">
                Gmail share (tối đa 3, cách nhau bởi dấu phẩy)
              </span>
              <input
                type="text"
                value={emailsText}
                onChange={(event) => setEmailsText(event.target.value)}
                placeholder="a@gmail.com, b@gmail.com"
                className="input-glass mt-1.5 h-11 text-sm"
              />
            </label>
          </div>

          <div className="flex min-h-0 flex-col rounded-xl border border-outline-variant/20 bg-surface-container-lowest/40 p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-primary">Giờ nhắc trong ngày</p>
                <p className="mt-0.5 text-xs text-on-surface-variant">
                  {notifyTimes.length}/{maxTimes} khung · bấm thẻ để sửa
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={resetDefaultTimes}
                  className="rounded-md px-2 py-1 text-[11px] text-on-surface-variant hover:bg-white"
                >
                  Mặc định
                </button>
                <button
                  type="button"
                  onClick={openAddTimeModal}
                  disabled={notifyTimes.length >= maxTimes}
                  className="inline-flex items-center gap-0.5 rounded-md px-2 py-1 text-[11px] text-primary hover:bg-primary/10 disabled:opacity-40"
                >
                  <MaterialIcon name="add" className="text-sm" />
                  Thêm
                </button>
              </div>
            </div>

            <ul className="grid gap-2 sm:grid-cols-2">
              {notifyTimes.map((time, index) => {
                const period = periodMetaForTime(time)
                return (
                  <li key={`notify-time-${index}`}>
                    <div className="flex items-center gap-1.5 rounded-xl border border-outline-variant/20 bg-white p-1.5 shadow-sm shadow-primary/5">
                      <button
                        type="button"
                        onClick={() => openEditTimeModal(index)}
                        className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition hover:bg-surface-container-low/70"
                      >
                        <span
                          className={[
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1',
                            period.accent,
                          ].join(' ')}
                        >
                          <MaterialIcon
                            name={period.icon}
                            className={`text-lg ${period.iconIdle}`}
                          />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-display text-lg leading-none text-primary tabular-nums">
                            {time}
                          </span>
                          <span className="mt-0.5 block text-[11px] text-on-surface-variant">
                            {period.shortLabel} · sửa
                          </span>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(index)}
                        disabled={notifyTimes.length <= 1}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-error-container/40 hover:text-error disabled:opacity-30"
                        aria-label={`Xóa khung giờ ${time}`}
                      >
                        <MaterialIcon name="delete" className="text-base" />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}

      <NotifyTimePickerModal
        open={Boolean(timeModal)}
        mode={timeModal?.mode || 'add'}
        initialTime={timeModal?.time || '08:00'}
        existingTimes={notifyTimes}
        onClose={() => setTimeModal(null)}
        onConfirm={handleConfirmTime}
      />
    </div>
  )
}

export default GoogleCalendarSettingsSection
