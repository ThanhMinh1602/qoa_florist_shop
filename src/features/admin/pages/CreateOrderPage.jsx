import { useCallback, useEffect, useMemo, useState } from 'react'
import { submitCustomRequestApi } from '../../../api/customRequestsApi'
import { fetchProductsApi } from '../../../api/productsApi'
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
        deliveryTimeSlot: deliveryData.deliveryTimeSlot || '',
        note: deliveryData.note || '',
        orderDate: deliveryData.orderDate || undefined,
        shipDate: deliveryData.deliveryDate || undefined,
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
      <CreateOrderMobileView
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
      />
    )
  }

  if (savedRequest) {
    return (
      <div className="flex flex-1 flex-col">
        <header className="border-b border-outline-variant/25 bg-surface-container-lowest/80 px-4 py-3 backdrop-blur lg:px-8 lg:py-5">
          <h2 className="font-display text-lg text-primary lg:text-3xl">Tạo đơn hàng mới</h2>
          <p className="mt-1 text-xs text-on-surface-variant lg:mt-2 lg:text-sm">Đơn đã được tạo.</p>
        </header>
        <div className="mx-auto w-full max-w-2xl p-4 lg:p-8">
          <CreateOrderSuccess request={savedRequest} onCreateAnother={handleCreateAnother} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/25 bg-surface-container-lowest/90 px-4 py-3 backdrop-blur lg:px-8 lg:py-4">
        <div>
          <h2 className="font-display text-lg text-primary lg:text-3xl">Tạo đơn hàng mới</h2>
          <p className="mt-0.5 hidden text-sm text-on-surface-variant lg:block">Theo sổ đơn QOA</p>
        </div>
        <button
          type="submit"
          form="admin-create-order"
          disabled={isSubmitting}
          className="hidden rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60 md:inline-flex"
        >
          {isSubmitting ? 'Đang lên đơn...' : 'Tạo đơn hàng'}
        </button>
      </header>

      <div className="mx-auto w-full max-w-7xl p-3 md:p-4 lg:p-5">
        <form id="admin-create-order" onSubmit={handleSubmit}>
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(17rem,0.75fr)] xl:items-start">
            <div className="space-y-3">
              <section className="overflow-hidden rounded-xl border border-outline-variant/25 bg-surface-container-lowest shadow-sm">
                <div className="grid gap-0 lg:grid-cols-2">
                  <div className="border-b border-outline-variant/20 p-3 lg:border-r lg:border-b-0">
                    <h3 className="text-[11px] font-semibold tracking-wide text-on-surface-variant uppercase">
                      Khách hàng
                    </h3>
                    <div className="mt-2">
                      <OrderCustomerFields values={deliveryData} onChange={handleDeliveryChange} />
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-[11px] font-semibold tracking-wide text-on-surface-variant uppercase">
                      Lịch & vận đơn
                    </h3>
                    <div className="mt-2 space-y-2">
                      <OrderScheduleFields values={deliveryData} onChange={handleDeliveryChange} />
                      <OrderTrackingFields values={deliveryData} onChange={handleDeliveryChange} />
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-3 shadow-sm">
                <h3 className="text-[11px] font-semibold tracking-wide text-on-surface-variant uppercase">
                  Sản phẩm
                </h3>
                <div className="mt-2">
                  <OrderItemsEditor products={products} items={items} onChange={setItems} />
                </div>
              </section>

              <section className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-3 shadow-sm">
                <h3 className="text-[11px] font-semibold tracking-wide text-on-surface-variant uppercase">
                  Note
                </h3>
                <div className="mt-2">
                  <OrderNoteFields values={deliveryData} onChange={handleDeliveryChange} />
                </div>
              </section>
            </div>

            <aside className="space-y-3 xl:sticky xl:top-20">
              <section className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-3 shadow-sm">
                <h3 className="text-[11px] font-semibold tracking-wide text-on-surface-variant uppercase">
                  Tiền đơn
                </h3>
                <div className="mt-2">
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
    </div>
  )
}

export default CreateOrderPage
