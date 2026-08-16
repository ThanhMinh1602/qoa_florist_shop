import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  fetchCustomRequestByIdApi,
  updateCustomRequestApi,
  updateCustomRequestStatusApi,
} from '../../../api/notificationsApi'
import { fetchProductsApi } from '../../../api/productsApi'
import {
  DEFAULT_DELIVERY_STEP,
  EMPTY_ORDER_MONEY,
} from '../../../constants/customRequestDefaults'
import { useIsLgUp } from '../../../hooks/useMediaQuery'
import { toIsoDateInput } from '../../../utils/dateFormat'
import { getInvoiceCode } from '../../../utils/invoiceCode'
import { toDateInputValue } from '../../../utils/money'
import { calcOrderMoney } from '../../../utils/orderMoney'
import { normalizeTrackingCode } from '../../../utils/trackingCode'
import OrderDetailModal from '../components/OrderDetailModal'
import AdminMobileOverlayShell from '../components/AdminMobileOverlayShell'
import { calcItemsSubtotal } from '../components/OrderItemsEditor'
import CreateOrderMobileView from '../mobile/CreateOrderMobileView'

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

function deliveryStateFromRequest(request) {
  return {
    ...DEFAULT_DELIVERY_STEP,
    customerName: request.customerName || '',
    customerPhone: request.customerPhone || '',
    deliveryAddress: request.deliveryAddress || '',
    orderDate: toDateInputValue(request.orderDate || request.createdAt) || '',
    deliveryDate:
      toIsoDateInput(request.deliveryDate) ||
      toDateInputValue(request.deliveryDate) ||
      toDateInputValue(request.shipDate) ||
      '',
    shipDate:
      toDateInputValue(request.shipDate) || toIsoDateInput(request.deliveryTimeSlot) || '',
    deliveryTimeSlot: request.deliveryTimeSlot || '',
    shippingProvider: request.shippingProvider || '',
    shippingTrackingCode: normalizeTrackingCode(request.shippingTrackingCode),
    note: request.note || '',
  }
}

function EditOrderPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const isLgUp = useIsLgUp()

  const [request, setRequest] = useState(null)
  const [deliveryData, setDeliveryData] = useState(DEFAULT_DELIVERY_STEP)
  const [products, setProducts] = useState([])
  const [items, setItems] = useState([])
  const [money, setMoney] = useState(EMPTY_ORDER_MONEY)
  const [error, setError] = useState('')
  const [loadError, setLoadError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)

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
    let cancelled = false
    ;(async () => {
      setIsLoading(true)
      setLoadError('')
      try {
        const result = await fetchCustomRequestByIdApi(orderId)
        if (cancelled) return
        const data = result.data
        if (!data) throw new Error('Không tìm thấy đơn.')
        setRequest(data)
        setDeliveryData(deliveryStateFromRequest(data))
        setItems(data.items || [])
        setMoney(moneyStateFromRequest(data))
      } catch (err) {
        if (!cancelled) setLoadError(err.message || 'Không tải được đơn.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [orderId])

  const handleDeliveryChange = useCallback((field, value) => {
    setError('')
    setDeliveryData((previous) => ({ ...previous, [field]: value }))
  }, [])

  const handleMoneyChange = useCallback((field, value) => {
    setError('')
    setMoney((previous) => ({ ...previous, [field]: value }))
  }, [])

  function goBackToList() {
    navigate('/admin/manage', { replace: true })
  }

  async function handleStatusChange(id, status) {
    setUpdatingId(id)
    try {
      const result = await updateCustomRequestStatusApi(id, status)
      setRequest(result.data)
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleShippingStatusChange(id, shippingStatus) {
    setUpdatingId(id)
    try {
      const result = await updateCustomRequestApi(id, { shippingStatus })
      setRequest(result.data)
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (!request) return
    if (!deliveryData.customerName.trim()) {
      setError('Vui lòng nhập tên khách hàng.')
      return
    }

    setIsSubmitting(true)
    try {
      const customerName = deliveryData.customerName.trim()
      const customerPhone = deliveryData.customerPhone.trim()
      await updateCustomRequestApi(request.id, {
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
        note: deliveryData.note || '',
        customerName,
        customerPhone,
        deliveryRecipientName: customerName || request.deliveryRecipientName,
        deliveryPhone: customerPhone || request.deliveryPhone,
        deliveryAddress: deliveryData.deliveryAddress.trim(),
        orderDate: deliveryData.orderDate || null,
        shipDate: deliveryData.shipDate || deliveryData.deliveryDate || null,
        deliveryDate: deliveryData.deliveryDate || '',
        deliveryTimeSlot: deliveryData.shipDate || deliveryData.deliveryTimeSlot || '',
        shippingProvider: deliveryData.shippingProvider || '',
        shippingTrackingCode: normalizeTrackingCode(deliveryData.shippingTrackingCode),
        monthEndChecked: Boolean(request.monthEndChecked),
      })
      goBackToList()
    } catch (err) {
      setError(err.message || 'Không thể lưu đơn.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLgUp) {
    if (isLoading) {
      return <p className="p-8 text-center text-sm text-on-surface-variant">Đang tải đơn…</p>
    }
    if (loadError || !request) {
      return (
        <div className="p-8 text-center">
          <p className="text-sm text-red-600">{loadError || 'Không tìm thấy đơn.'}</p>
          <button type="button" onClick={goBackToList} className="mt-3 text-sm font-semibold text-primary">
            Về danh sách
          </button>
        </div>
      )
    }
    return (
      <OrderDetailModal
        request={request}
        onClose={goBackToList}
        onStatusChange={handleStatusChange}
        onShippingStatusChange={handleShippingStatusChange}
        onUpdated={(updated) => {
          setRequest(updated)
          setDeliveryData(deliveryStateFromRequest(updated))
          setItems(updated.items || [])
          setMoney(moneyStateFromRequest(updated))
        }}
        isUpdating={updatingId === request.id}
      />
    )
  }

  return (
    <AdminMobileOverlayShell backTo="/admin/manage">
      {({ requestClose }) => {
        if (isLoading) {
          return (
            <div className="flex h-full items-center justify-center bg-background px-4">
              <p className="text-sm text-on-surface-variant">Đang tải đơn…</p>
            </div>
          )
        }
        if (loadError || !request) {
          return (
            <div className="flex h-full flex-col bg-background px-4 py-6">
              <p className="text-sm text-red-600">{loadError || 'Không tìm thấy đơn.'}</p>
              <button
                type="button"
                onClick={requestClose}
                className="mt-4 text-sm font-semibold text-primary"
              >
                Quay lại
              </button>
            </div>
          )
        }

        return (
          <CreateOrderMobileView
            mode="edit"
            title={`Sửa · ${getInvoiceCode(request)}`}
            submitLabel="Lưu đơn"
            submittingLabel="Đang lưu..."
            deliveryData={deliveryData}
            products={products}
            items={items}
            money={money}
            productsTotal={productsTotal}
            error={error}
            isSubmitting={isSubmitting}
            onDeliveryChange={handleDeliveryChange}
            onItemsChange={setItems}
            onMoneyChange={handleMoneyChange}
            onSubmit={handleSubmit}
            onBack={requestClose}
          />
        )
      }}
    </AdminMobileOverlayShell>
  )
}

export default EditOrderPage
