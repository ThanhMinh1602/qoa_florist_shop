import { AnimatePresence, motion } from 'framer-motion'
import MaterialIcon from '../../../components/common/MaterialIcon'
import BrandLogo from '../../../components/common/BrandLogo'
import { useAuth } from '../../../context/AuthContext'
import { useScrollLock } from '../../../hooks/useScrollLock'
import { drawerEnter, overlayFade } from '../../../lib/motion'
import AdminNavMenu from '../components/AdminNavMenu'

function AdminMobileDrawer({ isOpen, onClose }) {
  const { logout, username } = useAuth()
  useScrollLock(isOpen)

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.button
            type="button"
            onClick={onClose}
            className="absolute inset-0 bg-inverse-surface/40"
            aria-label="Đóng menu"
            {...overlayFade}
          />

          <motion.aside
            className="absolute inset-y-0 right-0 flex w-[min(100vw-4rem,20rem)] flex-col border-l border-white/55 bg-surface-container-lowest/95 shadow-[0_12px_40px_rgba(74,48,32,0.12)] backdrop-blur-[28px]"
            {...drawerEnter}
          >
            <div className="flex items-center justify-between border-b border-outline-variant/20 px-4 py-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <BrandLogo size="sm" />
                <p className="font-display truncate text-lg leading-none text-primary">QOA Florist</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary"
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

            <AdminNavMenu onNavigate={onClose} className="min-h-0" />

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
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  )
}

export default AdminMobileDrawer
