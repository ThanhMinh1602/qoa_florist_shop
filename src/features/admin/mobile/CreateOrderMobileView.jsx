import MaterialIcon from '../../../components/common/MaterialIcon'
import {
  OrderCustomerFieldsMobile,
  OrderNoteFieldsMobile,
  OrderScheduleFieldsMobile,
  OrderTrackingFieldsMobile,
} from '../components/AdminDeliveryFormMobile'
import CreateOrderSuccess from '../components/CreateOrderSuccess'
import OrderItemsEditor from '../components/OrderItemsEditor'
import OrderMoneyFields from '../components/OrderMoneyFields'
import AdminMobileFormActions from '../components/AdminMobileFormActions'

function CreateOrderMobileView({
  mode = 'create',
  title,
  submitLabel,
  submittingLabel,
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
  onBack,
}) {
  const isEdit = mode === 'edit'
  const pageTitle = title || (isEdit ? 'Sửa đơn' : 'Lên đơn')
  const primaryLabel = submitLabel || (isEdit ? 'Lưu đơn' : 'Tạo đơn hàng')
  const primaryBusyLabel = submittingLabel || (isEdit ? 'Đang lưu...' : 'Đang lên đơn...')

  if (savedRequest && !isEdit) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
        <header className="flex shrink-0 items-center gap-2 border-b border-outline-variant/25 bg-surface-container-lowest px-3 py-2">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low"
              aria-label="Quay lại"
            >
              <MaterialIcon name="arrow_back" className="text-xl" />
            </button>
          ) : null}
          <h2 className="min-w-0 flex-1 font-display text-base text-primary">Đơn đã tạo</h2>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-8 [-webkit-overflow-scrolling:touch]">
          <CreateOrderSuccess request={savedRequest} onCreateAnother={onCreateAnother} compact />
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-outline-variant/40 px-3 py-2.5 text-sm font-medium text-primary"
            >
              <MaterialIcon name="receipt_long" className="text-lg" />
              Về danh sách đơn
            </button>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <header className="flex shrink-0 items-center gap-2 border-b border-outline-variant/25 bg-surface-container-lowest px-3 py-2">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low"
            aria-label="Quay lại"
          >
            <MaterialIcon name="arrow_back" className="text-xl" />
          </button>
        ) : null}
        <h2 className="min-w-0 flex-1 truncate font-display text-base text-primary">{pageTitle}</h2>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch]">
        <form id="admin-order-form-mobile" onSubmit={onSubmit} className="space-y-2.5 px-2.5 py-2.5 pb-4">
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
              Note đơn
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

      <AdminMobileFormActions className="px-3 pt-2">
        <button
          type="submit"
          form="admin-order-form-mobile"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(74,48,32,0.22)] transition active:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? primaryBusyLabel : primaryLabel}
        </button>
      </AdminMobileFormActions>
    </div>
  )
}

export default CreateOrderMobileView
