export const ADMIN_NAV_ITEMS = [
  {
    to: '/admin',
    label: 'Dashboard',
    shortLabel: 'Home',
    icon: 'dashboard',
    end: true,
  },
  {
    to: '/admin/orders/new',
    label: 'Lên đơn',
    shortLabel: 'Lên đơn',
    icon: 'edit_note',
  },
  {
    to: '/admin/qr/new',
    label: 'Tạo QR',
    shortLabel: 'Tạo QR',
    icon: 'qr_code_2',
  },
  {
    to: '/admin/qr',
    label: 'Danh sách QR',
    shortLabel: 'QR',
    icon: 'list_alt',
    end: true,
  },
  {
    to: '/admin/manage',
    label: 'Đơn hàng',
    shortLabel: 'Đơn',
    icon: 'receipt_long',
  },
  {
    to: '/admin/cashbook',
    label: 'Thu chi',
    shortLabel: 'Thu chi',
    icon: 'account_balance_wallet',
  },
]

export const ADMIN_DRAWER_ITEMS = [
  {
    to: '/admin/products',
    label: 'Sản phẩm',
    icon: 'inventory_2',
  },
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

export const PAYMENT_STATUS_LABELS = {
  unpaid: { label: 'Chưa thanh toán', className: 'bg-amber-50 text-amber-700 ring-amber-100' },
  deposit: { label: 'Đã cọc', className: 'bg-sky-50 text-sky-700 ring-sky-100' },
  paid: { label: 'Đã thanh toán', className: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
}
