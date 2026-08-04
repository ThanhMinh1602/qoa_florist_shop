const fieldClassName =
  'w-full rounded-lg border border-outline-variant/25 px-3 py-2 text-sm text-on-surface outline-none transition placeholder:text-outline/55 focus:border-primary/40 focus:ring-2 focus:ring-primary/20'

function makeFieldChange(onChange) {
  return (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    onChange(field, value)
  }
}

export function OrderCustomerFields({ values, onChange }) {
  const handleChange = makeFieldChange(onChange)

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-on-surface-variant">
          Tên KH <span className="text-primary">*</span>
        </span>
        <input
          type="text"
          value={values.customerName}
          onChange={handleChange('customerName')}
          className={fieldClassName}
          placeholder="vd: My, Thu Phương, Mẹ Ny"
          required
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-on-surface-variant">SĐT</span>
        <input
          type="tel"
          value={values.customerPhone}
          onChange={handleChange('customerPhone')}
          className={fieldClassName}
          placeholder="vd: 0907 155 210"
        />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-xs font-medium text-on-surface-variant">Địa chỉ</span>
        <textarea
          value={values.deliveryAddress}
          onChange={handleChange('deliveryAddress')}
          rows={3}
          className={`${fieldClassName} resize-y leading-5`}
          placeholder="vd: 14 Lê Hoàng Phái, P.17, Gò Vấp, TP.HCM"
        />
      </label>
    </div>
  )
}

export function OrderScheduleFields({ values, onChange }) {
  const handleChange = makeFieldChange(onChange)

  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-on-surface-variant">Ngày đặt</span>
          <input
            type="date"
            value={values.orderDate || ''}
            onChange={handleChange('orderDate')}
            className={fieldClassName}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-on-surface-variant">Ngày cần</span>
          <input
            type="date"
            value={values.deliveryDate || ''}
            onChange={handleChange('deliveryDate')}
            className={fieldClassName}
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-on-surface-variant">Thời gian ship</span>
        <input
          type="text"
          value={values.deliveryTimeSlot || ''}
          onChange={handleChange('deliveryTimeSlot')}
          className={fieldClassName}
          placeholder="vd: Minh ship · 8h–12h · Sáng"
        />
      </label>
    </div>
  )
}

export function OrderNoteFields({ values, onChange }) {
  const handleChange = makeFieldChange(onChange)

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-on-surface-variant">Note đơn</span>
        <textarea
          value={values.note}
          onChange={handleChange('note')}
          rows={3}
          className={`${fieldClassName} resize-y leading-5`}
          placeholder="vd: Tag SN đỏ · Hpbd Mr Tài 24/10 · Khoanh 12/7 màu đỏ"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-on-surface-variant">Ghi chú giao hàng</span>
        <textarea
          value={values.deliveryNote}
          onChange={handleChange('deliveryNote')}
          rows={3}
          className={`${fieldClassName} resize-y leading-5`}
          placeholder="vd: Gọi trước 15 phút · Để bảo vệ · Không giao trưa"
        />
      </label>
    </div>
  )
}

export function OrderTrackingFields({ values, onChange }) {
  const handleChange = makeFieldChange(onChange)

  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-on-surface-variant">Mã vận đơn</span>
        <input
          type="text"
          value={values.shippingTrackingCode || ''}
          onChange={handleChange('shippingTrackingCode')}
          className={fieldClassName}
          placeholder="vd: GHN123… / GHTK…"
        />
      </label>
      <label className="flex h-10 items-center gap-2 text-sm text-on-surface">
        <input
          type="checkbox"
          checked={Boolean(values.monthEndChecked)}
          onChange={handleChange('monthEndChecked')}
          className="h-4 w-4 rounded border-outline-variant"
        />
        Check cuối tháng
      </label>
    </div>
  )
}

function AdminDeliveryForm({ values, onChange }) {
  return (
    <div className="space-y-4">
      <OrderCustomerFields values={values} onChange={onChange} />
      <OrderScheduleFields values={values} onChange={onChange} />
      <OrderNoteFields values={values} onChange={onChange} />
      <OrderTrackingFields values={values} onChange={onChange} />
    </div>
  )
}

export default AdminDeliveryForm
