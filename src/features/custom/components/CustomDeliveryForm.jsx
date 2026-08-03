const fieldClassName =
  'w-full rounded-xl border border-outline-variant/25 px-4 py-3 text-sm text-on-surface outline-none transition placeholder:text-outline focus:border-primary/40 focus:ring-2 focus:ring-primary/20'

function CustomDeliveryForm({ values, onChange }) {
  function handleChange(field) {
    return (event) => {
      onChange(field, event.target.value)
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <h4 className="text-sm font-semibold text-on-surface">Thông tin liên hệ của bạn</h4>
        <p className="mt-1 text-xs text-on-surface-variant">Shop sẽ gọi xác nhận qua số này.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-on-surface">
              Họ tên <span className="text-primary">*</span>
            </span>
            <input
              type="text"
              value={values.customerName}
              onChange={handleChange('customerName')}
              className={fieldClassName}
              placeholder="Nguyễn Văn A"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-on-surface">
              SĐT <span className="text-primary">*</span>
            </span>
            <input
              type="tel"
              value={values.customerPhone}
              onChange={handleChange('customerPhone')}
              className={fieldClassName}
              placeholder="0901 234 567"
              required
            />
          </label>
        </div>
      </section>

      <section>
        <h4 className="text-sm font-semibold text-on-surface">Thông tin giao hàng</h4>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-on-surface">
                Người nhận hàng <span className="text-primary">*</span>
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
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-on-surface">
              Địa chỉ giao hàng <span className="text-primary">*</span>
            </span>
            <textarea
              value={values.deliveryAddress}
              onChange={handleChange('deliveryAddress')}
              className={`${fieldClassName} min-h-24 resize-y leading-6`}
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-on-surface">Ngày giao mong muốn</span>
              <input
                type="date"
                value={values.deliveryDate}
                onChange={handleChange('deliveryDate')}
                className={fieldClassName}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-on-surface">Khung giờ giao</span>
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
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-on-surface">Ghi chú giao hàng</span>
            <textarea
              value={values.deliveryNote}
              onChange={handleChange('deliveryNote')}
              className={`${fieldClassName} min-h-20 resize-y leading-6`}
              placeholder="Ví dụ: Gọi trước khi giao, để hàng ở bảo vệ..."
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-on-surface">Ghi chú gửi shop</span>
            <textarea
              value={values.note}
              onChange={handleChange('note')}
              className={`${fieldClassName} min-h-20 resize-y leading-6`}
              placeholder="Ví dụ: Kèm hoa hồng đỏ, thêm thiệp viết tay..."
            />
          </label>
        </div>
      </section>
    </div>
  )
}

export default CustomDeliveryForm
