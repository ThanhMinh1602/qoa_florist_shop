import { useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation, useNavigationType, useOutlet } from 'react-router-dom'
import {
  adminMobileSlideTransition,
  adminMobileSlideVariants,
  adminPageTransition,
  shopPageTransition,
} from '../../lib/motion'
import { useIsLgUp } from '../../hooks/useMediaQuery'


function isCategoryEditorPath(path) {
  return path === '/admin/categories/new' || /^\/admin\/categories\/[^/]+\/edit$/.test(path)
}

function isOrderOverlayPath(path) {
  return false
}

/** Giữ layout /admin/products không remount khi vào nested detail */
function outletAnimationKey(pathname) {
  if (
    pathname === '/admin/categories' ||
    isCategoryEditorPath(pathname)
  ) {
    return '/admin/categories'
  }
  if (pathname === '/admin/products') {
    return '/admin/products'
  }
  if (pathname === '/admin/manage') {
    return '/admin/manage'
  }
  return pathname
}

function isProductDetailPath(path) {
  return path === '/admin/products/new' || /^\/admin\/products\/[^/]+$/.test(path)
}

function isFillHeightAdminPath(path) {
  if (path === '/admin/manage' || path === '/admin/products') return true
  if (path === '/admin/orders/new' || path === '/admin/orders/import') return true
  if (isProductDetailPath(path)) return true
  // Full-page order detail (not import overlay)
  if (
    /^\/admin\/orders\/[^/]+$/.test(path) &&
    path !== '/admin/orders/import'
  ) {
    return true
  }
  return false
}

function resolveAdminDirection(fromPath, toPath, navType) {
  if (navType === 'POP') return -1

  if (toPath.startsWith(`${fromPath}/`)) return 1
  if (fromPath.startsWith(`${toPath}/`)) return -1

  return 1
}

function AdminFillShell({ children }) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      {children}
    </div>
  )
}

function isTransparentAdminPath(path) {
  return false
}

function AnimatedOutlet({ variant = 'shop' }) {
  const location = useLocation()
  const outlet = useOutlet()
  const navType = useNavigationType()
  const isLgUp = useIsLgUp()

  const animKey = outletAnimationKey(location.pathname)
  const prevPathRef = useRef(location.pathname)
  const directionRef = useRef(1)
  const outletByPathRef = useRef(new Map())

  if (outlet) {
    outletByPathRef.current.set(animKey, outlet)
  }

  if (prevPathRef.current !== location.pathname) {
    directionRef.current = resolveAdminDirection(
      prevPathRef.current,
      location.pathname,
      navType,
    )
    prevPathRef.current = location.pathname
  }

  if (variant === 'admin' && isFillHeightAdminPath(animKey)) {
    const pathname = location.pathname
    if (isOrderOverlayPath(pathname)) {
      return outlet
    }
    return <AdminFillShell>{outlet}</AdminFillShell>
  }

  if (variant === 'admin' && !isLgUp) {
    // List + detail sản phẩm: detail portal tự slide; list/header luôn giữ
    if (animKey === '/admin/products') {
      return <div className="min-h-full">{outlet}</div>
    }

    const direction = directionRef.current
    const pageBg = isTransparentAdminPath(animKey) ? 'bg-transparent' : 'bg-background'

    return (
      <div className="relative min-h-full overflow-x-clip">
        <AnimatePresence
          initial={false}
          custom={direction}
          onExitComplete={() => {
            for (const path of [...outletByPathRef.current.keys()]) {
              if (path !== animKey) outletByPathRef.current.delete(path)
            }
          }}
        >
          <motion.div
            key={animKey}
            custom={direction}
            variants={adminMobileSlideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={adminMobileSlideTransition}
            className={`min-h-full w-full ${pageBg}`}
            style={{ willChange: 'transform' }}
          >
            {outletByPathRef.current.get(animKey) ?? outlet}
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  const motionProps = variant === 'admin' ? adminPageTransition : shopPageTransition

  return (
    <motion.div key={animKey} {...motionProps}>
      {outlet}
    </motion.div>
  )
}

export default AnimatedOutlet
