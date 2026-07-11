/**
 * Material Symbols — mặc định dùng bản fill.
 * @example <MaterialIcon name="edit_note" className="text-rose-600" />
 * @example <MaterialIcon name="expand_more" filled={false} />
 */
function MaterialIcon({
  name,
  className = '',
  filled = true,
  size,
  style,
  'aria-hidden': ariaHidden = true,
  ...props
}) {
  return (
    <span
      className={['material-symbols-outlined select-none', className].filter(Boolean).join(' ')}
      style={{
        fontVariationSettings: filled
          ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
          : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
        fontSize: size,
        lineHeight: 1,
        ...style,
      }}
      aria-hidden={ariaHidden}
      {...props}
    >
      {name}
    </span>
  )
}

export default MaterialIcon
