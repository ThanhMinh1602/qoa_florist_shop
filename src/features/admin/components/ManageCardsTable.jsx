import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import { buildGreetingUrl } from '../../../constants/app'
import { getTopicById } from '../../../constants/topics'
import { downloadQrImage } from '../../../utils/downloadQr'
import MaterialIcon from '../../../components/common/MaterialIcon'
import TopicLabel from '../../../components/common/TopicLabel'
import { QR_BG_COLOR, QR_FG_COLOR, qrHeartImageSettings } from '../../../constants/qrStyle'

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

function truncate(text, maxLength = 48) {
  if (!text) return '—'
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}…`
}

function CardQrModal({ card, onClose }) {
  const canvasRef = useRef(null)
  const [copied, setCopied] = useState(false)
  const topic = getTopicById(card.topicId)
  const greetingUrl = buildGreetingUrl(card.id)

  function handleCopyUrl() {
    navigator.clipboard.writeText(greetingUrl).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleDownloadQr() {
    const name = card.label || card.recipientName || ''
    const slug = name ? name.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') : card.id
    downloadQrImage(canvasRef.current, `qoa-qr-${slug || card.id}.png`, name)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div
        className="absolute inset-0"
        onClick={onClose}
        onKeyDown={(event) => event.key === 'Escape' && onClose()}
        role="button"
        tabIndex={-1}
        aria-label="Đóng"
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Mã QR thiệp</h3>
            <p className="mt-1 text-sm text-slate-500">
              <TopicLabel topic={topic} topicId={card.topicId} /> — {card.recipientName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Đóng"
          >
            <MaterialIcon name="close" className="text-xl" />
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-rose-100">
            <QRCodeCanvas
              ref={canvasRef}
              value={greetingUrl}
              size={180}
              level="H"
              includeMargin
              bgColor={QR_BG_COLOR}
              fgColor={QR_FG_COLOR}
              imageSettings={qrHeartImageSettings(180)}
            />
          </div>

          <div className="w-full flex-1 space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Link</p>
              <p className="mt-1 break-all text-sm text-rose-700">{greetingUrl}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopyUrl}
                className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-rose-50"
              >
                {copied ? 'Đã sao chép!' : 'Sao chép link'}
              </button>
              <button
                type="button"
                onClick={handleDownloadQr}
                className="rounded-xl bg-rose-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
              >
                Tải QR
              </button>
              <Link
                to={`/q/${card.id}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
              >
                Mở thiệp
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ManageCardsTable({ cards, onViewQr, onDelete, deletingId }) {
  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-rose-200 bg-white px-6 py-16 text-center">
        <MaterialIcon name="inbox" className="mx-auto text-4xl text-rose-300" />
        <p className="mt-3 text-sm font-medium text-slate-700">Chưa có thiệp nào phù hợp</p>
        <p className="mt-1 text-sm text-slate-500">
          Thử đổi bộ lọc hoặc tạo thiệp mới từ menu bên trái.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-sm shadow-rose-50">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-rose-100 bg-rose-50/60 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Ngày tạo</th>
              <th className="px-4 py-3">Chủ đề</th>
              <th className="px-4 py-3">Người nhận</th>
              <th className="px-4 py-3">Người gửi</th>
              <th className="px-4 py-3">SĐT</th>
              <th className="px-4 py-3">Lời chúc</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rose-50">
            {cards.map((card) => {
              const topic = getTopicById(card.topicId)

              return (
                <tr key={card.id} className="transition hover:bg-rose-50/40">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {formatDate(card.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                    <TopicLabel topic={topic} topicId={card.topicId} />
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">{card.recipientName}</td>
                  <td className="px-4 py-3 text-slate-600">{card.senderName || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {card.phone || '—'}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-slate-600">{truncate(card.message)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onViewQr(card)}
                        className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
                      >
                        QR
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(card)}
                        disabled={deletingId === card.id}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === card.id ? '...' : 'Xóa'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export { CardQrModal }
export default ManageCardsTable
