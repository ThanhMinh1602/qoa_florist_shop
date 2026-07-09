const fieldClassName =
  'w-full rounded-xl border border-rose-100 px-4 py-3.5 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:ring-2 focus:ring-rose-100'

function CustomDeliveryFormMobile({ values, onChange }) {
  function handleChange(field) {
    return (event) => {
      onChange(field, event.target.value)
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-rose-50 bg-rose-50/30 p-4">
        <h4 className="text-sm font-semibold text-slate-900">Thông tin liên hệ của bạn</h4>
        <p className="mt-1 text-xs text-slate-500">Shop sẽ gọi xác nhận qua số này.</p>
        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Họ tên <span className="text-rose-500">*</span>
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
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              SĐT <span className="text-rose-500">*</span>
            </span>
            <input
              type="tel"
              value={values.customerPhone}
              onChange={handleChange('customerPhone')}
              className={fieldClassName}
              placeholder="0901 234 567"
              autoComplete="tel"
              inputMode="tel"
              required
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-amber-50 bg-amber-50/20 p-4">
        <h4 className="text-sm font-semibold text-slate-900">Thông tin giao hàng</h4>
        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Người nhận hàng <span className="text-rose-500">*</span>
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
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              SĐT người nhận <span className="text-rose-500">*</span>
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
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Địa chỉ giao hàng <span className="text-rose-500">*</span>
            </span>
            <textarea
              value={values.deliveryAddress}
              onChange={handleChange('deliveryAddress')}
              className={`${fieldClassName} min-h-24 resize-y leading-6`}
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Ngày giao mong muốn</span>
            <input
              type="date"
              value={values.deliveryDate}
              onChange={handleChange('deliveryDate')}
              className={fieldClassName}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Khung giờ giao</span>
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
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Ghi chú giao hàng</span>
            <textarea
              value={values.deliveryNote}
              onChange={handleChange('deliveryNote')}
              className={`${fieldClassName} min-h-20 resize-y leading-6`}
              placeholder="Ví dụ: Gọi trước khi giao..."
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Ghi chú gửi shop</span>
            <textarea
              value={values.note}
              onChange={handleChange('note')}
              className={`${fieldClassName} min-h-20 resize-y leading-6`}
              placeholder="Ví dụ: Kèm hoa hồng đỏ..."
            />
          </label>
        </div>
      </section>
    </div>
  )
}

export default CustomDeliveryFormMobile
