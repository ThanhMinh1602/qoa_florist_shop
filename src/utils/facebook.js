import { formatMoney } from './money'

/**
 * Deep link Facebook Messenger tới Page / profile shop.
 * Link dạng: https://m.me/{pageId}?text=...
 *
 * Lưu ý mobile: mở bằng location.href (không window.open / target=_blank)
 * thì ?text= ít bị Messenger app nuốt hơn. Tin dài dễ bị cắt → dùng bản ngắn
 * trong URL + copy bản đầy đủ vào clipboard.
 *
 * Page: https://www.facebook.com/profile.php?id=61590863234957
 */

const MESSENGER_TEXT_MAX = 280

export function getFacebookPageId() {
  return (import.meta.env.VITE_FACEBOOK_PAGE_ID || '61590863234957').trim()
}

export function getFacebookPageUrl() {
  const id = getFacebookPageId()
  return id ? `https://www.facebook.com/profile.php?id=${id}` : ''
}

function isMobileMessengerClient() {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '')
}

/**
 * @param {string} [text] tin nhắn sẵn (m.me hỗ trợ ?text= trên nhiều thiết bị)
 */
export function buildFacebookMessengerUrl(text = '') {
  const id = getFacebookPageId()
  if (!id) return ''
  const base = `https://m.me/${id}`
  let message = String(text || '').trim()
  if (!message) return base
  // Messenger hay bỏ text dài / nhiều dòng trên app mobile
  message = message.replace(/\s*\n+\s*/g, ' ').replace(/\s{2,}/g, ' ').trim()
  if (message.length > MESSENGER_TEXT_MAX) {
    message = `${message.slice(0, MESSENGER_TEXT_MAX - 1).trim()}…`
  }
  return `${base}?text=${encodeURIComponent(message)}`
}

/** Tin đầy đủ — copy clipboard / desktop */
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

/** Tin ngắn cho ?text= — giữ dưới ~280 ký tự, 1 dòng */
export function buildProductOrderMessageShort(product) {
  if (!product) return 'Xin chào QOA Florist, mình muốn đặt hoa ạ.'
  const shopName = import.meta.env.VITE_SHOP_NAME || 'QOA Florist'
  const parts = [
    `Xin chào ${shopName}, mình muốn đặt:`,
    product.name || 'bó hoa',
    product.code ? `(mã ${product.code})` : null,
    product.price != null && product.price !== '' ? `- ${formatMoney(product.price)}` : null,
  ]
  return parts.filter(Boolean).join(' ')
}

export function buildProductOrderMessengerUrl(product) {
  return buildFacebookMessengerUrl(buildProductOrderMessageShort(product))
}

async function copyText(text) {
  const value = String(text || '').trim()
  if (!value || typeof navigator === 'undefined') return false
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
      return true
    }
  } catch {
    // fall through
  }
  try {
    const area = document.createElement('textarea')
    area.value = value
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.left = '-9999px'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(area)
    return ok
  } catch {
    return false
  }
}

/**
 * Mở Messenger kèm text. Mobile: same-tab. Desktop: tab mới.
 * Luôn cố copy tin đầy đủ để khách dán nếu app bỏ ?text=.
 * @returns {Promise<boolean>}
 */
export async function openFacebookMessenger(text = '', { clipboardText } = {}) {
  const forClipboard = String(clipboardText || text || '').trim()
  if (forClipboard) await copyText(forClipboard)

  const url = buildFacebookMessengerUrl(text)
  if (!url) return false

  if (isMobileMessengerClient()) {
    window.location.href = url
  } else {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
  return true
}

export function openProductOrderMessenger(product) {
  return openFacebookMessenger(buildProductOrderMessageShort(product), {
    clipboardText: buildProductOrderMessage(product),
  })
}
