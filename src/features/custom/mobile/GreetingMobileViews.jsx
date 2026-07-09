import { Link } from 'react-router-dom'
import BrandLogoCenter from '../../../components/common/BrandLogoCenter'

function GreetingLoadingMobile() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-black px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-rose-500/30" />
        <p className="mt-4 text-sm text-rose-200/80">Đang tải thiệp...</p>
      </div>
    </div>
  )
}

function GreetingNotFoundMobile() {
  return (
    <div className="flex min-h-dvh flex-col bg-black px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <BrandLogoCenter size="sm" />
        <h1 className="mt-6 text-xl font-semibold text-rose-200">Không tìm thấy thiệp</h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-rose-100/70">
          Mã QR này không tồn tại hoặc đã bị xóa. Vui lòng liên hệ shop hoa để được hỗ trợ.
        </p>
      </div>

      <Link
        to="/demo"
        className="mb-2 block w-full rounded-xl border border-rose-400/40 px-4 py-3.5 text-center text-sm font-medium text-rose-200 transition active:bg-rose-950"
      >
        Xem demo thiệp
      </Link>
    </div>
  )
}

export { GreetingLoadingMobile, GreetingNotFoundMobile }
