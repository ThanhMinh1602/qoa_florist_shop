import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import LoadingOverlay from '../../../components/common/LoadingOverlay'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { createShopOrderApi } from '../../../api/shopOrdersApi'
import { formatMoney } from '../../../utils/money'
import { useCart } from '../context/CartContext'
import { storeSuccessOrder } from '../utils/orderSuccessStorage'

const inputClass =
  'w-full rounded-xl border border-rose-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-100'

function ShopCheckoutPage() {
  const navigate = useNavigate()
  const { items, subtotal } = useCart()
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    deliveryRecipientName: '',
    deliveryPhone: '',
    deliveryAddress: '',
    deliveryDate: '',
    deliveryTimeSlot: '',
    deliveryNote: '',
    note: '',
    sameAsCustomer: true,
  })

  if (items.length === 0) {
    return <Navigate to="/shop" replace />
  }

  function update(field, value) {
    setError('')
    setForm((previous) => {
      const next = { ...previous, [field]: value }
      if (field === 'sameAsCustomer' && value) {
        next.deliveryRecipientName = previous.customerName
        next.deliveryPhone = previous.customerPhone
      }
      if (previous.sameAsCustomer && (field === 'customerName' || field === 'customerPhone')) {
        if (field === 'customerName') next.deliveryRecipientName = value
        if (field === 'customerPhone') next.deliveryPhone = value
      }
      return next
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsBusy(true)
    setError('')
    await new Promise((resolve) => setTimeout(resolve, 60))

    try {
      const deliveryRecipientName = form.sameAsCustomer
        ? form.customerName
        : form.deliveryRecipientName
      const deliveryPhone = form.sameAsCustomer ? form.customerPhone : form.deliveryPhone

      const result = await createShopOrderApi({
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        deliveryRecipientName: deliveryRecipientName.trim(),
        deliveryPhone: deliveryPhone.trim(),
        deliveryAddress: form.deliveryAddress.trim(),
        deliveryDate: form.deliveryDate,
        deliveryTimeSlot: form.deliveryTimeSlot.trim(),
        deliveryNote: form.deliveryNote.trim(),
        note: form.note.trim(),
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.name,
          quantity: item.quantity,
        })),
      })

      const order = result.data
      storeSuccessOrder(order)
      setIsBusy(false)
      // Xóa giỏ trên trang success — tránh checkout redirect về /shop vì giỏ trống
      navigate('/shop/success', { state: { order }, replace: true })
    } catch (err) {
      setIsBusy(false)
      setError(err.message || 'Không thể đặt hàng.')
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
        <h1 className="font-[Georgia,serif] text-2xl text-slate-900">Thông tin đặt hàng</h1>
        <p className="text-sm text-slate-500">
          Sau khi đặt, shop nhận thông báo ngay. Bạn có thể chat Zalo để xác nhận đơn.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Họ tên người đặt</span>
            <input
              required
              value={form.customerName}
              onChange={(e) => update('customerName', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">SĐT người đặt</span>
            <input
              required
              value={form.customerPhone}
              onChange={(e) => update('customerPhone', e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.sameAsCustomer}
            onChange={(e) => update('sameAsCustomer', e.target.checked)}
          />
          Người nhận giống người đặt
        </label>

        {!form.sameAsCustomer ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Họ tên người nhận</span>
              <input
                required
                value={form.deliveryRecipientName}
                onChange={(e) => update('deliveryRecipientName', e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">SĐT người nhận</span>
              <input
                required
                value={form.deliveryPhone}
                onChange={(e) => update('deliveryPhone', e.target.value)}
                className={inputClass}
              />
            </label>
          </div>
        ) : null}

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Địa chỉ giao hàng</span>
          <textarea
            required
            rows={3}
            value={form.deliveryAddress}
            onChange={(e) => update('deliveryAddress', e.target.value)}
            className={inputClass}
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Ngày giao</span>
            <input
              type="date"
              value={form.deliveryDate}
              onChange={(e) => update('deliveryDate', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Khung giờ</span>
            <input
              value={form.deliveryTimeSlot}
              onChange={(e) => update('deliveryTimeSlot', e.target.value)}
              placeholder="VD: 9h–11h"
              className={inputClass}
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Ghi chú giao hàng</span>
          <input
            value={form.deliveryNote}
            onChange={(e) => update('deliveryNote', e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Ghi chú đơn</span>
          <textarea
            rows={2}
            value={form.note}
            onChange={(e) => update('note', e.target.value)}
            className={inputClass}
          />
        </label>

        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="inline-flex items-center gap-1 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
          >
            <MaterialIcon name="check_circle" className="text-lg" />
            Xác nhận đặt hàng
          </button>
          <Link
            to="/shop/cart"
            className="rounded-xl border border-rose-100 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Quay lại giỏ
          </Link>
        </div>
      </form>

      <aside className="h-fit rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900">Đơn của bạn</h2>
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-3 text-sm">
              <span className="text-slate-600">
                {item.name} × {item.quantity}
              </span>
              <span className="font-medium text-slate-800">
                {formatMoney(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-rose-50 pt-3">
          <span className="text-sm text-slate-600">Tạm tính</span>
          <span className="text-lg font-semibold text-rose-600">{formatMoney(subtotal)}</span>
        </div>
        <p className="mt-3 text-xs text-slate-400">Thanh toán khi nhận hàng / theo thỏa thuận với shop trên Zalo.</p>
      </aside>

      <LoadingOverlay open={isBusy} message="Đang gửi đơn hàng..." />
    </div>
  )
}

export default ShopCheckoutPage
