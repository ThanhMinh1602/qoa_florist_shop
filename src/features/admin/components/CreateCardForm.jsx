const fieldClassName =
  'w-full rounded-xl border border-rose-100 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:ring-2 focus:ring-rose-100'

function CreateCardForm({ values, onChange }) {
  function handleChange(field) {
    return (event) => {
      onChange(field, event.target.value)
    }
  }

  return (
    <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          Tên người gửi
        </span>
        <input
          type="text"
          value={values.senderName}
          onChange={handleChange('senderName')}
          className={fieldClassName}
          placeholder="Ví dụ: Anh Minh"
          autoComplete="name"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          Tên người nhận <span className="text-rose-500">*</span>
        </span>
        <input
          type="text"
          value={values.recipientName}
          onChange={handleChange('recipientName')}
          className={fieldClassName}
          placeholder="Ví dụ: Lan Anh"
          required
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          Số điện thoại người nhận
        </span>
        <input
          type="tel"
          value={values.phone}
          onChange={handleChange('phone')}
          className={fieldClassName}
          placeholder="Ví dụ: 0901 234 567"
          autoComplete="tel"
        />
        <span className="mt-1.5 block text-xs text-slate-400">
          Dùng để tra cứu thiệp trong màn hình Quản lý (không hiển thị trên thiệp).
        </span>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          Lời chúc <span className="text-rose-500">*</span>
        </span>
        <textarea
          value={values.message}
          onChange={handleChange('message')}
          className={`${fieldClassName} min-h-36 resize-y leading-6`}
          placeholder="Nhập lời chúc sinh nhật..."
          required
        />
      </label>
    </form>
  )
}

export default CreateCardForm
