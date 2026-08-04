import { useEffect, useMemo, useState } from 'react'
import { ORDER_STATUS_LABELS, ORDER_STATUS_OPTIONS } from '../../../constants/orderStatus'
import {
  SHIPPING_STATUS_LABELS,
  SHIPPING_STATUS_OPTIONS,
} from '../../../constants/customRequestDefaults'
import { fetchProductsApi } from '../../../api/productsApi'
import { updateCustomRequestApi } from '../../../api/notificationsApi'
import { formatTimeAgo } from '../../../utils/formatTimeAgo'
import { getInvoiceCode } from '../../../utils/invoiceCode'
import { formatMoney, toDateInputValue } from '../../../utils/money'
import { calcOrderMoney } from '../../../utils/orderMoney'
import { buildZaloChatUrlToCustomer, openZaloChatWithCustomer } from '../../../utils/zalo'
import MaterialIcon from '../../../components/common/MaterialIcon'
import OrderItemsEditor, { calcItemsSubtotal } from './OrderItemsEditor'
import OrderMoneyFields from './OrderMoneyFields'
import RequestExportButton from './RequestExportButton'
import RequestShippingPanel from './RequestShippingPanel'

function moneyStateFromRequest(request) {
  return {
    addOnAmount: request.addOnAmount ?? '',
    deposit: request.deposit ?? '',
    shippingFee: request.shippingFee ?? '',
    actualShippingFee: request.actualShippingFee ?? '',
    incidentalAmount: request.incidentalAmount ?? '',
    codAmount: request.codAmount ?? '',
    codManual: true,
    paidAmount: request.paidAmount ?? '',
    paymentStatus: request.paymentStatus || 'unpaid',
    paymentNote: request.paymentNote || '',
  }
}

