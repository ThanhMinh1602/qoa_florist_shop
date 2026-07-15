import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { formatMoney } from '../../../utils/money'
import { readSuccessOrder } from '../utils/orderSuccessStorage'
import {
  buildBuyerToSellerMessage,
  buildZaloChatUrl,
  decodeZaloBridgePayload,
  getZaloShopPhone,
  openZaloChat,
} from '../../../utils/zalo'

function ShopZaloBridgePage() {
  const location = useLocation()
  const [copied, setCopied] = useState(false)

  const order = useMemo(() => {
    const hash = location.hash?.replace(/^#/, '')
    if (hash) {
      const fromHash = decodeZaloBridgePayload(hash)
      if (fromHash) return fromHash
    }
    return location.state?.order || readSuccessOrder()
  }, [location.hash, location.state])

  const message = order ? buildBuyerToSellerMessage(order) : ''
  const shopPhone = getZaloShopPhone()

  function handleCopy() {
    if (!message) return
    navigator.clipboard.writeText(message).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleOpenZalo() {
    if (!order) return
    // Copy trước — nếu Zalo bỏ ?text= thì dán được ngay
    navigator.clipboard?.writeText(message).catch(() => null)
    openZaloChat(order)
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-rose-100 bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-slate-600">Không tìm thấy thông tin đơn để chat Zalo.</p>
        <Link to="/shop" className="mt-4 inline-block text-sm font-medium text-rose-600">
          Về shop
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-3xl border border-rose-100 bg-white p-6 shadow-sm">
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-800">Chat Zalo với shop</p>
        <p className="mt-1 text-xs text-slate-500">
          Đơn <span className="font-mono font-bold text-rose-600">{order.invoiceCode}</span>
          {order.subtotal ? ` · ${formatMoney(order.subtotal)}` : ''} · Shop {shopPhone}
        </p>
      </div>

      <div className="rounded-2xl bg-slate-50 px-4 py-3 text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Tin nhắn sẽ gửi (copy nếu Zalo không tự điền)
        </p>
        <pre className="mt-2 whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-slate-700">
          {message}
        </pre>
      </div>

      <button
        type="button"
        onClick={handleOpenZalo}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0068FF] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0054cc]"
      >
        <MaterialIcon name="chat" className="text-lg" />
        Mở Zalo & gửi tin này
      </button>

      <button
        type="button"
        onClick={handleCopy}
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        {copied ? 'Đã copy tin nhắn' : 'Copy tin nhắn để dán trên Zalo'}
      </button>

      <a
        href={buildZaloChatUrl(order)}
        className="block text-center text-xs text-slate-400 underline"
      >
        Mở link Zalo thủ công
      </a>
    </div>
  )
}

export default ShopZaloBridgePage
