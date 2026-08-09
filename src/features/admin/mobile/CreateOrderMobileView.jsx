import {
  OrderCustomerFieldsMobile,
  OrderNoteFieldsMobile,
  OrderScheduleFieldsMobile,
  OrderTrackingFieldsMobile,
} from '../components/AdminDeliveryFormMobile'
import CreateOrderSuccess from '../components/CreateOrderSuccess'
import OrderItemsEditor from '../components/OrderItemsEditor'
import OrderMoneyFields from '../components/OrderMoneyFields'

function CreateOrderMobileView({
  deliveryData,
  products = [],
  items = [],
  money,
  productsTotal = 0,
  error,
  isSubmitting,
  savedRequest,
  onDeliveryChange,
  onItemsChange,
  onMoneyChange,
  onSubmit,
  onCreateAnother,
}) {
  if (savedRequest) {
    return (
      <div className="px-4 py-4 pb-8">
        <CreateOrderSuccess request={savedRequest} onCreateAnother={onCreateAnother} compact />
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="border-b border-outline-variant/25 bg-surface-container-lowest px-3 py-2">
        <h2 className="font-display text-base text-primary">Lên đơn</h2>
      </div>

      <div className="px-2.5 py-2.5 pb-[calc(9rem+env(safe-area-inset-bottom))]">
        <form id="admin-create-order-mobile" onSubmit={onSubmit} className="space-y-2.5">
          <section className="overflow-hidden rounded-xl border border-outline-variant/25 bg-surface-container-lowest">
            <div className="border-b border-outline-variant/20 p-2.5">
              <h3 className="text-[10px] font-semibold tracking-wide text-on-surface-variant uppercase">
                Khách hàng
              </h3>
              <div className="mt-1.5">
                <OrderCustomerFieldsMobile values={deliveryData} onChange={onDeliveryChange} />
              </div>
            </div>
            <div className="border-b border-outline-variant/20 p-2.5">
              <h3 className="text-[10px] font-semibold tracking-wide text-on-surface-variant uppercase">
                Lịch & vận đơn
              </h3>
              <div className="mt-1.5 space-y-2">
                <OrderScheduleFieldsMobile values={deliveryData} onChange={onDeliveryChange} />
                <OrderTrackingFieldsMobile values={deliveryData} onChange={onDeliveryChange} />
              </div>
            </div>
            <div className="p-2.5">
              <h3 className="text-[10px] font-semibold tracking-wide text-on-surface-variant uppercase">
                Sản phẩm
              </h3>
              <div className="mt-1.5">
                <OrderItemsEditor products={products} items={items} onChange={onItemsChange} />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-2.5">
            <h3 className="text-[10px] font-semibold tracking-wide text-on-surface-variant uppercase">
              Note
            </h3>
            <div className="mt-1.5">
              <OrderNoteFieldsMobile values={deliveryData} onChange={onDeliveryChange} />
            </div>
          </section>

          <section className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-2.5">
            <h3 className="text-[10px] font-semibold tracking-wide text-on-surface-variant uppercase">
              Tiền đơn
            </h3>
            <div className="mt-1.5">
              <OrderMoneyFields
                values={money}
                onChange={onMoneyChange}
                productsTotal={productsTotal}
              />
            </div>
          </section>

          {error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      </div>

      <div className="fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-30 border-t border-outline-variant/25 bg-surface-container-lowest/95 px-3 py-2.5 backdrop-blur lg:bottom-0">
        <button
          type="submit"
          form="admin-create-order-mobile"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition active:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Đang lên đơn...' : 'Tạo đơn hàng'}
        </button>
      </div>
    </div>
  )
}

export default CreateOrderMobileView
