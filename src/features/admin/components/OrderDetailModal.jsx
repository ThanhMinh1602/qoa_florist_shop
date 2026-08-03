import { useEffect, useMemo, useState } from 'react'
import { ORDER_STATUS_LABELS, ORDER_STATUS_OPTIONS } from '../../../constants/orderStatus'
import { SHIPPING_STATUS_LABELS } from '../../../constants/customRequestDefaults'
import { getTopicById } from '../../../constants/topics'
import { fetchProductsApi } from '../../../api/productsApi'
import { updateCustomRequestApi } from '../../../api/notificationsApi'
import { formatTimeAgo } from '../../../utils/formatTimeAgo'
import { getInvoiceCode } from '../../../utils/invoiceCode'
import { formatMoney, toDateInputValue } from '../../../utils/money'
import { buildZaloChatUrlToCustomer, openZaloChatWithCustomer } from '../../../utils/zalo'
import MaterialIcon from '../../../components/common/MaterialIcon'
import TopicLabel from '../../../components/common/TopicLabel'
import { PAYMENT_STATUS_LABELS } from '../constants/adminNavItems'
import OrderItemsEditor, { calcItemsSubtotal } from './OrderItemsEditor'
import OrderMoneyFields from './OrderMoneyFields'
import RequestExportButton from './RequestExportButton'
import RequestQrPanel from './RequestQrPanel'
import RequestShippingPanel from './RequestShippingPanel'

