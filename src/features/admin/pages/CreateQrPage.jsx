import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'
import MobileFrame from '../../../components/common/MobileFrame'
import TopicGreetingScreen from '../../greeting/TopicGreetingScreen'
import { CollapsiblePreview } from '../../../components/mobile/CollapsiblePreview'
import { TOPICS } from '../../../constants/topics'
import { getEmptyFormValues, getTopicQrForm, normalizePhraseList } from '../../../constants/topicQrForms'
import { useCards } from '../../../context/CardsContext'
import { useIsLgUp } from '../../../hooks/useMediaQuery'
import CardQrPanel from '../components/CardQrPanel'
import TopicQrForm from '../components/TopicQrForm'

function CreateQrPage() {
  const availableTopics = useMemo(() => TOPICS.filter((topic) => topic.available), [])
  const [topicId, setTopicId] = useState(availableTopics[0]?.id ?? 'birthday')
  const selectedTopic = useMemo(
    () => availableTopics.find((topic) => topic.id === topicId),
    [availableTopics, topicId],
  )
  const formConfig = getTopicQrForm(topicId)
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
    })

    setIsSaving(false)
    if (!result.success) {
      setSaveError(result.message)
      return
    }
    setSavedCard(result.card)
    setFormData(getEmptyFormValues(topicId))
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-outline-variant/25 bg-surface-container-lowest/80 px-4 py-3 backdrop-blur lg:px-8 lg:py-5">
        <div className="flex flex-wrap items-center justify-between gap-2.5 lg:items-start lg:gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-lg text-primary lg:text-3xl">Tạo QR thiệp</h2>
            <p className="mt-1 hidden max-w-2xl text-sm text-on-surface-variant lg:block">
              Chọn chủ đề animation → nhập form tương ứng → tạo QR gửi khách. Không gắn đơn giao.
            </p>
          </div>
          <Link
            to="/admin/qr"
            className="btn-glass inline-flex items-center gap-1 !px-3 !py-2 text-[10px] lg:text-xs"
          >
            <MaterialIcon name="list" className="text-lg" />
            Danh sách
          </Link>
        </div>
      </header>

      <div className="grid flex-1 gap-4 p-4 md:gap-8 md:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-10">
        <div className="space-y-4">
          <section className="glass-card p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-on-surface">1. Chọn chủ đề</h3>
            <div className="relative mt-3">
              <MaterialIcon
                name={selectedTopic?.icon ?? 'category'}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
              />
              <select
                value={topicId}
                onChange={(event) => handleTopicSelect(event.target.value)}
                className="w-full appearance-none rounded-xl border border-outline-variant/40 bg-surface-container-lowest py-3 pl-11 pr-10 text-sm font-medium text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                {availableTopics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
              <MaterialIcon
                name="expand_more"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-outline"
              />
            </div>
            {selectedTopic?.description ? (
              <p className="mt-2 text-xs text-on-surface-variant">{selectedTopic.description}</p>
            ) : null}
          </section>

          {formConfig ? (
            <section className="glass-card p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-on-surface">2. {formConfig.title}</h3>
              <p className="mt-1 text-xs text-on-surface-variant">{formConfig.hint}</p>
              <div className="mt-5">
                <TopicQrForm
                  fields={formConfig.fields}
                  values={formData}
                  onChange={handleFieldChange}
                />
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
                className="mt-6 inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-container disabled:opacity-60"
              >
                <MaterialIcon name="qr_code_2" className="text-lg" />
                {isSaving ? 'Đang tạo...' : 'Tạo QR & lưu'}
              </button>

              {savedCard ? (
                <div className="mt-6">
                  <CardQrPanel card={savedCard} />
                </div>
              ) : null}
            </section>
          ) : (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Chủ đề này chưa có form tạo QR.
            </p>
          )}
        </div>

        {isLgUp ? (
          <section className="lg:sticky lg:top-6">
            <MobileFrame label="Xem trước thiệp">
              <TopicGreetingScreen
                topicId={topicId}
                preview
                autoStart
                senderName={formData.senderName}
                recipientName={formData.recipientName}
                message={formData.message}
                keywords={normalizePhraseList(formData.keywords, 6)}
                messages={normalizePhraseList(formData.messages, 10)}
              />
            </MobileFrame>
          </section>
        ) : (
          <CollapsiblePreview label="Xem trước thiệp">
            <MobileFrame label="Xem trước thiệp">
              <TopicGreetingScreen
                topicId={topicId}
                preview
                autoStart
                senderName={formData.senderName}
                recipientName={formData.recipientName}
                message={formData.message}
                keywords={normalizePhraseList(formData.keywords, 6)}
                messages={normalizePhraseList(formData.messages, 10)}
              />
            </MobileFrame>
          </CollapsiblePreview>
        )}
      </div>
    </div>
  )
}

export default CreateQrPage
