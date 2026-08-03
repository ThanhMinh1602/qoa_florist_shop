import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { formatMoney } from '../../../utils/money'
import { downloadQrImage } from '../../../utils/downloadQr'
import { readSuccessOrder, storeSuccessOrder } from '../utils/orderSuccessStorage'
import {
  buildBuyerToSellerMessage,
  buildZaloBridgeUrl,
  getZaloShopPhone,
  openZaloChat,
} from '../../../utils/zalo'

function ShopOrderSuccessPage() {
  const location = useLocation()
  const canvasRef = useRef(null)
  const storedRef = useRef(false)
  const [copiedMsg, setCopiedMsg] = useState(false)
  const [order] = useState(() => location.state?.order || readSuccessOrder())

  useEffect(() => {
    if (!order || storedRef.current) return
    storedRef.current = true
    storeSuccessOrder(order)
  }, [order])

  if (!order) {
    return <Navigate to="/shop" replace />
  }

  const shopPhone = getZaloShopPhone()
  const message = buildBuyerToSellerMessage(order)
  // QR ngắn → trang cầu nối (hiện SP + mở Zalo). Tránh nhét URL zalo.me?text= dài vào QR.
  const qrValue = buildZaloBridgeUrl(order)

  function handleCopyMessage() {
    navigator.clipboard.writeText(message).then(() => {
      setCopiedMsg(true)
      window.setTimeout(() => setCopiedMsg(false), 2000)
    })
  }

  function handleDownload() {
    downloadQrImage(canvasRef.current, `qoa-zalo-${order.invoiceCode}.png`)
  }

  function handleOpenZalo() {
    navigator.clipboard?.writeText(message).catch(() => null)
    openZaloChat(order)
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 rounded-3xl border border-outline-variant/25 bg-surface-container-lowest p-6 text-center shadow-sm sm:p-8">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <MaterialIcon name="check_circle" className="text-3xl" />
      </div>
      <div>
        <h1 className="font-display text-2xl text-on-surface">Đặt hàng thành công</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Mã đơn <span className="font-mono font-bold text-primary">{order.invoiceCode}</span>
        </p>
        <p className="mt-1 text-sm text-on-surface-variant">
          Tổng tạm tính {formatMoney(order.subtotal)} · Shop đã nhận thông báo trên hệ thống.
        </p>
      </div>

      <div className="rounded-2xl border border-[#0068FF]/20 bg-[#0068FF]/5 px-4 py-5">
        <p className="text-sm font-semibold text-on-surface">QR Zalo shop</p>
        <p className="mt-1 text-xs text-on-surface-variant">
          Quét QR → xem tin nhắn (có sản phẩm) → mở Zalo. Shop: {shopPhone}
        </p>

        <div className="mx-auto mt-4 inline-flex rounded-2xl bg-surface-container-lowest p-3 shadow-sm ring-1 ring-slate-100">
          <QRCodeCanvas ref={canvasRef} value={qrValue} size={200} level="M" includeMargin />
        </div>

        <div className="mt-4 rounded-xl bg-surface-container-lowest px-3 py-3 text-left ring-1 ring-slate-100">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-outline">
            Nội dung tin nhắn
          </p>
          <pre className="mt-1.5 whitespace-pre-wrap break-words font-sans text-xs leading-relaxed text-on-surface">
            {message}
          </pre>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleOpenZalo}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0068FF] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0054cc]"
          >
            <MaterialIcon name="chat" className="text-lg" />
            Mở Zalo (đã copy tin nhắn)
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopyMessage}
              className="flex-1 rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-3 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container-low"
            >
              {copiedMsg ? 'Đã copy tin' : 'Copy tin nhắn'}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-3 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container-low"
            >
              Tải QR
            </button>
          </div>
        </div>
      </div>

      <Link
        to="/shop"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary"
      >
        <MaterialIcon name="arrow_back" className="text-base" />
        Tiếp tục mua hoa
      </Link>
    </div>
  )
}

export default ShopOrderSuccessPage
