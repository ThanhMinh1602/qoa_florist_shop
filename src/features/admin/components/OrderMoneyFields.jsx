import { formatMoney } from '../../../utils/money'
import { calcOrderMoney } from '../../../utils/orderMoney'

const inputClass =
  'w-full rounded-lg border border-outline-variant/25 px-2.5 py-2 text-sm outline-none placeholder:text-outline/55 focus:ring-2 focus:ring-primary/20'

function OrderMoneyFields({ values, onChange, productsTotal = 0 }) {
  const money = calcOrderMoney({
    productsTotal,
    addOnAmount: values.addOnAmount,
    deposit: values.deposit,
    shippingFee: values.shippingFee,
    actualShippingFee: values.actualShippingFee,
    incidentalAmount: values.incidentalAmount,
    codOverride: values.codManual ? values.codAmount : undefined,
  })

  return (
    <div className="grid gap-2.5">
      <div className="flex items-center justify-between rounded-lg bg-surface-container-low/70 px-3 py-2 text-sm">
        <span className="text-on-surface-variant">Tổng SP</span>
        <span className="font-semibold text-on-surface">{formatMoney(money.productsTotal)}</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <label className="block">
          <span className="mb-1 block text-xs text-on-surface-variant">Thêm theo y/c</span>
          <input
            type="number"
            min="0"
            value={values.addOnAmount}
            onChange={(e) => onChange('addOnAmount', e.target.value)}
            placeholder="vd: 20000"
            className={inputClass}
          />
        </label>
        <div className="block">
          <span className="mb-1 block text-xs text-on-surface-variant">Tổng đơn</span>
          <div className="flex h-[38px] items-center rounded-lg border border-primary/15 bg-primary-container/10 px-2.5">
            <span className="text-sm font-semibold text-primary">{formatMoney(money.orderTotal)}</span>
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs text-on-surface-variant">Cọc / CK</span>
          <input
            type="number"
            min="0"
            value={values.deposit}
            onChange={(e) => onChange('deposit', e.target.value)}
            placeholder="vd: 300000"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-on-surface-variant">Phát sinh / đền bù</span>
          <input
            type="number"
            min="0"
            value={values.incidentalAmount}
            onChange={(e) => onChange('incidentalAmount', e.target.value)}
            placeholder="vd: 0"
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs text-on-surface-variant">Ship báo khách</span>
          <input
            type="number"
            min="0"
            value={values.shippingFee}
            onChange={(e) => onChange('shippingFee', e.target.value)}
            placeholder="vd: 30000"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-on-surface-variant">Ship thực tế</span>
          <input
            type="number"
            min="0"
            value={values.actualShippingFee}
            onChange={(e) => onChange('actualShippingFee', e.target.value)}
            placeholder="vd: 25000"
            className={inputClass}
          />
        </label>

        <div className="rounded-lg bg-surface-container-low/60 px-2.5 py-2">
          <p className="text-[11px] text-on-surface-variant">Chênh ship</p>
          <p className="font-semibold text-on-surface">{formatMoney(money.shipDiff)}</p>
        </div>
        <div className="rounded-lg bg-surface-container-low/60 px-2.5 py-2">
          <p className="text-[11px] text-on-surface-variant">Cọc net</p>
          <p className="font-semibold text-on-surface">{formatMoney(money.netDeposit)}</p>
        </div>
      </div>

      <label className="block">
        <span className="mb-1 flex items-center justify-between text-xs text-on-surface-variant">
          <span>COD</span>
          <label className="inline-flex items-center gap-1 font-normal">
            <input
              type="checkbox"
              checked={Boolean(values.codManual)}
              onChange={(e) => {
                onChange('codManual', e.target.checked)
                if (!e.target.checked) onChange('codAmount', '')
              }}
            />
            Sửa tay
          </label>
        </span>
        <input
          type="number"
          min="0"
          value={values.codManual ? values.codAmount : money.autoCod}
          onChange={(e) => {
            if (!values.codManual) onChange('codManual', true)
            onChange('codAmount', e.target.value)
          }}
          placeholder="Tự tính: tổng đơn + ship − cọc"
          className={inputClass}
        />
      </label>

      <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-on-surface-variant">Thu về app</span>
          <span className="text-base font-semibold text-emerald-800">
            {formatMoney(money.appReceive)}
          </span>
        </div>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs text-on-surface-variant">Ghi chú TT</span>
        <input
          value={values.paymentNote}
          onChange={(e) => onChange('paymentNote', e.target.value)}
          placeholder="vd: Đã ck 300k MB"
          className={inputClass}
        />
      </label>
    </div>
  )
}

export default OrderMoneyFields
