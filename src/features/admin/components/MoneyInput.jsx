import { formatMoneyTyping, parseMoneyInput } from '../../../utils/money'

function MoneyInput({ value, onChange, className = '', placeholder = '0', onKeyDown, ...props }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder={placeholder}
      value={formatMoneyTyping(value)}
      onChange={(event) => onChange(parseMoneyInput(event.target.value))}
      onKeyDown={(event) => {
        if (
          event.key.length === 1 &&
          !/[0-9]/.test(event.key) &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey
        ) {
          event.preventDefault()
        }
        onKeyDown?.(event)
      }}
      {...props}
      className={`tabular-nums ${className}`.trim()}
    />
  )
}

export default MoneyInput
