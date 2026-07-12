import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import BirthdayScreen from '../../../components/BirthdayScreen'
import MobileFrame from '../../../components/common/MobileFrame'
import MaterialIcon from '../../../components/common/MaterialIcon'
import TopicLabel from '../../../components/common/TopicLabel'
import { submitCustomRequestApi } from '../../../api/customRequestsApi'
import { fetchProductsApi } from '../../../api/productsApi'
import {
  DEFAULT_CARD_STEP,
  DEFAULT_DELIVERY_STEP,
} from '../../../constants/customRequestDefaults'
import { TOPICS } from '../../../constants/topics'
import { useIsLgUp } from '../../../hooks/useMediaQuery'
import CustomCardStepForm from '../../custom/components/CustomCardStepForm'
import { ORDER_CREATE_MODES } from '../constants/adminNavItems'
import AdminDeliveryForm from '../components/AdminDeliveryForm'
import CreateOrderSuccess from '../components/CreateOrderSuccess'
import OrderItemsEditor, { calcItemsSubtotal } from '../components/OrderItemsEditor'
import OrderMoneyFields from '../components/OrderMoneyFields'
import CreateOrderMobileView from '../mobile/CreateOrderMobileView'

const EMPTY_MONEY = {
  deposit: '',
  shippingFee: '',
  codAmount: '',
  paidAmount: '',
  paymentStatus: 'unpaid',
  paymentNote: '',
  shipDate: '',
  subtotalOverride: '',
}

function OrderModePicker({ mode, onChange }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {ORDER_CREATE_MODES.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={[
            'rounded-2xl border px-4 py-4 text-left transition',
            mode === item.id
              ? 'border-rose-300 bg-rose-50 ring-1 ring-rose-100'
              : 'border-rose-100 bg-white hover:bg-rose-50/50',
          ].join(' ')}
        >
          <span className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <MaterialIcon name={item.icon} className="text-xl text-rose-500" />
            {item.label}
          </span>
          <span className="mt-1 block text-sm text-slate-500">{item.description}</span>
        </button>
      ))}
    </div>
  )
}

function CreateOrderPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const availableTopics = TOPICS.filter((topic) => topic.available)
  const modeParam = searchParams.get('mode')
  const initialMode = ORDER_CREATE_MODES.some((item) => item.id === modeParam)
    ? modeParam
    : 'delivery_qr'

  const [mode, setMode] = useState(initialMode)
  const [step, setStep] = useState(1)
  const [topicId, setTopicId] = useState(availableTopics[0]?.id ?? 'birthday')
  const [cardData, setCardData] = useState(DEFAULT_CARD_STEP)
  const [deliveryData, setDeliveryData] = useState(DEFAULT_DELIVERY_STEP)
  const [products, setProducts] = useState([])
  const [items, setItems] = useState([])
  const [money, setMoney] = useState(EMPTY_MONEY)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [savedRequest, setSavedRequest] = useState(null)
  const isLgUp = useIsLgUp()

  const withQr = mode === 'delivery_qr'
  const itemsSubtotal = useMemo(() => calcItemsSubtotal(items), [items])
  const subtotal =
    money.subtotalOverride !== '' && money.subtotalOverride !== undefined
      ? Number(money.subtotalOverride) || 0
      : itemsSubtotal

  useEffect(() => {
    fetchProductsApi(true)
      .then((result) => setProducts(result.data || []))
      .catch(() => setProducts([]))
  }, [])

  useEffect(() => {
    if (modeParam && ORDER_CREATE_MODES.some((item) => item.id === modeParam)) {
      setMode(modeParam)
    } else if (modeParam === 'card') {
      setMode('delivery_qr')
    }
  }, [modeParam])

  const handleCardChange = useCallback((field, value) => {
    setError('')
    setCardData((previous) => ({ ...previous, [field]: value }))
  }, [])

  const handleDeliveryChange = useCallback((field, value) => {
    setError('')
    setDeliveryData((previous) => ({ ...previous, [field]: value }))
  }, [])

  const handleMoneyChange = useCallback((field, value) => {
    setError('')
    setMoney((previous) => {
      const next = { ...previous, [field]: value }
      if (field === 'deposit' && !previous.paidAmount) {
        next.paidAmount = value
        if (Number(value) > 0 && previous.paymentStatus === 'unpaid') {
          next.paymentStatus = 'deposit'
        }
      }
      return next
    })
  }, [])

  function handleModeChange(nextMode) {
    setMode(nextMode)
    setStep(1)
    setError('')
    const next = new URLSearchParams(searchParams)
    if (nextMode === 'delivery_qr') next.delete('mode')
    else next.set('mode', nextMode)
    setSearchParams(next, { replace: true })
  }

  function validateCard() {
    if (!cardData.recipientName.trim() || !cardData.message.trim()) {
      setError('Vui lòng nhập tên người nhận và lời chúc.')
      return false
    }
    return true
  }

  function validateDelivery() {
    if (
      !deliveryData.customerName.trim() ||
      !deliveryData.customerPhone.trim() ||
      !deliveryData.deliveryRecipientName.trim() ||
      !deliveryData.deliveryPhone.trim() ||
      !deliveryData.deliveryAddress.trim()
    ) {
      setError('Vui lòng nhập đầy đủ thông tin khách và giao hàng.')
      return false
    }
    return true
  }

  function handleContinueToStep2() {
    if (withQr && !validateCard()) return
    setDeliveryData((previous) => ({
      ...previous,
      deliveryRecipientName:
        previous.deliveryRecipientName || (withQr ? cardData.recipientName.trim() : ''),
    }))
    setStep(2)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (withQr && !validateCard()) return
    if (!validateDelivery()) return

    setIsSubmitting(true)
    try {
      const moneyPayload = {
        items,
        subtotal,
        deposit: Number(money.deposit) || 0,
        shippingFee: Number(money.shippingFee) || 0,
        codAmount: Number(money.codAmount) || 0,
        paidAmount: Number(money.paidAmount) || 0,
        paymentStatus: money.paymentStatus,
        paymentNote: money.paymentNote,
        shipDate: money.shipDate || undefined,
        deliveryDate: money.shipDate || deliveryData.deliveryDate,
      }

      const payload = withQr
        ? { withQr: true, topicId, ...cardData, ...deliveryData, ...moneyPayload }
        : { withQr: false, ...deliveryData, ...moneyPayload }

      const result = await submitCustomRequestApi(payload)
      setSavedRequest(result.data)
      setStep(1)
    } catch (err) {
      setError(err.message || 'Không thể lên đơn. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleCreateAnother() {
    setStep(1)
    setCardData(DEFAULT_CARD_STEP)
    setDeliveryData(DEFAULT_DELIVERY_STEP)
    setItems([])
    setMoney(EMPTY_MONEY)
    setSavedRequest(null)
    setError('')
  }

  const submitLabel = withQr ? 'Lên đơn & tạo QR' : 'Lên đơn giao'
  const commerceSection = (
    <>
      <section className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm shadow-rose-50 md:p-6">
        <h3 className="text-lg font-semibold text-slate-900">Sản phẩm</h3>
        <p className="mt-1 text-sm text-slate-500">Chọn từ catalog giá cost hoặc nhập tùy chỉnh.</p>
        <div className="mt-4">
          <OrderItemsEditor products={products} items={items} onChange={setItems} />
        </div>
      </section>
      <section className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm shadow-rose-50 md:p-6">
        <h3 className="text-lg font-semibold text-slate-900">Tiền & giao</h3>
        <div className="mt-4">
          <OrderMoneyFields values={money} onChange={handleMoneyChange} subtotal={itemsSubtotal} />
        </div>
      </section>
    </>
  )

  if (!isLgUp) {
    return (
      <CreateOrderMobileView
        mode={mode}
        onModeChange={handleModeChange}
        step={step}
        topicId={topicId}
        availableTopics={availableTopics}
        cardData={cardData}
        deliveryData={deliveryData}
        products={products}
        items={items}
        money={money}
        itemsSubtotal={itemsSubtotal}
        error={error}
        isSubmitting={isSubmitting}
        savedRequest={savedRequest}
        submitLabel={submitLabel}
        onTopicSelect={setTopicId}
        onCardChange={handleCardChange}
        onDeliveryChange={handleDeliveryChange}
        onItemsChange={setItems}
        onMoneyChange={handleMoneyChange}
        onContinue={handleContinueToStep2}
        onBack={() => setStep(1)}
        onSubmit={handleSubmit}
        onCreateAnother={handleCreateAnother}
      />
    )
  }

  if (savedRequest) {
    return (
      <div className="flex flex-1 flex-col">
        <header className="border-b border-rose-100 bg-white/80 px-6 py-5 backdrop-blur md:px-8">
          <h2 className="text-2xl font-semibold text-slate-900">Lên đơn</h2>
          <p className="mt-2 text-sm text-slate-500">Đơn đã được tạo.</p>
        </header>
        <div className="mx-auto w-full max-w-2xl p-6 md:p-8">
          <CreateOrderSuccess request={savedRequest} onCreateAnother={handleCreateAnother} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-rose-100 bg-white/80 px-6 py-5 backdrop-blur md:px-8">
        <h2 className="text-2xl font-semibold text-slate-900">Lên đơn</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Chọn sản phẩm, tiền (cọc/ship/COD) và tùy chọn thiệp QR.
        </p>
      </header>

      <div className="mx-auto flex w-full max-w-6xl items-start p-6 lg:p-8">
        <form
          onSubmit={handleSubmit}
          className={[
            'min-w-0 flex-1 space-y-6 transition-[max-width] duration-300 ease-out',
            withQr ? 'max-w-none' : 'mx-auto max-w-3xl',
          ].join(' ')}
        >
          <section className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm shadow-rose-50">
            <h3 className="text-lg font-semibold text-slate-900">Loại đơn</h3>
            <div className="mt-4">
              <OrderModePicker mode={mode} onChange={handleModeChange} />
            </div>
          </section>

          {commerceSection}

          <div
            className={[
              'grid transition-[grid-template-rows] duration-300 ease-out',
              withQr ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
            ].join(' ')}
            aria-hidden={!withQr}
          >
            <div className="min-h-0 overflow-hidden">
              <section className="mb-6 rounded-2xl border border-rose-100 bg-white p-6 shadow-sm shadow-rose-50">
                <h3 className="text-lg font-semibold text-slate-900">Nội dung thiệp QR</h3>
                <div className="mt-5 mb-6">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Chủ đề</span>
                  <div className="flex flex-wrap gap-2">
                    {availableTopics.map((topic) => (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => setTopicId(topic.id)}
                        tabIndex={withQr ? undefined : -1}
                        className={[
                          'rounded-xl border px-4 py-2.5 text-sm font-medium transition',
                          topicId === topic.id
                            ? 'border-rose-300 bg-rose-50 text-rose-700 ring-1 ring-rose-100'
                            : 'border-rose-100 bg-white text-slate-600 hover:bg-rose-50/70',
                        ].join(' ')}
                      >
                        <TopicLabel topic={topic} />
                      </button>
                    ))}
                  </div>
                </div>
                <CustomCardStepForm values={cardData} onChange={handleCardChange} />
              </section>
            </div>
          </div>

          <section className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm shadow-rose-50">
            <h3 className="text-lg font-semibold text-slate-900">Thông tin giao hàng</h3>
            <div className="mt-6">
              <AdminDeliveryForm values={deliveryData} onChange={handleDeliveryChange} />
            </div>
          </section>

          {error ? (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-rose-500 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isSubmitting ? 'Đang lên đơn...' : submitLabel}
          </button>
        </form>

        <div
          className={[
            'hidden shrink-0 overflow-hidden lg:block',
            'transition-[width,opacity,margin] duration-300 ease-out',
            withQr ? 'ml-8 w-[360px] opacity-100' : 'pointer-events-none ml-0 w-0 opacity-0',
          ].join(' ')}
          aria-hidden={!withQr}
        >
          <div className="w-[360px] lg:sticky lg:top-6">
            <MobileFrame label="Xem trước thiệp QR">
              <BirthdayScreen
                preview
                autoStart
                senderName={cardData.senderName}
                recipientName={cardData.recipientName}
                message={cardData.message}
              />
            </MobileFrame>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateOrderPage
