import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'
import { fetchCatalogApi, fetchCatalogProductApi } from '../../api/catalogApi'
import { CATALOG_PAGE_SIZE } from '../../constants/catalogFilters'
import { swrKeys } from './keys'

async function catalogFetcher([, params]) {
  const result = await fetchCatalogApi(params)
  return {
    products: result.data || [],
    pagination: result.pagination || {
      page: 1,
      limit: CATALOG_PAGE_SIZE,
      total: (result.data || []).length,
      hasMore: false,
      totalPages: 1,
    },
  }
}

async function catalogProductFetcher([, , id]) {
  const result = await fetchCatalogProductApi(id)
  return result.data
}

/** Catalog 1 trang (landing preview). */
export function useCatalog(params = {}, options = {}) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKeys.catalog(params),
    catalogFetcher,
    options,
  )

  return {
    products: data?.products || [],
    pagination: data?.pagination,
    error,
    isLoading,
    isValidating,
    mutate,
  }
}

/** Catalog phân trang — load more. */
export function useCatalogInfinite(params = {}, options = {}) {
  const limit = params.limit || CATALOG_PAGE_SIZE

  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.pagination?.hasMore) return null
    return swrKeys.catalog({
      ...params,
      page: pageIndex + 1,
      limit,
    })
  }

  const { data, error, isLoading, isValidating, size, setSize, mutate } = useSWRInfinite(
    getKey,
    catalogFetcher,
    {
      revalidateFirstPage: true,
      ...options,
    },
  )

  const products = (data || []).flatMap((page) => page.products || [])
  const lastPage = data?.[data.length - 1]
  const hasMore = Boolean(lastPage?.pagination?.hasMore)
  const total = lastPage?.pagination?.total ?? products.length

  return {
    products,
    total,
    hasMore,
    error,
    isLoading,
    isValidating,
    isLoadingMore: isValidating && size > 1,
    size,
    setSize,
    loadMore: () => {
      if (!hasMore || isValidating) return
      setSize(size + 1)
    },
    mutate,
  }
}

export function useCatalogProduct(id, options = {}) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKeys.catalogProduct(id),
    catalogProductFetcher,
    options,
  )

  return {
    product: data,
    error,
    isLoading,
    isValidating,
    mutate,
  }
}
