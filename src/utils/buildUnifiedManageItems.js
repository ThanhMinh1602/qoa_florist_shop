import { getTopicById } from '../constants/topics'
import { getInvoiceCode } from '../utils/invoiceCode'

/**
 * Danh sách đơn hàng (có/không QR).
 * Thiệp QR gắn đơn đã nằm trong order.cardId — không liệt kê thiệp rời.
 */
export function buildUnifiedManageItems(orders = []) {
  return orders
    .map((order) => {
      const hasCard = Boolean(order.cardId)
      const topic = getTopicById(order.topicId)

      return {
        kind: 'order',
        id: order.id,
        createdAt: order.createdAt,
        code: getInvoiceCode(order),
        primaryName: order.customerName,
        secondaryPhone: order.customerPhone || '',
        deliveryLine: order.deliveryRecipientName || order.recipientName || '—',
        addressLine: order.deliveryAddress || '',
        typeKind: hasCard ? 'with_qr' : 'no_qr',
        typeLabel: hasCard ? topic?.name ?? order.topicId ?? 'Có QR' : 'Không QR',
        typeIcon: hasCard ? topic?.icon ?? 'qr_code_2' : 'local_shipping',
        topicId: order.topicId || null,
        status: order.status,
        shippingStatus: order.shippingStatus,
        raw: order,
      }
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
