import { Link, useNavigate } from 'react-router-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'
import SiteHeader from '../../../components/common/SiteHeader'
import { Reveal } from '../../../components/motion/Reveal'
import { useCatalog, useLandingSettings } from '../../../hooks/swr'
import CustomCardSection from '../components/CustomCardSection'
import LandingHeroCarousel from '../components/LandingHeroCarousel'
import FeaturedProductsRail from '../components/FeaturedProductsRail'
import PriceTiersSection from '../components/priceTiers/PriceTiersSection'

const LANDING_SCROLL_SECTIONS = ['home', 'price-tiers', 'featured', 'custom-card']

function LandingPage() {
  const navigate = useNavigate()
  const { heroImages, heroAutoPlayMs, priceTiers } = useLandingSettings()
  const {
    products,
    isLoading: productsLoading,
    error: catalogError,
  } = useCatalog({ sort: 'popular', page: 1, limit: 10 })
  const productsError = catalogError?.message || ''

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background text-on-background antialiased">
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <div className="mesh-wash absolute inset-0" />
      </div>

      <SiteHeader variant="hero" scrollSections={LANDING_SCROLL_SECTIONS} />

      <main>
        <section id="home" className="pt-12 md:pt-0">
          <LandingHeroCarousel
            images={heroImages}
            autoPlayMs={heroAutoPlayMs}
            onExplore={() => navigate('/shop')}
            onCustom={() => navigate('/shop/card')}
          />
        </section>

        <PriceTiersSection priceTiers={priceTiers} />

        <section
          id="featured"
          className="scroll-mt-14 bg-transparent py-10 md:scroll-mt-32 sm:py-16"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-16">
            <Reveal className="mb-5 flex items-center justify-between gap-3 sm:mb-10">
              <h2 className="font-display text-xl text-primary sm:text-3xl md:text-[2rem]">Bán chạy</h2>
              <Link
                to="/shop"
                className="label-caps shrink-0 text-[10px] text-primary hover:underline sm:text-xs"
              >
                Xem thêm
              </Link>
            </Reveal>

            {productsError ? (
              <p className="rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">
                {productsError}
              </p>
            ) : null}

            {productsLoading ? (
              <p className="py-16 text-center text-sm text-on-surface-variant">Đang tải sản phẩm...</p>
            ) : products.length === 0 ? (
              <div className="glass-card px-6 py-20 text-center">
                <MaterialIcon name="local_florist" className="text-4xl text-primary-fixed-dim" />
                <p className="mt-3 text-sm font-medium text-on-surface">Chưa có sản phẩm</p>
              </div>
            ) : null}
          </div>

          {!productsLoading && !productsError && products.length > 0 ? (
            <div className="w-full">
              <FeaturedProductsRail products={products} />
            </div>
          ) : null}
        </section>

        <CustomCardSection />
      </main>

      <footer className="flex w-full flex-col items-center justify-center gap-3 border-t border-white/55 px-5 py-12 sm:gap-4 sm:px-8 sm:py-16">
        <p className="font-display text-xl text-primary sm:text-2xl">QOA Florist</p>
        <p className="text-center text-xs text-on-surface-variant sm:text-sm">
          © {new Date().getFullYear()} QOA Florist. Đánh thức vẻ đẹp tự nhiên.
        </p>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          <Link
            to="/#featured"
            className="label-caps text-[10px] text-on-surface-variant hover:text-primary sm:text-xs"
          >
            Bán chạy
          </Link>
          <Link
            to="/shop"
            className="label-caps text-[10px] text-on-surface-variant hover:text-primary sm:text-xs"
          >
            Sản phẩm
          </Link>
          <Link
            to="/shop/card"
            className="label-caps text-[10px] text-on-surface-variant hover:text-primary sm:text-xs"
          >
            Tạo thiệp
          </Link>
          <a
            href="mailto:hello@qoaflorist.com"
            className="label-caps text-[10px] text-on-surface-variant hover:text-primary sm:text-xs"
          >
            Liên hệ
          </a>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
