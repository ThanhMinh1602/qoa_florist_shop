import TopicGreetingScreen from '../../greeting/TopicGreetingScreen'
import { CollapsiblePreview } from '../../../components/mobile/CollapsiblePreview'
import MobileFrame from '../../../components/common/MobileFrame'
import MaterialIcon from '../../../components/common/MaterialIcon'
import CustomCardHeaderMobile from './CustomCardHeaderMobile'
import CustomCardStepFormMobile from './CustomCardStepFormMobile'
import CustomDeliveryFormMobile from './CustomDeliveryFormMobile'
import CustomTopicPickerMobile from './CustomTopicPickerMobile'

function CustomCardMobileView({
  step,
  topicId,
  availableTopics,
  cardData,
  deliveryData,
  error,
  isSubmitting,
  onTopicSelect,
  onCardChange,
  onDeliveryChange,
  onContinue,
  onBack,
  onSubmit,
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-surface-container-low/80 via-surface-container-lowest to-surface-container/60">
      <CustomCardHeaderMobile step={step} />

      <div className="flex-1 px-4 py-4 pb-28">
        <CollapsiblePreview label="Xem trước thiệp QR" defaultOpen={step === 1}>
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

        <section className="mt-4 rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4 shadow-sm shadow-[0_12px_40px_rgba(74,48,32,0.05)]">
          {step === 1 ? (
            <>
              <h3 className="text-base font-semibold text-on-surface">Nội dung thiệp QR</h3>
              <p className="mt-1 text-xs text-on-surface-variant">Thông tin hiển thị khi quét mã QR.</p>

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

              {error ? (
                <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
                  {error}
                </p>
              ) : null}
            </>
          ) : (
            <form id="custom-delivery-form-mobile" onSubmit={onSubmit}>
              <button
                type="button"
                onClick={onBack}
                className="text-sm font-medium text-primary active:text-primary"
              >
                <span className="inline-flex items-center gap-1">
                  <MaterialIcon name="arrow_back" className="text-base" />
                  Quay lại bước 1
                </span>
              </button>
              <h3 className="mt-3 text-base font-semibold text-on-surface">Thông tin giao hàng</h3>
              <p className="mt-1 text-xs text-on-surface-variant">
                Shop sẽ tạo mã QR và xử lý giao hàng theo thông tin bên dưới.
              </p>

              <div className="mt-4">
                <CustomDeliveryFormMobile values={deliveryData} onChange={onDeliveryChange} />
              </div>

              {error ? (
                <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
                  {error}
                </p>
              ) : null}

              {step === 2 ? (
                <p className="mt-4 text-xs leading-5 text-on-surface-variant">
                  Mã QR sẽ được tạo tự động khi bạn gửi yêu cầu.
                </p>
              ) : null}
            </form>
          )}
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-outline-variant/25 bg-surface-container-lowest/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        {step === 1 ? (
          <button
            type="button"
            onClick={onContinue}
            className="w-full rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-white transition active:bg-primary-container"
          >
            Tiếp tục — Thông tin giao hàng
          </button>
        ) : (
          <button
            type="submit"
            form="custom-delivery-form-mobile"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-white transition active:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu về shop'}
          </button>
        )}
      </div>
    </div>
  )
}

export default CustomCardMobileView
