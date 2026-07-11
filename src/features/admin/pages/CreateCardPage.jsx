import { useCallback, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import BirthdayScreen from '../../../components/BirthdayScreen'
import { CollapsiblePreview } from '../../../components/mobile/CollapsiblePreview'
import MaterialIcon from '../../../components/common/MaterialIcon'
import MobileFrame from '../../../components/common/MobileFrame'
import { useIsLgUp } from '../../../hooks/useMediaQuery'
import { DEFAULT_BIRTHDAY_CARD_FORM } from '../../../constants/cardDefaults'
import { getTopicById } from '../../../constants/topics'
import { useCards } from '../../../context/CardsContext'
import CardQrPanel from '../components/CardQrPanel'
import CreateCardForm from '../components/CreateCardForm'

function CreateCardPage() {
  const { topicId } = useParams()
  const topic = getTopicById(topicId)
  const { createCard } = useCards()
  const [formData, setFormData] = useState(DEFAULT_BIRTHDAY_CARD_FORM)
  const [savedCard, setSavedCard] = useState(null)
  const [saveError, setSaveError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const isLgUp = useIsLgUp()

  const handleFieldChange = useCallback((field, value) => {
    setSaveError('')
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }))
  }, [])

  async function handleSave() {
    setSaveError('')
    setIsSaving(true)

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

  if (!topic) {
    return (
      <div className="flex flex-1 flex-col items-start justify-center p-8">
        <h2 className="text-xl font-semibold text-slate-900">Không tìm thấy chủ đề</h2>
        <Link
          to="/admin/create"
          className="mt-4 text-sm font-medium text-rose-600 hover:text-rose-700"
        >
          <span className="inline-flex items-center gap-1">
            <MaterialIcon name="arrow_back" className="text-base" />
            Quay lại chọn chủ đề
          </span>
        </Link>
      </div>
    )
  }

  if (!topic.available) {
    return <Navigate to="/admin/create" replace />
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-rose-100 bg-white/80 px-4 py-4 backdrop-blur md:px-8 md:py-5">
        <Link
          to="/admin/create"
          className="text-sm font-medium text-rose-600 transition hover:text-rose-700"
        >
          <span className="inline-flex items-center gap-1">
            <MaterialIcon name="arrow_back" className="text-base" />
            Quay lại chọn chủ đề
          </span>
        </Link>
        <p className="mt-3 text-sm font-medium text-rose-500">Thiệp QR nhanh</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">
          Tạo thiệp: {topic.name}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Chỉ tạo QR — không tạo đơn giao. Cần giao hoa thì dùng Lên đơn giao.
        </p>
      </header>

      <div className="grid flex-1 gap-4 p-4 md:gap-8 md:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-10">
        {!isLgUp ? (
          <CollapsiblePreview label="Xem trước thiệp">
            <MobileFrame label="Xem trước trên điện thoại">
              <BirthdayScreen
                preview
                autoStart
                senderName={formData.senderName}
                recipientName={formData.recipientName}
                message={formData.message}
              />
            </MobileFrame>
          </CollapsiblePreview>
        ) : null}

        <section className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm shadow-rose-50 md:p-6">
          <h3 className="text-lg font-semibold text-slate-900">Thông tin thiệp</h3>
          <p className="mt-1 text-sm text-slate-500">
            Các trường có dấu <span className="text-rose-500">*</span> là bắt buộc.
          </p>

          <div className="mt-6">
            <CreateCardForm values={formData} onChange={handleFieldChange} />
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
            className="mt-6 w-full rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isSaving ? 'Đang lưu...' : 'Tạo QR & Lưu'}
          </button>

          {savedCard ? <CardQrPanel card={savedCard} /> : null}
        </section>

        {isLgUp ? (
          <section className="lg:sticky lg:top-6">
            <MobileFrame label="Xem trước trên điện thoại">
              <BirthdayScreen
                preview
                autoStart
                senderName={formData.senderName}
                recipientName={formData.recipientName}
                message={formData.message}
              />
            </MobileFrame>
          </section>
        ) : null}
      </div>
    </div>
  )
}

export default CreateCardPage
