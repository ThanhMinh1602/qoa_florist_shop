import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import BrandLogo from '../../components/common/BrandLogo'
import MaterialIcon from '../../components/common/MaterialIcon'

/** Chiều cao header nổi + khoảng cách mép trên — dùng khi cuộn tới section */
export const NAV_OFFSET = 108
const SCROLL_LOCK_MS = 900

/** Tab điều hướng chung Home / Shop */
export const SITE_NAV_ITEMS = [
  { id: 'home', label: 'Home', type: 'hash', hash: 'home' },
  { id: 'featured', label: 'Bán chạy', type: 'hash', hash: 'featured' },
  { id: 'products', label: 'Sản phẩm', type: 'route', to: '/shop' },
  { id: 'custom-card', label: 'Tạo thiệp', type: 'hash', hash: 'custom-card' },
]

function normalizeHash(hash) {
  const value = (hash || '').replace(/^#/, '')
  if (value === 'collection' || value === 'products') return 'featured'
  return value
}

/**
 * @param {{ variant?: 'hero' | 'page', activeId?: string, scrollSections?: string[] }} props
 */
function SiteHeader({ variant = 'page', activeId, scrollSections = [] }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrollActive, setScrollActive] = useState(() => {
    if (activeId) return activeId
    const hash = normalizeHash(window.location.hash)
    return hash || 'home'
  })
  const [underline, setUnderline] = useState({ left: 0, width: 0, ready: false })
  const navListRef = useRef(null)
  const scrollLockUntilRef = useRef(0)

  const isHero = variant === 'hero'
  const resolvedActive =
    activeId ||
    (location.pathname.startsWith('/shop')
      ? 'products'
      : location.pathname === '/'
        ? scrollActive
        : 'home')

  const scrollToSection = useCallback((sectionId, { smooth = true } = {}) => {
    const el = document.getElementById(sectionId)
    if (!el) return false
    scrollLockUntilRef.current = Date.now() + SCROLL_LOCK_MS
    setScrollActive(sectionId)
    const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET
    window.scrollTo({ top: Math.max(0, top), behavior: smooth ? 'smooth' : 'auto' })
    return true
  }, [])

  const handleNav = useCallback(
    (item) => {
      setMenuOpen(false)

      if (item.type === 'route') {
        navigate(item.to)
        return
      }

      const target = item.hash
      if (location.pathname !== '/') {
        navigate(target === 'home' ? '/' : `/#${target}`)
        return
      }

      // Đang ở landing: luôn cuộn tới section (kể cả Home khi đang ở giữa trang)
      scrollToSection(target)
      if (target === 'home') {
        if (location.hash) navigate('/', { replace: true })
      } else if (location.hash !== `#${target}`) {
        navigate(`/#${target}`, { replace: true })
      }
    },
    [location.hash, location.pathname, navigate, scrollToSection],
  )

  useLayoutEffect(() => {
    const nav = navListRef.current
    if (!nav) return undefined

    function measure() {
      const activeBtn = nav.querySelector(`[data-nav-id="${resolvedActive}"]`)
      if (!activeBtn) {
        setUnderline((previous) => ({ ...previous, ready: false }))
        return
      }
      const navRect = nav.getBoundingClientRect()
      const btnRect = activeBtn.getBoundingClientRect()
      const pad = 8
      setUnderline({
        left: btnRect.left - navRect.left + pad,
        width: Math.max(btnRect.width - pad * 2, 12),
        ready: true,
      })
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [resolvedActive, menuOpen])

  useEffect(() => {
    if (!scrollSections.length || location.pathname !== '/') return undefined

    const elements = scrollSections
      .map((id) => document.getElementById(id))
      .filter(Boolean)
    if (!elements.length) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < scrollLockUntilRef.current) return
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target?.id) {
          setScrollActive(visible[0].target.id)
        }
      },
      {
        rootMargin: `-${NAV_OFFSET + 8}px 0px -55% 0px`,
        threshold: [0.2, 0.45, 0.7],
      },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [location.pathname, scrollSections])

  useEffect(() => {
    function unlockScroll() {
      scrollLockUntilRef.current = 0
    }
    window.addEventListener('scrollend', unlockScroll)
    return () => window.removeEventListener('scrollend', unlockScroll)
  }, [])

  // Vào landing kèm hash (từ shop hoặc refresh) → cuộn đúng section
  useEffect(() => {
    if (location.pathname !== '/') return undefined
    const hash = normalizeHash(location.hash)
    if (!hash) return undefined
    const timer = window.setTimeout(() => {
      scrollToSection(hash, { smooth: true })
    }, 50)
    return () => window.clearTimeout(timer)
  }, [location.hash, location.pathname, scrollToSection])

  const inactiveClass = isHero
    ? 'text-white/55 hover:text-white/90'
    : 'text-on-surface-variant hover:text-primary'
  const activeClass = isHero ? 'text-white' : 'text-primary'
  const underlineClass = isHero ? 'bg-white' : 'bg-primary'
  const barClass = isHero
    ? 'border-white/20 bg-black/20 shadow-[0_12px_40px_rgba(74,48,32,0.08)] backdrop-blur-xl'
    : 'border-white/55 bg-surface/70 shadow-[0_12px_40px_rgba(74,48,32,0.08)] backdrop-blur-2xl'
  const menuBtnClass = isHero ? 'text-white' : 'text-primary'
  const mobilePanelClass = isHero
    ? 'border-white/20 bg-black/50 backdrop-blur-xl'
    : 'border-white/55 bg-surface/90 backdrop-blur-2xl'
  const mobileInactive = isHero ? 'text-white/65' : 'text-on-surface-variant'
  const mobileActive = isHero ? 'text-white' : 'text-primary'
  const mobileBar = isHero ? 'bg-white' : 'bg-primary'

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4 lg:px-8">
      <nav
        className={[
          'pointer-events-auto mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border',
          barClass,
        ].join(' ')}
      >
        <div className="flex h-16 items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
          <button
            type="button"
            aria-label="QOA Florist"
            className="inline-flex items-center"
            onClick={() => handleNav(SITE_NAV_ITEMS[0])}
          >
            <BrandLogo size="sm" />
          </button>

          <div className="flex items-center gap-2">
            <div ref={navListRef} className="relative hidden items-center gap-2 md:flex">
              {SITE_NAV_ITEMS.map((item) => {
                const isActive = resolvedActive === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-nav-id={item.id}
                    aria-current={isActive ? 'true' : undefined}
                    className={[
                      'label-caps relative px-3 py-2 transition-colors duration-200',
                      isActive ? activeClass : inactiveClass,
                    ].join(' ')}
                    onClick={() => handleNav(item)}
                  >
                    {item.label}
                  </button>
                )
              })}
              <span
                aria-hidden="true"
                className={[
                  'pointer-events-none absolute bottom-0 h-0.5 rounded-full',
                  underlineClass,
                  'transition-[left,width,opacity] duration-300 ease-out',
                  underline.ready ? 'opacity-100' : 'opacity-0',
                ].join(' ')}
                style={{ left: underline.left, width: underline.width }}
              />
            </div>
            <button
              type="button"
              className={['rounded-xl p-2 md:hidden', menuBtnClass].join(' ')}
              aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <MaterialIcon name={menuOpen ? 'close' : 'menu'} />
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {menuOpen ? (
            <motion.div
              key="mobile-nav"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={['overflow-hidden border-t md:hidden', mobilePanelClass].join(' ')}
            >
              <div className="flex flex-col gap-1 px-5 py-4">
                {SITE_NAV_ITEMS.map((item) => {
                  const isActive = resolvedActive === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-current={isActive ? 'true' : undefined}
                      className={[
                        'label-caps relative rounded-xl px-3 py-2.5 text-left transition-colors duration-200',
                        isActive ? mobileActive : mobileInactive,
                      ].join(' ')}
                      onClick={() => handleNav(item)}
                    >
                      {item.label}
                      <span
                        aria-hidden="true"
                        className={[
                          'absolute inset-y-1.5 left-0 w-0.5 rounded-full transition-opacity duration-200',
                          mobileBar,
                          isActive ? 'opacity-100' : 'opacity-0',
                        ].join(' ')}
                      />
                    </button>
                  )
                })}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </nav>
    </div>
  )
}

export default SiteHeader
