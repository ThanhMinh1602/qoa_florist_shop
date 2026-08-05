import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import SiteHeader from '../../../components/common/SiteHeader'
import AnimatedOutlet from '../../../components/motion/AnimatedOutlet'

function ShopLayout() {
  const location = useLocation()

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname, location.key])

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background text-on-background">
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <div className="mesh-wash absolute inset-0" />
      </div>

      <SiteHeader
        variant="page"
        activeId={location.pathname.startsWith('/shop/card') ? 'custom-card' : 'products'}
      />

      <main className="pt-24 sm:pt-28">
        <AnimatedOutlet variant="shop" />
      </main>

      <footer className="relative mt-16 border-t border-white/55">
        <div className="mx-auto max-w-7xl px-5 py-12 text-center sm:px-8">
          <p className="font-display text-3xl text-primary">QOA Florist</p>
          <p className="mt-2 text-sm text-on-surface-variant">
            Hoa tươi mỗi ngày · Thiệp QR trên bó hoa · Giao tận nơi
          </p>
          <p className="mt-6 text-sm text-outline">© {new Date().getFullYear()} QOA Florist</p>
        </div>
      </footer>
    </div>
  )
}

export default ShopLayout
