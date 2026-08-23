/** Swatch màu tròn dưới tên SP trong danh sách. */
function ProductColorSwatches({ colors = [], max = 5, className = '' }) {
  const list = (Array.isArray(colors) ? colors : []).filter(
    (color) => color && (color.hex || color.name),
  )

  if (list.length === 0) return null

  const visible = list.slice(0, max)
  const extra = list.length - visible.length
  const title = list.map((color) => color.name || color.hex).filter(Boolean).join(', ')

  return (
    <div
      className={['mt-1 flex items-center gap-1', className].filter(Boolean).join(' ')}
      title={title}
      aria-label={title || 'Màu sản phẩm'}
    >
      {visible.map((color) => (
        <span
          key={color.id || color.hex || color.name}
          className="inline-block h-3.5 w-3.5 rounded-full border border-black/10 shadow-sm"
          style={{ backgroundColor: color.hex || '#C4A484' }}
        />
      ))}
      {extra > 0 ? (
        <span className="text-[10px] font-medium text-on-surface-variant">+{extra}</span>
      ) : null}
    </div>
  )
}

export default ProductColorSwatches
