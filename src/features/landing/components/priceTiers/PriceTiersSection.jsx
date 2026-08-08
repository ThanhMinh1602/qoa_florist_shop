import { getPriceTierWithImages } from '../../../../constants/priceTiers'
import { useDeviceLayout } from '../../../../hooks/useMediaQuery'
import PriceTiersDesktop from './desktop/PriceTiersDesktop'
import PriceTiersMobile from './mobile/PriceTiersMobile'
import PriceTiersTablet from './tablet/PriceTiersTablet'

function PriceTiersSection({ priceTiers = [] }) {
  const layout = useDeviceLayout()
  const tiers = getPriceTierWithImages(priceTiers)

  if (layout === 'desktop') return <PriceTiersDesktop tiers={tiers} />
  if (layout === 'tablet') return <PriceTiersTablet tiers={tiers} />
  return <PriceTiersMobile tiers={tiers} />
}

export default PriceTiersSection
