import { Link } from 'react-router-dom'
import { Stagger, StaggerItem } from '../../../../../components/motion/Reveal'
import { shopPathForPriceTier } from '../../../../../constants/priceTiers'

function PriceTiersMobile({ tiers }) {
  return (
    <section id="price-tiers" className="mx-auto max-w-7xl scroll-mt-14 px-5 py-10">
      <div className="mb-5">
        <p className="label-caps mb-1 text-[10px] text-secondary">Bộ sưu tập</p>
        <h2 className="font-display text-xl text-primary">Chọn theo mức giá</h2>
      </div>

      <Stagger className="grid grid-cols-2 gap-3" faster>
        {tiers.map((tier) => (
          <StaggerItem key={tier.id}>
            <Link
              to={shopPathForPriceTier(tier.id)}
              className="group relative block aspect-[4/5] overflow-hidden rounded-xl bg-surface-container-low shadow-[0_8px_24px_rgba(74,48,32,0.08)]"
            >
              {tier.coverImage?.url ? (
                <img
                  src={tier.coverImage.url}
                  alt={tier.label}
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-surface-variant" />
              )}

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-2.5 pt-12 pb-2.5">
                <h3 className="text-xs font-semibold leading-snug text-white">{tier.label}</h3>
                <p className="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-white/85">
                  {tier.description}
                </p>
                <span className="mt-2 inline-flex rounded-full border border-white/45 bg-white/15 px-2.5 py-1 text-[9px] font-semibold tracking-wide text-white backdrop-blur-sm">
                  Xem thêm
                </span>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}

export default PriceTiersMobile
