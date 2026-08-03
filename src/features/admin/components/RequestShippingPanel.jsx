import { useState } from 'react'
import { SHIPPING_PROVIDERS, SHIPPING_STATUS_LABELS } from '../../../constants/customRequestDefaults'
import { updateCustomRequestApi } from '../../../api/notificationsApi'

function RequestShippingPanel({ request, onUpdated }) {
  const [provider, setProvider] = useState(request.shippingProvider || '')
  const [trackingCode, setTrackingCode] = useState(request.shippingTrackingCode || '')
  const [shippingStatus, setShippingStatus] = useState(request.shippingStatus || 'pending')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSave(event) {
    event.preventDefault()
    setIsSaving(true)
    setMessage('')

    try {
      const result = await updateCustomRequestApi(request.id, {
        shippingProvider: provider,
        shippingTrackingCode: trackingCode,
        shippingStatus,
      })
      onUpdated(result.data)
      setMessage('Đã lưu thông tin vận chuyển.')
    } catch (err) {
      setMessage(err.message || 'Không thể lưu.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="rounded-2xl border border-outline-variant/30 bg-surface-container-low/50 p-4">
      <h4 className="text-sm font-semibold text-on-surface">Lên đơn vận chuyển</h4>
      <p className="mt-1 text-xs text-on-surface-variant">
        Trạng thái hiện tại:{' '}
        <span className="font-medium text-primary">
          {SHIPPING_STATUS_LABELS[request.shippingStatus] ?? 'Chưa lên đơn'}
        </span>
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-on-surface-variant">Đơn vị vận chuyển</span>
          <select
            value={provider}
            onChange={(event) => setProvider(event.target.value)}
            className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Chọn đơn vị</option>
            {SHIPPING_PROVIDERS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-on-surface-variant">Mã vận đơn</span>
          <input
            type="text"
            value={trackingCode}
            onChange={(event) => setTrackingCode(event.target.value)}
            className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Mã tracking..."
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-on-surface-variant">Trạng thái giao hàng</span>
          <select
            value={shippingStatus}
            onChange={(event) => setShippingStatus(event.target.value)}
            className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          >
            {Object.entries(SHIPPING_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {message ? (
        <p className="mt-3 text-xs text-primary">{message}</p>
      ) : null}

      <button
        type="submit"
        disabled={isSaving}
        className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-container disabled:opacity-60"
      >
        {isSaving ? 'Đang lưu...' : 'Lưu đơn vận chuyển'}
      </button>
    </form>
  )
}

export default RequestShippingPanel
