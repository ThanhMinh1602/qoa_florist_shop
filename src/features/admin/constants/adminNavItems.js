export const ADMIN_NAV_ITEMS = [
  {
    to: '/admin',
    label: 'Dashboard',
    shortLabel: 'Home',
    icon: 'dashboard',
    end: true,
  },
  {
    to: '/admin/qr/new',
    label: 'Tạo QR mới',
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
    to: '/admin/orders/new',
    label: 'Tạo đơn hàng',
    shortLabel: 'Lên đơn',
    icon: 'edit_note',
  },
  {
    to: '/admin/manage',
    label: 'Quản lý đơn',
    shortLabel: 'Đơn',
    icon: 'receipt_long',
  },
]

export const ADMIN_DRAWER_ITEMS = [
  {
    to: '/admin/products',
    label: 'Sản phẩm',
    icon: 'local_florist',
  },
  {
    to: '/admin/cashbook',
    label: 'Sổ quỹ',
    icon: 'account_balance_wallet',
  },
  {
    to: '/admin/settings',
    label: 'Cài đặt web',
    icon: 'tune',
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
  unpaid: {
    label: 'Chưa thanh toán',
    className: 'bg-secondary-fixed text-on-secondary-container ring-secondary-fixed-dim/40',
  },
  deposit: {
    label: 'Đã cọc',
    className: 'bg-primary-fixed/50 text-primary ring-primary-fixed-dim/40',
  },
  paid: {
    label: 'Đã thanh toán',
    className: 'bg-surface-container-high text-primary ring-primary/15',
  },
}
