import MaterialIcon from '../../../components/common/MaterialIcon'
import { ORDER_STATUS_LABELS } from '../../../constants/orderStatus'
import { PAYMENT_STATUS_LABELS } from '../constants/adminNavItems'
import { formatMoney } from '../../../utils/money'
import { formatTimeAgo } from '../../../utils/formatTimeAgo'
import { TypeBadge, formatShipDate } from '../components/ManageUnifiedTable'

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
        const payment = PAYMENT_STATUS_LABELS[item.paymentStatus] ?? PAYMENT_STATUS_LABELS.unpaid

        return (
          <button
            key={`${item.kind}-${item.id}`}
            type="button"
            onClick={() => onSelect(item)}
            className="w-full rounded-2xl border border-rose-100 bg-white p-4 text-left shadow-sm shadow-rose-50 transition active:bg-rose-50/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Ship {formatShipDate(item.shipDate)}</p>
                <p className="mt-1 truncate text-base font-semibold text-slate-900">
                  {item.primaryName}
                </p>
                <p className="font-mono text-[11px] text-slate-400">{item.code}</p>
              </div>
              <p className="shrink-0 font-semibold text-rose-700">{formatMoney(item.subtotal)}</p>
            </div>

            <p className="mt-2 line-clamp-2 text-sm text-slate-600">{item.productsLine}</p>
            <p className="mt-1 line-clamp-1 text-xs text-slate-500">{item.addressLine}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${payment.className}`}
              >
                {payment.label}
              </span>
              {status ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${status.className}`}
                >
                  {status.label}
                </span>
              ) : null}
              <TypeBadge
                typeKind={item.typeKind}
                typeLabel={item.typeLabel}
                typeIcon={item.typeIcon}
              />
              <span className="text-xs text-slate-400">{formatTimeAgo(item.createdAt)}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default ManageUnifiedListMobile
