import MaterialIcon from '../../../components/common/MaterialIcon'
import { ORDER_STATUS_LABELS } from '../../../constants/orderStatus'
import { SHIPPING_STATUS_LABELS } from '../../../constants/customRequestDefaults'
import { formatTimeAgo } from '../../../utils/formatTimeAgo'
import { TypeBadge } from '../components/ManageUnifiedTable'

function ManageUnifiedListMobile({ items, onSelect }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-rose-200 bg-white px-4 py-12 text-center">
        <MaterialIcon name="inbox" className="text-4xl text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-700">Chưa có dữ liệu</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const status = item.status
          ? ORDER_STATUS_LABELS[item.status] ?? ORDER_STATUS_LABELS.pending
          : null

        return (
          <button
            key={`${item.kind}-${item.id}`}
            type="button"
            onClick={() => onSelect(item)}
            className="w-full rounded-2xl border border-rose-100 bg-white p-4 text-left shadow-sm shadow-rose-50 transition active:bg-rose-50/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[11px] font-bold tracking-wide text-slate-500">
                  {item.code}
                </p>
                <p className="mt-1 truncate text-base font-semibold text-slate-900">
                  {item.primaryName}
                </p>
              </div>
              {status ? (
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${status.className}`}
                >
                  {status.label}
                </span>
              ) : null}
            </div>

            <p className="mt-2 text-sm text-slate-600">{item.deliveryLine}</p>
            {item.addressLine ? (
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.addressLine}</p>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <TypeBadge
                typeKind={item.typeKind}
                typeLabel={item.typeLabel}
                typeIcon={item.typeIcon}
              />
              <span className="text-xs text-slate-400">{formatTimeAgo(item.createdAt)}</span>
              {item.shippingStatus && item.shippingStatus !== 'pending' ? (
                <span className="text-xs text-sky-600">
                  {SHIPPING_STATUS_LABELS[item.shippingStatus]}
                </span>
              ) : null}
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default ManageUnifiedListMobile
