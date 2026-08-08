import { NavLink, useLocation } from 'react-router-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { ADMIN_NAV_ITEMS, isAdminNavItemActive } from '../constants/adminNavItems'

function AdminMobileBottomNav({ onOpenMenu }) {
  const { pathname } = useLocation()

  return (
    <nav
      className="admin-mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-white/55 bg-surface-container-lowest/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      aria-label="Điều hướng chính"
    >
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${ADMIN_NAV_ITEMS.length}, minmax(0, 1fr))` }}
      >
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = isAdminNavItemActive(pathname, item)

          if (item.type === 'menu') {
            return (
              <button
                key={item.id || 'menu'}
                type="button"
                onClick={onOpenMenu}
                className={[
                  'flex flex-col items-center gap-0.5 px-0.5 py-1.5 text-[9px] font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-on-surface-variant',
                ].join(' ')}
                aria-label="Mở thêm chức năng"
              >
                <span
                  className={[
                    'flex h-8 w-8 items-center justify-center rounded-2xl transition-colors',
                    isActive ? 'bg-surface-container-low ring-1 ring-primary/20' : 'bg-transparent',
                  ].join(' ')}
                >
                  <MaterialIcon name={item.icon} className="text-[1.2rem]" />
                </span>
                <span className="max-w-full truncate px-0.5">{item.shortLabel}</span>
              </button>
            )
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={Boolean(item.end)}
              className={[
                'flex flex-col items-center gap-0.5 px-0.5 py-1.5 text-[9px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-on-surface-variant',
              ].join(' ')}
            >
              <span
                className={[
                  'flex h-8 w-8 items-center justify-center rounded-2xl transition-colors',
                  isActive ? 'bg-surface-container-low ring-1 ring-primary/20' : 'bg-transparent',
                ].join(' ')}
              >
                <MaterialIcon name={item.icon} className="text-[1.2rem]" />
              </span>
              <span className="max-w-full truncate px-0.5">{item.shortLabel}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

export default AdminMobileBottomNav
