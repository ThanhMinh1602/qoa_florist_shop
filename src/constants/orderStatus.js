export const ORDER_STATUS_LABELS = {
  pending: { label: 'Mới', className: 'bg-amber-50 text-amber-700 ring-amber-100' },
  arranging: { label: 'Đang cắm', className: 'bg-orange-50 text-orange-700 ring-orange-100' },
  ready: { label: 'Sẵn sàng', className: 'bg-sky-50 text-sky-700 ring-sky-100' },
  done: { label: 'Hoàn thành', className: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
  // Đơn cũ trước khi đổi trạng thái
  reviewed: { label: 'Đang cắm', className: 'bg-orange-50 text-orange-700 ring-orange-100' },
}

/** Trạng thái chọn được trên UI (không gồm legacy reviewed) */
export const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Mới' },
  { value: 'arranging', label: 'Đang cắm' },
  { value: 'ready', label: 'Sẵn sàng' },
  { value: 'done', label: 'Hoàn thành' },
]

export const ORDER_STATUS_VALUES = ORDER_STATUS_OPTIONS.map((item) => item.value)
