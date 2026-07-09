import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BirthdayScreen from '../components/BirthdayScreen'
import { fetchCardById } from '../api/cardsApi'

function GreetingPage() {
  const { uuid } = useParams()
  const [card, setCard] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadCard() {
      setIsLoading(true)
      setNotFound(false)

      try {
        const result = await fetchCardById(uuid)
        if (!cancelled) {
          setCard(result.data)
        }
      } catch {
        if (!cancelled) {
          setNotFound(true)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadCard()

    return () => {
      cancelled = true
    }
  }, [uuid])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-sm text-rose-200/80">Đang tải thiệp...</p>
      </div>
    )
  }

  if (notFound || !card) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center">
        <p className="text-4xl" aria-hidden="true">
          🌸
        </p>
        <h1 className="mt-4 text-xl font-semibold text-rose-200">Không tìm thấy thiệp</h1>
        <p className="mt-2 max-w-md text-sm text-rose-100/70">
          Mã QR này không tồn tại hoặc đã bị xóa. Vui lòng liên hệ shop hoa để được hỗ trợ.
        </p>
        <Link
          to="/demo"
          className="mt-6 rounded-xl border border-rose-400/40 px-4 py-2.5 text-sm font-medium text-rose-200 transition hover:bg-rose-950"
        >
          Xem demo thiệp
        </Link>
      </div>
    )
  }

  return (
    <BirthdayScreen
      senderName={card.senderName}
      recipientName={card.recipientName}
      message={card.message}
    />
  )
}

export default GreetingPage
