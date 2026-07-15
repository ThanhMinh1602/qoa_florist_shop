import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'
import MobileFrame from '../../../components/common/MobileFrame'
import TopicGreetingScreen from '../../../components/TopicGreetingScreen'
import { CollapsiblePreview } from '../../../components/mobile/CollapsiblePreview'
import { TOPICS } from '../../../constants/topics'
import { getEmptyFormValues, getTopicQrForm } from '../../../constants/topicQrForms'
import { useCards } from '../../../context/CardsContext'
import { useIsLgUp } from '../../../hooks/useMediaQuery'
import CardQrPanel from '../components/CardQrPanel'
import TopicQrForm from '../components/TopicQrForm'

function CreateQrPage() {
  const availableTopics = useMemo(() => TOPICS.filter((topic) => topic.available), [])
  const [topicId, setTopicId] = useState(availableTopics[0]?.id ?? 'birthday')
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
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-rose-100 bg-white/80 px-4 py-4 backdrop-blur md:px-8 md:py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Tạo QR thiệp</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Chọn chủ đề animation → nhập form tương ứng → tạo QR gửi khách. Không gắn đơn giao.
            </p>
          </div>
          <Link
            to="/admin/qr"
            className="inline-flex items-center gap-1 rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
          >
            <MaterialIcon name="list" className="text-lg" />
            Danh sách QR
          </Link>
        </div>
      </header>

      <div className="grid flex-1 gap-4 p-4 md:gap-8 md:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-10">
        <div className="space-y-4">
          <section className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm sm:p-5">
            <h3 className="text-sm font-semibold text-slate-900">1. Chọn chủ đề</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {availableTopics.map((topic) => {
                const active = topic.id === topicId
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleTopicSelect(topic.id)}
                    className={[
                      'rounded-2xl border px-4 py-3 text-left transition',
                      active
                        ? 'border-rose-400 bg-rose-50 ring-2 ring-rose-100'
                        : 'border-rose-100 hover:border-rose-200 hover:bg-rose-50/50',
                    ].join(' ')}
                  >
                    <span className="flex items-center gap-2">
                      <MaterialIcon
                        name={topic.icon}
                        className={active ? 'text-rose-600' : 'text-slate-400'}
                      />
                      <span className="font-semibold text-slate-900">{topic.name}</span>
                    </span>
                    <p className="mt-1 text-xs text-slate-500">{topic.description}</p>
                  </button>
                )
              })}
            </div>
          </section>

          {formConfig ? (
            <section className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm sm:p-5">
              <h3 className="text-sm font-semibold text-slate-900">2. {formConfig.title}</h3>
              <p className="mt-1 text-xs text-slate-500">{formConfig.hint}</p>
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
                className="mt-6 inline-flex items-center gap-1 rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
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
              />
            </MobileFrame>
          </CollapsiblePreview>
        )}
      </div>
    </div>
  )
}

export default CreateQrPage
