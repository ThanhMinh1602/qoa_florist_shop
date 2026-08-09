import { useEffect, useState } from 'react'
import { NotificationsProvider } from '../../../context/NotificationsContext'
import AnimatedOutlet from '../../../components/motion/AnimatedOutlet'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { DEFAULT_THEME_COLOR, setThemeColor } from '../../../utils/themeColor'
import AdminHeader from '../components/AdminHeader'
import AdminSidebar from '../components/AdminSidebar'
import AdminMobileBottomNav from '../mobile/AdminMobileBottomNav'
import AdminMobileDrawer from '../mobile/AdminMobileDrawer'
import BrandLogo from '../../../components/common/BrandLogo'
import NotificationBell from '../components/NotificationBell'
import { ADMIN_MOBILE_MORE_SECTIONS } from '../constants/adminNavItems'

/** Trùng surface-container-lowest — status bar / header cùng màu trắng */
const ADMIN_HEADER_THEME = '#ffffff'

function AdminMobileTopBar({ onOpenMenu }) {
  return (
    <header className="admin-mobile-topbar flex items-center justify-between border-b border-outline-variant/20 bg-surface-container-lowest px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] lg:hidden">
      <div className="flex min-w-0 items-center gap-2">
        <BrandLogo size="xs" />
        <p className="font-display truncate text-base leading-none text-primary">QOA Florist</p>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <NotificationBell />
        <button
          type="button"
          onClick={onOpenMenu}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary"
          aria-label="Mở menu thêm"
        >
          <MaterialIcon name="menu" className="text-[1.35rem]" />
        </button>
      </div>
    </header>
  )
}

function AdminLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.remove('admin-chrome-hidden')
  }, [])

  useEffect(() => {
    setThemeColor(ADMIN_HEADER_THEME)
    return () => setThemeColor(DEFAULT_THEME_COLOR)
  }, [])

  useEffect(() => {
    const html = document.documentElement
    const { body } = document
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyOverscroll: body.style.overscrollBehavior,
    }
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    body.style.overscrollBehavior = 'none'
    return () => {
      html.style.overflow = prev.htmlOverflow
      body.style.overflow = prev.bodyOverflow
      body.style.overscrollBehavior = prev.bodyOverscroll
    }
  }, [])

  return (
    <NotificationsProvider>
      <div className="mist-bg flex h-dvh overflow-hidden overscroll-none">
        <AdminSidebar />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <AdminMobileTopBar onOpenMenu={() => setIsDrawerOpen(true)} />

          <div className="hidden lg:block">
            <AdminHeader />
          </div>

          <main
            data-scroll-root
            className="admin-mobile-main relative min-h-0 flex-1 overflow-y-auto overscroll-y-contain touch-pan-y [-webkit-overflow-scrolling:touch] [scrollbar-gutter:stable] pb-[var(--admin-bottom-nav-offset)] lg:pb-0"
          >
            <AnimatedOutlet variant="admin" />
          </main>
        </div>

        <AdminMobileBottomNav />
        <AdminMobileDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          sections={ADMIN_MOBILE_MORE_SECTIONS}
        />
      </div>
    </NotificationsProvider>
  )
}

export default AdminLayout
