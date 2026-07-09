const fieldClassName =
  'w-full rounded-xl border border-rose-100 px-4 py-3.5 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:ring-2 focus:ring-rose-100'

function CustomCardStepFormMobile({ values, onChange }) {
  function handleChange(field) {
    return (event) => {
      onChange(field, event.target.value)
    }
  }

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">Tên người gửi</span>
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
          Lời chúc <span className="text-rose-500">*</span>
        </span>
        <textarea
          value={values.message}
          onChange={handleChange('message')}
          className={`${fieldClassName} min-h-32 resize-y leading-6`}
          placeholder="Nhập lời chúc..."
          required
        />
      </label>
    </div>
  )
}

export default CustomCardStepFormMobile
