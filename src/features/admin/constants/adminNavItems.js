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
        to: '/admin/orders/import',
        label: 'Import từ Sheet',
        icon: 'upload_file',
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

/** 4 tab chính trên mobile bottom nav */
export const ADMIN_MOBILE_TABS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    shortLabel: 'Dashboard',
    icon: 'dashboard',
    to: '/admin',
    end: true,
  },
  {
    id: 'marketing',
    label: 'Marketing',
    shortLabel: 'Marketing',
    icon: 'campaign',
    defaultTo: '/admin/qr',
    matchPrefixes: ['/admin/qr'],
    children: [
      { to: '/admin/qr', label: 'Danh sách QR', icon: 'list_alt', end: true },
      { to: '/admin/qr/new', label: 'Tạo QR mới', icon: 'qr_code_2' },
    ],
  },
  {
    id: 'sales',
    label: 'Bán hàng',
    shortLabel: 'Bán hàng',
    icon: 'storefront',
    to: '/admin/orders/new',
    defaultTo: '/admin/orders/new',
    matchPrefixes: ['/admin/orders/new'],
  },
  {
    id: 'catalog',
    label: 'Sản phẩm',
    shortLabel: 'Sản phẩm',
    icon: 'local_florist',
    defaultTo: '/admin/products',
    matchPrefixes: ['/admin/products', '/admin/categories'],
    children: [
      { to: '/admin/products', label: 'Sản phẩm', icon: 'inventory_2' },
      { to: '/admin/categories', label: 'Danh mục', icon: 'category' },
    ],
  },
]

/** Mục phụ trong menu góc phải (không nằm 4 tab) */
export const ADMIN_MOBILE_MORE_SECTIONS = ADMIN_SIDEBAR_SECTIONS.filter(
  (section) => section.id === 'finance' || section.id === 'system',
)

export function isAdminNavItemActive(pathname, item) {
  if (!item) return false

  if (item.matchPrefixes?.length) {
    return item.matchPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  }

  if (!item.to) return false
  if (item.end) return pathname === item.to
  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}

export function isAdminMobileTabActive(pathname, tab) {
  if (!tab) return false
  if (tab.children?.length) {
    return tab.children.some((item) => isAdminNavItemActive(pathname, item))
      || (tab.matchPrefixes || []).some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
      )
  }
  return isAdminNavItemActive(pathname, tab)
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
