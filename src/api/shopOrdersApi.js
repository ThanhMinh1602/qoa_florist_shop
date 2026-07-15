import { apiRequest } from './client'

export function createShopOrderApi(payload) {
  return apiRequest('/custom-requests', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      source: payload.source || 'shop',
      withQr: false,
      createCashEntry: false,
      paymentStatus: 'unpaid',
    }),
  })
}
