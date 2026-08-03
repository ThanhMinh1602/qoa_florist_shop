import { NavLink } from 'react-router-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { ADMIN_NAV_ITEMS } from '../constants/adminNavItems'

function AdminMobileBottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/55 bg-surface-container-lowest/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      aria-label="Điều hướng chính"
    >
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${ADMIN_NAV_ITEMS.length}, minmax(0, 1fr))` }}
      >
        {ADMIN_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={Boolean(item.end)}
            className={({ isActive }) =>
              [
                'flex flex-col items-center gap-0.5 px-0.5 py-2 text-[9px] font-medium transition-colors sm:text-[10px]',
                isActive ? 'text-primary' : 'text-on-surface-variant',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={[
                    'flex h-9 w-9 items-center justify-center rounded-2xl transition-colors',
                    isActive ? 'bg-surface-container-low ring-1 ring-primary/20' : 'bg-transparent',
                  ].join(' ')}
                >
                  <MaterialIcon name={item.icon} className="text-[1.3rem]" />
                </span>
                <span className="truncate">{item.shortLabel}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default AdminMobileBottomNav
