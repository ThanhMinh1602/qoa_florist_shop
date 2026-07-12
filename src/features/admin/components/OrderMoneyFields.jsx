import { formatMoney } from '../../../utils/money'
import { PAYMENT_STATUS_LABELS } from '../constants/adminNavItems'

function OrderMoneyFields({ values, onChange, subtotal }) {
  const remaining = Math.max(
    0,
    (Number(subtotal) || 0) - (Number(values.paidAmount) || 0),
  )

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block text-sm sm:col-span-2">
        <span className="mb-1 block font-medium text-slate-700">
          Thu vào (subtotal) — {formatMoney(subtotal)}
        </span>
        <input
          type="number"
          min="0"
          value={values.subtotalOverride ?? ''}
          placeholder={String(subtotal || 0)}
          onChange={(e) => onChange('subtotalOverride', e.target.value)}
          className="w-full rounded-xl border border-rose-100 px-3 py-2.5 outline-none focus:ring-2 focus:ring-rose-100"
        />
        <span className="mt-1 block text-xs text-slate-400">Để trống = tự tính từ dòng hàng.</span>
      </label>

      {[
        ['deposit', 'Cọc'],
        ['shippingFee', 'Tiền ship'],
        ['codAmount', 'Ship thu hộ (COD)'],
        ['paidAmount', 'Đã thu'],
      ].map(([field, label]) => (
        <label key={field} className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">{label}</span>
          <input
            type="number"
            min="0"
            value={values[field]}
            onChange={(e) => onChange(field, e.target.value)}
            className="w-full rounded-xl border border-rose-100 px-3 py-2.5 outline-none focus:ring-2 focus:ring-rose-100"
          />
        </label>
      ))}

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Trạng thái TT</span>
        <select
          value={values.paymentStatus}
          onChange={(e) => onChange('paymentStatus', e.target.value)}
          className="w-full rounded-xl border border-rose-100 px-3 py-2.5 outline-none focus:ring-2 focus:ring-rose-100"
        >
          {Object.entries(PAYMENT_STATUS_LABELS).map(([value, meta]) => (
            <option key={value} value={value}>
              {meta.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Ghi chú thanh toán</span>
        <input
          value={values.paymentNote}
          onChange={(e) => onChange('paymentNote', e.target.value)}
          placeholder="Đã ck / Cọc 30k..."
          className="w-full rounded-xl border border-rose-100 px-3 py-2.5 outline-none focus:ring-2 focus:ring-rose-100"
        />
      </label>

      <label className="block text-sm sm:col-span-2">
        <span className="mb-1 block font-medium text-slate-700">Ngày ship</span>
        <input
          type="date"
          value={values.shipDate}
          onChange={(e) => onChange('shipDate', e.target.value)}
          className="w-full rounded-xl border border-rose-100 px-3 py-2.5 outline-none focus:ring-2 focus:ring-rose-100"
        />
      </label>

      <p className="sm:col-span-2 text-sm text-slate-500">
        Còn lại ước tính: <span className="font-semibold text-slate-800">{formatMoney(remaining)}</span>
      </p>
    </div>
  )
}

export default OrderMoneyFields
