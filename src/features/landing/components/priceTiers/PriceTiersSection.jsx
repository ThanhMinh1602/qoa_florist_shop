import { getPriceTierWithImages } from '../../../../constants/priceTiers'
import { useDeviceLayout } from '../../../../hooks/useMediaQuery'
import PriceTiersDesktop from './desktop/PriceTiersDesktop'
import PriceTiersMobile from './mobile/PriceTiersMobile'
import PriceTiersTablet from './tablet/PriceTiersTablet'

function PriceTiersSection({ priceTiers = [], title = 'Chọn theo mức giá' }) {
  const layout = useDeviceLayout()
  const tiers = getPriceTierWithImages(priceTiers)

  if (layout === 'desktop') return <PriceTiersDesktop tiers={tiers} title={title} />
  if (layout === 'tablet') return <PriceTiersTablet tiers={tiers} title={title} />
  return <PriceTiersMobile tiers={tiers} title={title} />
}

export default PriceTiersSection
