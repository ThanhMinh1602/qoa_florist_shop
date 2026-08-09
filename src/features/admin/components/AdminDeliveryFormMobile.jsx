import { SHIPPING_PROVIDERS } from '../../../constants/customRequestDefaults'
import { normalizeTrackingCode } from '../../../utils/trackingCode'

const fieldClassName =
  'w-full rounded-lg border border-outline-variant/25 px-3 py-2.5 text-[15px] text-on-surface outline-none transition placeholder:text-outline/55 focus:border-primary/40 focus:ring-2 focus:ring-primary/20'

function makeFieldChange(onChange) {
  return (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    onChange(field, value)
  }
}

export function OrderCustomerFieldsMobile({ values, onChange }) {
  const handleChange = makeFieldChange(onChange)

  return (
    <div className="grid gap-2.5">
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-on-surface">
            Tên KH <span className="text-primary">*</span>
          </span>
          <input
            type="text"
            value={values.customerName}
            onChange={handleChange('customerName')}
            className={fieldClassName}
            placeholder="Tên KH"
            autoComplete="name"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-on-surface">SĐT</span>
          <input
            type="tel"
            value={values.customerPhone}
            onChange={handleChange('customerPhone')}
            className={fieldClassName}
            placeholder="SĐT"
            inputMode="tel"
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-on-surface">Địa chỉ</span>
        <textarea
          value={values.deliveryAddress}
          onChange={handleChange('deliveryAddress')}
          rows={2}
          className={`${fieldClassName} resize-y leading-snug`}
          placeholder="Địa chỉ giao"
        />
      </label>
    </div>
  )
}

export function OrderScheduleFieldsMobile({ values, onChange }) {
  const handleChange = makeFieldChange(onChange)

  return (
    <div className="grid gap-2.5">
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-on-surface">Ngày đặt</span>
          <input
            type="date"
            value={values.orderDate || ''}
            onChange={handleChange('orderDate')}
            className={fieldClassName}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-on-surface">Ngày cần</span>
          <input
            type="date"
            value={values.deliveryDate || ''}
            onChange={handleChange('deliveryDate')}
            className={fieldClassName}
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-on-surface">Thời gian ship</span>
        <input
          type="text"
          value={values.deliveryTimeSlot || ''}
          onChange={handleChange('deliveryTimeSlot')}
          className={fieldClassName}
          placeholder="vd: 8h–12h · Sáng"
        />
      </label>
    </div>
  )
}

export function OrderNoteFieldsMobile({ values, onChange }) {
  const handleChange = makeFieldChange(onChange)

  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-on-surface">Note</span>
      <textarea
        value={values.note}
        onChange={handleChange('note')}
        rows={2}
        className={`${fieldClassName} resize-y leading-snug`}
        placeholder="Tag SN · lời thiệp…"
      />
    </label>
  )
}

export function OrderTrackingFieldsMobile({ values, onChange }) {
  const handleChange = makeFieldChange(onChange)

  return (
    <div className="grid gap-2.5">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-on-surface">Đơn vị vận chuyển</span>
        <select
          value={values.shippingProvider || ''}
          onChange={handleChange('shippingProvider')}
          className={fieldClassName}
        >
          <option value="">Chưa chọn</option>
          {SHIPPING_PROVIDERS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-on-surface">Mã vận đơn</span>
        <input
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          value={values.shippingTrackingCode || ''}
          onChange={handleChange('shippingTrackingCode')}
          onBlur={(event) => {
            const next = normalizeTrackingCode(event.target.value)
            if (next !== (values.shippingTrackingCode || '')) {
              onChange('shippingTrackingCode', next)
            }
          }}
          className={`${fieldClassName} font-mono`}
          placeholder="GHN / GHTK…"
        />
      </label>
    </div>
  )
}

function AdminDeliveryFormMobile({ values, onChange }) {
  return (
    <div className="space-y-3">
      <section className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-3 shadow-sm">
        <h4 className="text-xs font-semibold text-on-surface">Khách hàng</h4>
        <div className="mt-2">
          <OrderCustomerFieldsMobile values={values} onChange={onChange} />
        </div>
      </section>
      <section className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-3 shadow-sm">
        <h4 className="text-xs font-semibold text-on-surface">Lịch giao</h4>
        <div className="mt-2">
          <OrderScheduleFieldsMobile values={values} onChange={onChange} />
        </div>
      </section>
      <section className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-3 shadow-sm">
        <h4 className="text-xs font-semibold text-on-surface">Note</h4>
        <div className="mt-2">
          <OrderNoteFieldsMobile values={values} onChange={onChange} />
        </div>
      </section>
      <section className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-3 shadow-sm">
        <h4 className="text-xs font-semibold text-on-surface">Vận đơn</h4>
        <div className="mt-2">
          <OrderTrackingFieldsMobile values={values} onChange={onChange} />
        </div>
      </section>
    </div>
  )
}

export default AdminDeliveryFormMobile
