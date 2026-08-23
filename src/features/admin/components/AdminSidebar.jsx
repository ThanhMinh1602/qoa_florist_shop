import MaterialIcon from '../../../components/common/MaterialIcon'
import BrandLogo from '../../../components/common/BrandLogo'
import { useAuth } from '../../../context/AuthContext'
import { useDialog } from '../../../context/DialogContext'
import AdminNavMenu from './AdminNavMenu'

function AdminSidebar() {
  const { logout, username } = useAuth()
  const { confirm } = useDialog()

  async function handleLogout() {
    const ok = await confirm({
      title: 'Đăng xuất',
      message: 'Bạn có chắc muốn đăng xuất khỏi trang quản trị?',
      confirmLabel: 'Đăng xuất',
      cancelLabel: 'Ở lại',
      variant: 'danger',
    })
    if (ok) logout()
  }

  return (
    <aside className="sticky top-0 hidden h-dvh min-h-dvh w-64 shrink-0 flex-col border-r border-white/55 bg-surface-container-lowest/80 backdrop-blur-xl lg:flex">
      <div className="flex items-center gap-3 border-b border-outline-variant/20 px-5 py-5">
        <BrandLogo size="sm" />
        <p className="font-display text-xl leading-none text-primary">QOA Florist</p>
      </div>

      <AdminNavMenu />

      <div className="border-t border-outline-variant/20 p-4">
        {username ? (
          <div className="mb-3 rounded-2xl bg-surface-container-low px-3 py-3">
            <p className="truncate text-sm font-semibold text-on-surface">{username}</p>
            <p className="mt-0.5 text-xs text-on-surface-variant">Manager</p>
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => void handleLogout()}
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
