import { SHIPPING_PROVIDERS } from '../../../constants/customRequestDefaults'
import { normalizeTrackingCode } from '../../../utils/trackingCode'

const fieldClassName =
  'w-full rounded-lg border border-outline-variant/25 px-2.5 py-1.5 text-sm text-on-surface outline-none transition placeholder:text-outline/55 focus:border-primary/40 focus:ring-2 focus:ring-primary/20'

function makeFieldChange(onChange) {
  return (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    onChange(field, value)
  }
}

export function OrderCustomerFields({ values, onChange }) {
  const handleChange = makeFieldChange(onChange)

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <label className="block">
        <span className="mb-0.5 block text-[11px] font-medium text-on-surface-variant">
          Tên KH <span className="text-primary">*</span>
        </span>
        <input
          type="text"
          value={values.customerName}
          onChange={handleChange('customerName')}
          className={fieldClassName}
          placeholder="vd: My, Thu Phương"
          required
        />
      </label>
      <label className="block">
        <span className="mb-0.5 block text-[11px] font-medium text-on-surface-variant">SĐT</span>
        <input
          type="tel"
          value={values.customerPhone}
          onChange={handleChange('customerPhone')}
          className={fieldClassName}
          placeholder="vd: 0907 155 210"
        />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-0.5 block text-[11px] font-medium text-on-surface-variant">Địa chỉ</span>
        <textarea
          value={values.deliveryAddress}
          onChange={handleChange('deliveryAddress')}
          rows={2}
          className={`${fieldClassName} resize-y leading-snug`}
          placeholder="vd: 14 Lê Hoàng Phái, P.17, Gò Vấp"
        />
      </label>
    </div>
  )
}

export function OrderScheduleFields({ values, onChange }) {
  const handleChange = makeFieldChange(onChange)

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <label className="block">
        <span className="mb-0.5 block text-[11px] font-medium text-on-surface-variant">Ngày đặt</span>
        <input
          type="date"
          value={values.orderDate || ''}
          onChange={handleChange('orderDate')}
          className={fieldClassName}
        />
      </label>
      <label className="block">
        <span className="mb-0.5 block text-[11px] font-medium text-on-surface-variant">Ngày cần</span>
        <input
          type="date"
          value={values.deliveryDate || ''}
          onChange={handleChange('deliveryDate')}
          className={fieldClassName}
        />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-0.5 block text-[11px] font-medium text-on-surface-variant">
          Thời gian ship
        </span>
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

export function OrderNoteFields({ values, onChange }) {
  const handleChange = makeFieldChange(onChange)

  return (
    <label className="block">
      <span className="mb-0.5 block text-[11px] font-medium text-on-surface-variant">Note</span>
      <textarea
        value={values.note}
        onChange={handleChange('note')}
        rows={2}
        className={`${fieldClassName} resize-y leading-snug`}
        placeholder="vd: Tag SN đỏ · Hpbd…"
      />
    </label>
  )
}

export function OrderTrackingFields({ values, onChange }) {
  const handleChange = makeFieldChange(onChange)

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <label className="block">
        <span className="mb-0.5 block text-[11px] font-medium text-on-surface-variant">
          Đơn vị vận chuyển
        </span>
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
        <span className="mb-0.5 block text-[11px] font-medium text-on-surface-variant">Mã vận đơn</span>
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
          placeholder="vd: GHN123…"
        />
      </label>
    </div>
  )
}

function AdminDeliveryForm({ values, onChange }) {
  return (
    <div className="space-y-3">
      <OrderCustomerFields values={values} onChange={onChange} />
      <OrderScheduleFields values={values} onChange={onChange} />
      <OrderNoteFields values={values} onChange={onChange} />
      <OrderTrackingFields values={values} onChange={onChange} />
    </div>
  )
}

export default AdminDeliveryForm
