import useSWR from 'swr'
import { fetchCashbookApi } from '../../api/cashbookApi'
import { swrKeys } from './keys'

async function cashbookFetcher([, params]) {
  const result = await fetchCashbookApi(params)
  return {
    entries: result.data || [],
    totals: result.totals || { income: 0, expense: 0, balance: 0 },
  }
}

export function useCashbook(params = {}, options = {}) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKeys.cashbook(params),
    cashbookFetcher,
    options,
  )

  return {
    entries: data?.entries || [],
    totals: data?.totals || { income: 0, expense: 0, balance: 0 },
    error,
    isLoading,
    isValidating,
    mutate,
  }
}
