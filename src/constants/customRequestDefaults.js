export const DEFAULT_CARD_STEP = {
  senderName: '',
  recipientName: '',
  message: '',
}

function todayInputValue() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export const DEFAULT_DELIVERY_STEP = {
  orderDate: todayInputValue(),
  customerName: '',
  customerPhone: '',
  deliveryAddress: '',
  deliveryDate: '',
  shipDate: '',
  deliveryTimeSlot: '',
  note: '',
  shippingProvider: '',
  shippingTrackingCode: '',
}

export const EMPTY_ORDER_MONEY = {
  addOnAmount: '',
  deposit: '',
  shippingFee: '30000',
  actualShippingFee: '',
  incidentalAmount: '',
  codAmount: '',
  codManual: false,
  paymentNote: '',
}

export const SHIPPING_PROVIDERS = [
  { id: 'ghn', label: 'GHN' },
  { id: 'ghtk', label: 'GHTK' },
  { id: 'viettel_post', label: 'Viettel Post' },
  { id: 'vnpost', label: 'VNPost' },
  { id: 'other', label: 'Khác' },
]

export const SHIPPING_STATUS_LABELS = {
  pending: 'Chưa giao',
  booked: 'Đã lên đơn',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
}

export const SHIPPING_STATUS_META = {
  pending: {
    label: 'Chưa giao',
    className: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  },
  booked: {
    label: 'Đã lên đơn',
    className: 'bg-sky-100 text-sky-800 ring-1 ring-sky-200',
  },
  shipping: {
    label: 'Đang giao',
    className: 'bg-amber-100 text-amber-900 ring-1 ring-amber-300',
  },
  delivered: {
    label: 'Đã giao',
    className: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300',
  },
}

export const SHIPPING_STATUS_OPTIONS = Object.entries(SHIPPING_STATUS_LABELS).map(
  ([value, label]) => ({ value, label }),
)
