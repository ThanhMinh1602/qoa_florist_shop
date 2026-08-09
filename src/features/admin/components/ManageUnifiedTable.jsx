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

const th = 'whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide'
const td = 'px-3 py-3 align-top text-sm'

function ManageUnifiedTable({
  items,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  onSelect,
  onDelete,
  onShippingStatusChange,
  busy = false,
  updatingId = null,
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-outline-variant/40 px-6 py-14 text-center text-sm text-on-surface-variant">
        Chưa có đơn
      </div>
    )
  }

  const allSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.id))

  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant/25 bg-surface-container-lowest shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1080px] w-full text-left">
          <thead className="border-b border-outline-variant/25 bg-surface-container-low text-on-surface-variant">
            <tr>
              <th className={`${th} w-10`}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => onToggleSelectAll?.(event.target.checked)}
                  className="h-4 w-4 rounded border-outline-variant"
                  aria-label="Chọn tất cả"
                />
              </th>
              <th className={th}>Mã / Ngày</th>
              <th className={th}>Khách</th>
              <th className={th}>Sản phẩm</th>
              <th className={`${th} text-right`}>Tổng</th>
              <th className={`${th} text-right`}>Cọc</th>
              <th className={`${th} text-right`}>Ship</th>
              <th className={`${th} text-right`}>COD</th>
              <th className={`${th} text-right`}>Thu về</th>
              <th className={th}>VĐ</th>
              <th className={`${th} w-[6rem]`}>Giao hàng</th>
              <th className={`${th} w-10`} />
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
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
                  <td className={td} onClick={(event) => event.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleSelect?.(item.id)}
                      className="h-4 w-4 rounded border-outline-variant"
                      aria-label={`Chọn ${item.code}`}
                    />
                  </td>

                  <td className={`${td} whitespace-nowrap`}>
                    <p className="font-mono text-sm font-bold tracking-wide text-on-surface">
                      {item.code}
                    </p>
                    <p className="mt-1 text-xs text-on-surface-variant">
                      Đặt {formatShipDate(item.orderDate)}
                    </p>
                    <p className="text-sm font-medium text-primary">
                      Cần {formatShipDate(item.neededDate)}
                    </p>
                    {item.shipTime ? (
                      <p className="mt-0.5 max-w-[9rem] truncate text-xs text-outline">
                        {item.shipTime}
                      </p>
                    ) : null}
                    {workStatus ? (
                      <p className="mt-1 text-xs text-outline">{workStatus.label}</p>
                    ) : null}
                  </td>

                  <td className={`${td} min-w-[11rem] max-w-[15rem]`}>
                    <p className="text-base font-semibold text-on-surface">{item.primaryName}</p>
                    {item.secondaryPhone ? (
                      <p className="mt-0.5 text-sm text-on-surface-variant">{item.secondaryPhone}</p>
                    ) : null}
                    {item.addressLine ? (
                      <p className="mt-1 line-clamp-2 text-xs leading-4 text-outline">
                        {item.addressLine}
                      </p>
                    ) : null}
                  </td>

                  <td className={`${td} min-w-[12rem] max-w-[17rem]`}>
                    <p className="line-clamp-2 text-sm text-on-surface">{item.productsLine}</p>
                    {item.note ? (
                      <p className="mt-1 line-clamp-2 text-xs text-outline">{item.note}</p>
                    ) : null}
                  </td>

                  <td className={`${td} whitespace-nowrap text-right text-base font-semibold text-on-surface`}>
                    {formatMoney(item.subtotal)}
                  </td>
                  <td className={`${td} whitespace-nowrap text-right text-on-surface-variant`}>
                    {formatMoney(item.deposit)}
                  </td>
                  <td className={`${td} whitespace-nowrap text-right text-on-surface-variant`}>
                    <p>{formatMoney(item.shippingFee)}</p>
                    {Number(item.actualShippingFee) > 0 ? (
                      <p className="text-xs text-outline">
                        TT {formatMoney(item.actualShippingFee)}
                      </p>
                    ) : null}
                  </td>
                  <td className={`${td} whitespace-nowrap text-right text-on-surface-variant`}>
                    {formatMoney(item.codAmount)}
                  </td>
                  <td className={`${td} whitespace-nowrap text-right text-base font-semibold text-emerald-800`}>
                    {formatMoney(item.appReceive)}
                  </td>

                  <td className={`${td} max-w-[8rem]`}>
                    <p className="break-all font-mono text-xs text-on-surface-variant">
                      {item.trackingCode || '—'}
                    </p>
                  </td>

                  <td className={td} onClick={(event) => event.stopPropagation()}>
                    <select
                      value={shipKey}
                      disabled={busy || isRowUpdating}
                      onChange={(event) => onShippingStatusChange?.(item.id, event.target.value)}
                      className={`w-[5.75rem] rounded-md border-0 px-1 py-0.5 text-[10px] font-semibold leading-tight outline-none focus:ring-2 focus:ring-primary/25 disabled:opacity-60 ${shipMeta.className}`}
                    >
                      {SHIPPING_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {item.monthEndChecked ? (
                      <span className="mt-1 inline-flex rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-100">
                        Đã check
                      </span>
                    ) : null}
                  </td>

                  <td className={td} onClick={(event) => event.stopPropagation()}>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onDelete?.(item)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50"
                      title="Xóa"
                      aria-label="Xóa"
                    >
                      <MaterialIcon name="delete" className="text-xl" />
                    </button>
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
