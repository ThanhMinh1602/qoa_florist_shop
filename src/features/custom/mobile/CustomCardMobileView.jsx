import BirthdayScreen from '../../../components/BirthdayScreen'
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
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-rose-50/80 via-white to-pink-50/60">
      <CustomCardHeaderMobile step={step} />

      <div className="flex-1 px-4 py-4 pb-28">
        <CollapsiblePreview label="Xem trước thiệp QR" defaultOpen={step === 1}>
          <MobileFrame label="Xem trước thiệp QR">
            <BirthdayScreen
              preview
              autoStart
              senderName={cardData.senderName}
              recipientName={cardData.recipientName}
              message={cardData.message}
            />
          </MobileFrame>
        </CollapsiblePreview>

        <section className="mt-4 rounded-2xl border border-rose-100 bg-white p-4 shadow-sm shadow-rose-50">
          {step === 1 ? (
            <>
              <h3 className="text-base font-semibold text-slate-900">Nội dung thiệp QR</h3>
              <p className="mt-1 text-xs text-slate-500">Thông tin hiển thị khi quét mã QR.</p>

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
                className="text-sm font-medium text-rose-600 active:text-rose-700"
              >
                <span className="inline-flex items-center gap-1">
                  <MaterialIcon name="arrow_back" className="text-base" />
                  Quay lại bước 1
                </span>
              </button>
              <h3 className="mt-3 text-base font-semibold text-slate-900">Thông tin giao hàng</h3>
              <p className="mt-1 text-xs text-slate-500">
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
                <p className="mt-4 text-xs leading-5 text-slate-500">
                  Mã QR sẽ được tạo tự động khi bạn gửi yêu cầu.
                </p>
              ) : null}
            </form>
          )}
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-rose-100 bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        {step === 1 ? (
          <button
            type="button"
            onClick={onContinue}
            className="w-full rounded-xl bg-rose-500 px-5 py-3.5 text-sm font-semibold text-white transition active:bg-rose-600"
          >
            Tiếp tục — Thông tin giao hàng
          </button>
        ) : (
          <button
            type="submit"
            form="custom-delivery-form-mobile"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-rose-500 px-4 py-3.5 text-sm font-semibold text-white transition active:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu về shop'}
          </button>
        )}
      </div>
    </div>
  )
}

export default CustomCardMobileView
