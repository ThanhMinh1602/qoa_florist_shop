import TopicGreetingScreen from '../../greeting/TopicGreetingScreen'
import { CollapsiblePreview } from '../../../components/mobile/CollapsiblePreview'
import MobileFrame from '../../../components/common/MobileFrame'
import MobileStepIndicator from '../../../components/mobile/MobileStepIndicator'
import MaterialIcon from '../../../components/common/MaterialIcon'
import CustomCardStepFormMobile from '../../custom/mobile/CustomCardStepFormMobile'
import CustomTopicPickerMobile from '../../custom/mobile/CustomTopicPickerMobile'
import { ORDER_CREATE_MODES } from '../constants/adminNavItems'
import AdminDeliveryFormMobile from '../components/AdminDeliveryFormMobile'
import CreateOrderSuccess from '../components/CreateOrderSuccess'
import OrderItemsEditor from '../components/OrderItemsEditor'
import OrderMoneyFields from '../components/OrderMoneyFields'

function OrderModePickerMobile({ mode, onChange }) {
  return (
    <div className="grid gap-2">
      {ORDER_CREATE_MODES.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={[
            'rounded-2xl border px-4 py-3.5 text-left transition active:scale-[0.99]',
            mode === item.id
              ? 'border-primary/40 bg-surface-container-low ring-1 ring-primary/20'
              : 'border-outline-variant/25 bg-surface-container-lowest',
          ].join(' ')}
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-on-surface">
            <MaterialIcon name={item.icon} className="text-xl text-primary" />
            {item.label}
          </span>
          <span className="mt-0.5 block text-xs text-on-surface-variant">{item.description}</span>
        </button>
      ))}
    </div>
  )
}

function CreateOrderMobileView({
  mode,
  onModeChange,
  step,
  topicId,
  availableTopics,
  cardData,
  deliveryData,
  products = [],
  items = [],
  money,
  itemsSubtotal = 0,
  error,
  isSubmitting,
  savedRequest,
  submitLabel,
  onTopicSelect,
  onCardChange,
  onDeliveryChange,
  onItemsChange,
  onMoneyChange,
  onContinue,
  onBack,
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

  const withQr = mode === 'delivery_qr'
  const showContinue = withQr && step === 1
  const showCardFields = withQr && step === 1
  const showDeliveryFields = mode === 'delivery' || step === 2
  const modeMeta = ORDER_CREATE_MODES.find((item) => item.id === mode)

  return (
    <div className="flex flex-col">
      <div className="border-b border-outline-variant/25 bg-surface-container-lowest px-4 py-3">
        <h2 className="text-lg font-semibold text-on-surface">Lên đơn</h2>
        <p className="mt-0.5 text-xs text-on-surface-variant">{modeMeta?.description}</p>
        {withQr ? (
          <MobileStepIndicator
            step={step}
            steps={[
              { id: 'card', label: 'Thiệp' },
              { id: 'delivery', label: 'Giao hàng' },
            ]}
          />
        ) : null}
      </div>

      <div className="px-4 py-4 pb-[calc(9.5rem+env(safe-area-inset-bottom))]">
        <section className="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4 shadow-sm shadow-[0_12px_40px_rgba(74,48,32,0.05)]">
          <h3 className="text-sm font-semibold text-on-surface">Loại đơn</h3>
          <div className="mt-3">
            <OrderModePickerMobile mode={mode} onChange={onModeChange} />
          </div>
        </section>

        {showDeliveryFields ? (
          <div className="mt-4 space-y-4">
            <section className="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-on-surface">Sản phẩm</h3>
              <div className="mt-3">
                <OrderItemsEditor products={products} items={items} onChange={onItemsChange} />
              </div>
            </section>
            <section className="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-on-surface">Tiền & giao</h3>
              <div className="mt-3">
                <OrderMoneyFields
                  values={money}
                  onChange={onMoneyChange}
                  subtotal={itemsSubtotal}
                />
              </div>
            </section>
          </div>
        ) : null}

        <div
          className={[
            'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
            withQr ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
          ].join(' ')}
          aria-hidden={!withQr}
        >
          <div className="min-h-0 overflow-hidden">
            <CollapsiblePreview label="Xem trước thiệp QR" defaultOpen={false}>
              <MobileFrame label="Xem trước thiệp QR">
                <TopicGreetingScreen
                  topicId={topicId}
                  preview
                  autoStart
                  senderName={cardData.senderName}
                  recipientName={cardData.recipientName}
                  message={cardData.message}
                />
              </MobileFrame>
            </CollapsiblePreview>
          </div>
        </div>

        <form
          id="admin-create-order-mobile"
          onSubmit={onSubmit}
          className="mt-4 rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4 shadow-sm shadow-[0_12px_40px_rgba(74,48,32,0.05)]"
        >
          {showCardFields ? (
            <div>
              <h3 className="text-base font-semibold text-on-surface">Nội dung thiệp QR</h3>
              <div className="mt-4">
                <CustomTopicPickerMobile
                  topics={availableTopics}
                  topicId={topicId}
                  onSelect={onTopicSelect}
                />
              </div>
              <div className="mt-5">
                <CustomCardStepFormMobile values={cardData} onChange={onCardChange} />
              </div>
            </div>
          ) : null}

          {showDeliveryFields ? (
            <div>
              {withQr && step === 2 ? (
                <button
                  type="button"
                  onClick={onBack}
                  className="mb-3 text-sm font-medium text-primary active:text-primary"
                >
                  <span className="inline-flex items-center gap-1">
                    <MaterialIcon name="arrow_back" className="text-base" />
                    Quay lại thiệp
                  </span>
                </button>
              ) : null}
              <h3 className="text-base font-semibold text-on-surface">Thông tin giao hàng</h3>
              <div className="mt-4">
                <AdminDeliveryFormMobile values={deliveryData} onChange={onDeliveryChange} />
              </div>
            </div>
          ) : null}

          {error ? (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      </div>

      <div className="fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-30 border-t border-outline-variant/25 bg-surface-container-lowest/95 px-4 py-3 backdrop-blur lg:bottom-0">
        {showContinue ? (
          <button
            type="button"
            onClick={onContinue}
            className="w-full rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-white transition active:bg-primary-container"
          >
            Tiếp tục — Giao hàng
          </button>
        ) : (
          <button
            type="submit"
            form="admin-create-order-mobile"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-white transition active:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Đang lên đơn...' : submitLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export default CreateOrderMobileView
