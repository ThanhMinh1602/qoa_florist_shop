import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import MaterialIcon from '../../../components/common/MaterialIcon'
import MobileFrame from '../../../components/common/MobileFrame'
import { TOPICS } from '../../../constants/topics'
import {
  getEmptyFormValues,
  getTopicQrForm,
  normalizePhraseList,
} from '../../../constants/topicQrForms'
import { useCards } from '../../../context/CardsContext'
import TopicGreetingScreen from '../../greeting/TopicGreetingScreen'
import TopicQrForm from '../../admin/components/TopicQrForm'

const easeOut = [0.22, 1, 0.36, 1]

function toPublicFields(fields = []) {
  return fields.map((field) => {
    if (field.name === 'label') {
      return {
        ...field,
        label: 'Tên của bạn',
        placeholder: 'VD: Minh',
        help: undefined,
      }
    }
    if (field.name === 'phone') {
      return {
        ...field,
        label: 'Số điện thoại',
        help: undefined,
      }
    }
    return { ...field, help: undefined }
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
  const formConfig = getTopicQrForm(topicId)
  const publicFields = useMemo(() => toPublicFields(formConfig?.fields || []), [formConfig])
  const [formData, setFormData] = useState(() => getEmptyFormValues(topicId))
  const [savedCard, setSavedCard] = useState(null)
  const [saveError, setSaveError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)
  const { createCard } = useCards()

  const handleTopicSelect = useCallback((nextTopicId) => {
    setTopicId(nextTopicId)
    setFormData(getEmptyFormValues(nextTopicId))
    setSavedCard(null)
    setSaveError('')
    setPreviewKey((current) => current + 1)
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
    setCopied(false)
    setFormData(getEmptyFormValues(topicId))
    setSaveError('')
  }

  async function copyCode() {
    const code = savedCard?.code || savedCard?.id
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  function replayPreview() {
    setPreviewKey((current) => current + 1)
  }

  const preview = (
    <TopicGreetingScreen
      key={`${topicId}-${previewKey}`}
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
      <motion.div
        className="mx-auto max-w-lg px-5 py-14 sm:px-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: easeOut }}
      >
        <div className="text-center">
          <p className="label-caps text-primary">Hoàn tất</p>
          <h1 className="font-display mt-2 text-3xl text-on-surface">Thiệp đã sẵn sàng</h1>
          <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
            Mua hoa tại QOA và nhắc mã thiệp bên dưới để shop gắn QR lên bó hoa.
          </p>
          <div className="mt-8 border-y border-outline-variant/20 py-6">
            <p className="text-xs tracking-[0.18em] text-outline uppercase">Mã thiệp</p>
            <p className="mt-2 font-mono text-3xl font-bold tracking-[0.2em] text-primary">
              {savedCard.code || savedCard.id}
            </p>
            <button
              type="button"
              onClick={copyCode}
              className="mt-3 text-sm font-semibold text-primary hover:underline"
            >
              {copied ? 'Đã sao chép' : 'Sao chép mã'}
            </button>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <Link to="/shop" className="btn-primary py-4">
              Mua hoa kèm thiệp QR
            </Link>
            <button type="button" onClick={handleCreateAnother} className="btn-glass py-4">
              Tạo thiệp khác
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 pt-6 sm:px-8 lg:px-10">
      <div className="mb-8 lg:mb-10">
        <h1 className="font-display text-3xl text-on-surface sm:text-4xl">Tạo thiệp</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Soạn lời chúc, xem trước, rồi mua hoa để nhận QR trên bó hoa.
        </p>
      </div>

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
        <section className="order-1 lg:sticky lg:top-28 lg:order-none">
          <div className="flex justify-center lg:justify-start">
            <MobileFrame label="">{preview}</MobileFrame>
          </div>
          <button
            type="button"
            onClick={replayPreview}
            className="mx-auto mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:underline lg:mx-0"
          >
            <MaterialIcon name="replay" className="text-lg" />
            Chạy lại từ đầu
          </button>
        </section>

        <section className="order-2 min-w-0">
          <div className="flex flex-wrap gap-2">
            {availableTopics.map((topic) => {
              const selected = topic.id === topicId
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => handleTopicSelect(topic.id)}
                  className={[
                    'rounded-full px-4 py-2 text-sm font-semibold transition',
                    selected
                      ? 'bg-primary text-on-primary'
                      : 'bg-white/70 text-on-surface-variant hover:text-primary',
                  ].join(' ')}
                >
                  {topic.name}
                </button>
              )
            })}
          </div>

          {formConfig ? (
            <div className="mt-8">
              <TopicQrForm fields={publicFields} values={formData} onChange={handleFieldChange} />

              {saveError ? (
                <p className="mt-4 text-sm text-red-600" role="alert">
                  {saveError}
                </p>
              ) : null}

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary mt-8 w-full py-4 sm:w-auto sm:min-w-[220px]"
              >
                {isSaving ? 'Đang lưu...' : 'Hoàn tất thiệp'}
              </button>
              <p className="mt-3 text-xs text-outline">
                Không xuất QR tại đây. Bạn sẽ nhận mã thiệp để gửi shop khi đặt hoa.
              </p>
            </div>
          ) : (
            <p className="mt-8 text-sm text-amber-800">Chủ đề này chưa mở tạo thiệp.</p>
          )}
        </section>
      </div>
    </div>
  )
}

export default CreateCardPage
