import { NavLink } from 'react-router-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { ADMIN_NAV_ITEMS } from '../constants/adminNavItems'

function AdminMobileBottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-rose-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      aria-label="Điều hướng chính"
    >
      <div className="grid grid-cols-2">
        {ADMIN_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                'flex flex-col items-center gap-1 px-2 py-2.5 text-[11px] font-medium transition-colors',
                isActive ? 'text-rose-700' : 'text-slate-500',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={[
                    'flex h-9 w-9 items-center justify-center rounded-2xl transition-colors',
                    isActive ? 'bg-rose-50 ring-1 ring-rose-100' : 'bg-transparent',
                  ].join(' ')}
                >
                  <MaterialIcon name={item.icon} className="text-[1.35rem]" />
                </span>
                <span>{item.shortLabel}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default AdminMobileBottomNav
