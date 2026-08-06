/**
 * Page header dùng chung admin — compact trên mobile, giữ desktop.
 */
function AdminPageHeader({ title, subtitle, actions, bordered = false, className = '' }) {
  return (
    <header
      className={[
        bordered
          ? 'border-b border-outline-variant/25 bg-surface-container-lowest/80 backdrop-blur'
          : '',
        'px-4 py-3 lg:px-8 lg:py-5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex flex-wrap items-center justify-between gap-2.5 lg:items-end lg:gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl leading-tight text-primary lg:text-3xl">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-on-surface-variant lg:mt-1 lg:text-sm">{subtitle}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{actions}</div>
        ) : null}
      </div>
    </header>
  )
}

export default AdminPageHeader
