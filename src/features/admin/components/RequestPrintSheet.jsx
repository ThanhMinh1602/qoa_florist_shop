import { forwardRef } from 'react'
import { logoSrc } from '../../../components/common/BrandLogo'
import {
  SHIPPING_PROVIDERS,
  SHIPPING_STATUS_LABELS,
} from '../../../constants/customRequestDefaults'
import { getInvoiceCode } from '../../../utils/invoiceCode'

const BLACK = '#000000'
const GRAY = '#444444'
const LIGHT_GRAY = '#666666'
const WHITE = '#ffffff'

const rootStyle = {
  position: 'fixed',
  left: '-10000px',
  top: 0,
  width: 794,
  backgroundColor: WHITE,
  color: BLACK,
  fontFamily: "'Segoe UI', system-ui, sans-serif",
  padding: 40,
  pointerEvents: 'none',
  boxSizing: 'border-box',
}

const sectionStyle = {
  marginTop: 24,
  border: `1px solid ${BLACK}`,
  padding: 16,
  backgroundColor: WHITE,
}

function formatPrintDate(isoString) {
  if (!isoString) return '—'

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoString))
}

function getProviderLabel(id) {
  if (!id) return '—'
  return SHIPPING_PROVIDERS.find((item) => item.id === id)?.label ?? id
}

function LabelCell({ children, width }) {
  return (
    <td style={{ padding: '6px 12px 6px 0', color: LIGHT_GRAY, width, verticalAlign: 'top', fontSize: 14 }}>
      {children}
    </td>
  )
}

function ValueCell({ children, bold = false }) {
  return (
    <td style={{ padding: '6px 0', color: BLACK, fontWeight: bold ? 700 : 400, fontSize: 14 }}>
      {children}
    </td>
  )
}

const RequestPrintSheet = forwardRef(function RequestPrintSheet({ request }, ref) {
  const invoiceCode = getInvoiceCode(request)

  return (
    <div ref={ref} data-pdf-sheet style={rootStyle}>
      <div style={{ borderBottom: `2px solid ${BLACK}`, paddingBottom: 16 }}>
        <img
          src={logoSrc}
          alt="QOA florist"
          style={{
            height: 64,
            width: 64,
            borderRadius: '50%',
            objectFit: 'cover',
            border: `1px solid ${BLACK}`,
          }}
        />
        <h1 style={{ margin: '12px 0 0', fontSize: 24, fontWeight: 700, color: BLACK, textTransform: 'uppercase' }}>
          Hóa đơn vận chuyển
        </h1>
        <p style={{ margin: '16px 0 0', fontSize: 12, color: LIGHT_GRAY, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Mã hóa đơn
        </p>
        <p style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 700, color: BLACK, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {invoiceCode}
        </p>
        <p style={{ margin: '12px 0 0', fontSize: 14, color: GRAY }}>
          Ngày tạo: {formatPrintDate(request.createdAt)}
        </p>
      </div>

      <section style={sectionStyle}>
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: BLACK }}>
          Người đặt hàng
        </h2>
        <table style={{ width: '100%', marginTop: 12, borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <LabelCell width={160}>Họ tên</LabelCell>
              <ValueCell bold>{request.customerName}</ValueCell>
            </tr>
            <tr>
              <LabelCell>SĐT liên hệ</LabelCell>
              <ValueCell bold>{request.customerPhone}</ValueCell>
            </tr>
          </tbody>
        </table>
      </section>

      <section style={sectionStyle}>
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: BLACK }}>
          Thông tin giao hàng
        </h2>
        <table style={{ width: '100%', marginTop: 12, borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <LabelCell width={160}>Người nhận hàng</LabelCell>
              <ValueCell bold>{request.deliveryRecipientName || request.recipientName}</ValueCell>
            </tr>
            <tr>
              <LabelCell>SĐT người nhận</LabelCell>
              <ValueCell bold>{request.deliveryPhone || '—'}</ValueCell>
            </tr>
            <tr>
              <LabelCell>Địa chỉ giao</LabelCell>
              <ValueCell>{request.deliveryAddress || '—'}</ValueCell>
            </tr>
            <tr>
              <LabelCell>Ngày giao</LabelCell>
              <ValueCell>{request.deliveryDate || '—'}</ValueCell>
            </tr>
            <tr>
              <LabelCell>Khung giờ giao</LabelCell>
              <ValueCell>{request.deliveryTimeSlot || '—'}</ValueCell>
            </tr>
            {request.deliveryNote ? (
              <tr>
                <LabelCell>Ghi chú giao hàng</LabelCell>
                <ValueCell>{request.deliveryNote}</ValueCell>
              </tr>
            ) : null}
            {request.note ? (
              <tr>
                <LabelCell>Ghi chú đơn hàng</LabelCell>
                <ValueCell>{request.note}</ValueCell>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>

      <section style={sectionStyle}>
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: BLACK }}>
          Vận chuyển
        </h2>
        <table style={{ width: '100%', marginTop: 12, borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <LabelCell width={160}>Đơn vị vận chuyển</LabelCell>
              <ValueCell bold>{getProviderLabel(request.shippingProvider)}</ValueCell>
            </tr>
            <tr>
              <LabelCell>Mã vận đơn</LabelCell>
              <ValueCell bold>{(request.shippingTrackingCode || '—').toUpperCase()}</ValueCell>
            </tr>
            <tr>
              <LabelCell>Trạng thái</LabelCell>
              <ValueCell bold>
                {SHIPPING_STATUS_LABELS[request.shippingStatus] ?? 'Chưa lên đơn'}
              </ValueCell>
            </tr>
          </tbody>
        </table>
      </section>

      <p style={{ marginTop: 32, fontSize: 12, color: LIGHT_GRAY, textAlign: 'center' }}>
        Vui lòng đối chiếu thông tin trước khi giao hàng. Cảm ơn quý khách đã tin tưởng QOA Florist.
      </p>
    </div>
  )
})

export default RequestPrintSheet
