import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import MaterialIcon from '../../../../components/common/MaterialIcon'
import { easeOut } from '../../../../lib/motion'
import { shopPathForPriceTier } from '../../../../constants/priceTiers'
import { cloudinaryUrl } from '../../../../utils/cloudinaryUrl'

/** Cùng bố cục 2×2 — chỉ scale typography / tỉ lệ thẻ theo thiết bị */
const SIZE = {
  mobile: {
    aspect: 'aspect-[3/4]',
    radius: 'rounded-xl',
    pad: 'px-2.5 pb-2.5 pt-10',
    title: 'text-[12px] font-semibold leading-snug tracking-tight',
    desc: 'mt-0.5 line-clamp-2 text-[9px] leading-snug text-white/78',
    cta: 'mt-2 self-start gap-1 px-2.5 py-1 text-[8px]',
    arrow: 'text-[10px]',
    lift: false,
  },
  tablet: {
    aspect: 'aspect-[5/4]',
    radius: 'rounded-2xl',
    pad: 'px-4 pb-4 pt-14',
    title: 'text-lg font-semibold tracking-tight sm:text-xl',
    desc: 'mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-white/82',
    cta: 'mt-3 self-start px-3.5 py-1.5 text-[10px]',
    arrow: 'text-[12px]',
    lift: true,
  },
  desktop: {
    aspect: 'aspect-[16/10]',
    radius: 'rounded-[1.75rem]',
    pad: 'px-6 pb-6 pt-20',
    title: 'font-display text-2xl tracking-tight xl:text-[1.75rem]',
    desc: 'mt-2 max-w-md line-clamp-2 text-sm leading-relaxed text-white/85 xl:text-[15px]',
    cta: 'mt-4 self-start px-5 py-2.5 text-[11px]',
    arrow: 'text-[14px]',
    lift: true,
  },
}

export const priceTierCardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: easeOut },
  },
}

export const priceTierStagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.08 },
  },
}

function PriceTierCard({ tier, size = 'desktop', preview = false }) {
  const reduceMotion = useReducedMotion()
  const s = SIZE[size] || SIZE.desktop
  const canLift = s.lift && !reduceMotion && !preview

  const body = (
      <>
        {tier.coverImage?.url ? (
          <img
            src={cloudinaryUrl(tier.coverImage.url, { width: 800 })}
            alt={tier.label}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface-variant via-[#e8ddd0] to-[#cbb8a8]" />
        )}

        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/5"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 hidden opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:block"
          style={{
            background:
              'radial-gradient(120% 80% at 50% 120%, rgba(250,247,242,0.2), transparent 55%)',
          }}
          aria-hidden="true"
        />
        <div
          className="price-tier-shine pointer-events-none absolute inset-0 hidden md:block"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/20"
          aria-hidden="true"
        />

        <div className={['absolute inset-x-0 bottom-0 z-10 flex flex-col', s.pad].join(' ')}>
          <h3 className={['text-white', s.title].join(' ')}>{tier.label}</h3>
          <p className={s.desc}>{tier.description}</p>

          <span
            className={[
              'inline-flex items-center rounded-full border border-white/35 bg-white/12 font-semibold tracking-[0.1em] text-white uppercase backdrop-blur-md transition duration-300',
              'md:group-hover:border-transparent md:group-hover:bg-white md:group-hover:text-primary',
              s.cta,
            ].join(' ')}
          >
            Xem thêm
            <MaterialIcon
              name="arrow_forward"
              className={[s.arrow, 'transition-transform duration-300 md:group-hover:translate-x-0.5'].join(
                ' ',
              )}
            />
          </span>
        </div>
      </>
  )

  const shellClass = [
    'price-tier-card group relative block w-full overflow-hidden bg-[#2c1a12]',
    s.aspect,
    s.radius,
  ].join(' ')

  return (
    <motion.div
      variants={preview ? undefined : priceTierCardVariants}
      className="min-w-0"
      whileHover={canLift ? { y: -6 } : undefined}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
    >
      {preview ? (
        <div className={shellClass} aria-hidden="true">
          {body}
        </div>
      ) : (
        <Link to={shopPathForPriceTier(tier.id)} className={shellClass}>
          {body}
        </Link>
      )}
    </motion.div>
  )
}

export default PriceTierCard
