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

function ManageUnifiedTable({ items, onSelect }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-rose-200 bg-white px-6 py-16 text-center">
        <MaterialIcon name="inbox" className="text-4xl text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-700">Chưa có dữ liệu</p>
        <p className="mt-1 text-sm text-slate-500">Thử đổi bộ lọc hoặc lên đơn mới.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-sm shadow-rose-50">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-rose-100 bg-rose-50/60 text-xs font-semibold uppercase tracking-wide text-slate-500">
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
          <tbody className="divide-y divide-rose-50">
            {items.map((item) => {
              const status = item.status
                ? ORDER_STATUS_LABELS[item.status] ?? ORDER_STATUS_LABELS.pending
                : null
              const payment =
                PAYMENT_STATUS_LABELS[item.paymentStatus] ?? PAYMENT_STATUS_LABELS.unpaid

              return (
                <tr
                  key={`${item.kind}-${item.id}`}
                  className="cursor-pointer transition hover:bg-rose-50/50"
                  onClick={() => onSelect(item)}
                >
                  <td className="whitespace-nowrap px-3 py-3 text-slate-600">
                    <p className="font-medium">{formatShipDate(item.shipDate)}</p>
                    <p className="font-mono text-[10px] text-slate-400">{item.code}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-slate-800">{item.primaryName}</p>
                    <p className="text-xs text-slate-500">{item.secondaryPhone}</p>
                    <p className="mt-0.5 max-w-[12rem] truncate text-xs text-slate-400">
                      {item.addressLine}
                    </p>
                  </td>
                  <td className="max-w-[14rem] px-3 py-3 text-slate-700">
                    <p className="line-clamp-2">{item.productsLine}</p>
                    {item.raw?.note ? (
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">{item.raw.note}</p>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-semibold text-slate-900">
                    {formatMoney(item.subtotal)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-600">
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
                  <td className="px-3 py-3 font-mono text-[11px] text-slate-500">
                    {item.trackingCode || '—'}
                    <p className="mt-1 font-sans text-[10px] text-slate-400">
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
