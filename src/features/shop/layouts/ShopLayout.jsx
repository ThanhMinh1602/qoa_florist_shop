import { Link, Outlet, useLocation } from 'react-router-dom'
import BrandLogo from '../../../components/common/BrandLogo'

function ShopLayout() {
  const { pathname } = useLocation()
  const isCatalogHome = pathname === '/shop' || pathname === '/shop/'

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background text-on-background">
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <div className="mesh-wash absolute inset-0" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/55 bg-surface/75 shadow-[0_12px_40px_rgba(74,48,32,0.08)] backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5 sm:h-20 sm:px-8 lg:px-16">
          <Link to="/" aria-label="QOA Florist" className="inline-flex items-center">
            <BrandLogo size="sm" />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link to="/#home" className="label-caps text-on-surface-variant transition hover:text-primary">
              Home
            </Link>
            <Link
              to="/#products"
              className="label-caps text-on-surface-variant transition hover:text-primary"
            >
              Sản phẩm
            </Link>
            <Link
              to="/#custom-card"
              className="label-caps text-on-surface-variant transition hover:text-primary"
            >
              Tạo thiệp
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/custom" className="btn-primary !rounded-xl !px-4 !py-2.5 sm:!px-6">
              Tạo thiệp
            </Link>
          </div>
        </div>
      </header>

      <main>
        {isCatalogHome ? (
          <Outlet />
        ) : (
          <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8 sm:py-8">
            <Outlet />
          </div>
        )}
      </main>

      <footer className="relative mt-20 border-t border-outline-variant/20">
        <div className="mx-auto max-w-6xl px-5 py-12 text-center sm:px-8">
          <p className="font-display text-3xl text-primary">QOA Florist</p>
          <p className="mt-2 text-sm text-on-surface-variant">
            Hoa tươi mỗi ngày · Thiệp QR trên bó hoa · Giao tận nơi
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-outline">
            <span>© {new Date().getFullYear()} QOA Florist</span>
            <span>·</span>
            <Link to="/custom" className="hover:text-primary">
              Tạo thiệp
            </Link>
            <span>·</span>
            <Link to="/#products" className="hover:text-primary">
              Sản phẩm
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default ShopLayout
