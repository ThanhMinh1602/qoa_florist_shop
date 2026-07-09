import { NavLink } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'

const navItems = [
  {
    to: '/admin/create',
    label: 'Tạo thiệp mới',
    icon: '✨',
  },
  {
    to: '/admin/manage',
    label: 'Quản lý thiệp',
    icon: '📋',
  },
  {
    to: '/admin/change-password',
    label: 'Đổi mật khẩu',
    icon: '🔐',
  },
]

function AdminSidebar() {
  const { logout, username } = useAuth()

  return (
    <aside className="sticky top-0 flex h-dvh min-h-dvh w-64 shrink-0 flex-col border-r border-rose-100 bg-white">
      <div className="border-b border-rose-100 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">
          QOA Florist
        </p>
        <h1 className="mt-1 text-lg font-semibold text-rose-900">Admin Panel</h1>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-100'
                  : 'text-slate-600 hover:bg-rose-50/70 hover:text-rose-700',
              ].join(' ')
            }
          >
            <span aria-hidden="true" className="text-base">
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-rose-100 p-4">
        {username ? (
          <p className="mb-3 truncate px-2 text-xs text-slate-500">
            Đăng nhập: <span className="font-medium text-slate-700">{username}</span>
          </p>
        ) : null}
        <button
          type="button"
          onClick={logout}
          className="w-full rounded-xl border border-rose-100 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}

export default AdminSidebar
