import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { submitCustomRequestApi } from '../../../api/customRequestsApi'
import { fetchProductsApi } from '../../../api/productsApi'
import MaterialIcon from '../../../components/common/MaterialIcon'
import {
  DEFAULT_DELIVERY_STEP,
  EMPTY_ORDER_MONEY,
} from '../../../constants/customRequestDefaults'
import { useIsLgUp } from '../../../hooks/useMediaQuery'
import { calcOrderMoney } from '../../../utils/orderMoney'
import { normalizeTrackingCode } from '../../../utils/trackingCode'
import {
  OrderCustomerFields,
  OrderNoteFields,
  OrderScheduleFields,
  OrderTrackingFields,
} from '../components/AdminDeliveryForm'
import CreateOrderSuccess from '../components/CreateOrderSuccess'
import OrderItemsEditor, { calcItemsSubtotal } from '../components/OrderItemsEditor'
import OrderMoneyFields from '../components/OrderMoneyFields'
import AdminMobileOverlayShell from '../components/AdminMobileOverlayShell'
import CreateOrderMobileView from '../mobile/CreateOrderMobileView'

function CreateOrderPage() {
  const [deliveryData, setDeliveryData] = useState(DEFAULT_DELIVERY_STEP)
  const [products, setProducts] = useState([])
  const [items, setItems] = useState([])
  const [money, setMoney] = useState(EMPTY_ORDER_MONEY)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [savedRequest, setSavedRequest] = useState(null)
  const isLgUp = useIsLgUp()

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

  const handleDeliveryChange = useCallback((field, value) => {
    setError('')
    setDeliveryData((previous) => ({ ...previous, [field]: value }))
  }, [])

  const handleMoneyChange = useCallback((field, value) => {
    setError('')
    setMoney((previous) => ({ ...previous, [field]: value }))
  }, [])

  function validateDelivery() {
    if (!deliveryData.customerName.trim()) {
      setError('Vui lòng nhập tên khách hàng.')
      return false
    }
    return true
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (!validateDelivery()) return

    setIsSubmitting(true)
    try {
      const customerName = deliveryData.customerName.trim()
      const customerPhone = deliveryData.customerPhone.trim()
      const result = await submitCustomRequestApi({
        withQr: false,
        source: 'admin',
        customerName,
        customerPhone,
        deliveryRecipientName: customerName,
        deliveryPhone: customerPhone,
        deliveryAddress: deliveryData.deliveryAddress.trim(),
        deliveryDate: deliveryData.deliveryDate || '',
        deliveryTimeSlot: deliveryData.shipDate || deliveryData.deliveryTimeSlot || '',
        note: deliveryData.note || '',
        orderDate: deliveryData.orderDate || undefined,
        shipDate: deliveryData.shipDate || deliveryData.deliveryDate || undefined,
        shippingProvider: deliveryData.shippingProvider || '',
        shippingTrackingCode: normalizeTrackingCode(deliveryData.shippingTrackingCode),
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
      })
      setSavedRequest(result.data)
    } catch (err) {
      setError(err.message || 'Không thể lên đơn. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleCreateAnother() {
    setDeliveryData({ ...DEFAULT_DELIVERY_STEP })
    setItems([])
    setMoney({ ...EMPTY_ORDER_MONEY })
    setSavedRequest(null)
    setError('')
  }

  if (!isLgUp) {
    return (
      <AdminMobileOverlayShell backTo="/admin/manage">
        {({ requestClose }) => (
          <CreateOrderMobileView
            mode="create"
            deliveryData={deliveryData}
            products={products}
            items={items}
            money={money}
            productsTotal={productsTotal}
            error={error}
            isSubmitting={isSubmitting}
            savedRequest={savedRequest}
            onDeliveryChange={handleDeliveryChange}
            onItemsChange={setItems}
            onMoneyChange={handleMoneyChange}
            onSubmit={handleSubmit}
            onCreateAnother={handleCreateAnother}
            onBack={requestClose}
          />
        )}
      </AdminMobileOverlayShell>
    )
  }

  if (savedRequest) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col p-2 pb-[calc(var(--admin-bottom-nav-offset)+1rem)] sm:p-3 lg:p-4 lg:pb-4">
          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-outline-variant/15 bg-white shadow-[0_8px_30px_rgba(74,48,32,0.06)]">
            <header className="shrink-0 border-b border-outline-variant/15 px-4 py-3 sm:px-5 sm:py-3.5 lg:px-6 lg:py-4">
              <Link
                to="/admin/manage"
                className="mb-1.5 inline-flex items-center gap-1 text-xs font-medium text-on-surface-variant transition hover:text-primary"
              >
                <MaterialIcon name="arrow_back" className="text-base" />
                Đơn hàng
              </Link>
              <h2 className="font-display text-lg leading-tight text-primary sm:text-xl lg:text-2xl">
                Đơn đã tạo
              </h2>
              <p className="mt-1 text-xs text-on-surface-variant sm:text-sm">
                Đơn đã được lưu thành công.
              </p>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 lg:p-6">
              <div className="mx-auto w-full max-w-2xl">
                <CreateOrderSuccess request={savedRequest} onCreateAnother={handleCreateAnother} />
              </div>
            </div>
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col p-2 pb-[calc(var(--admin-bottom-nav-offset)+1rem)] sm:p-3 lg:p-4 lg:pb-4">
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-outline-variant/15 bg-white shadow-[0_8px_30px_rgba(74,48,32,0.06)]">
          <header className="shrink-0 border-b border-outline-variant/15 px-4 py-3 sm:px-5 sm:py-3.5 lg:px-6 lg:py-4">
            <Link
              to="/admin/manage"
              className="mb-1.5 inline-flex items-center gap-1 text-xs font-medium text-on-surface-variant transition hover:text-primary"
            >
              <MaterialIcon name="arrow_back" className="text-base" />
              Đơn hàng
            </Link>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-display text-lg leading-tight text-primary sm:text-xl lg:text-2xl">
                  Tạo đơn hàng mới
                </h2>
                <p className="mt-1 text-xs text-on-surface-variant sm:text-sm">Theo sổ đơn QOA</p>
              </div>
              <button
                type="submit"
                form="admin-create-order"
                disabled={isSubmitting}
                className="btn-primary shrink-0 !px-3 !py-2 text-xs sm:text-sm disabled:opacity-60"
              >
                {isSubmitting ? 'Đang lên đơn...' : 'Tạo đơn hàng'}
              </button>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 lg:p-6">
            <form id="admin-create-order" onSubmit={handleSubmit}>
              <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(17rem,0.75fr)] xl:items-start">
                <div className="space-y-3">
                  <section className="overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface-container-lowest">
                    <div className="grid gap-0 lg:grid-cols-2">
                      <div className="border-b border-outline-variant/20 p-4 lg:border-r lg:border-b-0">
                        <h3 className="text-sm font-semibold text-on-surface">Khách hàng</h3>
                        <div className="mt-3">
                          <OrderCustomerFields
                            values={deliveryData}
                            onChange={handleDeliveryChange}
                          />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-on-surface">Lịch & vận đơn</h3>
                        <div className="mt-3 space-y-2">
                          <OrderScheduleFields
                            values={deliveryData}
                            onChange={handleDeliveryChange}
                          />
                          <OrderTrackingFields
                            values={deliveryData}
                            onChange={handleDeliveryChange}
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4">
                    <h3 className="text-sm font-semibold text-on-surface">Sản phẩm</h3>
                    <div className="mt-3">
                      <OrderItemsEditor products={products} items={items} onChange={setItems} />
                    </div>
                  </section>

                  <section className="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4">
                    <h3 className="text-sm font-semibold text-on-surface">Note đơn</h3>
                    <div className="mt-3">
                      <OrderNoteFields values={deliveryData} onChange={handleDeliveryChange} />
                    </div>
                  </section>
                </div>

                <aside className="space-y-3 xl:sticky xl:top-4">
                  <section className="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4">
                    <h3 className="text-sm font-semibold text-on-surface">Tiền đơn</h3>
                    <div className="mt-3">
                      <OrderMoneyFields
                        values={money}
                        onChange={handleMoneyChange}
                        productsTotal={productsTotal}
                      />
                    </div>
                  </section>

                  {error ? (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
                      {error}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? 'Đang lên đơn...' : 'Tạo đơn hàng'}
                  </button>
                </aside>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}

export default CreateOrderPage
