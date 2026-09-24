import { useEffect, useRef, useState } from 'react'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { dmYToIso, isoToDmY, maskDmYInput } from '../../../utils/dateFormat'

export default function DateDmYField({ value, onChange, className = '' }) {
  const pickerRef = useRef(null)
  const [text, setText] = useState(() => isoToDmY(value))

  useEffect(() => setText(isoToDmY(value)), [value])

  function commitText() {
    if (!text.trim()) {
      onChange('')
      return
    }
    const iso = dmYToIso(text)
    if (iso) {
      onChange(iso)
      setText(isoToDmY(iso))
    } else {
      setText(isoToDmY(value))
    }
  }

  return (
    <div className="relative min-w-0">
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="dd/mm/yyyy"
        value={text}
        onChange={(event) => {
          const masked = maskDmYInput(event.target.value)
          setText(masked)
          const iso = dmYToIso(masked)
          if (iso) onChange(iso)
        }}
        onBlur={commitText}
        className={`${className} pr-9 tabular-nums`}
      />
      <input
        ref={pickerRef}
        type="date"
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-outline"
        aria-label="Chọn ngày"
        onClick={() => {
          const picker = pickerRef.current
          if (typeof picker?.showPicker === 'function') picker.showPicker()
          else picker?.click()
        }}
      >
        <MaterialIcon name="calendar_month" className="text-lg" />
      </button>
    </div>
  )
}
