import useSWR from 'swr'
import { fetchProductsApi } from '../../api/productsApi'
import { swrKeys } from './keys'

async function productsFetcher([, active]) {
  const result = await fetchProductsApi(active === 'all' ? undefined : active)
  return result.data || []
}

export function useProducts(active, options = {}) {
  const keyActive = active === undefined ? 'all' : active
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKeys.products(keyActive),
    productsFetcher,
    options,
  )

  return {
    products: data || [],
    error,
    isLoading,
    isValidating,
    mutate,
  }
}
