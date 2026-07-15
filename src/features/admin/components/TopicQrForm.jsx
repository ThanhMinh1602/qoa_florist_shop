const fieldClassName =
  'w-full rounded-xl border border-rose-100 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:ring-2 focus:ring-rose-100'

/** Form động theo schema TOPIC_QR_FORMS */
function TopicQrForm({ fields, values, onChange }) {
  return (
    <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
      {fields.map((field) => {
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
