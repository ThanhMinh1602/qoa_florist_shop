import { formatMoney } from '../../../utils/money'
import { calcOrderMoney } from '../../../utils/orderMoney'
import MoneyInput from './MoneyInput'

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
          <MoneyInput
            value={values.addOnAmount}
            onChange={(next) => onChange('addOnAmount', next)}
            placeholder="0"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-0.5 block text-[11px] text-on-surface-variant">Cọc / CK</span>
          <MoneyInput
            value={values.deposit}
            onChange={(next) => onChange('deposit', next)}
            placeholder="0"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-0.5 block text-[11px] text-on-surface-variant">Ship báo KH</span>
          <MoneyInput
            value={values.shippingFee}
            onChange={(next) => onChange('shippingFee', next)}
            placeholder="0"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-0.5 block text-[11px] text-on-surface-variant">Ship thực</span>
          <MoneyInput
            value={values.actualShippingFee}
            onChange={(next) => onChange('actualShippingFee', next)}
            placeholder="0"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-0.5 block text-[11px] text-on-surface-variant">Phát sinh</span>
          <MoneyInput
            value={values.incidentalAmount}
            onChange={(next) => onChange('incidentalAmount', next)}
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
        <MoneyInput
          value={values.codManual ? values.codAmount : money.autoCod}
          onChange={(next) => {
            if (!values.codManual) onChange('codManual', true)
            onChange('codAmount', next)
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
