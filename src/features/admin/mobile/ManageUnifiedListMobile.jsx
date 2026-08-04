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
  onEdit,
  onDelete,
  onShippingStatusChange,
  busy = false,
  updatingId = null,
}) {
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
        const workStatus = item.status
          ? ORDER_STATUS_LABELS[item.status] ?? ORDER_STATUS_LABELS.pending
          : null
        const shipKey = item.shippingStatus || 'pending'
        const shipMeta = SHIPPING_STATUS_META[shipKey] ?? SHIPPING_STATUS_META.pending
        const checked = selectedIds.includes(item.id)
        const isRowUpdating = updatingId === item.id

        return (
          <div
            key={`${item.kind}-${item.id}`}
            className="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={checked}
                disabled={busy}
                onChange={() => onToggleSelect?.(item.id)}
                className="mt-1 h-4 w-4 rounded border-outline-variant"
                aria-label={`Chọn đơn ${item.code}`}
              />
              <button
                type="button"
                onClick={() => onSelect(item)}
                className="min-w-0 flex-1 text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] font-bold text-outline">{item.code}</p>
                    <p className="mt-0.5 truncate text-base font-semibold text-on-surface">
                      {item.primaryName}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Cần {formatShipDate(item.neededDate)}
                      {item.shipTime ? ` · ${item.shipTime}` : ''}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-primary">{formatMoney(item.subtotal)}</p>
                    <p className="text-[11px] text-emerald-800">
                      Thu {formatMoney(item.appReceive)}
                    </p>
                  </div>
                </div>

                <p className="mt-2 line-clamp-2 text-sm text-on-surface-variant">
                  {item.productsLine}
                </p>

                <div className="mt-2 grid grid-cols-3 gap-2 rounded-xl bg-surface-container-low/50 px-2.5 py-2 text-[11px] text-on-surface-variant">
                  <div>
                    <p className="text-outline">Cọc</p>
                    <p className="font-medium text-on-surface">{formatMoney(item.deposit)}</p>
                  </div>
                  <div>
                    <p className="text-outline">Ship</p>
                    <p className="font-medium text-on-surface">{formatMoney(item.shippingFee)}</p>
                  </div>
                  <div>
                    <p className="text-outline">COD</p>
                    <p className="font-medium text-on-surface">{formatMoney(item.codAmount)}</p>
                  </div>
                </div>

                {workStatus || item.trackingCode || item.monthEndChecked ? (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {workStatus ? (
                      <span className="text-[11px] text-outline">{workStatus.label}</span>
                    ) : null}
                    {item.trackingCode ? (
                      <span className="font-mono text-[11px] text-outline">{item.trackingCode}</span>
                    ) : null}
                    {item.monthEndChecked ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-100">
                        Đã check
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/15 pt-3">
              <select
                value={shipKey}
                disabled={busy || isRowUpdating}
                onChange={(event) => onShippingStatusChange?.(item.id, event.target.value)}
                className={`min-w-[9rem] flex-1 rounded-xl border border-outline-variant/30 px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 ${shipMeta.className}`}
              >
                {SHIPPING_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onEdit?.(item)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-outline-variant/30 text-primary disabled:opacity-50"
                  aria-label="Sửa"
                  title="Sửa"
                >
                  <MaterialIcon name="edit" className="text-base" />
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onDelete?.(item)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200/80 bg-red-50/50 text-red-600 disabled:opacity-50"
                  aria-label="Xóa"
                  title="Xóa"
                >
                  <MaterialIcon name="delete" className="text-base" />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ManageUnifiedListMobile
