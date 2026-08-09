import MaterialIcon from '../../../components/common/MaterialIcon'
import {
  SHIPPING_STATUS_META,
  SHIPPING_STATUS_OPTIONS,
} from '../../../constants/customRequestDefaults'
import { ORDER_STATUS_LABELS } from '../../../constants/orderStatus'
import { formatMoney } from '../../../utils/money'
import { formatShipDate } from '../components/ManageUnifiedTable'

function ManageUnifiedListMobile({
  items,
  selectedIds = [],
  onToggleSelect,
  onSelect,
  onDelete,
  onShippingStatusChange,
  busy = false,
  updatingId = null,
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-outline-variant/40 px-3 py-8 text-center text-xs text-on-surface-variant">
        Chưa có đơn
      </div>
    )
  }

  return (
    <div className="divide-y divide-outline-variant/20 overflow-hidden rounded-xl border border-outline-variant/25 bg-surface-container-lowest">
      {items.map((item) => {
        const workStatus = item.status
          ? ORDER_STATUS_LABELS[item.status] ?? ORDER_STATUS_LABELS.pending
          : null
        const shipKey = item.shippingStatus || 'pending'
        const shipMeta = SHIPPING_STATUS_META[shipKey] ?? SHIPPING_STATUS_META.pending
        const checked = selectedIds.includes(item.id)
        const isRowUpdating = updatingId === item.id

        return (
          <div key={`${item.kind}-${item.id}`} className="px-2.5 py-2">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={checked}
                disabled={busy}
                onChange={() => onToggleSelect?.(item.id)}
                className="mt-1 h-3.5 w-3.5 rounded border-outline-variant"
                aria-label={`Chọn ${item.code}`}
              />
              <button
                type="button"
                onClick={() => onSelect(item)}
                className="min-w-0 flex-1 text-left"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="min-w-0 truncate text-sm font-semibold text-on-surface">
                    {item.primaryName}
                  </p>
                  <p className="shrink-0 text-sm font-semibold text-primary">
                    {formatMoney(item.subtotal)}
                  </p>
                </div>
                <p className="mt-0.5 truncate text-[11px] text-on-surface-variant">
                  <span className="font-mono">{item.code}</span>
                  {' · '}
                  {formatShipDate(item.neededDate)}
                  {workStatus ? ` · ${workStatus.label}` : ''}
                </p>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-outline">{item.productsLine}</p>
                <p className="mt-0.5 text-[10px] text-on-surface-variant">
                  Cọc {formatMoney(item.deposit)} · Ship {formatMoney(item.shippingFee)} · COD{' '}
                  {formatMoney(item.codAmount)}
                </p>
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => onDelete?.(item)}
                className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50"
                aria-label="Xóa"
              >
                <MaterialIcon name="delete" className="text-base" />
              </button>
            </div>
            <div className="mt-1.5 pl-5">
              <select
                value={shipKey}
                disabled={busy || isRowUpdating}
                onChange={(event) => onShippingStatusChange?.(item.id, event.target.value)}
                className={`w-full rounded-md border border-outline-variant/30 px-2 py-1 text-[11px] font-medium outline-none focus:ring-1 focus:ring-primary/20 disabled:opacity-60 ${shipMeta.className}`}
              >
                {SHIPPING_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ManageUnifiedListMobile
