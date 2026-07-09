import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { NotificationsProvider } from '../../../context/NotificationsContext'
import AdminHeader from '../components/AdminHeader'
import AdminSidebar from '../components/AdminSidebar'
import AdminMobileBottomNav from '../mobile/AdminMobileBottomNav'
import AdminMobileDrawer from '../mobile/AdminMobileDrawer'
import BrandLogo from '../../../components/common/BrandLogo'
import NotificationBell from '../components/NotificationBell'

function AdminMobileTopBar({ onOpenMenu }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-rose-100 bg-white/95 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur lg:hidden">
      <BrandLogo size="sm" />
      <div className="flex items-center gap-1">
        <NotificationBell />
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-rose-50 hover:text-rose-700"
          aria-label="Mở menu"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
            <path d="M4 7a1 1 0 1 0 0 2h16a1 1 0 1 0 0-2H4Zm0 5a1 1 0 1 0 0 2h16a1 1 0 1 0 0-2H4Zm0 5a1 1 0 1 0 0 2h16a1 1 0 1 0 0-2H4Z" />
          </svg>
        </button>
      </div>
    </header>
  )
}

function AdminLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <NotificationsProvider>
      <div className="flex h-dvh overflow-hidden bg-rose-50/40">
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
