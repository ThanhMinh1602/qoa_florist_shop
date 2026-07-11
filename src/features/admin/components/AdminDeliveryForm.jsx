const fieldClassName =
  'w-full rounded-xl border border-rose-100 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:ring-2 focus:ring-rose-100'

function AdminDeliveryForm({ values, onChange }) {
  function handleChange(field) {
    return (event) => {
      onChange(field, event.target.value)
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <h4 className="text-sm font-semibold text-slate-900">Khách đặt hàng</h4>
        <p className="mt-1 text-xs text-slate-500">Người gọi / đặt tại quầy — dùng để liên hệ xác nhận.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Tên khách <span className="text-rose-500">*</span>
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
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              SĐT khách <span className="text-rose-500">*</span>
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
        <h4 className="text-sm font-semibold text-slate-900">Giao hàng</h4>
        <p className="mt-1 text-xs text-slate-500">Người nhận hoa và địa chỉ giao.</p>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Người nhận hoa <span className="text-rose-500">*</span>
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
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Địa chỉ giao <span className="text-rose-500">*</span>
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
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Ngày giao</span>
              <input
                type="date"
                value={values.deliveryDate}
                onChange={handleChange('deliveryDate')}
                className={fieldClassName}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Khung giờ</span>
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
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Ghi chú giao hàng</span>
            <textarea
              value={values.deliveryNote}
              onChange={handleChange('deliveryNote')}
              className={`${fieldClassName} min-h-20 resize-y leading-6`}
              placeholder="Gọi trước khi giao, để ở bảo vệ..."
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Ghi chú nội bộ (loại hoa, màu, ngân sách...)
            </span>
            <textarea
              value={values.note}
              onChange={handleChange('note')}
              className={`${fieldClassName} min-h-20 resize-y leading-6`}
              placeholder="Ví dụ: Bó hồng đỏ 30 bông, phụ kiện nơ trắng..."
            />
          </label>
        </div>
      </section>
    </div>
  )
}

export default AdminDeliveryForm
