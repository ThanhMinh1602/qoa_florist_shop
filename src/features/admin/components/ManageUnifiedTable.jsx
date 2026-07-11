import MaterialIcon from '../../../components/common/MaterialIcon'
import { ORDER_STATUS_LABELS } from '../../../constants/orderStatus'
import { SHIPPING_STATUS_LABELS } from '../../../constants/customRequestDefaults'
import { formatTimeAgo } from '../../../utils/formatTimeAgo'

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

function TypeBadge({ typeKind, typeLabel, typeIcon }) {
  const className =
    typeKind === 'with_qr'
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
      : 'bg-slate-100 text-slate-600 ring-slate-200'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${className}`}
    >
      {typeIcon ? <MaterialIcon name={typeIcon} className="text-[0.95rem]" /> : null}
      {typeLabel}
    </span>
  )
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-rose-200 bg-white px-6 py-16 text-center">
      <MaterialIcon name="inbox" className="text-4xl text-slate-300" />
      <p className="mt-3 text-sm font-medium text-slate-700">Chưa có dữ liệu</p>
      <p className="mt-1 text-sm text-slate-500">Thử đổi bộ lọc hoặc lên đơn mới.</p>
    </div>
  )
}

function ManageUnifiedTable({ items, onSelect }) {
  if (items.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-sm shadow-rose-50">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-rose-100 bg-rose-50/60 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Mã</th>
              <th className="px-4 py-3">Khách / Người nhận</th>
              <th className="px-4 py-3">Chi tiết</th>
              <th className="px-4 py-3">Loại</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Ngày tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rose-50">
            {items.map((item) => {
              const status = item.status
                ? ORDER_STATUS_LABELS[item.status] ?? ORDER_STATUS_LABELS.pending
                : null

              return (
                <tr
                  key={`${item.kind}-${item.id}`}
                  className="cursor-pointer transition hover:bg-rose-50/50"
                  onClick={() => onSelect(item)}
                >
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-bold text-slate-800">
                    {item.code}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{item.primaryName}</p>
                    {item.secondaryPhone ? (
                      <p className="text-xs text-slate-500">{item.secondaryPhone}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-800">{item.deliveryLine}</p>
                    {item.addressLine ? (
                      <p className="max-w-[14rem] truncate text-xs text-slate-500">
                        {item.addressLine}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <TypeBadge
                      typeKind={item.typeKind}
                      typeLabel={item.typeLabel}
                      typeIcon={item.typeIcon}
                    />
                  </td>
                  <td className="px-4 py-3">
                    {status ? (
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${status.className}`}
                        >
                          {status.label}
                        </span>
                        {item.shippingStatus && item.shippingStatus !== 'pending' ? (
                          <span className="text-[11px] text-sky-600">
                            {SHIPPING_STATUS_LABELS[item.shippingStatus]}
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                    <span title={formatDate(item.createdAt)}>{formatTimeAgo(item.createdAt)}</span>
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

export default ManageUnifiedTable
export { TypeBadge }
