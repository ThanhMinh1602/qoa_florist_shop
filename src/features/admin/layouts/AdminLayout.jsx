import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { NotificationsProvider } from '../../../context/NotificationsContext'
import AdminHeader from '../components/AdminHeader'
import AdminSidebar from '../components/AdminSidebar'
import AdminMobileBottomNav from '../mobile/AdminMobileBottomNav'
import AdminMobileDrawer from '../mobile/AdminMobileDrawer'
import MaterialIcon from '../../../components/common/MaterialIcon'
import NotificationBell from '../components/NotificationBell'

function AdminMobileTopBar({ onOpenMenu }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/55 bg-surface-container-lowest/80 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl lg:hidden">
      <div>
        <p className="font-display text-xl leading-none text-primary">QOA Admin</p>
        <p className="mt-0.5 text-[10px] tracking-[0.12em] text-on-surface-variant uppercase">
          Boutique
        </p>
      </div>
      <div className="flex items-center gap-1">
        <NotificationBell />
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary"
          aria-label="Mở menu"
        >
          <MaterialIcon name="menu" className="text-[1.4rem]" />
        </button>
      </div>
    </header>
  )
}

function AdminLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <NotificationsProvider>
      <div className="mist-bg flex h-dvh overflow-hidden">
        <AdminSidebar />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <AdminMobileTopBar onOpenMenu={() => setIsDrawerOpen(true)} />

          <div className="hidden lg:block">
            <AdminHeader />
          </div>

          <main className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable] pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:pb-0">
            <Outlet />
          </main>
        </div>

        <AdminMobileBottomNav />
        <AdminMobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      </div>
    </NotificationsProvider>
  )
}

export default AdminLayout
