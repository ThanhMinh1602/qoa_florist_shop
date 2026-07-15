/**
 * Kết nối người mua ↔ người bán qua Zalo (deep link 1-1).
 *
 * Lưu ý: Zalo thường bỏ qua ?text= khi quét QR quá dài.
 * → QR nên trỏ link ngắn /shop/zalo#... rồi từ đó mở Zalo + hiện tin để copy.
 */

import { getPublicBaseUrl } from '../constants/app'

export function getZaloShopPhone() {
  return (import.meta.env.VITE_ZALO_OA_ID || '0798334803').trim()
}

/** @deprecated dùng getZaloShopPhone */
export function getZaloShopId() {
  return getZaloShopPhone()
}

function itemSummary(order) {
  if (!Array.isArray(order?.items) || order.items.length === 0) return ''
  return order.items.map((item) => `${item.productName} x${item.quantity}`).join(', ')
}

/** Tin đầy đủ — hiện trên web để copy */
export function buildBuyerToSellerMessage(order) {
  const shopName = import.meta.env.VITE_SHOP_NAME || 'QOA Florist'
  const lines = [
    `[Don ${order.invoiceCode}] Xin chao ${shopName}`,
    `Em vua dat hang tren web.`,
    `SDT mua: ${order.customerPhone || ''}`,
    `Nguoi nhan: ${order.deliveryRecipientName || ''} - ${order.deliveryPhone || ''}`,
    `Dia chi: ${order.deliveryAddress || ''}`,
  ]

  const items = itemSummary(order)
  if (items) lines.push(`San pham: ${items}`)
  if (order.subtotal) lines.push(`Tam tinh: ${order.subtotal}d`)
  if (order.note) lines.push(`Ghi chu: ${order.note}`)
  lines.push('Nho shop xac nhan don giup em.')

  return lines.filter((line) => line && !line.endsWith(': ')).join('\n')
}

/** Tin ngắn cho ?text= (Zalo hay cắt URL dài) */
export function buildBuyerToSellerMessageShort(order) {
  const items = itemSummary(order)
  return [
    `Don ${order.invoiceCode}`,
    `SDT ${order.customerPhone || ''}`,
    items ? `SP: ${items}` : null,
    order.subtotal ? `${order.subtotal}d` : null,
    'Xac nhan don giup em',
  ]
    .filter(Boolean)
    .join(' | ')
}

export function buildSellerToBuyerMessage(order) {
  const shopName = import.meta.env.VITE_SHOP_NAME || 'QOA Florist'
  const items = itemSummary(order)
  return [
    `[Don ${order.invoiceCode}] Xin chao ${order.customerName || 'ban'}`,
    `${shopName} da nhan don.`,
    items ? `SP: ${items}` : null,
    'Shop se ho tro tren Zalo nay.',
  ]
    .filter(Boolean)
    .join('\n')
}

export function buildZaloOrderMessage(order) {
  return buildBuyerToSellerMessage(order)
}

export function buildZaloChatUrlTo(phone, text) {
  const id = String(phone || '').replace(/\s/g, '').trim()
  if (!id) return ''
  const encoded = encodeURIComponent(text || '')
  return encoded ? `https://zalo.me/${id}?text=${encoded}` : `https://zalo.me/${id}`
}

export function buildZaloChatUrl(order, { short = true } = {}) {
  const text = short ? buildBuyerToSellerMessageShort(order) : buildBuyerToSellerMessage(order)
  return buildZaloChatUrlTo(getZaloShopPhone(), text)
}

export function buildZaloChatUrlToCustomer(order) {
  return buildZaloChatUrlTo(order?.customerPhone, buildSellerToBuyerMessage(order))
}

/** Payload ngắn nhét vào hash QR — điện thoại quét vẫn đọc được */
export function encodeZaloBridgePayload(order) {
  const payload = {
    c: order.invoiceCode,
    n: order.customerName || '',
    p: order.customerPhone || '',
    r: order.deliveryRecipientName || '',
    d: order.deliveryPhone || '',
    a: order.deliveryAddress || '',
    i: (order.items || []).map((item) => ({
      n: item.productName,
      q: item.quantity,
    })),
    t: order.subtotal || 0,
    note: order.note || '',
  }
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
}

export function decodeZaloBridgePayload(encoded) {
  try {
    const json = decodeURIComponent(escape(atob(encoded)))
    const data = JSON.parse(json)
    return {
      invoiceCode: data.c,
      customerName: data.n,
      customerPhone: data.p,
      deliveryRecipientName: data.r,
      deliveryPhone: data.d,
      deliveryAddress: data.a,
      items: (data.i || []).map((item) => ({
        productName: item.n,
        quantity: item.q,
      })),
      subtotal: data.t,
      note: data.note || '',
    }
  } catch {
    return null
  }
}

/** Link ngắn cho QR (trang cầu nối hiện tin + mở Zalo) */
export function buildZaloBridgeUrl(order) {
  const hash = encodeZaloBridgePayload(order)
  return `${getPublicBaseUrl()}/shop/zalo#${hash}`
}

export function openZaloChat(order) {
  const url = buildZaloChatUrl(order, { short: true })
  if (!url) return false
  // location.href đáng tin hơn window.open trên mobile (giữ ?text=)
  window.location.href = url
  return true
}

export function openZaloChatWithCustomer(order) {
  const url = buildZaloChatUrlToCustomer(order)
  if (!url) return false
  // Admin: mở tab mới, không rời trang quản lý
  window.open(url, '_blank', 'noopener,noreferrer')
  return true
}
