import { formatMoneyTyping, parseMoneyInput } from '../../../utils/money'

function MoneyInput({ value, onChange, className = '', placeholder = '0', ...props }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder={placeholder}
      value={formatMoneyTyping(value)}
      onChange={(event) => onChange(parseMoneyInput(event.target.value))}
      {...props}
      className={`tabular-nums ${className}`.trim()}
    />
  )
}

export default MoneyInput
