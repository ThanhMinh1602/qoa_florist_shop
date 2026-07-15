import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  createCardApi,
  deleteCardApi,
  fetchCardById as fetchCardByIdApi,
  fetchCards as fetchCardsApi,
} from '../api/cardsApi'

const CardsContext = createContext(null)

export function CardsProvider({ children }) {
  const [cards, setCards] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchCards = useCallback(async (filters = {}) => {
    setIsLoading(true)
    setError('')

    try {
      const result = await fetchCardsApi(filters)
      setCards(result.data)
      return { success: true, cards: result.data }
    } catch (err) {
      const message = err.message || 'Không thể tải danh sách thiệp.'
      setError(message)
      return { success: false, message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createCard = useCallback(
    async ({ topicId, label, senderName, recipientName, phone, message }) => {
      const trimmedLabel = label?.trim()
      const trimmedRecipient = recipientName?.trim()
      const trimmedMessage = message?.trim()

      if (!topicId) {
        return { success: false, message: 'Vui lòng chọn chủ đề thiệp.' }
      }
      if (!trimmedLabel) {
        return { success: false, message: 'Vui lòng nhập tên gợi nhớ cho QR.' }
      }
      if (!trimmedRecipient || !trimmedMessage) {
        return {
          success: false,
          message: 'Vui lòng nhập đầy đủ tên người nhận và lời nhắn theo chủ đề.',
        }
      }

      setError('')

      try {
        const result = await createCardApi({
          topicId,
          label: trimmedLabel,
          senderName,
          recipientName: trimmedRecipient,
          phone,
          message: trimmedMessage,
        })

        setCards((previous) => [result.data, ...previous])
        return { success: true, card: result.data }
      } catch (err) {
        const message = err.message || 'Không thể tạo thiệp.'
        setError(message)
        return { success: false, message }
      }
    },
    [],
  )

  const deleteCard = useCallback(async (id) => {
    setError('')

    try {
      await deleteCardApi(id)
      setCards((previous) => previous.filter((card) => card.id !== id))
      return { success: true }
    } catch (err) {
      const message = err.message || 'Không thể xóa thiệp.'
      setError(message)
      return { success: false, message }
    }
  }, [])

  const getCardById = useCallback(
    (id) => cards.find((card) => card.id === id) ?? null,
    [cards],
  )

  const fetchCardById = useCallback(async (id) => {
    const cached = cards.find((card) => card.id === id)
    if (cached) {
      return { success: true, card: cached }
    }

    try {
      const result = await fetchCardByIdApi(id)
      return { success: true, card: result.data }
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Không tìm thấy thiệp.',
      }
    }
  }, [cards])

  const value = useMemo(
    () => ({
      cards,
      isLoading,
      error,
      fetchCards,
      createCard,
      deleteCard,
      getCardById,
      fetchCardById,
    }),
    [cards, isLoading, error, fetchCards, createCard, deleteCard, getCardById, fetchCardById],
  )

  return <CardsContext.Provider value={value}>{children}</CardsContext.Provider>
}

export function useCards() {
  const context = useContext(CardsContext)

  if (!context) {
    throw new Error('useCards must be used within CardsProvider')
  }

  return context
}
