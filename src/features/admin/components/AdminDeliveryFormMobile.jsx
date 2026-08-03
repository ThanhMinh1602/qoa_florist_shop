const fieldClassName =
  'w-full rounded-xl border border-outline-variant/25 px-4 py-3.5 text-base text-on-surface outline-none transition placeholder:text-outline focus:border-primary/40 focus:ring-2 focus:ring-primary/20'

function AdminDeliveryFormMobile({ values, onChange }) {
  function handleChange(field) {
    return (event) => {
      onChange(field, event.target.value)
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-surface-container bg-surface-container-low/30 p-4">
        <h4 className="text-sm font-semibold text-on-surface">Khách đặt hàng</h4>
        <p className="mt-1 text-xs text-on-surface-variant">Người gọi / đặt tại quầy.</p>
        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-on-surface">
              Tên khách <span className="text-primary">*</span>
            </span>
            <input
              type="text"
              value={values.customerName}
              onChange={handleChange('customerName')}
              className={fieldClassName}
              placeholder="Nguyễn Văn A"
              autoComplete="name"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-on-surface">
              SĐT khách <span className="text-primary">*</span>
            </span>
            <input
              type="tel"
              value={values.customerPhone}
              onChange={handleChange('customerPhone')}
              className={fieldClassName}
              placeholder="0901 234 567"
              inputMode="tel"
              required
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-amber-50 bg-amber-50/20 p-4">
        <h4 className="text-sm font-semibold text-on-surface">Giao hàng</h4>
        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-on-surface">
              Người nhận hoa <span className="text-primary">*</span>
            </span>
            <input
              type="text"
              value={values.deliveryRecipientName}
              onChange={handleChange('deliveryRecipientName')}
              className={fieldClassName}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-on-surface">
              SĐT người nhận <span className="text-primary">*</span>
            </span>
            <input
              type="tel"
              value={values.deliveryPhone}
              onChange={handleChange('deliveryPhone')}
              className={fieldClassName}
              inputMode="tel"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-on-surface">
              Địa chỉ giao <span className="text-primary">*</span>
            </span>
            <textarea
              value={values.deliveryAddress}
              onChange={handleChange('deliveryAddress')}
              className={`${fieldClassName} min-h-24 resize-y leading-6`}
              placeholder="Số nhà, đường, phường/xã..."
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-on-surface">Ngày giao</span>
            <input
              type="date"
              value={values.deliveryDate}
              onChange={handleChange('deliveryDate')}
              className={fieldClassName}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-on-surface">Khung giờ</span>
            <select
              value={values.deliveryTimeSlot}
              onChange={handleChange('deliveryTimeSlot')}
              className={fieldClassName}
            >
              <option value="">Chọn khung giờ</option>
              <option value="8h-12h">8h – 12h</option>
              <option value="12h-17h">12h – 17h</option>
              <option value="17h-21h">17h – 21h</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-on-surface">Ghi chú giao hàng</span>
            <textarea
              value={values.deliveryNote}
              onChange={handleChange('deliveryNote')}
              className={`${fieldClassName} min-h-20 resize-y leading-6`}
              placeholder="Gọi trước khi giao..."
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-on-surface">
              Ghi chú nội bộ (hoa, màu, ngân sách...)
            </span>
            <textarea
              value={values.note}
              onChange={handleChange('note')}
              className={`${fieldClassName} min-h-20 resize-y leading-6`}
              placeholder="Bó hồng đỏ 30 bông..."
            />
          </label>
        </div>
      </section>
    </div>
  )
}

export default AdminDeliveryFormMobile
