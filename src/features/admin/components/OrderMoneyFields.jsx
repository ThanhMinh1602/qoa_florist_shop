import { formatMoney } from '../../../utils/money'
import { calcOrderMoney } from '../../../utils/orderMoney'

const inputClass =
  'w-full rounded-md border border-outline-variant/25 px-2 py-1.5 text-sm outline-none placeholder:text-outline/55 focus:ring-2 focus:ring-primary/20'

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
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg bg-surface-container-low/70 px-2.5 py-1.5 text-xs">
        <span className="text-on-surface-variant">
          SP <strong className="text-on-surface">{formatMoney(money.productsTotal)}</strong>
        </span>
        <span className="text-on-surface-variant">
          Tổng{' '}
          <strong className="text-primary">{formatMoney(money.orderTotal)}</strong>
        </span>
        <span className="text-on-surface-variant">
          Thu app{' '}
          <strong className="text-emerald-800">{formatMoney(money.appReceive)}</strong>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-0.5 block text-[11px] text-on-surface-variant">Thêm y/c</span>
          <input
            type="number"
            min="0"
            value={values.addOnAmount}
            onChange={(e) => onChange('addOnAmount', e.target.value)}
            placeholder="0"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-0.5 block text-[11px] text-on-surface-variant">Cọc / CK</span>
          <input
            type="number"
            min="0"
            value={values.deposit}
            onChange={(e) => onChange('deposit', e.target.value)}
            placeholder="0"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-0.5 block text-[11px] text-on-surface-variant">Ship báo KH</span>
          <input
            type="number"
            min="0"
            value={values.shippingFee}
            onChange={(e) => onChange('shippingFee', e.target.value)}
            placeholder="0"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-0.5 block text-[11px] text-on-surface-variant">Ship thực</span>
          <input
            type="number"
            min="0"
            value={values.actualShippingFee}
            onChange={(e) => onChange('actualShippingFee', e.target.value)}
            placeholder="0"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-0.5 block text-[11px] text-on-surface-variant">Phát sinh</span>
          <input
            type="number"
            min="0"
            value={values.incidentalAmount}
            onChange={(e) => onChange('incidentalAmount', e.target.value)}
            placeholder="0"
            className={inputClass}
          />
        </label>
        <div className="grid grid-cols-2 gap-1 rounded-md bg-surface-container-low/50 px-2 py-1.5 text-[11px]">
          <div>
            <p className="text-on-surface-variant">Chênh ship</p>
            <p className="font-semibold text-on-surface">{formatMoney(money.shipDiff)}</p>
          </div>
          <div>
            <p className="text-on-surface-variant">Cọc net</p>
            <p className="font-semibold text-on-surface">{formatMoney(money.netDeposit)}</p>
          </div>
        </div>
      </div>

      <label className="block">
        <span className="mb-0.5 flex items-center justify-between text-[11px] text-on-surface-variant">
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
          placeholder="Tổng + ship − cọc"
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="mb-0.5 block text-[11px] text-on-surface-variant">Ghi chú TT</span>
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
