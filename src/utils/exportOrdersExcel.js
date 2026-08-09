import * as XLSX from 'xlsx'
import { ORDER_STATUS_LABELS } from '../constants/orderStatus'
import { SHIPPING_STATUS_LABELS } from '../constants/customRequestDefaults'
import { getInvoiceCode } from './invoiceCode'
import { calcOrderMoney } from './orderMoney'
import { normalizeTrackingCode } from './trackingCode'

const HEADERS = [
  'STT',
  'Ngày đặt',
  'Ngày cần',
  'Thời gian ship',
  'Tên KH',
  'SĐT',
  'Địa chỉ',
  'Sản phẩm',
  'Số lượng',
  'Màu',
  'Tổng giá sản phẩm',
  'Thêm theo y/c',
  'Tổng giá trị đơn hàng',
  'Note',
  'Cọc+ Chuyển khoản (Ny nhận)',
  'Ghi chú TT',
  'Tiền ship báo khách',
  'Ship thực tế',
  'Tiền phát sinh, đền bù',
  'COD',
  'Mã vận đơn',
  'Check cuối tháng',
  'Đơn vị vận chuyển',
  'Trạng thái làm hàng',
  'Trạng thái giao hàng',
  'Mã hóa đơn',
]

function toDate(value) {
  if (!value) return null
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const [year, month, day] = value.slice(0, 10).split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return Number.isNaN(date.getTime()) ? null : date
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Ưu tiên ngày cần nhận (theo tab Tháng trên Sheet), fallback ngày đặt / tạo. */
export function getOrderMonthDate(order) {
  return (
    toDate(order.shipDate) ||
    toDate(order.deliveryDate) ||
    toDate(order.orderDate) ||
    toDate(order.createdAt)
  )
}

export function getOrderMonthKey(order) {
  const date = getOrderMonthDate(order)
  if (!date) return null
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  return {
    year,
    month,
    key: `${year}-${String(month).padStart(2, '0')}`,
    label: `Tháng ${month}/${year}`,
  }
}

export function listOrderMonths(orders = []) {
  const map = new Map()
  orders.forEach((order) => {
    const info = getOrderMonthKey(order)
    if (!info) return
    const current = map.get(info.key) || { ...info, count: 0 }
    current.count += 1
    map.set(info.key, current)
  })
  return Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key))
}

export function filterOrdersByMonth(orders, year, month) {
  const y = Number(year)
  const m = Number(month)
  return orders.filter((order) => {
    const info = getOrderMonthKey(order)
    return info && info.year === y && info.month === m
  })
}

function formatSheetDate(value) {
  const date = toDate(value)
  if (!date) return ''
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

function moneyValue(value) {
  const num = Number(value)
  return Number.isFinite(num) ? Math.round(num) : 0
}

function orderMoney(order) {
  const productsTotal =
    Number(order.productsTotal) > 0
      ? Number(order.productsTotal)
      : (order.items || []).reduce(
          (sum, item) => sum + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1),
          0,
        )
  return calcOrderMoney({
    productsTotal,
    addOnAmount: order.addOnAmount,
    deposit: order.deposit,
    shippingFee: order.shippingFee,
    actualShippingFee: order.actualShippingFee,
    incidentalAmount: order.incidentalAmount,
    codOverride: order.codAmount,
  })
}

function statusLabel(map, value) {
  return map[value]?.label || value || ''
}

/**
 * Build AOA rows for one month of orders (multi-line SP like Sheet QOA).
 */
export function buildOrdersExportRows(orders = []) {
  const sorted = [...orders].sort((a, b) => {
    const aTime = getOrderMonthDate(a)?.getTime() || 0
    const bTime = getOrderMonthDate(b)?.getTime() || 0
    return aTime - bTime
  })

  const rows = [HEADERS]
  let stt = 0

  sorted.forEach((order) => {
    stt += 1
    const money = orderMoney(order)
    const items = Array.isArray(order.items) && order.items.length
      ? order.items
      : [
          {
            productName: '—',
            quantity: 1,
            unitPrice: money.productsTotal,
            color: '',
          },
        ]

    items.forEach((item, itemIndex) => {
      const qty = Math.max(1, Number(item.quantity) || 1)
      const lineTotal = Math.round((Number(item.unitPrice) || 0) * qty)
      const isPrimary = itemIndex === 0

      rows.push([
        isPrimary ? stt : '',
        isPrimary ? formatSheetDate(order.orderDate || order.createdAt) : '',
        isPrimary
          ? formatSheetDate(order.shipDate || order.deliveryDate) ||
            String(order.deliveryDate || '')
          : '',
        isPrimary ? order.deliveryTimeSlot || '' : '',
        isPrimary ? order.customerName || '' : '',
        isPrimary ? order.customerPhone || '' : '',
        isPrimary ? order.deliveryAddress || '' : '',
        item.productName || '',
        qty,
        item.color || '',
        lineTotal || (isPrimary ? money.productsTotal : ''),
        isPrimary ? moneyValue(order.addOnAmount) : '',
        isPrimary ? money.orderTotal : '',
        isPrimary ? order.note || '' : '',
        isPrimary ? money.deposit : '',
        isPrimary ? order.paymentNote || '' : '',
        isPrimary ? money.shippingFee : '',
        isPrimary ? money.actualShippingFee : '',
        isPrimary ? moneyValue(order.incidentalAmount) : '',
        isPrimary ? money.codAmount : '',
        isPrimary ? normalizeTrackingCode(order.shippingTrackingCode) : '',
        isPrimary ? (order.monthEndChecked ? 'Đã check' : '') : '',
        isPrimary ? order.shippingProvider || '' : '',
        isPrimary ? statusLabel(ORDER_STATUS_LABELS, order.status) : '',
        isPrimary
          ? statusLabel(SHIPPING_STATUS_LABELS, order.shippingStatus || 'pending')
          : '',
        isPrimary ? getInvoiceCode(order) : '',
      ])
    })
  })

  return rows
}

