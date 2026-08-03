const fieldClassName =
  'w-full rounded-xl border border-outline-variant/25 px-4 py-3 text-sm text-on-surface outline-none transition placeholder:text-outline focus:border-primary/40 focus:ring-2 focus:ring-primary/20'

function CustomCardStepForm({ values, onChange }) {
  function handleChange(field) {
    return (event) => {
      onChange(field, event.target.value)
    }
  }

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-on-surface">Tên người gửi</span>
        <input
          type="text"
          value={values.senderName}
          onChange={handleChange('senderName')}
          className={fieldClassName}
          placeholder="Ví dụ: Anh Minh"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-on-surface">
          Tên người nhận <span className="text-primary">*</span>
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
        <span className="mb-1.5 block text-sm font-medium text-on-surface">
          Lời chúc <span className="text-primary">*</span>
        </span>
        <textarea
          value={values.message}
          onChange={handleChange('message')}
          className={`${fieldClassName} min-h-36 resize-y leading-6`}
          placeholder="Nhập lời chúc..."
          required
        />
      </label>
    </div>
  )
}

export default CustomCardStepForm
