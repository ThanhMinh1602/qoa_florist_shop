import { NavLink } from 'react-router-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { useAuth } from '../../../context/AuthContext'
import { ADMIN_DRAWER_ITEMS, ADMIN_NAV_ITEMS } from '../constants/adminNavItems'

const navItems = [...ADMIN_NAV_ITEMS, ...ADMIN_DRAWER_ITEMS]

function AdminSidebar() {
  const { logout, username } = useAuth()

  return (
    <aside className="sticky top-0 hidden h-dvh min-h-dvh w-64 shrink-0 flex-col border-r border-white/55 bg-surface-container-lowest/80 backdrop-blur-xl lg:flex">
      <div className="border-b border-outline-variant/20 px-6 py-6">
        <p className="font-display text-2xl leading-none text-primary">QOA Admin</p>
        <p className="mt-1.5 text-[11px] tracking-[0.12em] text-on-surface-variant uppercase">
          Boutique Management
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={Boolean(item.end)}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-on-primary shadow-[0_8px_20px_rgba(17,83,67,0.18)]'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary',
              ].join(' ')
            }
          >
            <MaterialIcon name={item.icon} className="text-[1.25rem]" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-outline-variant/20 p-4">
        {username ? (
          <div className="mb-3 rounded-2xl bg-surface-container-low px-3 py-3">
            <p className="truncate text-sm font-semibold text-on-surface">{username}</p>
            <p className="mt-0.5 text-xs text-on-surface-variant">Manager</p>
          </div>
        ) : null}
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-outline-variant/40 px-4 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:border-primary/30 hover:bg-surface-container-low hover:text-primary"
        >
          <MaterialIcon name="logout" className="text-[1.15rem]" />
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}

export default AdminSidebar
