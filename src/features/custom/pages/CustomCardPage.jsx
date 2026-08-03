import { useCallback, useState } from 'react'
import { submitCustomRequestApi } from '../../../api/customRequestsApi'
import BrandLogo from '../../../components/common/BrandLogo'
import BrandLogoCenter from '../../../components/common/BrandLogoCenter'
import MaterialIcon from '../../../components/common/MaterialIcon'
import MobileFrame from '../../../components/common/MobileFrame'
import TopicLabel from '../../../components/common/TopicLabel'
import {
  DEFAULT_CARD_STEP,
  DEFAULT_DELIVERY_STEP,
} from '../../../constants/customRequestDefaults'
import { TOPICS } from '../../../constants/topics'
import { useIsLgUp } from '../../../hooks/useMediaQuery'
import TopicGreetingScreen from '../../greeting/TopicGreetingScreen'
import CustomCardStepForm from '../components/CustomCardStepForm'
import CustomDeliveryForm from '../components/CustomDeliveryForm'
import CustomCardMobileView from '../mobile/CustomCardMobileView'
import CustomSuccessMobile from '../mobile/CustomSuccessMobile'

function CustomCardPage() {
  const availableTopics = TOPICS.filter((topic) => topic.available)
  const [step, setStep] = useState(1)
  const [topicId, setTopicId] = useState(availableTopics[0]?.id ?? 'birthday')
  const [cardData, setCardData] = useState(DEFAULT_CARD_STEP)
  const [deliveryData, setDeliveryData] = useState(DEFAULT_DELIVERY_STEP)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const isLgUp = useIsLgUp()

  const handleCardChange = useCallback((field, value) => {
    setError('')
    setCardData((previous) => ({ ...previous, [field]: value }))
  }, [])

  const handleDeliveryChange = useCallback((field, value) => {
    setError('')
    setDeliveryData((previous) => ({ ...previous, [field]: value }))
  }, [])

  function validateStep1() {
    if (!cardData.recipientName.trim() || !cardData.message.trim()) {
      setError('Vui lòng nhập tên người nhận và lời chúc.')
      return false
    }
    return true
  }

  function handleContinueToStep2() {
    if (!validateStep1()) return

    setDeliveryData((previous) => ({
      ...previous,
      deliveryRecipientName: previous.deliveryRecipientName || cardData.recipientName.trim(),
    }))
    setStep(2)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await submitCustomRequestApi({
        topicId,
        ...cardData,
        ...deliveryData,
      })
      setIsSubmitted(true)
    } catch (err) {
      setError(err.message || 'Không thể gửi yêu cầu. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleReset() {
    setStep(1)
    setCardData(DEFAULT_CARD_STEP)
    setDeliveryData(DEFAULT_DELIVERY_STEP)
    setIsSubmitted(false)
    setError('')
  }

  if (isSubmitted) {
    if (!isLgUp) {
      return (
        <CustomSuccessMobile customerPhone={deliveryData.customerPhone} onReset={handleReset} />
      )
    }

    return (
      <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-surface-container-low via-surface-container-lowest to-surface-container px-4 pb-[env(safe-area-inset-bottom)]">
        <div className="w-full max-w-md rounded-3xl border border-emerald-100 bg-surface-container-lowest p-6 text-center shadow-xl shadow-primary/10 sm:p-8">
          <BrandLogoCenter size="md" />
          <MaterialIcon name="check_circle" className="mt-4 text-5xl text-emerald-500" filled />
          <h1 className="mt-4 text-2xl font-semibold text-on-surface">Đã gửi yêu cầu!</h1>
          <p className="mt-3 text-sm leading-6 text-on-surface-variant">
            QOA Florist đã nhận thiệp và thông tin giao hàng. Shop sẽ liên hệ qua{' '}
            <span className="font-medium text-on-surface">{deliveryData.customerPhone}</span> để xác
            nhận đơn.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-container"
          >
            Gửi yêu cầu khác
          </button>
        </div>
      </div>
    )
  }

  if (!isLgUp) {
    return (
      <CustomCardMobileView
        step={step}
        topicId={topicId}
        availableTopics={availableTopics}
        cardData={cardData}
        deliveryData={deliveryData}
        error={error}
        isSubmitting={isSubmitting}
        onTopicSelect={setTopicId}
        onCardChange={handleCardChange}
        onDeliveryChange={handleDeliveryChange}
        onContinue={handleContinueToStep2}
        onBack={() => setStep(1)}
        onSubmit={handleSubmit}
      />
    )
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      <div className="mesh-wash pointer-events-none absolute inset-0" aria-hidden="true" />

      <header className="relative border-b border-white/55 bg-surface/75 px-6 py-5 backdrop-blur-2xl">
        <BrandLogo size="md" />
        <h1 className="font-display mt-3 text-3xl tracking-wide text-primary">Tự thiết kế thiệp</h1>
        <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
          Bước 1: Thiết kế thiệp QR — Bước 2: Nhập thông tin giao hàng và gửi về shop.
        </p>

        <div className="mt-5 flex items-center gap-3">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-outline'}`}>
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step >= 1 ? 'bg-primary text-white' : 'bg-surface-container'}`}>1</span>
            <span className="text-sm font-medium">Thiệp & QR</span>
          </div>
          <span className="h-px w-8 bg-outline-variant/40" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-outline'}`}>
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step >= 2 ? 'bg-primary text-white' : 'bg-surface-container'}`}>2</span>
            <span className="text-sm font-medium">Giao hàng</span>
          </div>
        </div>
      </header>

      <div className="relative mx-auto grid max-w-6xl gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:p-8">
        <section className="glass-card rounded-xl p-6">
          {step === 1 ? (
            <>
              <h3 className="text-lg font-semibold text-on-surface">Bước 1 — Nội dung thiệp QR</h3>
              <p className="mt-1 text-sm text-on-surface-variant">Thông tin này sẽ hiển thị khi quét mã QR.</p>

              <div className="mt-5 mb-6">
                <span className="mb-1.5 block text-sm font-medium text-on-surface">Chủ đề</span>
                <div className="flex flex-wrap gap-2">
                  {availableTopics.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => setTopicId(topic.id)}
                      className={[
                        'rounded-xl border px-4 py-2.5 text-sm font-medium transition',
                        topicId === topic.id
                          ? 'border-primary/40 bg-surface-container-low text-primary ring-1 ring-primary/20'
                          : 'border-outline-variant/25 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low/70',
                      ].join(' ')}
                    >
                      <TopicLabel topic={topic} />
                    </button>
                  ))}
                </div>
              </div>

              <CustomCardStepForm values={cardData} onChange={handleCardChange} />

              {error ? (
                <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">{error}</p>
              ) : null}

              <button
                type="button"
                onClick={handleContinueToStep2}
                className="mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-container"
              >
                <span className="inline-flex items-center gap-1">
                  Tiếp tục — Thông tin giao hàng
                  <MaterialIcon name="arrow_forward" className="text-base" />
                </span>
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm font-medium text-primary transition hover:text-primary"
              >
                <span className="inline-flex items-center gap-1">
                  <MaterialIcon name="arrow_back" className="text-base" />
                  Quay lại bước 1
                </span>
              </button>
              <h3 className="mt-3 text-lg font-semibold text-on-surface">Bước 2 — Thông tin giao hàng</h3>
              <p className="mt-1 text-sm text-on-surface-variant">
                Shop sẽ tạo mã QR và xử lý giao hàng theo thông tin bên dưới.
              </p>

              <div className="mt-6">
                <CustomDeliveryForm values={deliveryData} onChange={handleDeliveryChange} />
              </div>

              {error ? (
                <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">{error}</p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu về shop'}
              </button>
            </form>
          )}
        </section>

        <section className="lg:sticky lg:top-6">
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
          {step === 2 ? (
            <p className="mt-3 max-w-xs text-center text-xs text-on-surface-variant">
              Mã QR sẽ được tạo tự động khi bạn gửi yêu cầu. Shop có thể tải QR ngay trên hệ thống admin.
            </p>
          ) : null}
        </section>
      </div>
    </div>
  )
}

export default CustomCardPage
