import { formatMoney } from '../../../utils/money'
import MoneyInput from './MoneyInput'

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
        color: '',
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
        color: '',
        note: '',
      },
    ])
  }

  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1),
    0,
  )

  const lineInput =
    'rounded-md border border-outline-variant/25 bg-surface-container-lowest px-2 py-1.5 text-sm outline-none placeholder:text-outline/55 focus:ring-2 focus:ring-primary/20'

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <select
          defaultValue=""
          onChange={(event) => {
            if (event.target.value) {
              addFromProduct(event.target.value)
              event.target.value = ''
            }
          }}
          className="min-w-0 flex-1 rounded-lg border border-outline-variant/25 px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">+ Catalog…</option>
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
          className="shrink-0 rounded-lg border border-outline-variant/40 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-surface-container-low"
        >
          Tùy chỉnh
        </button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-outline-variant/40 px-3 py-4 text-center text-xs text-on-surface-variant">
          Chưa có SP — chọn catalog hoặc tùy chỉnh.
        </p>
      ) : (
        <div className="space-y-1.5">
          {items.map((item, index) => {
            const lineTotal = (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1)
            return (
              <div
                key={`${item.productId || 'custom'}-${index}`}
                className="rounded-lg border border-outline-variant/25 bg-surface-container-low/15 p-2"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_3.25rem_6.5rem_auto] items-center gap-1.5 sm:grid-cols-[minmax(0,1.4fr)_3.25rem_6.5rem_minmax(0,1fr)_auto_auto]">
                  <input
                    value={item.productName || ''}
                    onChange={(e) => updateItem(index, { productName: e.target.value })}
                    placeholder="Tên SP"
                    className={`${lineInput} min-w-0`}
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={item.quantity || ''}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/[^\d]/g, '')
                      updateItem(index, { quantity: digits === '' ? '' : Math.max(1, Number(digits)) })
                    }}
                    onBlur={() => {
                      if (!item.quantity) updateItem(index, { quantity: 1 })
                    }}
                    className={`${lineInput} tabular-nums`}
                    title="Số lượng"
                    placeholder="SL"
                  />
                  <MoneyInput
                    value={item.unitPrice}
                    onChange={(next) => updateItem(index, { unitPrice: next === '' ? 0 : next })}
                    className={lineInput}
                    title="Đơn giá"
                    placeholder="Giá"
                  />
                  <input
                    value={item.color || ''}
                    onChange={(e) => updateItem(index, { color: e.target.value })}
                    placeholder="Màu"
                    className={`${lineInput} col-span-3 min-w-0 sm:col-span-1`}
                  />
                  <p className="hidden whitespace-nowrap text-right text-xs font-semibold text-on-surface sm:block">
                    {formatMoney(lineTotal)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="rounded-md px-1.5 py-1 text-xs text-outline hover:bg-surface-container-lowest hover:text-red-500"
                  >
                    Xóa
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={item.note || ''}
                  onChange={(e) => updateItem(index, { note: e.target.value })}
                  placeholder="Note sản phẩm"
                  className={`${lineInput} mt-1.5 w-full resize-y leading-snug`}
                />
                <p className="mt-1 text-right text-xs font-medium text-on-surface sm:hidden">
                  {formatMoney(lineTotal)}
                </p>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-right text-xs font-semibold text-on-surface">
        Tổng SP: {formatMoney(subtotal)}
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
