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
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
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
                    className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50"
                    aria-label="Xóa"
                  >
                    <MaterialIcon name="delete" className="text-[1.05rem]" />
                  </button>
                </div>
                <div className="mt-1.5 flex justify-end">
                  <select
                    value={shipKey}
                    disabled={busy || isRowUpdating}
                    onChange={(event) => onShippingStatusChange?.(item.id, event.target.value)}
                    aria-label="Trạng thái giao hàng"
                    className={`max-w-[5.75rem] rounded border-0 px-1.5 py-0.5 text-[10px] font-medium leading-tight outline-none focus:ring-1 focus:ring-primary/20 disabled:opacity-60 ${shipMeta.className}`}
                  >
                    {SHIPPING_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ManageUnifiedListMobile

export function ManageUnifiedListMobileSkeleton({ rows = 8 }) {
  return (
    <div className="divide-y divide-outline-variant/20 overflow-hidden rounded-xl border border-outline-variant/25 bg-surface-container-lowest">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="px-2.5 py-2.5">
          <div className="flex items-start gap-2">
            <div className="img-shimmer mt-1 h-3.5 w-3.5 shrink-0 rounded" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="img-shimmer h-4 w-32 max-w-[55%] rounded" />
                    <div className="img-shimmer h-4 w-16 shrink-0 rounded" />
                  </div>
                  <div className="img-shimmer h-3 w-44 max-w-[75%] rounded" />
                  <div className="img-shimmer h-3 w-52 max-w-[85%] rounded" />
                  <div className="img-shimmer h-3 w-40 max-w-[70%] rounded" />
                </div>
                <div className="img-shimmer h-6 w-6 shrink-0 rounded-md" />
              </div>
              <div className="flex justify-end">
                <div className="img-shimmer h-5 w-[4.5rem] rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
