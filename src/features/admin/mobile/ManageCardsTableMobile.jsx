import { useState } from 'react'
import { getTopicById } from '../../../constants/topics'
import MaterialIcon from '../../../components/common/MaterialIcon'
import TopicLabel from '../../../components/common/TopicLabel'

function formatDate(isoString) {
  if (!isoString) return '—'

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoString))
}

function truncate(text, maxLength = 80) {
  if (!text) return '—'
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}…`
}

function ManageCardsTableMobile({ cards, onViewQr, onDelete, deletingId }) {
  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-rose-200 bg-white px-4 py-12 text-center">
        <MaterialIcon name="inbox" className="mx-auto text-4xl text-rose-300" />
        <p className="mt-3 text-sm font-medium text-slate-700">Chưa có thiệp nào phù hợp</p>
        <p className="mt-1 text-sm text-slate-500">Thử đổi bộ lọc hoặc tạo thiệp mới.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {cards.map((card) => {
        const topic = getTopicById(card.topicId)

        return (
          <article
            key={card.id}
            className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm shadow-rose-50"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-base font-semibold text-slate-900">{card.recipientName}</p>
                <p className="mt-1 text-sm text-slate-500">
                  <TopicLabel topic={topic} topicId={card.topicId} />
                </p>
              </div>
              <p className="shrink-0 text-[11px] text-slate-400">{formatDate(card.createdAt)}</p>
            </div>

            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-400">Người gửi</dt>
                <dd className="text-right font-medium text-slate-700">{card.senderName || '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-400">SĐT</dt>
                <dd className="text-right text-slate-700">{card.phone || '—'}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Lời chúc</dt>
                <dd className="mt-1 leading-6 text-slate-600">{truncate(card.message)}</dd>
              </div>
            </dl>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onViewQr(card)}
                className="rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
              >
                Xem QR
              </button>
              <button
                type="button"
                onClick={() => onDelete(card)}
                disabled={deletingId === card.id}
                className="rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId === card.id ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default ManageCardsTableMobile
