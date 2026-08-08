import useSWR from 'swr'
import { fetchLandingSettingsApi } from '../../api/settingsApi'
import { mergeLandingCopy } from '../../constants/landingCopy'
import { PRICE_TIERS } from '../../constants/priceTiers'
import { swrKeys } from './keys'

async function landingSettingsFetcher() {
  const result = await fetchLandingSettingsApi()
  return result.data || {}
}

export function useLandingSettings(options = {}) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKeys.landingSettings,
    landingSettingsFetcher,
    options,
  )

  const copy = mergeLandingCopy(data)

  return {
    settings: data,
    heroImages: (data?.heroImages || []).filter((image) => image?.url),
    heroAutoPlayMs: data?.heroAutoPlayMs || 5000,
    priceTiers: data?.priceTiers || PRICE_TIERS.map((tier) => ({ id: tier.id, description: '', images: [] })),
    copy,
    error,
    isLoading,
    isValidating,
    mutate,
  }
}
