import { useRef } from 'react'
import { countBracketPhrases } from '../../../constants/topicQrForms'

const fieldClassName =
  'w-full rounded-xl border border-rose-100 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:ring-2 focus:ring-rose-100'

/** Nhập cụm từ dạng [cụm 1][cụm 2] — nút thêm tạo cặp [] và đặt cursor vào giữa */
function PhraseListField({ field, values, onChange }) {
  const inputRef = useRef(null)
  const maxItems = field.maxItems || 6
  const raw = String(values[field.name] ?? '')
  const phraseCount = countBracketPhrases(raw)

  function insertNewBracketPair() {
    if (phraseCount >= maxItems) return
    const el = inputRef.current
    const next = `${raw}[]`
    onChange(field.name, next)

    requestAnimationFrame(() => {
      if (!el) return
      const cursor = next.length - 1
      el.focus()
      el.setSelectionRange(cursor, cursor)
    })
  }

  function handleKeyDown(event) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    insertNewBracketPair()
  }

  return (
    <div className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {field.label}
        {field.required ? <span className="text-rose-500"> *</span> : null}
      </span>
      <textarea
        ref={inputRef}
        value={raw}
        onChange={(event) => onChange(field.name, event.target.value)}
        onKeyDown={handleKeyDown}
        className={[fieldClassName, 'min-h-24 resize-y font-mono leading-6'].join(' ')}
        placeholder={field.placeholder}
        required={field.required}
        spellCheck={false}
      />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {phraseCount < maxItems ? (
          <button
            type="button"
            onClick={insertNewBracketPair}
            className="text-sm font-medium text-rose-600 hover:text-rose-700"
          >
            + Thêm cụm từ ({phraseCount}/{maxItems})
          </button>
        ) : (
          <span className="text-xs text-slate-400">Đã đạt tối đa {maxItems} cụm từ.</span>
        )}
      </div>
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