function OrderDetailModal({
  request,
  onClose,
  onStatusChange,
  onShippingStatusChange,
  onUpdated,
  isUpdating,
}) {
  const status = ORDER_STATUS_LABELS[request.status] ?? ORDER_STATUS_LABELS.pending
  const shippingKey = request.shippingStatus || 'pending'

  const [products, setProducts] = useState([])
  const [items, setItems] = useState(request.items || [])
  const [money, setMoney] = useState(() => moneyStateFromRequest(request))
  const [note, setNote] = useState(request.note || '')
  const [customerName, setCustomerName] = useState(request.customerName || '')
  const [customerPhone, setCustomerPhone] = useState(request.customerPhone || '')
  const [deliveryAddress, setDeliveryAddress] = useState(request.deliveryAddress || '')
  const [orderDate, setOrderDate] = useState(toDateInputValue(request.orderDate || request.createdAt) || '')
  const [neededDate, setNeededDate] = useState(
    toDateInputValue(request.shipDate) || request.deliveryDate || '',
  )
  const [shipTime, setShipTime] = useState(request.deliveryTimeSlot || '')
  const [trackingCode, setTrackingCode] = useState(request.shippingTrackingCode || '')
  const [monthEndChecked, setMonthEndChecked] = useState(Boolean(request.monthEndChecked))
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const productsTotal = useMemo(() => calcItemsSubtotal(items), [items])
  const totals = useMemo(
    () =>
      calcOrderMoney({
        productsTotal,
        addOnAmount: money.addOnAmount,
        deposit: money.deposit,
        shippingFee: money.shippingFee,
        actualShippingFee: money.actualShippingFee,
        incidentalAmount: money.incidentalAmount,
        codOverride: money.codManual ? money.codAmount : undefined,
      }),
    [productsTotal, money],
  )

  useEffect(() => {
    fetchProductsApi(true)
      .then((result) => setProducts(result.data || []))
      .catch(() => setProducts([]))
  }, [])

  useEffect(() => {
    setItems(request.items || [])
    setMoney(moneyStateFromRequest(request))
    setNote(request.note || '')
    setCustomerName(request.customerName || '')
    setCustomerPhone(request.customerPhone || '')
    setDeliveryAddress(request.deliveryAddress || '')
    setOrderDate(toDateInputValue(request.orderDate || request.createdAt) || '')
    setNeededDate(toDateInputValue(request.shipDate) || request.deliveryDate || '')
    setShipTime(request.deliveryTimeSlot || '')
    setTrackingCode(request.shippingTrackingCode || '')
    setMonthEndChecked(Boolean(request.monthEndChecked))
  }, [request])

  async function handleSaveCommerce() {
    setIsSaving(true)
    setError('')
    try {
      const result = await updateCustomRequestApi(request.id, {
        items,
        addOnAmount: totals.addOnAmount,
        subtotal: totals.orderTotal,
        deposit: totals.deposit,
        shippingFee: totals.shippingFee,
        actualShippingFee: totals.actualShippingFee,
        incidentalAmount: totals.incidentalAmount,
        codAmount: totals.codAmount,
        paidAmount: Number(money.paidAmount) || totals.deposit,
        paymentStatus: money.paymentStatus,
        paymentNote: money.paymentNote,
        note,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryRecipientName: customerName.trim() || request.deliveryRecipientName,
        deliveryPhone: customerPhone.trim() || request.deliveryPhone,
        deliveryAddress: deliveryAddress.trim(),
        orderDate: orderDate || null,
        shipDate: neededDate || null,
        deliveryDate: neededDate || '',
        deliveryTimeSlot: shipTime,
        shippingTrackingCode: trackingCode,
        monthEndChecked,
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
            <p className="mt-1 text-sm text-on-surface-variant">{formatTimeAgo(request.createdAt)}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${status.className}`}>
                {status.label}
              </span>
              <span className="rounded-full bg-surface-container px-2.5 py-0.5 text-xs font-medium text-on-surface ring-1 ring-slate-200">
                {SHIPPING_STATUS_LABELS[shippingKey] || 'Chưa giao'}
              </span>
              <span className="rounded-full bg-surface-container px-2.5 py-0.5 text-xs font-medium text-on-surface ring-1 ring-slate-200">
                {formatMoney(request.subtotal)}
              </span>
              {request.monthEndChecked ? (
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                  Đã check cuối tháng
                </span>
              ) : null}
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
              title="Trạng thái làm hàng"
            >
              {ORDER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={shippingKey}
              disabled={isUpdating}
              onChange={(event) =>
                onShippingStatusChange
                  ? onShippingStatusChange(request.id, event.target.value)
                  : null
              }
              className="rounded-xl border border-outline-variant/25 px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
              title="Trạng thái giao hàng"
            >
              {SHIPPING_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4">
            <h4 className="text-sm font-semibold text-on-surface">Thời gian & vận đơn</h4>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-on-surface">Ngày đặt</span>
                <input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="w-full rounded-xl border border-outline-variant/25 px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-on-surface">Ngày cần</span>
                <input
                  type="date"
                  value={neededDate}
                  onChange={(e) => setNeededDate(e.target.value)}
                  className="w-full rounded-xl border border-outline-variant/25 px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-on-surface">Thời gian ship</span>
                <input
                  type="text"
                  value={shipTime}
                  onChange={(e) => setShipTime(e.target.value)}
                  className="w-full rounded-xl border border-outline-variant/25 px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className="mb-1 block font-medium text-on-surface">Mã vận đơn</span>
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  className="w-full rounded-xl border border-outline-variant/25 px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="flex items-center gap-2 pt-7 text-sm text-on-surface">
                <input
                  type="checkbox"
                  checked={monthEndChecked}
                  onChange={(e) => setMonthEndChecked(e.target.checked)}
                  className="h-4 w-4 rounded border-outline-variant"
                />
                Check cuối tháng
              </label>
            </div>
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
                productsTotal={productsTotal}
              />
            </div>
            <label className="mt-3 block text-sm">
              <span className="mb-1 block font-medium text-on-surface">Note</span>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-xl border border-outline-variant/25 px-3 py-2.5 outline-none focus:ring-2 focus:ring-secondary/20"
              />
            </label>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-4">
            <h4 className="text-sm font-semibold text-on-surface">Khách & địa chỉ</h4>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-on-surface">Tên KH</span>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl border border-outline-variant/25 px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-on-surface">SĐT</span>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-xl border border-outline-variant/25 px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className="mb-1 block font-medium text-on-surface">Địa chỉ</span>
                <textarea
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full rounded-xl border border-outline-variant/25 px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              {request.shippingStatus ? (
                <p className="text-sm text-on-surface-variant sm:col-span-2">
                  Giao hàng: {SHIPPING_STATUS_LABELS[request.shippingStatus] || 'Chưa giao'}
                </p>
              ) : null}
            </div>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="button"
            onClick={handleSaveCommerce}
            disabled={isSaving}
            className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-container disabled:opacity-60 sm:w-auto"
          >
            {isSaving ? 'Đang lưu...' : 'Lưu đơn'}
          </button>

          <RequestShippingPanel request={request} onUpdated={onUpdated} />
        </div>
      </div>
    </div>
  )
}

export default OrderDetailModal
