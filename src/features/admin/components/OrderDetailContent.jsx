import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { ORDER_STATUS_OPTIONS } from '../../../constants/orderStatus'
import {
  SHIPPING_PROVIDERS,
  SHIPPING_STATUS_OPTIONS,
} from '../../../constants/customRequestDefaults'
import { fetchProductsApi } from '../../../api/productsApi'
import { updateCustomRequestApi } from '../../../api/notificationsApi'
import { toIsoDateInput, formatViDate } from '../../../utils/dateFormat'
import { formatMoney, normalizeOrderItems, toDateInputValue } from '../../../utils/money'
import { calcOrderMoney } from '../../../utils/orderMoney'
import { normalizeTrackingCode } from '../../../utils/trackingCode'
import { buildZaloChatUrlToCustomer, openZaloChatWithCustomer } from '../../../utils/zalo'
import MaterialIcon from '../../../components/common/MaterialIcon'
import OrderItemsEditor, { calcItemsSubtotal } from './OrderItemsEditor'
import OrderMoneyFields from './OrderMoneyFields'
import RequestExportButton from './RequestExportButton'

function moneyStateFromRequest(request) {
  return {
    addOnAmount: request.addOnAmount ?? '',
    deposit: request.deposit ?? '',
    shippingFee: request.shippingFee ?? '',
    actualShippingFee: request.actualShippingFee ?? '',
    incidentalAmount: request.incidentalAmount ?? '',
    codAmount: request.codAmount ?? '',
    codManual: true,
    paymentNote: request.paymentNote || '',
  }
}

function formStateFromRequest(request) {
  return {
    items: normalizeOrderItems(request.items),
    money: moneyStateFromRequest(request),
    note: request.note || '',
    customerName: request.customerName || '',
    customerPhone: request.customerPhone || '',
    deliveryAddress: request.deliveryAddress || '',
    orderDate: toDateInputValue(request.orderDate || request.createdAt) || '',
    neededDate:
      toIsoDateInput(request.deliveryDate) ||
      toDateInputValue(request.deliveryDate) ||
      toDateInputValue(request.shipDate) ||
      '',
    shipDate:
      toDateInputValue(request.shipDate) ||
      toIsoDateInput(request.deliveryTimeSlot) ||
      toIsoDateInput(request.deliveryDate) ||
      toDateInputValue(request.deliveryDate) ||
      '',
    shippingProvider: request.shippingProvider || '',
    trackingCode: normalizeTrackingCode(request.shippingTrackingCode),
    monthEndChecked: Boolean(request.monthEndChecked),
  }
}

function displayValue(value) {
  const text = String(value ?? '').trim()
  return text || '—'
}

function shippingProviderLabel(id) {
  if (!id) return '—'
  return SHIPPING_PROVIDERS.find((item) => item.id === id)?.label || id
}

function ViewField({ label, children, className = '' }) {
  return (
    <div className={className}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-on-surface-variant">{label}</p>
      <div className="mt-1 text-sm text-on-surface">{children}</div>
    </div>
  )
}

