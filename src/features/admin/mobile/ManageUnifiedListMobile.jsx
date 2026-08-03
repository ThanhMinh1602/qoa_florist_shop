import MaterialIcon from '../../../components/common/MaterialIcon'
import { ORDER_STATUS_LABELS } from '../../../constants/orderStatus'
import { PAYMENT_STATUS_LABELS } from '../constants/adminNavItems'
import { formatMoney } from '../../../utils/money'
import { formatTimeAgo } from '../../../utils/formatTimeAgo'
import { TypeBadge, formatShipDate } from '../components/ManageUnifiedTable'

function ManageUnifiedListMobile({ items, onSelect }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-lowest px-4 py-12 text-center">
        <MaterialIcon name="inbox" className="text-4xl text-outline" />
        <p className="mt-3 text-sm font-medium text-on-surface">Chưa có dữ liệu</p>
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
            className="w-full rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4 text-left shadow-sm shadow-[0_12px_40px_rgba(74,48,32,0.05)] transition active:bg-surface-container-low/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-on-surface-variant">Ship {formatShipDate(item.shipDate)}</p>
                <p className="mt-1 truncate text-base font-semibold text-on-surface">
                  {item.primaryName}
                </p>
                <p className="font-mono text-[11px] text-outline">{item.code}</p>
              </div>
              <p className="shrink-0 font-semibold text-primary">{formatMoney(item.subtotal)}</p>
            </div>

            <p className="mt-2 line-clamp-2 text-sm text-on-surface-variant">{item.productsLine}</p>
            <p className="mt-1 line-clamp-1 text-xs text-on-surface-variant">{item.addressLine}</p>

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
              <span className="text-xs text-outline">{formatTimeAgo(item.createdAt)}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default ManageUnifiedListMobile
