const SUCCESS_ORDER_KEY = 'qoa_shop_last_order'

export function storeSuccessOrder(order) {
  sessionStorage.setItem(SUCCESS_ORDER_KEY, JSON.stringify(order))
}

export function readSuccessOrder() {
  try {
    const raw = sessionStorage.getItem(SUCCESS_ORDER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
