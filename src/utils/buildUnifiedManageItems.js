import { isoToDmY, toIsoDateInput } from './dateFormat'
import { getInvoiceCode } from './invoiceCode'
import { normalizeOrderItems, summarizeItems, toDateInputValue } from './money'
import { calcOrderMoney } from './orderMoney'
import { normalizeTrackingCode } from './trackingCode'

function safeTime(value) {
  const time = new Date(value).getTime()
  return Number.isFinite(time) ? time : 0
}

/**
 * Danh sách đơn hàng — map theo sổ ĐƠN HÀNG QOA.
 */
export function buildUnifiedManageItems(orders = []) {
  return (Array.isArray(orders) ? orders : [])
    .filter((order) => order && (order.id || order.invoiceCode))
    .map((order) => {
      const items = normalizeOrderItems(order.items)
      const productsTotal =
        order.productsTotal ??
        items.reduce(
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
      const shipDate = order.shipDate || order.deliveryDate || null

      return {
        kind: 'order',
        id: order.id,
        createdAt: order.createdAt,
        orderDate: order.orderDate || order.createdAt || null,
        neededDate: shipDate,
        shipTime:
          isoToDmY(
            toDateInputValue(order.shipDate) ||
              toIsoDateInput(order.deliveryTimeSlot) ||
              toIsoDateInput(order.deliveryDate),
          ) ||
          (toIsoDateInput(order.deliveryTimeSlot) ? '' : order.deliveryTimeSlot) ||
          '',
        code: getInvoiceCode(order),
        primaryName: order.customerName || 'Khách',
        secondaryPhone: order.customerPhone || '',
        deliveryLine: order.deliveryRecipientName || order.recipientName || order.customerName || '—',
        addressLine: order.deliveryAddress || '',
        productsLine: summarizeItems(items),
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
        status: order.status || 'pending',
        shippingStatus: order.shippingStatus || 'pending',
        raw: order,
        shipDate,
      }
    })
    .sort((a, b) => safeTime(b.neededDate || b.createdAt) - safeTime(a.neededDate || a.createdAt))
}
