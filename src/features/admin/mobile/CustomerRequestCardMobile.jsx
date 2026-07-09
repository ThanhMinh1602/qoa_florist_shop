import { SHIPPING_STATUS_LABELS } from '../../../constants/customRequestDefaults'
import { getTopicById } from '../../../constants/topics'
import { formatTimeAgo } from '../../../utils/formatTimeAgo'
import { getInvoiceCode } from '../../../utils/invoiceCode'
import RequestExportButton from '../components/RequestExportButton'
import RequestQrPanel from '../components/RequestQrPanel'
import RequestShippingPanel from '../components/RequestShippingPanel'

const STATUS_LABELS = {
  pending: { label: 'Chờ xử lý', className: 'bg-amber-50 text-amber-700 ring-amber-100' },
  reviewed: { label: 'Đã xem', className: 'bg-sky-50 text-sky-700 ring-sky-100' },
  done: { label: 'Hoàn thành', className: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
}

const ANIMATION_CLASS =
  'grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]'

function truncate(text, max = 48) {
  if (!text) return '—'
  if (text.length <= max) return text
  return `${text.slice(0, max)}…`
}

function CustomerRequestCardMobile({
  request,
  isHighlighted,
  isExpanded,
  onToggle,
  onStatusChange,
  onUpdated,
  isUpdating,
}) {
  const topic = getTopicById(request.topicId)
  const status = STATUS_LABELS[request.status] ?? STATUS_LABELS.pending
  const hasCard = Boolean(request.cardId)

  return (
    <article
      className={[
        'overflow-hidden rounded-2xl border bg-white shadow-sm',
        isHighlighted ? 'border-rose-300 ring-2 ring-rose-100' : 'border-rose-100 shadow-rose-50',
      ].join(' ')}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-3 p-4 text-left transition-colors active:bg-rose-50/40"
        aria-expanded={isExpanded}
      >
        <span className="min-w-0 flex-1">
          <span className="block text-base font-semibold text-slate-900">{request.customerName}</span>

          <span className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold tracking-wide text-slate-800">
              {getInvoiceCode(request)}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${status.className}`}>
              {status.label}
            </span>
            {request.shippingStatus && request.shippingStatus !== 'pending' ? (
              <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700 ring-1 ring-sky-100">
                {SHIPPING_STATUS_LABELS[request.shippingStatus]}
              </span>
            ) : null}
          </span>

          <span className="mt-2 block text-xs text-slate-500">
            {formatTimeAgo(request.createdAt)} · {topic?.emoji} {topic?.name ?? request.topicId}
          </span>

          <div className={[ANIMATION_CLASS, isExpanded ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'].join(' ')}>
            <div className="min-h-0 overflow-hidden">
              <span className="mt-3 block space-y-1 text-sm text-slate-600">
                <span className="block">
                  <span className="text-slate-400">Giao cho:</span>{' '}
                  <span className="font-medium text-slate-800">
                    {request.deliveryRecipientName || request.recipientName}
                  </span>
                </span>
                {request.deliveryPhone ? (
                  <span className="block text-slate-700">{request.deliveryPhone}</span>
                ) : null}
                <span className="block">
                  <span className="text-slate-400">Địa chỉ:</span> {truncate(request.deliveryAddress, 64)}
                </span>
              </span>
            </div>
          </div>
        </span>

        <span
          className={[
            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 transition-transform duration-300',
            isExpanded ? 'rotate-180 bg-rose-100' : '',
          ].join(' ')}
          aria-hidden="true"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current">
            <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" />
          </svg>
        </span>
      </button>

      <div className={[ANIMATION_CLASS, isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'].join(' ')}>
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-rose-50 px-4 pb-4 pt-4">
            <div className="mb-4 grid gap-2">
              <RequestExportButton request={request} />
              <select
                value={request.status}
                disabled={isUpdating}
                onChange={(event) => onStatusChange(request.id, event.target.value)}
                className="w-full rounded-xl border border-rose-100 px-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-rose-100"
              >
                <option value="pending">Chờ xử lý</option>
                <option value="reviewed">Đã xem</option>
                <option value="done">Hoàn thành</option>
              </select>
            </div>

            <div className="space-y-4">
              {hasCard ? (
                <RequestQrPanel request={request} />
              ) : (
                <div className="rounded-2xl border border-dashed border-rose-200 px-4 py-8 text-center text-sm text-slate-500">
                  Đơn cũ chưa có mã QR
                </div>
              )}

              <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-4">
                <h4 className="text-sm font-semibold text-slate-900">Thông tin giao hàng</h4>
                <dl className="mt-3 space-y-2 text-sm">
                  <div>
                    <dt className="text-xs text-slate-400">Người nhận hàng</dt>
                    <dd className="font-medium text-slate-800">
                      {request.deliveryRecipientName || request.recipientName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400">SĐT giao hàng</dt>
                    <dd className="text-slate-700">{request.deliveryPhone || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400">Địa chỉ</dt>
                    <dd className="leading-6 text-slate-700">{request.deliveryAddress || '—'}</dd>
                  </div>
                  {(request.deliveryDate || request.deliveryTimeSlot) && (
                    <div>
                      <dt className="text-xs text-slate-400">Thời gian giao</dt>
                      <dd className="text-slate-700">
                        {[request.deliveryDate, request.deliveryTimeSlot].filter(Boolean).join(' · ')}
                      </dd>
                    </div>
                  )}
                  {request.deliveryNote ? (
                    <div>
                      <dt className="text-xs text-slate-400">Ghi chú giao hàng</dt>
                      <dd className="text-slate-600">{request.deliveryNote}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>

              <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-4">
                <h4 className="text-sm font-semibold text-slate-900">Khách đặt & nội dung thiệp</h4>
                <dl className="mt-3 space-y-2 text-sm">
                  <div>
                    <dt className="text-xs text-slate-400">SĐT khách</dt>
                    <dd className="font-medium text-slate-800">{request.customerPhone}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400">Người gửi thiệp</dt>
                    <dd className="text-slate-700">{request.senderName || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400">Người nhận thiệp</dt>
                    <dd className="text-slate-700">{request.recipientName}</dd>
                  </div>
                </dl>
                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-rose-400">Lời chúc</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">{request.message}</p>
                {request.note ? (
                  <p className="mt-2 text-xs text-slate-500">Ghi chú shop: {request.note}</p>
                ) : null}
              </div>

              <RequestShippingPanel request={request} onUpdated={onUpdated} />
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default CustomerRequestCardMobile
