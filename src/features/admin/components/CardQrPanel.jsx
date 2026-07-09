import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import { buildGreetingUrl } from '../../../constants/app'
import { getTopicById } from '../../../constants/topics'
import { downloadQrImage } from '../../../utils/downloadQr'

function CardQrPanel({ card }) {
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
    downloadQrImage(canvasRef.current, `qoa-qr-${card.id}.png`)
  }

  return (
    <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="text-xl">
          ✅
        </span>
        <div>
          <h4 className="text-lg font-semibold text-slate-900">Đã tạo thiệp & mã QR</h4>
          <p className="mt-1 text-sm text-slate-600">
            Chủ đề: <span className="font-medium">{topic?.name ?? card.topicId}</span> — Người
            nhận: <span className="font-medium">{card.recipientName}</span>
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-rose-100">
          <QRCodeCanvas
            ref={canvasRef}
            value={greetingUrl}
            size={200}
            level="M"
            includeMargin
            bgColor="#ffffff"
            fgColor="#1f2937"
          />
        </div>

        <div className="w-full flex-1 space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">ID thiệp</p>
            <p className="mt-1 break-all font-mono text-sm text-slate-700">{card.id}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Link quét QR
            </p>
            <p className="mt-1 break-all text-sm text-rose-700">{greetingUrl}</p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopyUrl}
              className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-rose-50"
            >
              {copied ? 'Đã sao chép!' : 'Sao chép link'}
            </button>
            <button
              type="button"
              onClick={handleDownloadQr}
              className="rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600"
            >
              Tải ảnh QR
            </button>
            <Link
              to="/admin/manage"
              className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
            >
              Xem trong Quản lý
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardQrPanel
