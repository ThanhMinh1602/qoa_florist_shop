const fieldClassName =
  'w-full rounded-xl border border-outline-variant/25 px-4 py-3.5 text-base text-on-surface outline-none transition placeholder:text-outline/55 focus:border-primary/40 focus:ring-2 focus:ring-primary/20'

function makeFieldChange(onChange) {
  return (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    onChange(field, value)
  }
}

export function OrderCustomerFieldsMobile({ values, onChange }) {
  const handleChange = makeFieldChange(onChange)

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-on-surface">
          Tên KH <span className="text-primary">*</span>
        </span>
        <input
          type="text"
          value={values.customerName}
          onChange={handleChange('customerName')}
          className={fieldClassName}
          placeholder="vd: My, Thu Phương, Mẹ Ny"
          autoComplete="name"
          required
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-on-surface">SĐT</span>
        <input
          type="tel"
          value={values.customerPhone}
          onChange={handleChange('customerPhone')}
          className={fieldClassName}
          placeholder="vd: 0907 155 210"
          inputMode="tel"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-on-surface">Địa chỉ</span>
        <textarea
          value={values.deliveryAddress}
          onChange={handleChange('deliveryAddress')}
          className={`${fieldClassName} min-h-24 resize-y leading-6`}
          placeholder="vd: 14 Lê Hoàng Phái, P.17, Gò Vấp, TP.HCM"
        />
      </label>
    </div>
  )
}

export function OrderScheduleFieldsMobile({ values, onChange }) {
  const handleChange = makeFieldChange(onChange)

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-on-surface">Ngày đặt</span>
        <input
          type="date"
          value={values.orderDate || ''}
          onChange={handleChange('orderDate')}
          className={fieldClassName}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-on-surface">Ngày cần</span>
        <input
          type="date"
          value={values.deliveryDate || ''}
          onChange={handleChange('deliveryDate')}
          className={fieldClassName}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-on-surface">Thời gian ship</span>
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

export function OrderNoteFieldsMobile({ values, onChange }) {
  const handleChange = makeFieldChange(onChange)

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-on-surface">Note đơn</span>
        <textarea
          value={values.note}
          onChange={handleChange('note')}
          className={`${fieldClassName} min-h-20 resize-y leading-6`}
          placeholder="vd: Tag SN đỏ · Hpbd Mr Tài 24/10"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-on-surface">Ghi chú giao hàng</span>
        <textarea
          value={values.deliveryNote}
          onChange={handleChange('deliveryNote')}
          className={`${fieldClassName} min-h-20 resize-y leading-6`}
          placeholder="vd: Gọi trước 15 phút · Để bảo vệ"
        />
      </label>
    </div>
  )
}

export function OrderTrackingFieldsMobile({ values, onChange }) {
  const handleChange = makeFieldChange(onChange)

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-on-surface">Mã vận đơn</span>
        <input
          type="text"
          value={values.shippingTrackingCode || ''}
          onChange={handleChange('shippingTrackingCode')}
          className={fieldClassName}
          placeholder="vd: GHN123… / GHTK…"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-on-surface">
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

function AdminDeliveryFormMobile({ values, onChange }) {
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-on-surface">Khách hàng</h4>
        <div className="mt-3">
          <OrderCustomerFieldsMobile values={values} onChange={onChange} />
        </div>
      </section>
      <section className="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-on-surface">Lịch giao</h4>
        <div className="mt-3">
          <OrderScheduleFieldsMobile values={values} onChange={onChange} />
        </div>
      </section>
      <section className="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-on-surface">Note</h4>
        <div className="mt-3">
          <OrderNoteFieldsMobile values={values} onChange={onChange} />
        </div>
      </section>
      <section className="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-on-surface">Vận đơn</h4>
        <div className="mt-3">
          <OrderTrackingFieldsMobile values={values} onChange={onChange} />
        </div>
      </section>
    </div>
  )
}

export default AdminDeliveryFormMobile
