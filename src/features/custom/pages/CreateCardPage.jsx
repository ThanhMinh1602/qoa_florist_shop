import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'
import MobileFrame from '../../../components/common/MobileFrame'
import { CollapsiblePreview } from '../../../components/mobile/CollapsiblePreview'
import { TOPICS } from '../../../constants/topics'
import {
  getEmptyFormValues,
  getTopicQrForm,
  normalizePhraseList,
} from '../../../constants/topicQrForms'
import { useCards } from '../../../context/CardsContext'
import { useIsLgUp } from '../../../hooks/useMediaQuery'
import TopicGreetingScreen from '../../greeting/TopicGreetingScreen'
import TopicQrForm from '../../admin/components/TopicQrForm'

function toPublicFields(fields = []) {
  return fields.map((field) => {
    if (field.name === 'label') {
      return {
        ...field,
        label: 'Tên của bạn',
        placeholder: 'VD: Minh',
        help: 'Shop dùng tên này để nhận diện thiệp khi bạn đặt hoa.',
      }
    }
    if (field.name === 'phone') {
      return {
        ...field,
        label: 'Số điện thoại (tuỳ chọn)',
        help: 'Để shop liên hệ khi ghép thiệp vào đơn hoa.',
      }
    }
    return field
  })
}

function resolvePublicLabel(formData) {
  const fromLabel = formData.label?.trim()
  if (fromLabel) return `${fromLabel} · web`
  const fromRecipient = formData.recipientName?.trim()
  if (fromRecipient) return `${fromRecipient} · web`
  return `Thiệp web · ${new Date().toLocaleDateString('vi-VN')}`
}