function OrderDetailModal({ request, onClose, onStatusChange, onUpdated, isUpdating }) {
  const topic = getTopicById(request.topicId)
  const status = ORDER_STATUS_LABELS[request.status] ?? ORDER_STATUS_LABELS.pending
  const hasCard = Boolean(request.cardId)
  const payment = PAYMENT_STATUS_LABELS[request.paymentStatus] ?? PAYMENT_STATUS_LABELS.unpaid

  const [products, setProducts] = useState([])
  const [items, setItems] = useState(request.items || [])
  const [money, setMoney] = useState({
    deposit: request.deposit ?? '',
    shippingFee: request.shippingFee ?? '',
    codAmount: request.codAmount ?? '',
    paidAmount: request.paidAmount ?? '',
    paymentStatus: request.paymentStatus || 'unpaid',
    paymentNote: request.paymentNote || '',
    shipDate: toDateInputValue(request.shipDate) || '',
    subtotalOverride: request.subtotal ?? '',
  })
  const [note, setNote] = useState(request.note || '')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const itemsSubtotal = useMemo(() => calcItemsSubtotal(items), [items])
  const subtotal =
    money.subtotalOverride !== '' && money.subtotalOverride !== undefined
      ? Number(money.subtotalOverride) || 0
      : itemsSubtotal

  useEffect(() => {
    fetchProductsApi(true)
      .then((result) => setProducts(result.data || []))
      .catch(() => setProducts([]))
  }, [])

  useEffect(() => {
    setItems(request.items || [])
    setMoney({
      deposit: request.deposit ?? '',
      shippingFee: request.shippingFee ?? '',
      codAmount: request.codAmount ?? '',
      paidAmount: request.paidAmount ?? '',
      paymentStatus: request.paymentStatus || 'unpaid',
      paymentNote: request.paymentNote || '',
      shipDate: toDateInputValue(request.shipDate) || '',
      subtotalOverride: request.subtotal ?? '',
    })
    setNote(request.note || '')
  }, [request])

  async function handleSaveCommerce() {
    setIsSaving(true)
    setError('')
    try {
      const result = await updateCustomRequestApi(request.id, {
        items,
        subtotal,
        deposit: Number(money.deposit) || 0,
        shippingFee: Number(money.shippingFee) || 0,
        codAmount: Number(money.codAmount) || 0,
        paidAmount: Number(money.paidAmount) || 0,
        paymentStatus: money.paymentStatus,
        paymentNote: money.paymentNote,
        shipDate: money.shipDate || null,
        note,
      })
      onUpdated?.(result.data)
    } catch (err) {
      setError(err.message || 'Không thể lưu.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-on-surface/50 p-0 sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Đóng" />

      <div className="relative z-10 flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-surface-container-lowest shadow-2xl sm:rounded-2xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-surface-container px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="font-mono text-xs font-bold tracking-wide text-on-surface-variant">
              {getInvoiceCode(request)}
            </p>
            <h3 className="mt-1 truncate text-lg font-semibold text-on-surface">
              {request.customerName}
            </h3>
            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-on-surface-variant">
              <span>{formatTimeAgo(request.createdAt)}</span>
              <span>·</span>
              {hasCard ? <TopicLabel topic={topic} topicId={request.topicId} /> : <span>Không QR</span>}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${status.className}`}>
                {status.label}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${payment.className}`}>
                {payment.label}
              </span>
              <span className="rounded-full bg-surface-container px-2.5 py-0.5 text-xs font-medium text-on-surface ring-1 ring-slate-200">
                {formatMoney(request.subtotal)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-outline transition hover:bg-surface-container hover:text-on-surface-variant"
            aria-label="Đóng"
          >
            <MaterialIcon name="close" className="text-xl" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-end gap-2">
            {request.customerPhone ? (
              <button
                type="button"
                onClick={() => openZaloChatWithCustomer(request)}
                className="inline-flex items-center gap-1 rounded-xl bg-[#0068FF] px-3 py-2 text-sm font-semibold text-white hover:bg-[#0054cc]"
                title={buildZaloChatUrlToCustomer(request)}
              >
                <MaterialIcon name="chat" className="text-lg" />
                Chat Zalo khách
              </button>
            ) : null}
            <RequestExportButton request={request} />
            <select
              value={request.status === 'reviewed' ? 'arranging' : request.status}
              disabled={isUpdating}
              onChange={(event) => onStatusChange(request.id, event.target.value)}
              className="rounded-xl border border-outline-variant/25 px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/20"
            >
              {ORDER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4">
            <h4 className="text-sm font-semibold text-on-surface">Sản phẩm & tiền</h4>
            <div className="mt-3">
              <OrderItemsEditor products={products} items={items} onChange={setItems} />
            </div>
            <div className="mt-4">
              <OrderMoneyFields
                values={money}
                onChange={(field, value) => setMoney((prev) => ({ ...prev, [field]: value }))}
                subtotal={itemsSubtotal}
              />
            </div>
            <label className="mt-3 block text-sm">
              <span className="mb-1 block font-medium text-on-surface">Note đơn</span>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-xl border border-outline-variant/25 px-3 py-2.5 outline-none focus:ring-2 focus:ring-secondary/20"
              />
            </label>
            {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
            <button
              type="button"
              onClick={handleSaveCommerce}
              disabled={isSaving}
              className="mt-3 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-container disabled:opacity-60"
            >
              {isSaving ? 'Đang lưu...' : 'Lưu sản phẩm & tiền'}
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {hasCard ? (
              <RequestQrPanel request={request} />
            ) : (
              <div className="rounded-2xl border border-dashed border-outline-variant/40 px-4 py-8 text-center text-sm text-on-surface-variant">
                Đơn không kèm thiệp QR
              </div>
            )}

            <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-4">
              <h4 className="text-sm font-semibold text-on-surface">Thông tin giao hàng</h4>
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-xs text-outline">Người nhận hàng</dt>
                  <dd className="font-medium text-on-surface">
                    {request.deliveryRecipientName || request.recipientName}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-outline">SĐT</dt>
                  <dd className="text-on-surface">{request.deliveryPhone || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-outline">Địa chỉ</dt>
                  <dd className="leading-6 text-on-surface">{request.deliveryAddress || '—'}</dd>
                </div>
                {request.shippingStatus ? (
                  <div>
                    <dt className="text-xs text-outline">VC</dt>
                    <dd className="text-on-surface">
                      {SHIPPING_STATUS_LABELS[request.shippingStatus]}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </div>

          <RequestShippingPanel request={request} onUpdated={onUpdated} />
        </div>
      </div>
    </div>
  )
}

export default OrderDetailModal
