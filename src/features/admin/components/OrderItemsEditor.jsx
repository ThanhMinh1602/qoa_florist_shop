import { formatMoney } from '../../../utils/money'

function OrderItemsEditor({ products = [], items = [], onChange }) {
  function updateItem(index, patch) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  function removeItem(index) {
    onChange(items.filter((_, i) => i !== index))
  }

  function addFromProduct(productId) {
    const product = products.find((item) => item.id === productId)
    if (!product) return
    onChange([
      ...items,
      {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.sellPrice || 0,
        unitCost: product.costPrice || 0,
        note: '',
      },
    ])
  }

  function addCustom() {
    onChange([
      ...items,
      {
        productId: '',
        productName: '',
        quantity: 1,
        unitPrice: 0,
        unitCost: 0,
        note: '',
      },
    ])
  }

  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1),
    0,
  )

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <select
          defaultValue=""
          onChange={(event) => {
            if (event.target.value) {
              addFromProduct(event.target.value)
              event.target.value = ''
            }
          }}
          className="min-w-[12rem] flex-1 rounded-xl border border-rose-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-100"
        >
          <option value="">+ Thêm từ catalog...</option>
          {products
            .filter((product) => product.active !== false)
            .map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} — {formatMoney(product.sellPrice)}
              </option>
            ))}
        </select>
        <button
          type="button"
          onClick={addCustom}
          className="rounded-xl border border-rose-200 px-3 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-50"
        >
          Dòng tùy chỉnh
        </button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-rose-200 px-4 py-6 text-center text-sm text-slate-500">
          Chưa có sản phẩm. Chọn từ catalog hoặc thêm dòng tùy chỉnh.
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={`${item.productId || 'custom'}-${index}`}
              className="grid gap-2 rounded-xl border border-rose-100 bg-rose-50/20 p-3 sm:grid-cols-[1fr_5rem_7rem_auto]"
            >
              <input
                value={item.productName}
                onChange={(e) => updateItem(index, { productName: e.target.value })}
                placeholder="Tên sản phẩm"
                className="rounded-lg border border-rose-100 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-100"
              />
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => updateItem(index, { quantity: Number(e.target.value) || 1 })}
                className="rounded-lg border border-rose-100 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-100"
                title="Số lượng"
              />
              <input
                type="number"
                min="0"
                value={item.unitPrice}
                onChange={(e) => updateItem(index, { unitPrice: Number(e.target.value) || 0 })}
                className="rounded-lg border border-rose-100 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-100"
                title="Đơn giá"
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="rounded-lg px-2 text-sm text-slate-400 hover:bg-white hover:text-red-500"
              >
                Xóa
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-right text-sm font-semibold text-slate-800">
        Thu vào (tạm tính): {formatMoney(subtotal)}
      </p>
    </div>
  )
}

export default OrderItemsEditor

export function calcItemsSubtotal(items = []) {
  return items.reduce(
    (sum, item) => sum + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1),
    0,
  )
}