function CreateCardPage() {
  const availableTopics = useMemo(() => TOPICS.filter((topic) => topic.available), [])
  const [topicId, setTopicId] = useState(availableTopics[0]?.id ?? 'birthday')
  const selectedTopic = useMemo(
    () => availableTopics.find((topic) => topic.id === topicId),
    [availableTopics, topicId],
  )
  const formConfig = getTopicQrForm(topicId)
  const publicFields = useMemo(
    () => toPublicFields(formConfig?.fields || []),
    [formConfig],
  )
  const [formData, setFormData] = useState(() => getEmptyFormValues(topicId))
  const [savedCard, setSavedCard] = useState(null)
  const [saveError, setSaveError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const { createCard } = useCards()
  const isLgUp = useIsLgUp()

  const handleTopicSelect = useCallback((nextTopicId) => {
    setTopicId(nextTopicId)
    setFormData(getEmptyFormValues(nextTopicId))
    setSavedCard(null)
    setSaveError('')
  }, [])

  const handleFieldChange = useCallback((field, value) => {
    setSaveError('')
    setFormData((previous) => ({ ...previous, [field]: value }))
  }, [])

  async function handleSave() {
    if (!formConfig) return
    setIsSaving(true)
    setSaveError('')

    const result = await createCard({
      topicId,
      ...formData,
      label: resolvePublicLabel(formData),
    })

    setIsSaving(false)
    if (!result.success) {
      setSaveError(result.message)
      return
    }
    setSavedCard(result.card)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCreateAnother() {
    setSavedCard(null)
    setFormData(getEmptyFormValues(topicId))
    setSaveError('')
  }

  const preview = (
    <TopicGreetingScreen
      topicId={topicId}
      preview
      autoStart
      senderName={formData.senderName}
      recipientName={formData.recipientName || formData.label}
      message={formData.message}
      keywords={normalizePhraseList(formData.keywords, 6)}
      messages={normalizePhraseList(formData.messages, 10)}
    />
  )

  if (savedCard) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8 lg:px-16">
        <div className="rounded-[2rem] border border-outline-variant/20 bg-white/80 px-6 py-10 text-center shadow-[0_20px_50px_rgba(74,48,32,0.08)] backdrop-blur-xl sm:px-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-fixed text-primary">
            <MaterialIcon name="check" className="text-3xl" />
          </div>
          <h1 className="font-display mt-5 text-3xl text-on-surface">Thiệp đã sẵn sàng</h1>
          <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
            Thiệp chưa xuất mã QR. Hãy mua hoa tại QOA để nhận bó hoa kèm thiệp QR — người nhận
            quét mã trên hoa sẽ mở đúng lời chúc này.
          </p>
          <div className="mt-5 rounded-2xl bg-surface-container-low px-4 py-4">
            <p className="text-xs font-semibold tracking-wide text-outline uppercase">Mã thiệp</p>
            <p className="mt-1 font-mono text-2xl font-bold tracking-[0.18em] text-primary">
              {savedCard.code || savedCard.id}
            </p>
            {savedCard.label ? (
              <p className="mt-2 text-sm text-on-surface">
                Tên thiệp:{' '}
                <span className="font-semibold">{savedCard.label.replace(/ · web$/, '')}</span>
              </p>
            ) : null}
            <p className="mt-2 text-xs text-outline">
              Nhắc shop mã thiệp này khi đặt hoa để ghép đúng lời chúc vào đơn.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/shop" className="btn-primary flex-1 py-4">
              Mua hoa kèm thiệp QR
            </Link>
            <button type="button" onClick={handleCreateAnother} className="btn-glass flex-1 py-4">
              Tạo thiệp khác
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-16">
      <div className="mb-8 max-w-2xl">
        <p className="label-caps text-primary">Thiệp số</p>
        <h1 className="font-display mt-1 text-3xl text-on-surface sm:text-4xl">Tạo thiệp lời chúc</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Soạn thiệp và xem trước. Không xuất QR tại đây — QR sẽ được gắn trên bó hoa khi bạn đặt
          hàng.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-12">
        <div className="space-y-4">
          <section className="rounded-2xl border border-outline-variant/20 bg-white/75 p-4 shadow-[0_12px_40px_rgba(74,48,32,0.06)] backdrop-blur-xl sm:p-5">
            <h2 className="text-sm font-semibold text-on-surface">1. Chọn chủ đề</h2>
            <div className="relative mt-3">
              <MaterialIcon
                name={selectedTopic?.icon ?? 'category'}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-secondary"
              />
              <select
                value={topicId}
                onChange={(event) => handleTopicSelect(event.target.value)}
                className="w-full appearance-none rounded-xl border border-outline-variant/40 bg-surface-container-lowest py-3 pr-10 pl-11 text-sm font-medium text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                {availableTopics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
              <MaterialIcon
                name="expand_more"
                className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-outline"
              />
            </div>
            {selectedTopic?.description ? (
              <p className="mt-2 text-xs text-on-surface-variant">{selectedTopic.description}</p>
            ) : null}
          </section>

          {formConfig ? (
            <section className="rounded-2xl border border-outline-variant/20 bg-white/75 p-4 shadow-[0_12px_40px_rgba(74,48,32,0.06)] backdrop-blur-xl sm:p-5">
              <h2 className="text-sm font-semibold text-on-surface">2. {formConfig.title}</h2>
              <p className="mt-1 text-xs text-on-surface-variant">{formConfig.hint}</p>
              <div className="mt-5">
                <TopicQrForm fields={publicFields} values={formData} onChange={handleFieldChange} />
              </div>

              {saveError ? (
                <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
                  {saveError}
                </p>
              ) : null}

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary mt-6 w-full py-3.5 sm:w-auto"
              >
                <MaterialIcon name="favorite" className="text-lg" />
                {isSaving ? 'Đang lưu thiệp...' : 'Hoàn tất thiệp'}
              </button>
            </section>
          ) : (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Chủ đề này chưa mở tạo thiệp.
            </p>
          )}
        </div>

        {isLgUp ? (
          <section className="lg:sticky lg:top-28">
            <MobileFrame label="Xem trước thiệp">{preview}</MobileFrame>
          </section>
        ) : (
          <CollapsiblePreview label="Xem trước thiệp">
            <MobileFrame label="Xem trước thiệp">{preview}</MobileFrame>
          </CollapsiblePreview>
        )}
      </div>
    </div>
  )
}

export default CreateCardPage