const OrderDetailContent = forwardRef(function OrderDetailContent(
  {
    request,
    isEditing,
    onUpdated,
    onStatusChange,
    onShippingStatusChange,
    isUpdating,
  },
  ref,
) {
  const shippingKey = request.shippingStatus || 'pending'

  const [products, setProducts] = useState([])
  const [items, setItems] = useState(() => normalizeOrderItems(request.items))
  const [money, setMoney] = useState(() => moneyStateFromRequest(request))
  const [note, setNote] = useState(request.note || '')
  const [customerName, setCustomerName] = useState(request.customerName || '')
  const [customerPhone, setCustomerPhone] = useState(request.customerPhone || '')
  const [deliveryAddress, setDeliveryAddress] = useState(request.deliveryAddress || '')
  const [orderDate, setOrderDate] = useState(toDateInputValue(request.orderDate || request.createdAt) || '')
  const [neededDate, setNeededDate] = useState(
    toIsoDateInput(request.deliveryDate) ||
      toDateInputValue(request.deliveryDate) ||
      toDateInputValue(request.shipDate) ||
      '',
  )
  const [shipDate, setShipDate] = useState(
    toDateInputValue(request.shipDate) ||
      toIsoDateInput(request.deliveryTimeSlot) ||
      toIsoDateInput(request.deliveryDate) ||
      toDateInputValue(request.deliveryDate) ||
      '',
  )
  const [shippingProvider, setShippingProvider] = useState(request.shippingProvider || '')
  const [trackingCode, setTrackingCode] = useState(() =>
    normalizeTrackingCode(request.shippingTrackingCode),
  )
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

  function applyFormState(next) {
    setItems(next.items)
    setMoney(next.money)
    setNote(next.note)
    setCustomerName(next.customerName)
    setCustomerPhone(next.customerPhone)
    setDeliveryAddress(next.deliveryAddress)
    setOrderDate(next.orderDate)
    setNeededDate(next.neededDate)
    setShipDate(next.shipDate)
    setShippingProvider(next.shippingProvider)
    setTrackingCode(next.trackingCode)
    setMonthEndChecked(next.monthEndChecked)
  }

  function revert() {
    applyFormState(formStateFromRequest(request))
    setError('')
  }

  useEffect(() => {
    fetchProductsApi(true)
      .then((result) => setProducts(result.data || []))
      .catch(() => setProducts([]))
  }, [])

  useEffect(() => {
    applyFormState(formStateFromRequest(request))
    setError('')
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
        paidAmount: totals.deposit,
        paymentNote: money.paymentNote,
        note,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryRecipientName: customerName.trim() || request.deliveryRecipientName,
        deliveryPhone: customerPhone.trim() || request.deliveryPhone,
        deliveryAddress: deliveryAddress.trim(),
        orderDate: orderDate || null,
        shipDate: shipDate || neededDate || null,
        deliveryDate: neededDate || '',
        deliveryTimeSlot: shipDate || request.deliveryTimeSlot || '',
        shippingProvider,
        shippingTrackingCode: normalizeTrackingCode(trackingCode),
        monthEndChecked,
      })
      onUpdated?.(result.data)
      return result.data
    } catch (err) {
      setError(err.message || 'Không thể lưu.')
      return null
    } finally {
      setIsSaving(false)
    }
  }

  useImperativeHandle(
    ref,
    () => ({
      save: handleSaveCommerce,
      revert,
      get isSaving() {
        return isSaving
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- save closes over latest form state
    [isSaving, items, money, note, customerName, customerPhone, deliveryAddress, orderDate, neededDate, shipDate, shippingProvider, trackingCode, monthEndChecked, totals, request],
  )

  return (
    <div className="space-y-4">
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
            onShippingStatusChange ? onShippingStatusChange(request.id, event.target.value) : null
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

      <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-4">
        <h4 className="text-sm font-semibold text-on-surface">Khách & địa chỉ</h4>
        {isEditing ? (
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
          </div>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <ViewField label="Tên KH">{displayValue(customerName)}</ViewField>
            <ViewField label="SĐT">{displayValue(customerPhone)}</ViewField>
            <ViewField label="Địa chỉ" className="sm:col-span-2">
              <p className="whitespace-pre-wrap">{displayValue(deliveryAddress)}</p>
            </ViewField>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4">
        <h4 className="text-sm font-semibold text-on-surface">Lịch & vận đơn</h4>
        {isEditing ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <label className="block min-w-0 text-sm">
              <span className="mb-1 block font-medium text-on-surface">Ngày đặt</span>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full min-w-0 max-w-full rounded-xl border border-outline-variant/25 px-3 py-2.5 text-sm outline-none [color-scheme:light] focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="block min-w-0 text-sm">
              <span className="mb-1 block font-medium text-rose-700">Ngày cần</span>
              <input
                type="date"
                value={neededDate}
                onChange={(e) => setNeededDate(e.target.value)}
                className="w-full min-w-0 max-w-full rounded-xl border border-outline-variant/25 px-3 py-2.5 text-sm text-rose-700 outline-none [color-scheme:light] focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="block min-w-0 text-sm">
              <span className="mb-1 block font-medium text-sky-700">Thời gian ship</span>
              <input
                type="date"
                value={shipDate}
                onChange={(e) => setShipDate(e.target.value)}
                className="w-full min-w-0 max-w-full rounded-xl border border-outline-variant/25 px-3 py-2.5 text-sm text-sky-700 outline-none [color-scheme:light] focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-on-surface">Đơn vị vận chuyển</span>
              <select
                value={shippingProvider}
                onChange={(e) => setShippingProvider(e.target.value)}
                className="w-full rounded-xl border border-outline-variant/25 px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Chưa chọn</option>
                {SHIPPING_PROVIDERS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-on-surface">Mã vận đơn</span>
              <input
                type="text"
                inputMode="text"
                autoComplete="off"
                spellCheck={false}
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                onBlur={() => setTrackingCode((value) => normalizeTrackingCode(value))}
                className="w-full rounded-xl border border-outline-variant/25 px-3 py-2.5 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="vd: 148143415811"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-on-surface sm:col-span-3">
              <input
                type="checkbox"
                checked={monthEndChecked}
                onChange={(e) => setMonthEndChecked(e.target.checked)}
                className="h-4 w-4 rounded border-outline-variant"
              />
              Check cuối tháng
            </label>
          </div>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <ViewField label="Ngày đặt">{displayValue(formatViDate(orderDate))}</ViewField>
            <ViewField label="Ngày cần">
              <span className="font-medium text-rose-700">{displayValue(formatViDate(neededDate))}</span>
            </ViewField>
            <ViewField label="Thời gian ship">
              <span className="font-medium text-sky-700">{displayValue(formatViDate(shipDate))}</span>
            </ViewField>
            <ViewField label="Đơn vị vận chuyển">{shippingProviderLabel(shippingProvider)}</ViewField>
            <ViewField label="Mã vận đơn" className="sm:col-span-2">
              <span className="font-mono">{displayValue(trackingCode)}</span>
            </ViewField>
            <ViewField label="Check cuối tháng" className="sm:col-span-3">
              {monthEndChecked ? 'Đã check' : 'Chưa check'}
            </ViewField>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4">
        <h4 className="text-sm font-semibold text-on-surface">Sản phẩm & tiền</h4>
        {isEditing ? (
          <>
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
              <span className="mb-1 block font-medium text-on-surface">Note đơn</span>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-xl border border-outline-variant/25 px-3 py-2.5 outline-none focus:ring-2 focus:ring-secondary/20"
              />
            </label>
          </>
        ) : (
          <div className="mt-3 space-y-4">
            {items.length === 0 ? (
              <p className="text-sm text-on-surface-variant">—</p>
            ) : (
              <ul className="divide-y divide-outline-variant/20 rounded-xl border border-outline-variant/20">
                {items.map((item, index) => (
                  <li key={`${item.productId || item.productName}-${index}`} className="px-3 py-2.5 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-amber-800">
                          {displayValue(item.productName)}
                        </p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          SL {item.quantity}
                          {item.color ? ` · ${item.color}` : ''}
                          {item.note ? ` · ${item.note}` : ''}
                        </p>
                      </div>
                      <p className="shrink-0 font-medium text-amber-800">
                        {formatMoney((Number(item.unitPrice) || 0) * (Number(item.quantity) || 1))}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="grid gap-2 sm:grid-cols-2">
              <ViewField label="SP">{formatMoney(totals.productsTotal)}</ViewField>
              <ViewField label="Tổng đơn">
                <span className="font-semibold text-emerald-700">{formatMoney(totals.orderTotal)}</span>
              </ViewField>
              <ViewField label="Thêm y/c">{formatMoney(totals.addOnAmount)}</ViewField>
              <ViewField label="Cọc / CK">{formatMoney(totals.deposit)}</ViewField>
              <ViewField label="Ship báo KH">{formatMoney(totals.shippingFee)}</ViewField>
              <ViewField label="Ship thực">{formatMoney(totals.actualShippingFee)}</ViewField>
              <ViewField label="Phát sinh">{formatMoney(totals.incidentalAmount)}</ViewField>
              <ViewField label="COD">{formatMoney(totals.codAmount)}</ViewField>
              <ViewField label="Ghi chú TT" className="sm:col-span-2">
                {displayValue(money.paymentNote)}
              </ViewField>
              <ViewField label="Note đơn" className="sm:col-span-2">
                <p className="whitespace-pre-wrap">{displayValue(note)}</p>
              </ViewField>
            </div>
          </div>
        )}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  )
})

export default OrderDetailContent
