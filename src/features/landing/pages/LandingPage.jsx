import { Link, useNavigate } from 'react-router-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'
import SiteHeader from '../../../components/common/SiteHeader'
import { Reveal } from '../../../components/motion/Reveal'
import { LANDING_IMAGES } from '../../../constants/landingImagery'
import { useCatalog, useLandingSettings } from '../../../hooks/swr'
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
          className="mx-auto max-w-7xl scroll-mt-14 py-10 md:scroll-mt-32 sm:px-8 sm:py-16 lg:px-16"
        >
          <Reveal className="mb-5 flex items-center justify-between gap-3 px-5 sm:mb-10 sm:px-0">
            <h2 className="font-display text-xl text-primary sm:text-3xl md:text-[2rem]">Bán chạy</h2>
            <Link
              to="/shop"
              className="label-caps shrink-0 text-[10px] text-primary hover:underline sm:text-xs"
            >
              Xem thêm
            </Link>
          </Reveal>

          {productsError ? (
            <p className="mx-5 rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container sm:mx-0">
              {productsError}
            </p>
          ) : null}

          {productsLoading ? (
            <p className="py-16 text-center text-sm text-on-surface-variant">Đang tải sản phẩm...</p>
          ) : products.length === 0 ? (
            <div className="glass-card mx-5 px-6 py-20 text-center sm:mx-0">
              <MaterialIcon name="local_florist" className="text-4xl text-primary-fixed-dim" />
              <p className="mt-3 text-sm font-medium text-on-surface">Chưa có sản phẩm</p>
            </div>
          ) : (
            <FeaturedProductsRail products={products} />
          )}
        </section>

        <section
          id="custom-card"
          className="mx-auto max-w-7xl scroll-mt-14 px-5 py-10 md:scroll-mt-32 sm:px-8 sm:py-16 lg:px-16"
        >
          <Reveal className="glass-card flex flex-row items-center gap-3.5 rounded-2xl p-3.5 sm:gap-8 sm:p-8 md:gap-12 md:p-16">
            <div className="min-w-0 flex-1 text-left">
              <h2 className="mb-1.5 font-display text-xl leading-snug text-primary sm:mb-4 sm:text-3xl md:mb-6 md:text-[2rem]">
                Thiệp số, cảm xúc thật
              </h2>
              <p className="mb-3 line-clamp-3 text-[11px] leading-relaxed text-on-surface-variant sm:mb-6 sm:line-clamp-none sm:text-sm md:mb-8 md:text-base">
                Biến mỗi bó hoa thành một thông điệp độc nhất. Ghi âm giọng nói, tải lên video kỷ
                niệm, hoặc viết một lá thư tay kỹ thuật số. Người nhận chỉ cần quét mã QR đính kèm
                để mở ra những điều bất ngờ.
              </p>
              <Link
                to="/shop/card"
                className="btn-primary inline-flex px-3.5 py-2 text-[10px] sm:px-6 sm:py-3 sm:text-[10px] md:px-8 md:py-4 md:text-xs"
              >
                Tạo thiệp ngay
              </Link>
            </div>
            <div className="relative flex shrink-0 justify-center">
              <div className="relative z-10 h-[148px] w-[72px] overflow-hidden rounded-[14px] border-[3px] border-surface-container-high bg-surface-container-lowest shadow-lg sm:h-[280px] sm:w-[120px] sm:rounded-[24px] sm:border-[5px] sm:shadow-xl md:h-[420px] md:w-56 md:rounded-[32px] md:border-8 md:shadow-2xl">
                <div className="flex h-4 w-full items-end justify-center bg-surface-container-high pb-0.5 sm:h-7 sm:pb-1 md:h-10 md:pb-2">
                  <div className="h-1.5 w-7 rounded-full bg-on-surface sm:h-2.5 sm:w-12 md:h-4 md:w-20" />
                </div>
                <img
                  src={LANDING_IMAGES.qrCard}
                  alt="Giao diện thiệp số trên điện thoại"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div
                className="absolute top-1/2 left-1/2 -z-0 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-container/20 blur-2xl sm:h-56 sm:w-56 sm:blur-3xl md:h-80 md:w-80"
                aria-hidden="true"
              />
            </div>
          </Reveal>
        </section>
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
