import BrandLogo from '../../../components/common/BrandLogo'
import MobileStepIndicator from '../../../components/mobile/MobileStepIndicator'

function CustomCardHeaderMobile({ step }) {
  return (
    <header className="sticky top-0 z-20 border-b border-outline-variant/25 bg-surface-container-lowest/95 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur">
      <div className="flex items-center gap-3">
        <BrandLogo size="sm" />
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-primary">Tự thiết kế thiệp</h1>
          <p className="text-xs text-on-surface-variant">Gửi yêu cầu về QOA Florist</p>
        </div>
      </div>

      <MobileStepIndicator
        step={step}
        steps={[
          { id: 'card', label: 'Thiệp & QR' },
          { id: 'delivery', label: 'Giao hàng' },
        ]}
      />
    </header>
  )
}

export default CustomCardHeaderMobile
