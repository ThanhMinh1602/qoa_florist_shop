import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { fetchCatalogApi } from '../../../api/catalogApi'
import { fetchLandingSettingsApi } from '../../../api/settingsApi'
import BrandLogo from '../../../components/common/BrandLogo'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { LANDING_IMAGES, LANDING_STEPS } from '../../../constants/landingImagery'
import { SHOP_IMAGES } from '../../../constants/shopImagery'
import { formatMoney } from '../../../utils/money'
import LandingHeroCarousel from '../components/LandingHeroCarousel'

const STEP_ICONS = ['local_florist', 'qr_code_2', 'local_shipping']
const NAV_OFFSET = 80
const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'products', label: 'Sản phẩm' },
  { id: 'custom-card', label: 'Tạo thiệp' },
]
const SCROLL_LOCK_MS = 1000

function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [heroImages, setHeroImages] = useState([])
  const [heroAutoPlayMs, setHeroAutoPlayMs] = useState(5000)
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState('')
  const [underline, setUnderline] = useState({ left: 0, width: 0, ready: false })
  const navListRef = useRef(null)
  const scrollLockUntilRef = useRef(0)

  const scrollToSection = useCallback((sectionId) => {
    const el = document.getElementById(sectionId)
    if (!el) return
    scrollLockUntilRef.current = Date.now() + SCROLL_LOCK_MS
    setActiveSection(sectionId)
    const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    setMenuOpen(false)
  }, [])

  useLayoutEffect(() => {
    const nav = navListRef.current
    if (!nav) return undefined

    function measure() {
      const activeBtn = nav.querySelector(`[data-nav-id="${activeSection}"]`)
      if (!activeBtn) return
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
  }, [activeSection])

  useEffect(() => {
    const sectionIds = NAV_ITEMS.map((item) => item.id)
    const elements = sectionIds
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
          setActiveSection(visible[0].target.id)
        }
      },
      {
        rootMargin: `-${NAV_OFFSET + 8}px 0px -45% 0px`,
        threshold: [0.15, 0.35, 0.55],
      },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    function unlockScroll() {
      scrollLockUntilRef.current = 0
    }
    window.addEventListener('scrollend', unlockScroll)
    return () => window.removeEventListener('scrollend', unlockScroll)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadHero() {
      try {
        const result = await fetchLandingSettingsApi()
        if (cancelled) return
        const nextImages = Array.isArray(result.data?.heroImages) ? result.data.heroImages : []
        setHeroImages(nextImages.filter((image) => image?.url))
        setHeroAutoPlayMs(result.data?.heroAutoPlayMs || 5000)
      } catch (err) {
        console.error('Không tải được ảnh hero landing:', err)
        if (!cancelled) setHeroImages([])
      }
    }
    loadHero()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadProducts() {
      setProductsLoading(true)
      setProductsError('')
      try {
        const result = await fetchCatalogApi({ sort: 'newest' })
        if (!cancelled) setProducts((result.data || []).slice(0, 3))
      } catch (err) {
        if (!cancelled) setProductsError(err.message || 'Không tải được sản phẩm.')
      } finally {
        if (!cancelled) setProductsLoading(false)
      }
    }
    loadProducts()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (!hash) return
    const sectionId = hash === 'collection' ? 'products' : hash
    const timer = window.setTimeout(() => scrollToSection(sectionId), 80)
    return () => window.clearTimeout(timer)
  }, [scrollToSection])

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background text-on-background antialiased">
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <div className="mesh-wash absolute inset-0" />
      </div>

      <nav className="fixed top-0 z-50 w-full border-b border-white/20 bg-black/20 shadow-[0_12px_40px_rgba(74,48,32,0.08)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:h-20 sm:px-8 lg:px-16">
          <button
            type="button"
            aria-label="QOA Florist"
            className="inline-flex items-center"
            onClick={() => scrollToSection('home')}
          >
            <BrandLogo size="sm" />
          </button>

          <div className="flex items-center gap-2">
            <div ref={navListRef} className="relative hidden items-center gap-2 md:flex">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-nav-id={item.id}
                    aria-current={isActive ? 'true' : undefined}
                    className={[
                      'label-caps relative px-3 py-2 transition-colors duration-200',
                      isActive ? 'text-white' : 'text-white/55 hover:text-white/90',
                    ].join(' ')}
                    onClick={() => scrollToSection(item.id)}
                  >
                    {item.label}
                  </button>
                )
              })}
              <span
                aria-hidden="true"
                className={[
                  'pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-white',
                  'transition-[left,width,opacity] duration-300 ease-out',
                  underline.ready ? 'opacity-100' : 'opacity-0',
                ].join(' ')}
                style={{ left: underline.left, width: underline.width }}
              />
            </div>
            <button
              type="button"
              className="rounded-xl p-2 text-white md:hidden"
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
              className="overflow-hidden border-t border-white/20 bg-black/50 backdrop-blur-xl md:hidden"
            >
              <div className="flex flex-col gap-1 px-5 py-4">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeSection === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-current={isActive ? 'true' : undefined}
                      className={[
                        'label-caps relative rounded-xl px-3 py-2.5 text-left transition-colors duration-200',
                        isActive ? 'text-white' : 'text-white/65',
                      ].join(' ')}
                      onClick={() => scrollToSection(item.id)}
                    >
                      {item.label}
                      <span
                        aria-hidden="true"
                        className={[
                          'absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-white transition-opacity duration-200',
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

      <main>
        <section id="home">
          <LandingHeroCarousel
            images={heroImages}
            autoPlayMs={heroAutoPlayMs}
            onExplore={() => scrollToSection('products')}
            onCustom={() => scrollToSection('custom-card')}
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-16">
          <div className="grid gap-6 md:grid-cols-3">
            {LANDING_STEPS.map((step, index) => (
              <div
                key={step.title}
                className="glass-card flex flex-col items-center rounded-xl p-8 text-center"
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
              </div>
            ))}
          </div>
        </section>

        <section
          id="products"
          className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 lg:px-16"
        >
          <div className="mb-12">
            <h2 className="font-display text-3xl text-primary md:text-[2rem]">Sản phẩm</h2>
          </div>

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
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <li key={product.id} className="glass-card overflow-hidden">
                  <div className="relative aspect-[4/5] overflow-hidden bg-surface-container-low">
                    {product.mainImage ? (
                      <img
                        src={product.mainImage}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="relative flex h-full items-center justify-center">
                        <img
                          src={SHOP_IMAGES.moodPink}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover opacity-50"
                          aria-hidden="true"
                        />
                        <MaterialIcon
                          name="local_florist"
                          className="relative text-5xl text-white"
                        />
                      </div>
                    )}
                    <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/55 bg-surface-container-lowest/55 p-3 backdrop-blur-xl">
                      <p className="font-mono text-[10px] font-bold tracking-wider text-outline">
                        {product.code}
                      </p>
                      <h3 className="font-display mt-0.5 line-clamp-2 text-xl leading-tight text-on-surface">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-primary">
                        {formatMoney(product.price)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          id="custom-card"
          className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 lg:px-16"
        >
          <div className="glass-card flex flex-col items-center gap-12 rounded-2xl p-8 md:flex-row md:p-16">
            <div className="flex-1">
              <h2 className="mb-6 font-display text-3xl text-primary md:text-[2rem]">
                Thiệp số, cảm xúc thật
              </h2>
              <p className="mb-8 text-base text-on-surface-variant">
                Biến mỗi bó hoa thành một thông điệp độc nhất. Ghi âm giọng nói, tải lên video kỷ
                niệm, hoặc viết một lá thư tay kỹ thuật số. Người nhận chỉ cần quét mã QR đính kèm
                để mở ra những điều bất ngờ.
              </p>
              <button
                type="button"
                className="btn-primary inline-flex cursor-default px-8 py-4 opacity-70"
                disabled
                title="Tạm thời chưa mở"
              >
                Tạo thiệp ngay
              </button>
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
          </div>
        </section>
      </main>

      <footer className="flex w-full flex-col items-center justify-center gap-4 border-t border-white/55 px-5 py-16 sm:px-8">
        <p className="font-display text-2xl text-primary">QOA Florist</p>
        <p className="text-sm text-on-surface-variant">
          © {new Date().getFullYear()} QOA Florist. Đánh thức vẻ đẹp tự nhiên.
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <button
            type="button"
            className="label-caps text-on-surface-variant hover:text-primary"
            onClick={() => scrollToSection('products')}
          >
            Sản phẩm
          </button>
          <button
            type="button"
            className="label-caps text-on-surface-variant hover:text-primary"
            onClick={() => scrollToSection('custom-card')}
          >
            Tạo thiệp
          </button>
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
