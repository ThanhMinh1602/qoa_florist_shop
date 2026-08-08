/** 4 mức giá giới thiệu trên trang chủ — đồng bộ với lọc shop */
export const PRICE_TIER_IDS = ['under-100', '100-150', '150-200', 'over-200']

export const PRICE_TIERS = [
  {
    id: 'under-100',
    label: 'Dưới 100k',
    description: 'Bó hoa nhỏ xinh — tặng nhanh, gửi lời yêu thương nhẹ nhàng.',
    minPrice: null,
    maxPrice: 99999,
    icon: 'local_florist',
  },
  {
    id: '100-150',
    label: '100k – 150k',
    description: 'Lựa chọn phổ biến cho bạn bè, đồng nghiệp và người thân.',
    minPrice: 100000,
    maxPrice: 150000,
    icon: 'favorite',
  },
  {
    id: '150-200',
    label: '150k – 200k',
    description: 'Bó hoa chỉn chu hơn — phù hợp kỷ niệm và lời cảm ơn đặc biệt.',
    minPrice: 150000,
    maxPrice: 200000,
    icon: 'spa',
  },
  {
    id: 'over-200',
    label: 'Trên 200k',
    description: 'Thiết kế nổi bật, ấn tượng — dành cho dịp quan trọng.',
    minPrice: 200001,
    maxPrice: null,
    icon: 'auto_awesome',
  },
]

export function getPriceTierWithImages(savedTiers = []) {
  const byId = new Map(
    (Array.isArray(savedTiers) ? savedTiers : []).map((tier) => [tier.id, tier]),
  )

  return PRICE_TIERS.map((tier) => {
    const saved = byId.get(tier.id)
    const images = (saved?.images || []).filter((image) => image?.url)
    return {
      ...tier,
      description: saved?.description?.trim() || tier.description,
      images,
      coverImage: images[0] || null,
    }
  })
}

export function shopPathForPriceTier(tierId) {
  return `/shop?price=${encodeURIComponent(tierId)}`
}
