import { Link, Outlet } from 'react-router-dom'
import BrandLogo from '../../../components/common/BrandLogo'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { useCart } from '../context/CartContext'

function ShopLayout() {
  const { count } = useCart()

  return (
    <div className="min-h-dvh bg-[radial-gradient(ellipse_at_top,_#fff1f2_0%,_#ffffff_45%,_#f8fafc_100%)]">
      <header className="sticky top-0 z-40 border-b border-rose-100/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/shop" className="flex items-center gap-3">
            <BrandLogo size="xs" />
            <div>
              <p className="font-[Georgia,serif] text-lg leading-none text-slate-900">QOA Florist</p>
              <p className="mt-0.5 text-[11px] tracking-wide text-rose-500">Shop hoa online</p>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              to="/shop"
              className="hidden rounded-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700 sm:inline"
            >
              Sản phẩm
            </Link>
            <Link
              to="/shop/cart"
              className="relative inline-flex items-center gap-1 rounded-full bg-rose-500 px-3.5 py-2 text-sm font-semibold text-white hover:bg-rose-600"
            >
              <MaterialIcon name="shopping_bag" className="text-lg" />
              Giỏ
              {count > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              ) : null}
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>

      <footer className="border-t border-rose-100 bg-white/70 px-4 py-6 text-center text-xs text-slate-500">
        QOA Florist · Đặt hoa online · Liên hệ Zalo sau khi đặt hàng
      </footer>
    </div>
  )
}

export default ShopLayout
