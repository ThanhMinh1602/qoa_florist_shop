import { NavLink } from 'react-router-dom'
import BrandLogo from '../../../components/common/BrandLogo'
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
        className="absolute inset-0 bg-slate-900/40"
        aria-label="Đóng menu"
      />

      <aside className="absolute inset-y-0 right-0 flex w-[min(100vw-4rem,18rem)] flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-rose-100 px-4 py-4">
          <BrandLogo size="sm" />
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-rose-50 hover:text-slate-700"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <div className="border-b border-rose-50 px-4 py-4">
          {username ? (
            <p className="text-xs text-slate-500">
              Đăng nhập: <span className="font-medium text-slate-700">{username}</span>
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
                    ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-100'
                    : 'text-slate-600 hover:bg-rose-50/70 hover:text-rose-700',
                ].join(' ')
              }
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-rose-100 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => {
              onClose()
              logout()
            }}
            className="w-full rounded-xl border border-rose-100 px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          >
            Đăng xuất
          </button>
        </div>
      </aside>
    </div>
  )
}

export default AdminMobileDrawer
