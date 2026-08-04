import MaterialIcon from '../../../components/common/MaterialIcon'
import {
  SHIPPING_STATUS_META,
  SHIPPING_STATUS_OPTIONS,
} from '../../../constants/customRequestDefaults'
import { ORDER_STATUS_LABELS } from '../../../constants/orderStatus'
import { formatMoney, toDateInputValue } from '../../../utils/money'

function formatShipDate(value) {
  if (!value) return '—'
  if (/^\d{4}-\d{2}-\d{2}/.test(value) || value.includes('T')) {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date)
    }
  }
  return String(value)
}

const actionBtnClass =
  'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant transition hover:bg-surface-container-low disabled:opacity-50'

const thClass = 'whitespace-nowrap px-3 py-2.5 font-semibold'
const tdClass = 'px-3 py-3 align-top'

function ManageUnifiedTable({
  items,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  onSelect,
  onEdit,
  onDelete,
  onShippingStatusChange,
  busy = false,
  updatingId = null,
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-lowest px-6 py-16 text-center">
        <MaterialIcon name="inbox" className="text-4xl text-outline" />
        <p className="mt-3 text-sm font-medium text-on-surface">Chưa có dữ liệu</p>
        <p className="mt-1 text-sm text-on-surface-variant">Thử đổi bộ lọc hoặc lên đơn mới.</p>
      </div>
    )
  }

  const allSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.id))

  return (
    <div className="overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface-container-lowest shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1100px] w-full text-left text-sm">
          <thead className="border-b border-outline-variant/25 bg-surface-container-low text-[11px] uppercase tracking-wide text-on-surface-variant">
            <tr>
              <th className={`${thClass} w-10`}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => onToggleSelectAll?.(event.target.checked)}
                  className="h-4 w-4 rounded border-outline-variant"
                  aria-label="Chọn tất cả"
                />
              </th>
              <th className={thClass}>Mã / Ngày</th>
              <th className={thClass}>Khách</th>
              <th className={thClass}>Sản phẩm</th>
              <th className={`${thClass} text-right`}>Tổng đơn</th>
              <th className={`${thClass} text-right`}>Cọc</th>
              <th className={`${thClass} text-right`}>Ship</th>
              <th className={`${thClass} text-right`}>COD</th>
              <th className={`${thClass} text-right`}>Thu về</th>
              <th className={thClass}>Giao hàng</th>
              <th className={thClass}>VĐ</th>
              <th className={`${thClass} text-right`}> </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {items.map((item) => {
              const workStatus = item.status
                ? ORDER_STATUS_LABELS[item.status] ?? ORDER_STATUS_LABELS.pending
                : null
              const shipKey = item.shippingStatus || 'pending'
              const shipMeta = SHIPPING_STATUS_META[shipKey] ?? SHIPPING_STATUS_META.pending
              const checked = selectedIds.includes(item.id)
              const isRowUpdating = updatingId === item.id

              return (
                <tr
                  key={`${item.kind}-${item.id}`}
                  className="cursor-pointer transition hover:bg-surface-container-low/70"
                  onClick={() => onSelect(item)}
                >
                  <td className={tdClass} onClick={(event) => event.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleSelect?.(item.id)}
                      className="h-4 w-4 rounded border-outline-variant"
                      aria-label={`Chọn đơn ${item.code}`}
                    />
                  </td>

                  <td className={`${tdClass} whitespace-nowrap`}>
                    <p className="font-mono text-xs font-bold tracking-wide text-on-surface">
                      {item.code}
                    </p>
                    <p className="mt-1 text-xs text-on-surface-variant">
                      Đặt {formatShipDate(item.orderDate)}
                    </p>
                    <p className="text-xs font-medium text-primary">
                      Cần {formatShipDate(item.neededDate)}
                    </p>
                    {item.shipTime ? (
                      <p className="mt-0.5 max-w-[8rem] truncate text-[11px] text-outline">
                        {item.shipTime}
                      </p>
                    ) : null}
                  </td>

                  <td className={`${tdClass} min-w-[10rem] max-w-[14rem]`}>
                    <p className="font-medium text-on-surface">{item.primaryName}</p>
                    {item.secondaryPhone ? (
                      <p className="text-xs text-on-surface-variant">{item.secondaryPhone}</p>
                    ) : null}
                    {item.addressLine ? (
                      <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-outline">
                        {item.addressLine}
                      </p>
                    ) : null}
                  </td>

                  <td className={`${tdClass} min-w-[11rem] max-w-[16rem]`}>
                    <p className="line-clamp-2 text-on-surface">{item.productsLine}</p>
                    {item.note ? (
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-outline">{item.note}</p>
                    ) : null}
                  </td>

                  <td className={`${tdClass} whitespace-nowrap text-right font-semibold text-on-surface`}>
                    {formatMoney(item.subtotal)}
                  </td>
                  <td className={`${tdClass} whitespace-nowrap text-right text-on-surface-variant`}>
                    {formatMoney(item.deposit)}
                  </td>
                  <td className={`${tdClass} whitespace-nowrap text-right text-on-surface-variant`}>
                    <p>{formatMoney(item.shippingFee)}</p>
                    {item.actualShippingFee ? (
                      <p className="text-[11px] text-outline">
                        TT {formatMoney(item.actualShippingFee)}
                      </p>
                    ) : null}
                  </td>
                  <td className={`${tdClass} whitespace-nowrap text-right text-on-surface-variant`}>
                    {formatMoney(item.codAmount)}
                  </td>
                  <td className={`${tdClass} whitespace-nowrap text-right font-semibold text-emerald-800`}>
                    {formatMoney(item.appReceive)}
                  </td>

                  <td className={tdClass} onClick={(event) => event.stopPropagation()}>
                    <select
                      value={shipKey}
                      disabled={busy || isRowUpdating}
                      onChange={(event) => onShippingStatusChange?.(item.id, event.target.value)}
                      className={`w-full min-w-[8.5rem] rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-2 py-1.5 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 ${shipMeta.className}`}
                      title="Trạng thái giao hàng"
                    >
                      {SHIPPING_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {workStatus ? (
                      <p className="mt-1 text-[10px] text-outline">{workStatus.label}</p>
                    ) : null}
                  </td>

                  <td className={`${tdClass} max-w-[7rem]`}>
                    <p className="truncate font-mono text-[11px] text-on-surface-variant">
                      {item.trackingCode || '—'}
                    </p>
                    {item.monthEndChecked ? (
                      <span className="mt-1 inline-flex rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-100">
                        Check
                      </span>
                    ) : null}
                  </td>

                  <td className={tdClass} onClick={(event) => event.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onEdit?.(item)}
                        className={`${actionBtnClass} text-primary`}
                        title="Sửa"
                        aria-label="Sửa"
                      >
                        <MaterialIcon name="edit" className="text-base" />
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onDelete?.(item)}
                        className={`${actionBtnClass} text-red-600 hover:border-red-200 hover:bg-red-50/70`}
                        title="Xóa"
                        aria-label="Xóa"
                      >
                        <MaterialIcon name="delete" className="text-base" />
                      </button>
                    </div>
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
export { formatShipDate, toDateInputValue }
