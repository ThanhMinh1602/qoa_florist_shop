import { motion } from 'framer-motion'
import { viewportOnce } from '../../../../../lib/motion'
import PriceTierCard from '../PriceTierCard'

/** Điện thoại: lưới 2×2 — đúng 4 thẻ như desktop/tablet */
function PriceTiersMobile({ tiers, title = 'Chọn theo mức giá' }) {
  return (
    <section id="price-tiers" className="mx-auto w-full max-w-7xl scroll-mt-14 px-4 py-8 sm:px-5">
      <motion.div
        className="mb-4"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportOnce}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="font-display text-lg text-primary sm:text-xl">{title}</h2>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 gap-2.5"
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
        }}
      >
        {tiers.map((tier) => (
          <PriceTierCard key={tier.id} tier={tier} size="mobile" />
        ))}
      </motion.div>
    </section>
  )
}

export default PriceTiersMobile
