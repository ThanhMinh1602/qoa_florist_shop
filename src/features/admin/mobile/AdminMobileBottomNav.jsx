import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { overlayFade, sheetEnter } from '../../../lib/motion'
import {
  ADMIN_MOBILE_TABS,
  isAdminMobileTabActive,
  isAdminNavItemActive,
} from '../constants/adminNavItems'

function AdminMobileBottomNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const navRef = useRef(null)
  const [sheetTab, setSheetTab] = useState(null)

  useEffect(() => {
    const el = navRef.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined

    const syncHeight = () => {
      const rect = el.getBoundingClientRect()
      const bottomGap = window.innerHeight - rect.bottom
      document.documentElement.style.setProperty(
        '--admin-bottom-nav-offset',
        `${Math.ceil(rect.height + Math.max(0, bottomGap))}px`,
      )
    }

    syncHeight()
    const observer = new ResizeObserver(syncHeight)
    observer.observe(el)
    window.addEventListener('resize', syncHeight)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', syncHeight)
      document.documentElement.style.removeProperty('--admin-bottom-nav-offset')
    }
  }, [])

  useEffect(() => {
    setSheetTab(null)
  }, [pathname])

  function handleTabPress(tab) {
    const active = isAdminMobileTabActive(pathname, tab)
    const children = tab.children || []

    if (children.length > 1) {
      if (active) {
        setSheetTab(tab)
        return
      }
      navigate(tab.defaultTo || children[0].to)
      return
    }

    navigate(tab.to || tab.defaultTo)
  }

  return (
    <>
      <div
        ref={navRef}
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 lg:hidden"
      >
        <nav
          className="pointer-events-auto mx-auto flex max-w-md items-center justify-between gap-0.5 rounded-2xl border border-white/80 bg-surface-container-lowest px-1.5 py-1 shadow-[0_8px_28px_rgba(74,48,32,0.12)] ring-1 ring-outline-variant/20"
          aria-label="Điều hướng chính"
        >
          {ADMIN_MOBILE_TABS.map((tab) => {
            const isActive = isAdminMobileTabActive(pathname, tab)
            const hasChildren = (tab.children || []).length > 1

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabPress(tab)}
                className={[
                  'relative flex h-9 flex-1 items-center justify-center rounded-xl transition-all duration-200 ease-out active:scale-95',
                  isActive
                    ? 'bg-primary text-on-primary shadow-[0_4px_12px_rgba(74,48,32,0.22)]'
                    : 'text-on-surface-variant hover:bg-surface-container-low/80 hover:text-primary',
                ].join(' ')}
                aria-label={tab.label}
                title={tab.label}
                aria-current={isActive ? 'page' : undefined}
                aria-haspopup={hasChildren ? 'dialog' : undefined}
              >
                <MaterialIcon
                  name={tab.icon}
                  className={['text-[1.1rem] transition-transform duration-200', isActive ? 'scale-105' : ''].join(
                    ' ',
                  )}
                />
                {hasChildren ? (
                  <span
                    className={[
                      'absolute right-1.5 top-1.5 h-1 w-1 rounded-full',
                      isActive ? 'bg-on-primary/70' : 'bg-primary/45',
                    ].join(' ')}
                  />
                ) : null}
              </button>
            )
          })}
        </nav>
      </div>

      <AnimatePresence>
        {sheetTab ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.button
              type="button"
              className="absolute inset-0 bg-inverse-surface/35 backdrop-blur-[2px]"
              aria-label="Đóng"
              onClick={() => setSheetTab(null)}
              {...overlayFade}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 rounded-t-[1.35rem] border border-white/60 bg-surface-container-lowest/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_40px_rgba(74,48,32,0.14)] backdrop-blur-xl"
              role="dialog"
              aria-label={sheetTab.label}
              {...sheetEnter}
            >
              <div className="flex justify-center pt-2.5">
                <span className="h-1 w-9 rounded-full bg-outline-variant/70" />
              </div>
              <div className="flex items-center justify-between px-4 pb-2 pt-3">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.14em] text-outline uppercase">
                    Chọn màn hình
                  </p>
                  <p className="font-display text-base text-primary">{sheetTab.label}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSheetTab(null)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-on-surface-variant transition hover:bg-surface-container-low"
                  aria-label="Đóng"
                >
                  <MaterialIcon name="close" className="text-xl" />
                </button>
              </div>
              <div className="grid gap-1.5 px-3 pb-4">
                {sheetTab.children.map((item) => {
                  const active = isAdminNavItemActive(pathname, item)
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={Boolean(item.end)}
                      onClick={() => setSheetTab(null)}
                      className={[
                        'flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition',
                        active
                          ? 'bg-primary text-on-primary shadow-[0_6px_16px_rgba(74,48,32,0.18)]'
                          : 'bg-surface-container-low/70 text-on-surface hover:bg-surface-container',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'flex h-9 w-9 items-center justify-center rounded-xl',
                          active ? 'bg-white/15' : 'bg-surface-container-lowest',
                        ].join(' ')}
                      >
                        <MaterialIcon name={item.icon} className="text-[1.2rem]" />
                      </span>
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {active ? <MaterialIcon name="check" className="text-[1.1rem]" /> : null}
                    </NavLink>
                  )
                })}
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  )
}

export default AdminMobileBottomNav
