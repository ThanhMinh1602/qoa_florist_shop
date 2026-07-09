export const DEFAULT_CARD_STEP = {
  senderName: '',
  recipientName: '',
  message: '',
}

export const DEFAULT_DELIVERY_STEP = {
  customerName: '',
  customerPhone: '',
  deliveryRecipientName: '',
  deliveryPhone: '',
  deliveryAddress: '',
  deliveryDate: '',
  deliveryTimeSlot: '',
  deliveryNote: '',
  note: '',
}

export const SHIPPING_PROVIDERS = [
  { id: 'ghn', label: 'GHN' },
  { id: 'ghtk', label: 'GHTK' },
  { id: 'viettel_post', label: 'Viettel Post' },
  { id: 'vnpost', label: 'VNPost' },
  { id: 'other', label: 'Khác' },
]

export const SHIPPING_STATUS_LABELS = {
  pending: 'Chưa lên đơn',
  booked: 'Đã lên đơn',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
}
