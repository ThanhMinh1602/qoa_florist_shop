import { formatMoney } from './money'

/**
 * Deep link Facebook Messenger tới Page / profile shop.
 * Link dạng: https://m.me/{pageId}?text=...
 *
 * Page: https://www.facebook.com/profile.php?id=61590863234957
 */

export function getFacebookPageId() {
  return (import.meta.env.VITE_FACEBOOK_PAGE_ID || '61590863234957').trim()
}

export function getFacebookPageUrl() {
  const id = getFacebookPageId()
  return id ? `https://www.facebook.com/profile.php?id=${id}` : ''
}

/**
 * @param {string} [text] tin nhắn sẵn (m.me hỗ trợ ?text= trên nhiều thiết bị)
 */
export function buildFacebookMessengerUrl(text = '') {
  const id = getFacebookPageId()
  if (!id) return ''
  const base = `https://m.me/${id}`
  const message = String(text || '').trim()
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}

export function buildProductOrderMessage(product) {
  if (!product) return 'Xin chào QOA Florist, mình muốn đặt hoa ạ.'
  const shopName = import.meta.env.VITE_SHOP_NAME || 'QOA Florist'
  const lines = [
    `Xin chào ${shopName},`,
    'Mình muốn đặt bó hoa:',
    product.name ? `- Tên: ${product.name}` : null,
    product.code ? `- Mã: ${product.code}` : null,
    product.price != null && product.price !== ''
      ? `- Giá: ${formatMoney(product.price)}`
      : null,
    '',
    'Ghi chú thêm: ',
  ]
  return lines.filter((line) => line !== null).join('\n')
}

export function buildProductOrderMessengerUrl(product) {
  return buildFacebookMessengerUrl(buildProductOrderMessage(product))
}

export function openFacebookMessenger(text = '') {
  const url = buildFacebookMessengerUrl(text)
  if (!url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}
