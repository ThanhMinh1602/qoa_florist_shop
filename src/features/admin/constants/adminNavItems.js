/** Bottom nav mobile — các mục thao tác nhanh */
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

/**
 * Sidebar / drawer — nhóm accordion.
 * type: 'link' = 1 mục, click chuyển trang (không dropdown)
 * type: 'group' = click tên nhóm để xổ menu con
 */
export const ADMIN_SIDEBAR_SECTIONS = [
  {
    id: 'overview',
    label: 'Tổng quan',
    type: 'link',
    item: {
      to: '/admin',
      label: 'Dashboard',
      icon: 'dashboard',
      end: true,
    },
  },
  {
    id: 'marketing',
    label: 'Marketing',
    type: 'group',
    icon: 'campaign',
    children: [
      {
        to: '/admin/qr/new',
        label: 'Tạo QR mới',
        icon: 'qr_code_2',
      },
      {
        to: '/admin/qr',
        label: 'Danh sách QR',
        icon: 'list_alt',
        end: true,
      },
    ],
  },
  {
    id: 'sales',
    label: 'Bán hàng',
    type: 'group',
    icon: 'storefront',
    children: [
      {
        to: '/admin/orders/new',
        label: 'Tạo đơn hàng',
        icon: 'edit_note',
      },
      {
        to: '/admin/manage',
        label: 'Quản lý đơn',
        icon: 'receipt_long',
      },
    ],
  },
  {
    id: 'catalog',
    label: 'Sản phẩm',
    type: 'group',
    icon: 'local_florist',
    children: [
      {
        to: '/admin/products',
        label: 'Sản phẩm',
        icon: 'inventory_2',
      },
      {
        to: '/admin/categories',
        label: 'Danh mục',
        icon: 'category',
      },
    ],
  },
  {
    id: 'finance',
    label: 'Tài chính',
    type: 'link',
    item: {
      to: '/admin/cashbook',
      label: 'Sổ quỹ',
      icon: 'account_balance_wallet',
    },
  },
  {
    id: 'system',
    label: 'Hệ thống',
    type: 'group',
    icon: 'settings',
    children: [
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
    ],
  },
]

/** Drawer mobile (legacy flat) — các mục phụ không nằm bottom nav */
export const ADMIN_DRAWER_ITEMS = [
  {
    to: '/admin/products',
    label: 'Sản phẩm',
    icon: 'local_florist',
  },
  {
    to: '/admin/categories',
    label: 'Danh mục',
    icon: 'category',
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

export function isAdminNavItemActive(pathname, item) {
  if (!item?.to) return false
  if (item.end) return pathname === item.to
  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}

export function isAdminSectionActive(pathname, section) {
  if (section.type === 'link') {
    return isAdminNavItemActive(pathname, section.item)
  }
  return (section.children || []).some((item) => isAdminNavItemActive(pathname, item))
}

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
