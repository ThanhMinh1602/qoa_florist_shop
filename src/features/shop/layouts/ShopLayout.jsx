import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import SiteFooter from '../../../components/common/SiteFooter'
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

      <main className="pt-12 md:pt-24 lg:pt-28">
        <AnimatedOutlet variant="shop" />
      </main>

      <SiteFooter />
    </div>
  )
}

export default ShopLayout
