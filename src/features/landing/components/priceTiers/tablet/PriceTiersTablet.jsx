import { Link } from 'react-router-dom'
import { Stagger, StaggerItem } from '../../../../../components/motion/Reveal'
import { shopPathForPriceTier } from '../../../../../constants/priceTiers'

function PriceTiersTablet({ tiers }) {
  return (
    <section id="price-tiers" className="mx-auto max-w-7xl scroll-mt-20 px-8 py-14">
      <div className="mb-8 max-w-xl">
        <p className="label-caps mb-2 text-xs text-secondary">Bộ sưu tập</p>
        <h2 className="font-display text-3xl text-primary">Chọn theo mức giá</h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          Bốn khoảng giá rõ ràng — mỗi ô là những mẫu hoa nổi bật trong tầm ngân sách của bạn.
        </p>
      </div>

      <Stagger className="grid grid-cols-2 gap-5">
        {tiers.map((tier) => (
          <StaggerItem key={tier.id}>
            <Link
              to={shopPathForPriceTier(tier.id)}
              className="group relative block aspect-[5/4] overflow-hidden rounded-2xl bg-surface-container-low shadow-[0_10px_28px_rgba(74,48,32,0.08)]"
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

              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/70 via-black/35 to-transparent px-4 pt-14 pb-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-white">{tier.label}</h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-white/88">
                    {tier.description}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-white/45 bg-white/15 px-3.5 py-1.5 text-[10px] font-semibold tracking-wide text-white backdrop-blur-sm transition group-hover:bg-white/25">
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

export default PriceTiersTablet
