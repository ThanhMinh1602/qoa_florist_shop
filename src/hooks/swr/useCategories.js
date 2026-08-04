import useSWR from 'swr'
import { fetchCategoriesApi, fetchPublicCategoriesApi } from '../../api/categoriesApi'
import { swrKeys } from './keys'

async function publicCategoriesFetcher() {
  const result = await fetchPublicCategoriesApi()
  return result.data || []
}

async function adminCategoriesFetcher() {
  const result = await fetchCategoriesApi()
  return result.data || []
}

export function usePublicCategories(options = {}) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKeys.publicCategories,
    publicCategoriesFetcher,
    options,
  )

  return {
    categories: data || [],
    error,
    isLoading,
    isValidating,
    mutate,
  }
}

export function useAdminCategories(options = {}) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKeys.adminCategories,
    adminCategoriesFetcher,
    options,
  )

  return {
    categories: data || [],
    error,
    isLoading,
    isValidating,
    mutate,
  }
}
