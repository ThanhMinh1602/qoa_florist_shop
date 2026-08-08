import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Reveal } from '../../../../../components/motion/Reveal'
import { viewportOnce } from '../../../../../lib/motion'
import PriceTierCard, { priceTierStagger } from '../PriceTierCard'

/** Desktop: lưới 2×2 — 4 thẻ */
function PriceTiersDesktop({ tiers }) {
  return (
    <section id="price-tiers" className="mx-auto w-full max-w-7xl scroll-mt-32 px-10 py-14 lg:px-16 lg:py-16">
      <Reveal className="mb-9 flex items-end justify-between gap-6 lg:mb-10">
        <h2 className="font-display text-[1.75rem] text-primary lg:text-[2rem]">
          Chọn theo mức giá
        </h2>
        <Link
          to="/shop"
          className="label-caps group inline-flex shrink-0 items-center gap-1 text-xs text-primary transition hover:gap-2"
        >
          Xem tất cả
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </Reveal>

      <motion.div
        className="grid grid-cols-2 gap-5 lg:gap-6"
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={priceTierStagger}
      >
        {tiers.map((tier) => (
          <PriceTierCard key={tier.id} tier={tier} size="desktop" />
        ))}
      </motion.div>
    </section>
  )
}

export default PriceTiersDesktop
