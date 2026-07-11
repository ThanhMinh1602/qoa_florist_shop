import BrandLogoCenter from '../../../components/common/BrandLogoCenter'
import MaterialIcon from '../../../components/common/MaterialIcon'

function CustomSuccessMobile({ customerPhone, onReset }) {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-rose-50 via-white to-pink-50 px-4 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white p-6 text-center shadow-xl shadow-rose-100/60">
          <BrandLogoCenter size="md" />
          <MaterialIcon name="check_circle" className="mt-4 text-5xl text-emerald-500" filled />
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">Đã gửi yêu cầu!</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            QOA Florist đã nhận thiệp và thông tin giao hàng. Shop sẽ liên hệ qua{' '}
            <span className="font-medium text-slate-700">{customerPhone}</span> để xác nhận đơn.
          </p>
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-rose-100 bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        <button
          type="button"
          onClick={onReset}
          className="w-full rounded-xl bg-rose-500 px-5 py-3.5 text-sm font-semibold text-white transition active:bg-rose-600"
        >
          Gửi yêu cầu khác
        </button>
      </div>
    </div>
  )
}

export default CustomSuccessMobile
