import { Link, useNavigate } from 'react-router-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'
import SiteHeader from '../../../components/common/SiteHeader'
import { Reveal, Stagger, StaggerItem } from '../../../components/motion/Reveal'
import { LANDING_IMAGES, LANDING_STEPS } from '../../../constants/landingImagery'
import { useCatalog, useLandingSettings } from '../../../hooks/swr'
import LandingHeroCarousel from '../components/LandingHeroCarousel'
import FeaturedProductsRail from '../components/FeaturedProductsRail'

const STEP_ICONS = ['local_florist', 'qr_code_2', 'local_shipping']
const LANDING_SCROLL_SECTIONS = ['home', 'featured', 'custom-card']

function LandingPage() {
  const navigate = useNavigate()
  const { heroImages, heroAutoPlayMs } = useLandingSettings()
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
        <section id="home">
          <LandingHeroCarousel
            images={heroImages}
            autoPlayMs={heroAutoPlayMs}
            onExplore={() => navigate('/shop')}
            onCustom={() => navigate('/shop/card')}
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-16">
          <Stagger className="grid gap-6 md:grid-cols-3">
            {LANDING_STEPS.map((step, index) => (
              <StaggerItem
                key={step.title}
                className="glass-card lift-card flex flex-col items-center rounded-xl p-8 text-center"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-surface-variant">
                  <MaterialIcon
                    name={STEP_ICONS[index] || 'local_florist'}
                    className="text-[32px] text-primary"
                  />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-primary">
                  {step.title.replace(/^\d+\.\s*/, '')}
                </h3>
                <p className="text-sm text-on-surface-variant">{step.description}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <section
          id="featured"
          className="mx-auto max-w-7xl scroll-mt-32 px-5 py-16 sm:px-8 lg:px-16"
        >
          <Reveal className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="label-caps text-primary">Gợi ý hôm nay</p>
              <h2 className="font-display mt-1 text-3xl text-primary md:text-[2rem]">Bán chạy</h2>
            </div>
            <Link to="/shop" className="label-caps shrink-0 text-primary hover:underline">
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
          ) : (
            <FeaturedProductsRail products={products} />
          )}
        </section>

        <section
          id="custom-card"
          className="mx-auto max-w-7xl scroll-mt-32 px-5 py-16 sm:px-8 lg:px-16"
        >
          <Reveal className="glass-card flex flex-col items-center gap-12 rounded-2xl p-8 md:flex-row md:p-16">
            <div className="flex-1">
              <h2 className="mb-6 font-display text-3xl text-primary md:text-[2rem]">
                Thiệp số, cảm xúc thật
              </h2>
              <p className="mb-8 text-base text-on-surface-variant">
                Biến mỗi bó hoa thành một thông điệp độc nhất. Ghi âm giọng nói, tải lên video kỷ
                niệm, hoặc viết một lá thư tay kỹ thuật số. Người nhận chỉ cần quét mã QR đính kèm
                để mở ra những điều bất ngờ.
              </p>
              <Link to="/shop/card" className="btn-primary inline-flex px-8 py-4">
                Tạo thiệp ngay
              </Link>
            </div>
            <div className="relative flex flex-1 justify-center">
              <div className="relative z-10 h-[420px] w-56 overflow-hidden rounded-[32px] border-8 border-surface-container-high bg-surface-container-lowest shadow-2xl sm:h-[500px] sm:w-64">
                <div className="flex h-10 w-full items-end justify-center bg-surface-container-high pb-2">
                  <div className="h-4 w-20 rounded-full bg-on-surface" />
                </div>
                <img
                  src={LANDING_IMAGES.qrCard}
                  alt="Giao diện thiệp số trên điện thoại"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div
                className="absolute top-1/2 left-1/2 -z-0 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-container/20 blur-3xl"
                aria-hidden="true"
              />
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="flex w-full flex-col items-center justify-center gap-4 border-t border-white/55 px-5 py-16 sm:px-8">
        <p className="font-display text-2xl text-primary">QOA Florist</p>
        <p className="text-sm text-on-surface-variant">
          © {new Date().getFullYear()} QOA Florist. Đánh thức vẻ đẹp tự nhiên.
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <Link to="/#featured" className="label-caps text-on-surface-variant hover:text-primary">
            Bán chạy
          </Link>
          <Link to="/shop" className="label-caps text-on-surface-variant hover:text-primary">
            Sản phẩm
          </Link>
          <Link to="/shop/card" className="label-caps text-on-surface-variant hover:text-primary">
            Tạo thiệp
          </Link>
          <a
            href="mailto:hello@qoaflorist.com"
            className="label-caps text-on-surface-variant hover:text-primary"
          >
            Liên hệ
          </a>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
