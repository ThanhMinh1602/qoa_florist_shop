import useSWR from 'swr'
import { fetchCardById, fetchCards } from '../../api/cardsApi'
import { swrKeys } from './keys'

async function cardFetcher([, id]) {
  const result = await fetchCardById(id)
  return result.data
}

async function cardsFetcher([, , filters]) {
  const result = await fetchCards(filters)
  return result.data || []
}

export function useCard(id, options = {}) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKeys.card(id),
    cardFetcher,
    options,
  )

  return {
    card: data,
    error,
    isLoading,
    isValidating,
    notFound: Boolean(error) && !data,
    mutate,
  }
}

export function useCards(filters = {}, options = {}) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKeys.cards(filters),
    cardsFetcher,
    options,
  )

  return {
    cards: data || [],
    error,
    isLoading,
    isValidating,
    mutate,
  }
}
