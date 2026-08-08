import { motion } from 'framer-motion'
import { viewportOnce } from '../../../../../lib/motion'
import PriceTierCard, { priceTierStagger } from '../PriceTierCard'

/** iPad / tablet: lưới 2×2 — 4 thẻ */
function PriceTiersTablet({ tiers }) {
  return (
    <section id="price-tiers" className="mx-auto w-full max-w-7xl scroll-mt-20 px-6 py-12 md:px-8 md:py-14">
      <motion.div
        className="mb-7"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportOnce}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="font-display text-2xl text-primary md:text-3xl">Chọn theo mức giá</h2>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 gap-4 md:gap-5"
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={priceTierStagger}
      >
        {tiers.map((tier) => (
          <PriceTierCard key={tier.id} tier={tier} size="tablet" />
        ))}
      </motion.div>
    </section>
  )
}

export default PriceTiersTablet
