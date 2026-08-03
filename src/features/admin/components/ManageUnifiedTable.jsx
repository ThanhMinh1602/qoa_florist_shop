import MaterialIcon from '../../../components/common/MaterialIcon'
import { ORDER_STATUS_LABELS } from '../../../constants/orderStatus'
import { PAYMENT_STATUS_LABELS } from '../constants/adminNavItems'
import { formatMoney, toDateInputValue } from '../../../utils/money'
import { formatTimeAgo } from '../../../utils/formatTimeAgo'

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

function TypeBadge({ typeKind, typeLabel, typeIcon }) {
  const className =
    typeKind === 'with_qr'
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
      : 'bg-surface-container text-on-surface-variant ring-slate-200'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${className}`}
    >
      {typeIcon ? <MaterialIcon name={typeIcon} className="text-[0.95rem]" /> : null}
      {typeLabel}
    </span>
  )
}

function ManageUnifiedTable({ items, onSelect }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-lowest px-6 py-16 text-center">
        <MaterialIcon name="inbox" className="text-4xl text-outline" />
        <p className="mt-3 text-sm font-medium text-on-surface">Chưa có dữ liệu</p>
        <p className="mt-1 text-sm text-on-surface-variant">Thử đổi bộ lọc hoặc lên đơn mới.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface-container-lowest shadow-sm shadow-[0_12px_40px_rgba(74,48,32,0.05)]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-outline-variant/25 bg-surface-container-low text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            <tr>
              <th className="px-3 py-3">Ship</th>
              <th className="px-3 py-3">Khách</th>
              <th className="px-3 py-3">Sản phẩm</th>
              <th className="px-3 py-3">Thu vào</th>
              <th className="px-3 py-3">Cọc / Ship / COD</th>
              <th className="px-3 py-3">TT / Trạng thái</th>
              <th className="px-3 py-3">VĐ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {items.map((item) => {
              const status = item.status
                ? ORDER_STATUS_LABELS[item.status] ?? ORDER_STATUS_LABELS.pending
                : null
              const payment =
                PAYMENT_STATUS_LABELS[item.paymentStatus] ?? PAYMENT_STATUS_LABELS.unpaid

              return (
                <tr
                  key={`${item.kind}-${item.id}`}
                  className="cursor-pointer transition hover:bg-surface-container-low/80"
                  onClick={() => onSelect(item)}
                >
                  <td className="whitespace-nowrap px-3 py-3 text-on-surface-variant">
                    <p className="font-medium">{formatShipDate(item.shipDate)}</p>
                    <p className="font-mono text-[10px] text-outline">{item.code}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-on-surface">{item.primaryName}</p>
                    <p className="text-xs text-on-surface-variant">{item.secondaryPhone}</p>
                    <p className="mt-0.5 max-w-[12rem] truncate text-xs text-outline">
                      {item.addressLine}
                    </p>
                  </td>
                  <td className="max-w-[14rem] px-3 py-3 text-on-surface">
                    <p className="line-clamp-2">{item.productsLine}</p>
                    {item.raw?.note ? (
                      <p className="mt-0.5 line-clamp-1 text-xs text-outline">{item.raw.note}</p>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-semibold text-on-surface">
                    {formatMoney(item.subtotal)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-on-surface-variant">
                    <p>Cọc {formatMoney(item.deposit)}</p>
                    <p>Ship {formatMoney(item.shippingFee)}</p>
                    <p>COD {formatMoney(item.codAmount)}</p>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex w-fit rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${payment.className}`}
                      >
                        {payment.label}
                      </span>
                      {status ? (
                        <span
                          className={`inline-flex w-fit rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${status.className}`}
                        >
                          {status.label}
                        </span>
                      ) : null}
                      <TypeBadge
                        typeKind={item.typeKind}
                        typeLabel={item.typeLabel}
                        typeIcon={item.typeIcon}
                      />
                    </div>
                  </td>
                  <td className="px-3 py-3 font-mono text-[11px] text-on-surface-variant">
                    {item.trackingCode || '—'}
                    <p className="mt-1 font-sans text-[10px] text-outline">
                      {formatTimeAgo(item.createdAt)}
                    </p>
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
export { TypeBadge, formatShipDate, toDateInputValue }
