import { Link, useParams } from 'react-router-dom'
import BrandLogoCenter from '../../../components/common/BrandLogoCenter'
import { useIsLgUp } from '../../../hooks/useMediaQuery'
import { useCard } from '../../../hooks/swr'
import TopicGreetingScreen from '../TopicGreetingScreen'
import { GreetingLoadingMobile, GreetingNotFoundMobile } from '../mobile/GreetingMobileViews'

function GreetingPage() {
  const { uuid } = useParams()
  const { card, isLoading, notFound } = useCard(uuid)
  const isLgUp = useIsLgUp()

  if (isLoading) {
    if (!isLgUp) {
      return <GreetingLoadingMobile />
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-sm text-rose-200/80">Đang tải thiệp...</p>
      </div>
    )
  }

  if (notFound || !card) {
    if (!isLgUp) {
      return <GreetingNotFoundMobile />
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center">
        <BrandLogoCenter size="sm" />
        <h1 className="mt-6 text-xl font-semibold text-rose-200">Không tìm thấy thiệp</h1>
        <p className="mt-2 max-w-md text-sm text-rose-100/70">
          Mã QR này không tồn tại hoặc đã bị xóa. Vui lòng liên hệ shop hoa để được hỗ trợ.
        </p>
        <Link
          to="/"
          className="mt-6 rounded-xl border border-rose-400/40 px-4 py-2.5 text-sm font-medium text-rose-200 transition hover:bg-rose-950"
        >
          Về trang chủ
        </Link>
      </div>
    )
  }

  return (
    <TopicGreetingScreen
      topicId={card.topicId}
      senderName={card.senderName}
      recipientName={card.recipientName}
      message={card.message}
      keywords={card.keywords}
      messages={card.messages}
      music={card.music}
    />
  )
}

export default GreetingPage
