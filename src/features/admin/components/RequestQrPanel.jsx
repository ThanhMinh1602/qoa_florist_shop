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
      <h4 className="text-sm font-semibold text-on-surface">Mã QR thiệp</h4>
      <p className="mt-1 text-xs text-on-surface-variant">
        <TopicLabel topic={topic} topicId={request.topicId} /> — {request.recipientName}
      </p>

      <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <div className="rounded-xl bg-surface-container-lowest p-3 shadow-sm ring-1 ring-primary/20">
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
          <p className="break-all text-xs text-primary">{greetingUrl}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopyUrl}
              className="rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-3 py-1.5 text-xs font-medium text-on-surface transition hover:bg-surface-container-low"
            >
              {copied ? 'Đã sao chép!' : 'Sao chép link'}
            </button>
            <button
              type="button"
              onClick={handleDownloadQr}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-container"
            >
              Tải QR
            </button>
            <Link
              to={`/q/${request.cardId}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-surface-container-low"
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
