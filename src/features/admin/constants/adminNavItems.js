export const ADMIN_NAV_ITEMS = [
  {
    to: '/admin/orders/new',
    label: 'Lên đơn',
    shortLabel: 'Lên đơn',
    icon: 'edit_note',
  },
  {
    to: '/admin/manage',
    label: 'Đơn hàng',
    shortLabel: 'Đơn hàng',
    icon: 'receipt_long',
  },
]

export const ADMIN_DRAWER_ITEMS = [
  {
    to: '/admin/change-password',
    label: 'Đổi mật khẩu',
    icon: 'lock',
  },
]

/** delivery | delivery_qr */
export const ORDER_CREATE_MODES = [
  {
    id: 'delivery',
    label: 'Chỉ giao hoa',
    description: 'Đơn giao hàng — không tạo thiệp QR.',
    icon: 'local_shipping',
  },
  {
    id: 'delivery_qr',
    label: 'Giao hoa + thiệp QR',
    description: 'Đơn giao kèm thiệp số cho người nhận.',
    icon: 'qr_code_2',
  },
]
