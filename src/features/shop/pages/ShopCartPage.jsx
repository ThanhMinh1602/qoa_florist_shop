import { Link } from 'react-router-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { formatMoney } from '../../../utils/money'
import { useCart } from '../context/CartContext'

function ShopCartPage() {
  const { items, subtotal, setQuantity, removeItem } = useCart()

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-rose-200 bg-white px-6 py-16 text-center">
        <MaterialIcon name="shopping_bag" className="text-4xl text-rose-200" />
        <p className="mt-3 text-sm font-medium text-slate-700">Giỏ hàng trống</p>
        <Link
          to="/shop"
          className="mt-4 inline-flex rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
        >
          Chọn sản phẩm
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="font-[Georgia,serif] text-2xl text-slate-900">Giỏ hàng</h1>

      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.productId}
            className="flex gap-3 rounded-2xl border border-rose-100 bg-white p-3 shadow-sm"
          >
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-rose-50">
              {item.mainImage ? (
                <img src={item.mainImage} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-rose-200">
                  <MaterialIcon name="image" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                to={`/shop/product/${item.productId}`}
                className="font-semibold text-slate-900 hover:text-rose-600"
              >
                {item.name}
              </Link>
              <p className="mt-1 text-sm text-rose-600">{formatMoney(item.price)}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => setQuantity(item.productId, e.target.value)}
                  className="w-20 rounded-lg border border-rose-100 px-2 py-1.5 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  Xóa
                </button>
              </div>
            </div>
            <p className="shrink-0 font-semibold text-slate-800">
              {formatMoney(item.price * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <div className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Tạm tính</span>
          <span className="text-lg font-semibold text-rose-600">{formatMoney(subtotal)}</span>
        </div>
        <Link
          to="/shop/checkout"
          className="mt-4 flex w-full items-center justify-center rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white hover:bg-rose-600"
        >
          Đặt hàng
        </Link>
      </div>
    </div>
  )
}

export default ShopCartPage
