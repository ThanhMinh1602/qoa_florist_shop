import { useEffect, useState } from 'react'
import { NotificationsProvider } from '../../../context/NotificationsContext'
import AnimatedOutlet from '../../../components/motion/AnimatedOutlet'
import AdminHeader from '../components/AdminHeader'
import AdminSidebar from '../components/AdminSidebar'
import AdminMobileBottomNav from '../mobile/AdminMobileBottomNav'
import AdminMobileDrawer from '../mobile/AdminMobileDrawer'
import BrandLogo from '../../../components/common/BrandLogo'
import NotificationBell from '../components/NotificationBell'

function AdminMobileTopBar() {
  return (
    <header className="admin-mobile-topbar sticky top-0 z-30 flex items-center justify-between border-b border-white/55 bg-surface-container-lowest/90 px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur-xl lg:hidden">
      <div className="flex min-w-0 items-center gap-2">
        <BrandLogo size="xs" />
        <p className="font-display truncate text-base leading-none text-primary">QOA Florist</p>
      </div>
      <NotificationBell />
    </header>
  )
}

function AdminLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.remove('admin-chrome-hidden')
  }, [])

  return (
    <NotificationsProvider>
      <div className="mist-bg flex h-dvh overflow-hidden">
        <AdminSidebar />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <AdminMobileTopBar />

          <div className="hidden lg:block">
            <AdminHeader />
          </div>

          <main
            data-scroll-root
            className="admin-mobile-main min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable] pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0"
          >
            <AnimatedOutlet variant="admin" />
          </main>
        </div>

        <AdminMobileBottomNav onOpenMenu={() => setIsDrawerOpen(true)} />
        <AdminMobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      </div>
    </NotificationsProvider>
  )
}

export default AdminLayout
