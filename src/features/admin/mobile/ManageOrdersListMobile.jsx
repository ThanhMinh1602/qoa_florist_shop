import { ORDER_STATUS_LABELS } from '../../../constants/orderStatus'
import { SHIPPING_STATUS_LABELS } from '../../../constants/customRequestDefaults'
import { getTopicById } from '../../../constants/topics'
import { formatTimeAgo } from '../../../utils/formatTimeAgo'
import { getInvoiceCode } from '../../../utils/invoiceCode'
import MaterialIcon from '../../../components/common/MaterialIcon'
import TopicLabel from '../../../components/common/TopicLabel'

function ManageOrdersListMobile({ orders, onSelect }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-rose-200 bg-white px-4 py-12 text-center">
        <MaterialIcon name="inbox" className="mx-auto text-4xl text-rose-300" />
        <p className="mt-3 text-sm font-medium text-slate-700">Chưa có đơn hàng nào</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const topic = getTopicById(order.topicId)
        const status = ORDER_STATUS_LABELS[order.status] ?? ORDER_STATUS_LABELS.pending
        const hasCard = Boolean(order.cardId)

        return (
          <button
            key={order.id}
            type="button"
            onClick={() => onSelect(order)}
            className="w-full rounded-2xl border border-rose-100 bg-white p-4 text-left shadow-sm shadow-rose-50 transition active:bg-rose-50/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[11px] font-bold tracking-wide text-slate-500">
                  {getInvoiceCode(order)}
                </p>
                <p className="mt-1 truncate text-base font-semibold text-slate-900">
                  {order.customerName}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${status.className}`}
              >
                {status.label}
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-600">
              Giao cho:{' '}
              <span className="font-medium text-slate-800">
                {order.deliveryRecipientName || order.recipientName}
              </span>
            </p>
            <p className="mt-1 line-clamp-2 text-xs text-slate-500">
              {order.deliveryAddress || '—'}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{formatTimeAgo(order.createdAt)}</span>
              <span>·</span>
              {hasCard ? <TopicLabel topic={topic} topicId={order.topicId} /> : <span>Không QR</span>}
              {order.shippingStatus && order.shippingStatus !== 'pending' ? (
                <>
                  <span>·</span>
                  <span className="text-sky-600">
                    {SHIPPING_STATUS_LABELS[order.shippingStatus]}
                  </span>
                </>
              ) : null}
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default ManageOrdersListMobile
