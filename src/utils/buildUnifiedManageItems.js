import { getInvoiceCode } from './invoiceCode'
import { summarizeItems } from './money'
import { calcOrderMoney } from './orderMoney'
import { normalizeTrackingCode } from './trackingCode'

/**
 * Danh sách đơn hàng — map theo sổ ĐƠN HÀNG QOA.
 */
export function buildUnifiedManageItems(orders = []) {
  return orders
    .map((order) => {
      const productsTotal =
        order.productsTotal ??
        (order.items || []).reduce(
          (sum, item) => sum + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1),
          0,
        )
      const money = calcOrderMoney({
        productsTotal,
        addOnAmount: order.addOnAmount,
        deposit: order.deposit,
        shippingFee: order.shippingFee,
        actualShippingFee: order.actualShippingFee,
        incidentalAmount: order.incidentalAmount,
        codOverride: order.codAmount,
      })

      return {
        kind: 'order',
        id: order.id,
        createdAt: order.createdAt,
        orderDate: order.orderDate || order.createdAt || null,
        neededDate: order.shipDate || order.deliveryDate || null,
        shipTime: order.deliveryTimeSlot || '',
        code: getInvoiceCode(order),
        primaryName: order.customerName,
        secondaryPhone: order.customerPhone || '',
        deliveryLine: order.deliveryRecipientName || order.recipientName || '—',
        addressLine: order.deliveryAddress || '',
        productsLine: summarizeItems(order.items),
        note: order.note || '',
        subtotal: money.orderTotal,
        deposit: money.deposit,
        shippingFee: money.shippingFee,
        actualShippingFee: money.actualShippingFee,
        codAmount: money.codAmount,
        appReceive: money.appReceive,
        paymentStatus: order.paymentStatus || 'unpaid',
        paymentNote: order.paymentNote || '',
        trackingCode: normalizeTrackingCode(order.shippingTrackingCode),
        monthEndChecked: Boolean(order.monthEndChecked),
        status: order.status,
        shippingStatus: order.shippingStatus,
        raw: order,
        // legacy aliases
        shipDate: order.shipDate || order.deliveryDate || null,
      }
    })
    .sort((a, b) => {
      const aDate = new Date(a.neededDate || a.createdAt).getTime()
      const bDate = new Date(b.neededDate || b.createdAt).getTime()
      return bDate - aDate
    })
}