const TRACKING_COL_INDEX = HEADERS.indexOf('Mã vận đơn')

function forceTrackingCodesAsText(worksheet, rowCount) {
  if (TRACKING_COL_INDEX < 0) return
  for (let r = 1; r < rowCount; r += 1) {
    const addr = XLSX.utils.encode_cell({ r, c: TRACKING_COL_INDEX })
    const cell = worksheet[addr]
    if (!cell) continue
    const text = normalizeTrackingCode(cell.v)
    if (!text) {
      delete worksheet[addr]
      continue
    }
    // Ép kiểu text để Excel không đổi thành số / scientific
    worksheet[addr] = { t: 's', v: text, z: '@' }
  }
}

function buildWorksheet(orders) {
  const rows = buildOrdersExportRows(orders)
  const worksheet = XLSX.utils.aoa_to_sheet(rows)
  forceTrackingCodesAsText(worksheet, rows.length)
  worksheet['!cols'] = HEADERS.map((header) => ({
    wch: Math.min(36, Math.max(12, String(header).length + 2)),
  }))
  return { worksheet, rows, count: orders.length }
}

function stampFilenameDate() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}${m}${d}`
}

export function downloadOrdersExcel({ orders, year, month, filename }) {
  const y = Number(year)
  const m = Number(month)
  const sheetOrders = filterOrdersByMonth(orders, y, m)
  if (!sheetOrders.length) {
    throw new Error(`Không có đơn nào trong tháng ${m}/${y}.`)
  }

  const { worksheet } = buildWorksheet(sheetOrders)
  const workbook = XLSX.utils.book_new()
  const sheetName = `Tháng ${m}`.slice(0, 31)
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  const outName =
    filename ||
    `DON_HANG_QOA_Thang_${String(m).padStart(2, '0')}_${y}.xlsx`
  XLSX.writeFile(workbook, outName)

  return {
    count: sheetOrders.length,
    filename: outName,
    month: m,
    year: y,
    mode: 'month',
  }
}

/** Xuất toàn bộ đơn: mỗi tháng 1 tab (+ tab Khác nếu thiếu ngày). */
export function downloadAllOrdersExcel({ orders, filename } = {}) {
  const list = Array.isArray(orders) ? orders : []
  if (!list.length) {
    throw new Error('Không có đơn nào để xuất.')
  }

  const months = listOrderMonths(list)
  const workbook = XLSX.utils.book_new()
  let totalCount = 0
  const usedNames = new Set()

  function uniqueSheetName(base) {
    let name = String(base || 'Sheet').slice(0, 31)
    if (!usedNames.has(name)) {
      usedNames.add(name)
      return name
    }
    let i = 2
    while (usedNames.has(`${name.slice(0, 28)}_${i}`)) i += 1
    name = `${name.slice(0, 28)}_${i}`
    usedNames.add(name)
    return name
  }

  if (months.length === 0) {
    const { worksheet, count } = buildWorksheet(list)
    totalCount = count
    XLSX.utils.book_append_sheet(workbook, worksheet, uniqueSheetName('Tất cả'))
  } else {
    // Tab tổng hợp trước
    const allBuilt = buildWorksheet(list)
    totalCount = allBuilt.count
    XLSX.utils.book_append_sheet(workbook, allBuilt.worksheet, uniqueSheetName('Tất cả'))

    months
      .slice()
      .sort((a, b) => a.key.localeCompare(b.key))
      .forEach((item) => {
        const monthOrders = filterOrdersByMonth(list, item.year, item.month)
        if (!monthOrders.length) return
        const { worksheet } = buildWorksheet(monthOrders)
        XLSX.utils.book_append_sheet(
          workbook,
          worksheet,
          uniqueSheetName(`Tháng ${item.month}-${item.year}`),
        )
      })

    const orphanOrders = list.filter((order) => !getOrderMonthKey(order))
    if (orphanOrders.length) {
      const { worksheet } = buildWorksheet(orphanOrders)
      XLSX.utils.book_append_sheet(workbook, worksheet, uniqueSheetName('Khác'))
    }
  }

  const outName = filename || `DON_HANG_QOA_Tat_ca_${stampFilenameDate()}.xlsx`
  XLSX.writeFile(workbook, outName)

  return {
    count: totalCount,
    filename: outName,
    sheets: workbook.SheetNames.length,
    mode: 'all',
  }
}
