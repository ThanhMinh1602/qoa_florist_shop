const fieldClassName =
  'w-full rounded-xl border border-rose-100 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:ring-2 focus:ring-rose-100'

function PhraseListField({ field, values, onChange }) {
  const items = Array.isArray(values[field.name]) ? values[field.name] : ['']
  const maxItems = field.maxItems || 6

  function updateItem(index, value) {
    const next = items.map((item, i) => (i === index ? value : item))
    onChange(field.name, next)
  }

  function addItem() {
    if (items.length >= maxItems) return
    onChange(field.name, [...items, ''])
  }

  function removeItem(index) {
    if (items.length <= 1) {
      onChange(field.name, [''])
      return
    }
    onChange(
      field.name,
      items.filter((_, i) => i !== index),
    )
  }

  return (
    <div className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {field.label}
        {field.required ? <span className="text-rose-500"> *</span> : null}
      </span>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={`${field.name}-${index}`} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(event) => updateItem(index, event.target.value)}
              className={fieldClassName}
              placeholder={field.placeholder}
              required={field.required && index === 0}
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="shrink-0 rounded-xl border border-rose-100 px-3 text-sm text-slate-500 hover:bg-rose-50 hover:text-rose-600"
              aria-label="Xóa cụm từ"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      {items.length < maxItems ? (
        <button
          type="button"
          onClick={addItem}
          className="mt-2 text-sm font-medium text-rose-600 hover:text-rose-700"
        >
          + Thêm cụm từ ({items.length}/{maxItems})
        </button>
      ) : (
        <span className="mt-2 block text-xs text-slate-400">Đã đạt tối đa {maxItems} cụm từ.</span>
      )}
      {field.help ? <span className="mt-1.5 block text-xs text-slate-400">{field.help}</span> : null}
    </div>
  )
}

/** Form động theo schema TOPIC_QR_FORMS */
function TopicQrForm({ fields, values, onChange }) {
  return (
    <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
      {fields.map((field) => {
        if (field.type === 'phraseList') {
          return <PhraseListField key={field.name} field={field} values={values} onChange={onChange} />
        }

        const isTextarea = field.type === 'textarea'
        const InputTag = isTextarea ? 'textarea' : 'input'

        return (
          <label key={field.name} className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              {field.label}
              {field.required ? <span className="text-rose-500"> *</span> : null}
            </span>
            <InputTag
              type={isTextarea ? undefined : field.type || 'text'}
              value={values[field.name] ?? ''}
              onChange={(event) => onChange(field.name, event.target.value)}
              className={[fieldClassName, isTextarea ? 'min-h-32 resize-y leading-6' : ''].join(' ')}
              placeholder={field.placeholder}
              required={field.required}
              autoComplete={field.type === 'tel' ? 'tel' : undefined}
            />
            {field.help ? (
              <span className="mt-1.5 block text-xs text-slate-400">{field.help}</span>
            ) : null}
          </label>
        )
      })}
    </form>
  )
}

export default TopicQrForm
