import { ORDER_STATUS_LABELS, ORDER_STATUS_OPTIONS } from '../../../constants/orderStatus'
import { SHIPPING_STATUS_LABELS } from '../../../constants/customRequestDefaults'
import { getTopicById } from '../../../constants/topics'
import { formatTimeAgo } from '../../../utils/formatTimeAgo'
import { getInvoiceCode } from '../../../utils/invoiceCode'
import MaterialIcon from '../../../components/common/MaterialIcon'
import TopicLabel from '../../../components/common/TopicLabel'
import RequestExportButton from './RequestExportButton'
import RequestQrPanel from './RequestQrPanel'
import RequestShippingPanel from './RequestShippingPanel'

function OrderDetailModal({
  request,
  onClose,
  onStatusChange,
  onUpdated,
  isUpdating,
}) {
  const topic = getTopicById(request.topicId)
  const status = ORDER_STATUS_LABELS[request.status] ?? ORDER_STATUS_LABELS.pending
  const hasCard = Boolean(request.cardId)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Đóng"
      />

      <div className="relative z-10 flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-rose-50 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="font-mono text-xs font-bold tracking-wide text-slate-500">
              {getInvoiceCode(request)}
            </p>
            <h3 className="mt-1 truncate text-lg font-semibold text-slate-900">
              {request.customerName}
            </h3>
            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
              <span>{formatTimeAgo(request.createdAt)}</span>
              <span>·</span>
              {hasCard ? <TopicLabel topic={topic} topicId={request.topicId} /> : <span>Không QR</span>}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${status.className}`}>
                {status.label}
              </span>
              {request.shippingStatus ? (
                <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700 ring-1 ring-sky-100">
                  {SHIPPING_STATUS_LABELS[request.shippingStatus]}
                </span>
              ) : null}
              <span
                className={[
                  'rounded-full px-2.5 py-0.5 text-xs font-medium ring-1',
                  hasCard
                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                    : 'bg-slate-100 text-slate-600 ring-slate-200',
                ].join(' ')}
              >
                {hasCard ? 'Có thiệp QR' : 'Không có QR'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Đóng"
          >
            <MaterialIcon name="close" className="text-xl" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <RequestExportButton request={request} />
            <select
              value={request.status === 'reviewed' ? 'arranging' : request.status}
              disabled={isUpdating}
              onChange={(event) => onStatusChange(request.id, event.target.value)}
              className="rounded-xl border border-rose-100 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-rose-100"
            >
              {ORDER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {hasCard ? (
              <RequestQrPanel request={request} />
            ) : (
              <div className="rounded-2xl border border-dashed border-rose-200 px-4 py-8 text-center text-sm text-slate-500">
                Đơn không kèm thiệp QR
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
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
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
                  <dd className="text-slate-700">{request.recipientName || '—'}</dd>
                </div>
              </dl>
              {request.message ? (
                <>
                  <p className="mt-3 text-xs font-medium uppercase tracking-wide text-rose-400">
                    Lời chúc
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{request.message}</p>
                </>
              ) : null}
              {request.note ? (
                <p className="mt-2 text-xs text-slate-500">Ghi chú shop: {request.note}</p>
              ) : null}
            </div>

            <RequestShippingPanel request={request} onUpdated={onUpdated} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailModal
