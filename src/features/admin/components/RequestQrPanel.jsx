import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import { buildGreetingUrl } from '../../../constants/app'
import { getTopicById } from '../../../constants/topics'
import { downloadQrImage } from '../../../utils/downloadQr'
import TopicLabel from '../../../components/common/TopicLabel'
import { QR_BG_COLOR, QR_FG_COLOR, qrHeartImageSettings } from '../../../constants/qrStyle'

function RequestQrPanel({ request }) {
  const canvasRef = useRef(null)
  const [copied, setCopied] = useState(false)
  const topic = getTopicById(request.topicId)
  const greetingUrl = buildGreetingUrl(request.cardId)

  function handleCopyUrl() {
    navigator.clipboard.writeText(greetingUrl).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleDownloadQr() {
    const name = request.label || request.recipientName || ''
    const slug = name ? name.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') : request.cardId
    downloadQrImage(canvasRef.current, `qoa-qr-${slug || request.cardId}.png`, name)
  }

  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
      <h4 className="text-sm font-semibold text-slate-900">Mã QR thiệp</h4>
      <p className="mt-1 text-xs text-slate-500">
        <TopicLabel topic={topic} topicId={request.topicId} /> — {request.recipientName}
      </p>

      <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-rose-100">
          <QRCodeCanvas
            ref={canvasRef}
            value={greetingUrl}
            size={140}
            level="H"
            includeMargin
            bgColor={QR_BG_COLOR}
            fgColor={QR_FG_COLOR}
            imageSettings={qrHeartImageSettings(140)}
          />
        </div>

        <div className="w-full flex-1 space-y-2">
          <p className="break-all text-xs text-rose-700">{greetingUrl}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopyUrl}
              className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-rose-50"
            >
              {copied ? 'Đã sao chép!' : 'Sao chép link'}
            </button>
            <button
              type="button"
              onClick={handleDownloadQr}
              className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-600"
            >
              Tải QR
            </button>
            <Link
              to={`/q/${request.cardId}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
            >
              Mở thiệp
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RequestQrPanel
