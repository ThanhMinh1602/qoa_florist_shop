import { NavLink } from 'react-router-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { useAuth } from '../../../context/AuthContext'
import { ADMIN_DRAWER_ITEMS } from '../constants/adminNavItems'

function AdminMobileDrawer({ isOpen, onClose }) {
  const { logout, username } = useAuth()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-inverse-surface/40"
        aria-label="Đóng menu"
      />

      <aside className="absolute inset-y-0 right-0 flex w-[min(100vw-4rem,18rem)] flex-col border-l border-white/55 bg-surface-container-lowest/95 shadow-[0_12px_40px_rgba(74,48,32,0.12)] backdrop-blur-[28px]">
        <div className="flex items-center justify-between border-b border-outline-variant/20 px-4 py-4">
          <div>
            <p className="font-display text-xl leading-none text-primary">QOA Admin</p>
            <p className="mt-1 text-[10px] tracking-[0.12em] text-on-surface-variant uppercase">
              Boutique
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary"
            aria-label="Đóng"
          >
            <MaterialIcon name="close" />
          </button>
        </div>

        <div className="border-b border-outline-variant/15 px-4 py-4">
          {username ? (
            <p className="text-xs text-on-surface-variant">
              Đăng nhập: <span className="font-medium text-on-surface">{username}</span>
            </p>
          ) : null}
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {ADMIN_DRAWER_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary',
                ].join(' ')
              }
            >
              <MaterialIcon name={item.icon} className="text-[1.25rem]" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-outline-variant/20 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => {
              onClose()
              logout()
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-outline-variant/40 px-4 py-3 text-sm font-medium text-on-surface-variant transition-colors hover:border-primary/30 hover:bg-surface-container-low hover:text-primary"
          >
            <MaterialIcon name="logout" className="text-[1.15rem]" />
            Đăng xuất
          </button>
        </div>
      </aside>
    </div>
  )
}

export default AdminMobileDrawer
