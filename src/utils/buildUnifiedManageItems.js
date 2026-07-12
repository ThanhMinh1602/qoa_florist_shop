import { getTopicById } from '../constants/topics'
import { getInvoiceCode } from './invoiceCode'
import { summarizeItems } from './money'

/**
 * Danh sách đơn hàng (có/không QR) — kèm tiền & sản phẩm.
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
        shipDate: order.shipDate || order.deliveryDate || null,
        code: getInvoiceCode(order),
        primaryName: order.customerName,
        secondaryPhone: order.customerPhone || '',
        deliveryLine: order.deliveryRecipientName || order.recipientName || '—',
        addressLine: order.deliveryAddress || '',
        productsLine: summarizeItems(order.items),
        subtotal: order.subtotal || 0,
        deposit: order.deposit || 0,
        shippingFee: order.shippingFee || 0,
        codAmount: order.codAmount || 0,
        paymentStatus: order.paymentStatus || 'unpaid',
        paymentNote: order.paymentNote || '',
        trackingCode: order.shippingTrackingCode || '',
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
