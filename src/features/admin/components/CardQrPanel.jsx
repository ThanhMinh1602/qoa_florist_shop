import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import { buildGreetingUrl } from '../../../constants/app'
import { getTopicById } from '../../../constants/topics'
import { downloadQrImage } from '../../../utils/downloadQr'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { QR_BG_COLOR, QR_FG_COLOR, qrHeartImageSettings } from '../../../constants/qrStyle'

function CardQrPanel({ card, embedded = false, qrSize = 200 }) {
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
    <div
      className={
        embedded
          ? 'rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4'
          : 'mt-8 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6'
      }
    >
      {!embedded ? (
        <div className="flex items-start gap-3">
          <MaterialIcon name="check_circle" className="text-2xl text-emerald-500" filled />
          <div>
            <h4 className="text-lg font-semibold text-slate-900">Đã tạo thiệp & mã QR</h4>
            <p className="mt-1 text-sm text-slate-600">
              {card.label ? (
                <>
                  <span className="font-medium">{card.label}</span>
                  {' · '}
                </>
              ) : null}
              Chủ đề: <span className="font-medium">{topic?.name ?? card.topicId}</span>
              {card.topicId === 'galaxy_love' ? (
                <>
                  {' — '}
                  {(card.keywords || []).filter(Boolean).slice(0, 3).join(' · ') || 'Galaxy'}
                </>
              ) : (
                <>
                  {' — Người nhận: '}
                  <span className="font-medium">{card.recipientName}</span>
                </>
              )}
            </p>
          </div>
        </div>
      ) : (
        <h4 className="text-sm font-semibold text-slate-900">Mã QR thiệp</h4>
      )}

      <div
        className={[
          'flex flex-col items-center gap-4 sm:flex-row sm:items-start',
          embedded ? 'mt-4' : 'mt-6',
        ].join(' ')}
      >
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-rose-100 sm:p-5">
          <QRCodeCanvas
            ref={canvasRef}
            value={greetingUrl}
            size={qrSize}
            level="H"
            includeMargin
            bgColor={QR_BG_COLOR}
            fgColor={QR_FG_COLOR}
            imageSettings={qrHeartImageSettings(qrSize)}
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
            {!embedded ? (
              <Link
                to="/admin/qr"
                className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
              >
                Danh sách QR
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardQrPanel
