import { Link } from 'react-router-dom'
import { Reveal, Stagger, StaggerItem } from '../../../../../components/motion/Reveal'
import { shopPathForPriceTier } from '../../../../../constants/priceTiers'

function PriceTiersDesktop({ tiers }) {
  return (
    <section id="price-tiers" className="mx-auto max-w-7xl scroll-mt-32 px-16 py-16">
      <Reveal className="mb-10 flex items-end justify-between gap-6">
        <div className="max-w-xl">
          <p className="label-caps mb-2 text-xs text-secondary">Bộ sưu tập</p>
          <h2 className="font-display text-[2rem] text-primary">Chọn theo mức giá</h2>
          <p className="mt-3 text-base leading-relaxed text-on-surface-variant">
            Khám phá sản phẩm nổi bật theo từng khoảng giá. Chạm vào ô để xem toàn bộ mẫu hoa phù
            hợp ngân sách của bạn.
          </p>
        </div>
        <Link to="/shop" className="label-caps shrink-0 text-xs text-primary hover:underline">
          Xem tất cả
        </Link>
      </Reveal>

      <Stagger className="grid grid-cols-2 gap-6">
        {tiers.map((tier) => (
          <StaggerItem key={tier.id}>
            <Link
              to={shopPathForPriceTier(tier.id)}
              className="group relative block aspect-[16/10] overflow-hidden rounded-2xl bg-surface-container-low shadow-[0_12px_36px_rgba(74,48,32,0.1)]"
            >
              {tier.coverImage?.url ? (
                <img
                  src={tier.coverImage.url}
                  alt={tier.label}
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-surface-variant" />
              )}

              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-6 pt-20 pb-5">
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-2xl text-white">{tier.label}</h3>
                  <p className="mt-2 max-w-md line-clamp-2 text-sm leading-relaxed text-white/90">
                    {tier.description}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-white/50 bg-white/15 px-5 py-2.5 text-[11px] font-semibold tracking-wide text-white backdrop-blur-sm transition group-hover:bg-white/25">
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

export default PriceTiersDesktop
