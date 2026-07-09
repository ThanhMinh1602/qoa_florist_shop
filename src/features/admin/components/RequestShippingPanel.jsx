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
    <form onSubmit={handleSave} className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4">
      <h4 className="text-sm font-semibold text-slate-900">Lên đơn vận chuyển</h4>
      <p className="mt-1 text-xs text-slate-500">
        Trạng thái hiện tại:{' '}
        <span className="font-medium text-sky-700">
          {SHIPPING_STATUS_LABELS[request.shippingStatus] ?? 'Chưa lên đơn'}
        </span>
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Đơn vị vận chuyển</span>
          <select
            value={provider}
            onChange={(event) => setProvider(event.target.value)}
            className="w-full rounded-xl border border-sky-100 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-100"
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
          <span className="mb-1 block text-xs font-medium text-slate-600">Mã vận đơn</span>
          <input
            type="text"
            value={trackingCode}
            onChange={(event) => setTrackingCode(event.target.value)}
            className="w-full rounded-xl border border-sky-100 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-100"
            placeholder="Mã tracking..."
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-slate-600">Trạng thái giao hàng</span>
          <select
            value={shippingStatus}
            onChange={(event) => setShippingStatus(event.target.value)}
            className="w-full rounded-xl border border-sky-100 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-100"
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
        <p className="mt-3 text-xs text-sky-700">{message}</p>
      ) : null}

      <button
        type="submit"
        disabled={isSaving}
        className="mt-4 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60"
      >
        {isSaving ? 'Đang lưu...' : 'Lưu đơn vận chuyển'}
      </button>
    </form>
  )
}

export default RequestShippingPanel
