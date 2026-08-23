import { Link } from 'react-router-dom'
import MaterialIcon from '../../../../components/common/MaterialIcon'

/**
 * Khung màn settings: panel trắng bo góc chiếm gần hết ngang + dọc.
 */
function SettingsSubpageShell({
  title,
  description,
  children,
  actions,
  backTo = '/admin/settings',
  backLabel = 'Cài đặt web',
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col p-2 pb-[calc(var(--admin-bottom-nav-offset)+4.75rem)] sm:p-3 lg:p-4 lg:pb-4">
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-outline-variant/15 bg-white shadow-[0_8px_30px_rgba(74,48,32,0.06)]">
          <header className="shrink-0 border-b border-outline-variant/15 px-4 py-3 sm:px-5 sm:py-3.5 lg:px-6 lg:py-4">
            <Link
              to={backTo}
              className="mb-1.5 inline-flex items-center gap-1 text-xs font-medium text-on-surface-variant transition hover:text-primary"
            >
              <MaterialIcon name="arrow_back" className="text-base" />
              {backLabel}
            </Link>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-display text-lg leading-tight text-primary sm:text-xl lg:text-2xl">
                  {title}
                </h2>
                {description ? (
                  <p className="mt-0.5 text-xs text-on-surface-variant lg:text-sm">{description}</p>
                ) : null}
              </div>
              {actions ? (
                <div className="hidden shrink-0 flex-wrap items-center gap-2 lg:flex">{actions}</div>
              ) : null}
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 lg:p-6">
            {children}
          </div>
        </section>
      </div>

      {actions ? (
        <div className="fixed inset-x-0 bottom-[var(--admin-bottom-nav-offset)] z-30 border-t border-outline-variant/20 bg-white/95 px-4 pt-2.5 pb-2.5 backdrop-blur-xl lg:hidden">
          {actions}
        </div>
      ) : null}
    </div>
  )
}

export default SettingsSubpageShell
