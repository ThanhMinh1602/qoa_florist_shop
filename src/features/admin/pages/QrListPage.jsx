import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'
import TopicLabel from '../../../components/common/TopicLabel'
import { getTopicById } from '../../../constants/topics'
import { cardToFormValues, getTopicQrForm } from '../../../constants/topicQrForms'
import { getMusicName } from '../../../constants/galaxyMusic'
import { useCards } from '../../../context/CardsContext'
import { useDialog } from '../../../context/DialogContext'
import { useIsLgUp } from '../../../hooks/useMediaQuery'
import { formatTimeAgo } from '../../../utils/formatTimeAgo'
import { buildGreetingUrl } from '../../../constants/app'
import CardQrPanel from '../components/CardQrPanel'
import TopicQrForm from '../components/TopicQrForm'

function contentPreview(card) {
  if (card.topicId === 'galaxy_love') {
    return (
      (card.keywords || []).filter(Boolean).slice(0, 3).join(' · ') ||
      (card.messages || [])[0] ||
      '—'
    )
  }
  return card.recipientName || '—'
}

function QrDetailModal({ card, onClose, onDelete, onUpdated }) {
  const { updateCard } = useCards()
  const topic = getTopicById(card.topicId)
  const formConfig = getTopicQrForm(card.topicId)
  const greetingUrl = buildGreetingUrl(card.id)

  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState(() => cardToFormValues(card))
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    setFormData(cardToFormValues(card))
    setEditing(false)
    setSaveError('')
  }, [card])

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') {
        if (editing) {
          setEditing(false)
          setFormData(cardToFormValues(card))
          setSaveError('')
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, editing, card])

  function handleFieldChange(field, value) {
    setSaveError('')
    setFormData((previous) => ({ ...previous, [field]: value }))
  }

  async function handleSave() {
    setIsSaving(true)
    setSaveError('')
    const result = await updateCard(card.id, {
      topicId: card.topicId,
      ...formData,
    })
    setIsSaving(false)
    if (!result.success) {
      setSaveError(result.message)
      return
    }
    setEditing(false)
    onUpdated?.(result.card)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-on-surface/50 backdrop-blur-[2px]"
        aria-label="Đóng"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-surface-container-lowest shadow-xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-outline-variant/25 px-6 py-5 sm:px-8">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-outline">
              {editing ? 'Sửa QR' : 'Chi tiết QR'}
            </p>
            <h3 className="mt-1 truncate text-xl font-semibold text-on-surface sm:text-2xl">
              {card.label || card.recipientName || 'Thiệp QR'}
            </h3>
            <p className="mt-1 text-base text-on-surface-variant">{topic?.name ?? card.topicId}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl p-2.5 text-outline hover:bg-surface-container-low hover:text-primary"
            aria-label="Đóng"
          >
            <MaterialIcon name="close" className="text-2xl" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5 sm:px-8 sm:py-6">
          {editing && formConfig ? (
            <>
              <TopicQrForm
                fields={formConfig.fields}
                values={formData}
                onChange={handleFieldChange}
              />
              {saveError ? (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
                  {saveError}
                </p>
              ) : null}
            </>
          ) : (
            <>
              <dl className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-outline">
                    {card.topicId === 'galaxy_love' ? 'Tên khách hàng' : 'Tên gợi nhớ'}
                  </dt>
                  <dd className="mt-1 text-base font-medium text-on-surface">{card.label || '—'}</dd>
                </div>

                {card.topicId === 'galaxy_love' ? (
                  <>
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-outline">
                        Keywords
                      </dt>
                      <dd className="mt-1 text-base text-on-surface">
                        {(card.keywords || []).filter(Boolean).join(' · ') || '—'}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-outline">
                        Lời nhắn
                      </dt>
                      <dd className="mt-1 whitespace-pre-wrap text-base leading-relaxed text-on-surface">
                        {(card.messages || []).filter(Boolean).join('\n') || card.message || '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-outline">
                        Nhạc nền
                      </dt>
                      <dd className="mt-1 text-base text-on-surface">
                        {getMusicName(card.music) || '—'}
                      </dd>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-outline">
                        Người nhận
                      </dt>
                      <dd className="mt-1 text-base font-medium text-on-surface">
                        {card.recipientName || '—'}
                      </dd>
                    </div>
                    {card.senderName ? (
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-outline">
                          Người gửi
                        </dt>
                        <dd className="mt-1 text-base text-on-surface">{card.senderName}</dd>
                      </div>
                    ) : null}
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-outline">
                        Lời chúc
                      </dt>
                      <dd className="mt-1 whitespace-pre-wrap text-base leading-relaxed text-on-surface">
                        {card.message || '—'}
                      </dd>
                    </div>
                  </>
                )}

                {card.phone ? (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-outline">
                      SĐT
                    </dt>
                    <dd className="mt-1 text-base text-on-surface">{card.phone}</dd>
                  </div>
                ) : null}

                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-outline">
                    Tạo lúc
                  </dt>
                  <dd className="mt-1 text-base text-on-surface">{formatTimeAgo(card.createdAt)}</dd>
                </div>

                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-outline">
                    Link
                  </dt>
                  <dd className="mt-1 break-all text-base text-primary">{greetingUrl}</dd>
                </div>
              </dl>

              <CardQrPanel card={card} embedded qrSize={260} />
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-outline-variant/25 px-6 py-4 sm:px-8 sm:py-5">
          {editing ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  setFormData(cardToFormValues(card))
                  setSaveError('')
                }}
                disabled={isSaving}
                className="rounded-xl border border-outline-variant/40 px-5 py-3 text-sm font-medium text-on-surface hover:bg-surface-container-low disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-container disabled:opacity-60"
              >
                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-outline-variant/40 px-5 py-3 text-sm font-medium text-on-surface hover:bg-surface-container-low"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData(cardToFormValues(card))
                  setEditing(true)
                  setSaveError('')
                }}
                className="inline-flex items-center gap-1 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-container"
              >
                <MaterialIcon name="edit" className="text-lg" />
                Sửa
              </button>
              <button
                type="button"
                onClick={() => onDelete(card)}
                className="rounded-xl px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Xóa QR
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function QrListPage() {
  const { cards, isLoading, error, fetchCards, deleteCard } = useCards()
  const { confirm, alert } = useDialog()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const isLgUp = useIsLgUp()

  const load = useCallback(async () => {
    await fetchCards(search.trim() ? { search: search.trim() } : {})
  }, [fetchCards, search])

  useEffect(() => {
    load()
  }, [load])

  async function handleDelete(card) {
    const ok = await confirm({
      title: 'Xóa QR',
      message: `Xóa “${card.label || card.recipientName}”? Link QR sẽ không còn dùng được.`,
      confirmLabel: 'Xóa',
      variant: 'danger',
    })
    if (!ok) return
    const result = await deleteCard(card.id)
    if (!result.success) {
      await alert({ title: 'Không thể xóa', message: result.message, variant: 'error' })
      return
    }
    if (selected?.id === card.id) setSelected(null)
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-outline-variant/25 bg-surface-container-lowest/80 px-4 py-4 backdrop-blur md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl text-primary">Danh sách QR</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Quản lý và theo dõi các mã QR thiệp đính kèm hoa.
            </p>
          </div>
          <Link
            to="/admin/qr/new"
            className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-container"
          >
            <MaterialIcon name="add" className="text-lg" />
            Tạo QR mới
          </Link>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
        <div className="flex flex-wrap gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên khách, keyword, lời nhắn..."
            className="w-full max-w-md rounded-xl border border-outline-variant/25 bg-surface-container-lowest px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/15"
          />
        </div>

        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        ) : null}

        {isLoading ? (
          <p className="py-12 text-center text-sm text-on-surface-variant">Đang tải...</p>
        ) : cards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-lowest px-6 py-16 text-center">
            <MaterialIcon name="qr_code_2" className="text-4xl text-primary-fixed-dim" />
            <p className="mt-3 text-sm font-medium text-on-surface">Chưa có QR nào</p>
            <Link to="/admin/qr/new" className="mt-3 inline-block text-sm font-medium text-primary">
              Tạo QR đầu tiên
            </Link>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            {isLgUp ? (
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-outline-variant/25 bg-surface-container-low/60 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                  <tr>
                    <th className="px-4 py-3">Tên khách / gợi nhớ</th>
                    <th className="px-4 py-3">Chủ đề</th>
                    <th className="px-4 py-3">Nội dung</th>
                    <th className="px-4 py-3">Tạo</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {cards.map((card) => (
                    <tr
                      key={card.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelected(card)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          setSelected(card)
                        }
                      }}
                      className="cursor-pointer transition hover:bg-surface-container-low/50"
                    >
                      <td className="px-4 py-3 font-semibold text-on-surface">
                        {card.label || '(Chưa đặt tên)'}
                      </td>
                      <td className="px-4 py-3">
                        <TopicLabel topicId={card.topicId} />
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">{contentPreview(card)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-on-surface-variant">
                        {formatTimeAgo(card.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleDelete(card)
                          }}
                          className="text-sm text-red-500 hover:text-red-600"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <ul className="divide-y divide-surface-container">
                {cards.map((card) => (
                  <li key={card.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(card)}
                      className="w-full p-4 text-left transition hover:bg-surface-container-low/40"
                    >
                      <p className="font-semibold text-on-surface">
                        {card.label || '(Chưa đặt tên)'}
                      </p>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        <TopicLabel topicId={card.topicId} /> · {contentPreview(card)} ·{' '}
                        {formatTimeAgo(card.createdAt)}
                      </p>
                    </button>
                    <div className="flex gap-3 px-4 pb-3">
                      <button
                        type="button"
                        onClick={() => setSelected(card)}
                        className="text-sm font-medium text-primary"
                      >
                        Xem / Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(card)}
                        className="text-sm text-red-500"
                      >
                        Xóa
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {selected ? (
        <QrDetailModal
          card={selected}
          onClose={() => setSelected(null)}
          onDelete={handleDelete}
          onUpdated={(card) => setSelected(card)}
        />
      ) : null}
    </div>
  )
}

export default QrListPage
