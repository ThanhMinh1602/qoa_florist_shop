import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import BrandLogo from './BrandLogo'
import MaterialIcon from './MaterialIcon'
import { Reveal } from '../motion/Reveal'
import { useLandingSettings } from '../../hooks/swr'
import { viewportOnce } from '../../lib/motion'
import { getZaloShopPhone } from '../../utils/zalo'

const FOOTER_LINKS = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Bán chạy', to: '/#featured' },
  { label: 'Sản phẩm', to: '/shop' },
  { label: 'Tạo thiệp', to: '/shop/card' },
]

function SiteFooter() {
  const reduceMotion = useReducedMotion()
  const { copy } = useLandingSettings()
  const zaloPhone = (copy.footerZaloPhone || getZaloShopPhone()).replace(/\s/g, '')
  const year = new Date().getFullYear()
  const email = copy.footerEmail || 'hello@qoaflorist.com'

  return (
    <footer className="site-footer relative mt-6 overflow-hidden sm:mt-10">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface-container-low/80 to-surface-dim" />
        <div className="site-footer-glow absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-outline-variant/50 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-16 lg:py-24">
        <Reveal className="flex flex-col items-center text-center">
          <BrandLogo size="sm" center className="mb-5 sm:mb-6" />

          <motion.p
            className="font-display text-[2rem] tracking-tight text-primary sm:text-5xl md:text-[3.25rem]"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.05 }}
          >
            {copy.footerBrand}
          </motion.p>

          <motion.p
            className="mt-3 max-w-md text-sm leading-relaxed text-on-surface-variant sm:mt-4 sm:text-base"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.5, delay: 0.12 }}
          >
            {copy.footerTagline}
          </motion.p>
        </Reveal>

        <motion.nav
          className="mt-8 flex flex-wrap items-center justify-center gap-x-1 gap-y-2 sm:mt-10"
          aria-label="Footer"
          initial={reduceMotion ? false : 'hidden'}
          whileInView={reduceMotion ? undefined : 'show'}
          viewport={viewportOnce}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
          }}
        >
          {FOOTER_LINKS.map((link, index) => (
            <motion.div
              key={link.to}
              className="flex items-center"
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { type: 'spring', stiffness: 360, damping: 22 },
                },
              }}
            >
              {index > 0 ? (
                <span className="mx-2 h-1 w-1 rounded-full bg-outline-variant/70 sm:mx-3" aria-hidden="true" />
              ) : null}
              <Link
                to={link.to}
                className="label-caps px-1.5 py-1 text-[10px] text-on-surface-variant transition hover:text-primary sm:text-xs"
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </motion.nav>

        <Reveal className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-10" delay={0.18}>
          <a
            href={`https://zalo.me/${zaloPhone}`}
            target="_blank"
            rel="noreferrer"
            className="site-footer-cta inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary px-5 py-2.5 text-[10px] font-bold tracking-[0.12em] text-on-primary uppercase transition hover:-translate-y-0.5 hover:bg-primary-container sm:text-[11px]"
          >
            <MaterialIcon name="chat" className="text-base" filled />
            Chat Zalo
          </a>
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-2 rounded-full border border-outline-variant/40 bg-white/55 px-5 py-2.5 text-[10px] font-bold tracking-[0.12em] text-primary uppercase backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/80 sm:text-[11px]"
          >
            <MaterialIcon name="mail" className="text-base" />
            Liên hệ
          </a>
        </Reveal>

        <div className="mt-12 flex flex-col items-center gap-2 border-t border-outline-variant/25 pt-6 sm:mt-14 sm:pt-8">
          <p className="text-[11px] text-on-surface-variant sm:text-xs">
            © {year} {copy.footerBrand}. {copy.footerCopyright}
          </p>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
