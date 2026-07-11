import { ORDER_STATUS_LABELS } from '../../../constants/orderStatus'
import { SHIPPING_STATUS_LABELS } from '../../../constants/customRequestDefaults'
import { getTopicById } from '../../../constants/topics'
import { formatTimeAgo } from '../../../utils/formatTimeAgo'
import { getInvoiceCode } from '../../../utils/invoiceCode'
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

function ManageOrdersTable({ orders, onSelect }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-rose-200 bg-white px-6 py-16 text-center">
        <MaterialIcon name="inbox" className="mx-auto text-4xl text-rose-300" />
        <p className="mt-3 text-sm font-medium text-slate-700">Chưa có đơn hàng nào</p>
        <p className="mt-1 text-sm text-slate-500">Thử đổi bộ lọc hoặc lên đơn mới.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-sm shadow-rose-50">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-rose-100 bg-rose-50/60 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Mã đơn</th>
              <th className="px-4 py-3">Khách</th>
              <th className="px-4 py-3">Giao cho</th>
              <th className="px-4 py-3">Loại</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Ngày tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rose-50">
            {orders.map((order) => {
              const topic = getTopicById(order.topicId)
              const status = ORDER_STATUS_LABELS[order.status] ?? ORDER_STATUS_LABELS.pending
              const hasCard = Boolean(order.cardId)

              return (
                <tr
                  key={order.id}
                  className="cursor-pointer transition hover:bg-rose-50/50"
                  onClick={() => onSelect(order)}
                >
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-bold text-slate-800">
                    {getInvoiceCode(order)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{order.customerName}</p>
                    <p className="text-xs text-slate-500">{order.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-800">
                      {order.deliveryRecipientName || order.recipientName}
                    </p>
                    <p className="max-w-[14rem] truncate text-xs text-slate-500">
                      {order.deliveryAddress || '—'}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {hasCard ? <TopicLabel topic={topic} topicId={order.topicId} /> : 'Không QR'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${status.className}`}
                      >
                        {status.label}
                      </span>
                      {order.shippingStatus && order.shippingStatus !== 'pending' ? (
                        <span className="text-[11px] text-sky-600">
                          {SHIPPING_STATUS_LABELS[order.shippingStatus]}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                    <span title={formatDate(order.createdAt)}>{formatTimeAgo(order.createdAt)}</span>
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

export default ManageOrdersTable
