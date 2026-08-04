import useSWR from 'swr'
import { fetchStatsOverviewApi } from '../../api/statsApi'
import { swrKeys } from './keys'

async function statsFetcher() {
  const result = await fetchStatsOverviewApi()
  return result.data
}

export function useStatsOverview(options = {}) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKeys.statsOverview,
    statsFetcher,
    options,
  )

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  }
}
