import * as XLSX from 'xlsx'
import { normalizeTrackingCode } from './trackingCode'

/**
 * Parse file Sheet ĐƠN HÀNG QOA (.xlsx / .xls / .csv / .tsv)
 * Khớp 2 layout: Tháng 7 đầu (SP gộp) và Tháng 7 cuối / Tháng 8 (SP + SL + Màu).
 */

const HEADER_ALIASES = {
  stt: ['stt', 'stt.'],
  orderDate: ['ngày đặt', 'ngay dat', 'ngày đặt đơn', 'ngay dat don'],
  deliveryDate: ['ngày cần', 'ngay can', 'ngày cần nhận', 'ngay can nhan'],
  shipDate: ['thời gian ship', 'thoi gian ship', 'ngày ship', 'ngay ship', 'thời gian'],
  deliveryTimeSlot: ['khung giờ', 'khung gio', 'giờ giao'],
  customerName: ['tên kh', 'ten kh', 'tên khách', 'ten khach', 'khách hàng'],
  customerPhone: ['sđt', 'sdt', 'điện thoại', 'dien thoai', 'phone'],
  deliveryAddress: ['địa chỉ', 'dia chi', 'address'],
  productName: ['sản phẩm', 'san pham', 'tên sp', 'ten sp'],
  quantity: ['số lượng', 'so luong', 'sl', 'qty'],
  color: ['màu', 'mau', 'color'],
  itemNote: ['note sản phẩm', 'note sp', 'ghi chú sp', 'ghi chu sp'],
  productsTotal: ['tổng giá sản phẩm', 'tong gia san pham', 'tổng giá sp'],
  addOnAmount: ['thêm theo y/c', 'them theo y/c', 'thêm theo yc', 'phụ thu'],
  orderTotal: [
    'tổng giá trị đơn hàng',
    'tong gia tri don hang',
    'tổng đơn',
    'tong don',
  ],
  note: ['note đơn', 'note don', 'ghi chú đơn', 'ghi chu don', 'note'],
  deposit: [
    'cọc',
    'cọc+ chuyển khoản',
    'cọc+chuyển khoản',
    'cọc+ chuyển khoản (ny nhận)',
    'chuyển khoản',
  ],
  paymentNote: ['ghi chú tt', 'ghi chu tt', 'ghi chú thanh toán'],
  shippingFee: ['tiền ship báo khách', 'ship báo khách', 'ship bao khach'],
  actualShippingFee: ['ship thực tế', 'ship thuc te'],
  incidentalAmount: ['tiền phát sinh', 'phát sinh', 'đền bù', 'phat sinh'],
  codAmount: ['cod'],
  shippingTrackingCode: ['mã vận đơn', 'ma van don', 'mã vận', 'tracking'],
  monthEndChecked: ['check cuối tháng', 'check cuoi thang'],
  shippingProvider: ['đơn vị vận chuyển', 'don vi van chuyen', 'đvvc'],
  status: ['trạng thái làm hàng', 'trang thai lam hang'],
  shippingStatus: ['trạng thái giao hàng', 'trang thai giao hang'],
  invoiceCode: ['mã hóa đơn', 'ma hoa don', 'mã đơn', 'ma don', 'invoice'],
}

function normalizeHeader(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim()
}

function matchField(header) {
  const normalized = normalizeHeader(header)
  if (!normalized) return null

  let bestField = null
  let bestScore = -1

  for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
    for (const alias of aliases) {
      const a = normalizeHeader(alias)
      if (!a) continue

      let score = -1
      if (normalized === a) {
        score = 1000 + a.length
      } else if (normalized.startsWith(`${a} `) || a.startsWith(`${normalized} `)) {
        score = 600 + Math.min(a.length, normalized.length)
      } else if (
        normalized.startsWith(a) &&
        (normalized.length === a.length || !/[a-z0-9]/.test(normalized[a.length] || ''))
      ) {
        // "coc" → "coc+ chuyen khoan…", "ghi chu" → "ghi chu tt"
        score = 400 + a.length
      } else if (a.length >= 6 && (normalized.includes(a) || a.includes(normalized))) {
        // Avoid short aliases (e.g. "san pham") stealing "tong gia san pham"
        score = 100 + a.length
      }

      if (score > bestScore) {
        bestScore = score
        bestField = field
      }
    }
  }

  return bestField
}

function parseMoney(value) {
  if (value === null || value === undefined || value === '') return ''
  if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, Math.round(value))
  const raw = String(value).replace(/[^\d.-]/g, '')
  if (!raw || raw === '-' || raw === '.') return ''
  const num = Number(raw)
  return Number.isFinite(num) ? Math.max(0, Math.round(num)) : ''
}

function parseQuantity(value) {
  if (value === null || value === undefined || value === '') return 1
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(1, Math.round(value))
  }
  const raw = String(value).replace(/[^\d.-]/g, '')
  if (!raw) return 1
  const num = Number(raw)
  return Number.isFinite(num) && num > 0 ? Math.max(1, Math.round(num)) : 1
}

function parsePhone(value) {
  if (value === null || value === undefined || value === '') return ''
  if (typeof value === 'number' && Number.isFinite(value)) {
    const digits = String(Math.trunc(Math.abs(value)))
    if (digits.length === 9) return `0${digits}`
    return digits
  }
  const text = String(value).trim()
  const digits = text.replace(/[^\d]/g, '')
  if (!digits) return text
  if (digits.length === 9 && !digits.startsWith('0')) return `0${digits}`
  return digits
}

/** dd/mm/yyyy | d/m | d/m/yy | Excel serial */
function parseSheetDate(value) {
  if (value === null || value === undefined || value === '') return ''
  if (typeof value === 'number' && Number.isFinite(value)) {
    const parsed = XLSX.SSF?.parse_date_code?.(value)
    if (parsed?.y && parsed?.m && parsed?.d) {
      const mm = String(parsed.m).padStart(2, '0')
      const dd = String(parsed.d).padStart(2, '0')
      return `${parsed.y}-${mm}-${dd}`
    }
    // Excel serial fallback (1900 date system)
    const utc = Date.UTC(1899, 11, 30) + Math.round(value) * 86400000
    const date = new Date(utc)
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString().slice(0, 10)
    }
  }

  const text = String(value).trim()
  const m = text.match(/^(\d{1,2})[/.](\d{1,2})(?:[/.](\d{2,4}))?/)
  if (!m) return ''
  let year = m[3] ? Number(m[3]) : new Date().getFullYear()
  if (year < 100) year += 2000
  const day = Number(m[1])
  const month = Number(m[2])
  if (day < 1 || day > 31 || month < 1 || month > 12) return ''
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function parseStatusKey(value, labels) {
  const text = normalizeHeader(value)
  if (!text) return ''
  for (const [key, meta] of Object.entries(labels)) {
    if (normalizeHeader(key) === text) return key
    const label = typeof meta === 'string' ? meta : meta.label
    if (normalizeHeader(label) === text) return key === 'reviewed' ? 'arranging' : key
  }
  return ''
}

const ORDER_STATUS_IMPORT = {
  pending: 'Mới',
  arranging: 'Đang cắm',
  ready: 'Sẵn sàng',
  done: 'Hoàn thành',
  reviewed: 'Đang cắm',
}

const SHIPPING_STATUS_IMPORT = {
  pending: 'Chưa giao',
  booked: 'Đã lên đơn',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
}

function isChecked(value) {
  const text = String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
  return text.includes('da check') || text === 'true' || text === 'x' || text === '1'
}

function buildColumnMap(headerRow) {
  const map = {}
  headerRow.forEach((cell, index) => {
    const field = matchField(cell)
    if (!field) return
    // Prefer first match; "ghi chú" vs deposit columns — skip price-list side columns
    if (map[field] === undefined) map[field] = index
  })
  return map
}

function findHeaderRow(rows) {
  for (let i = 0; i < Math.min(rows.length, 15); i += 1) {
    const row = rows[i] || []
    const map = buildColumnMap(row)
    if (map.customerName !== undefined && (map.productName !== undefined || map.orderTotal !== undefined)) {
      return { index: i, map }
    }
  }
  return null
}

function cell(row, map, field) {
  if (map[field] === undefined) return ''
  const value = row[map[field]]
  if (value === null || value === undefined) return ''
  return value
}

function rowHasCustomer(row, map) {
  return String(cell(row, map, 'customerName') || '').trim().length > 0
}

function rowHasProduct(row, map) {
  return String(cell(row, map, 'productName') || '').trim().length > 0
}

function makeItem(row, map, { allowOrderTotalFallback = false } = {}) {
  const productName = String(cell(row, map, 'productName') || '').trim()
  if (!productName) return null
  const quantity = parseQuantity(cell(row, map, 'quantity'))
  const productsTotal = parseMoney(cell(row, map, 'productsTotal'))
  let unitPrice = 0
  if (productsTotal !== '' && quantity > 0) {
    unitPrice = Math.round(Number(productsTotal) / quantity)
  } else if (allowOrderTotalFallback) {
    // Old sheet: một dòng SP + tổng đơn, chưa tách cột tổng SP
    const fallback = parseMoney(cell(row, map, 'orderTotal'))
    if (fallback !== '' && quantity > 0) unitPrice = Math.round(Number(fallback) / quantity)
  }
  return {
    productId: '',
    productName,
    quantity,
    unitPrice: Math.max(0, unitPrice),
    unitCost: 0,
    color: String(cell(row, map, 'color') || '').trim(),
    note: String(cell(row, map, 'itemNote') || '').trim(),
  }
}

function emptyDraft(stt) {
  return {
    stt: stt || '',
    rowLabel: stt || '',
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    orderDate: '',
    deliveryDate: '',
    shipDate: '',
    deliveryTimeSlot: '',
    note: '',
    paymentNote: '',
    invoiceCode: '',
    status: '',
    shippingStatus: '',
    productsTotal: '',
    addOnAmount: '',
    deposit: '',
    shippingFee: 30000,
    actualShippingFee: '',
    incidentalAmount: '',
    codAmount: '',
    shippingTrackingCode: '',
    shippingProvider: '',
    monthEndChecked: false,
    items: [],
  }
}

function finalizeDraft(draft) {
  if (!draft.customerName.trim() && draft.items.length === 0) return null

  const items = draft.items.length
    ? draft.items
    : draft.customerName.trim()
      ? [
          {
            productId: '',
            productName: 'Đơn import (chưa tách SP)',
            quantity: 1,
            unitPrice: Math.max(
              0,
              Number(draft.productsTotal) || Number(draft.orderTotalHint) || 0,
            ),
            unitCost: 0,
            color: '',
            note: '',
          },
        ]
      : []

  if (!draft.customerName.trim()) return null

  const itemsSum = items.reduce(
    (sum, item) => sum + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1),
    0,
  )
  const allItemsPriced = items.length > 0 && items.every((item) => Number(item.unitPrice) > 0)
  const draftProductsTotal = Number(draft.productsTotal) > 0 ? Number(draft.productsTotal) : 0
  const productsTotal = allItemsPriced
    ? itemsSum
    : draftProductsTotal > 0
      ? draftProductsTotal
      : itemsSum

  const addOn = Number(draft.addOnAmount) || 0
  const orderTotalHint = Number(draft.orderTotalHint) || 0
  const subtotal =
    orderTotalHint > 0 ? orderTotalHint : productsTotal + addOn

  // If sheet gave order total but no add-on, derive add-on
  let addOnAmount = addOn
  if (!addOnAmount && orderTotalHint > productsTotal) {
    addOnAmount = orderTotalHint - productsTotal
  }

  return {
    rowLabel: draft.stt || draft.customerName,
    customerName: draft.customerName.trim(),
    customerPhone: draft.customerPhone.trim(),
    deliveryRecipientName: draft.customerName.trim(),
    deliveryPhone: draft.customerPhone.trim(),
    deliveryAddress: draft.deliveryAddress.trim(),
    orderDate: draft.orderDate || undefined,
    deliveryDate: draft.deliveryDate || '',
    shipDate: draft.shipDate || parseSheetDate(draft.deliveryTimeSlot) || draft.deliveryDate || undefined,
    deliveryTimeSlot:
      draft.shipDate || parseSheetDate(draft.deliveryTimeSlot) || draft.deliveryTimeSlot.trim(),
    note: draft.note.trim(),
    paymentNote: draft.paymentNote.trim(),
    invoiceCode: String(draft.invoiceCode || '').trim().toUpperCase(),
    status: draft.status || undefined,
    shippingStatus: draft.shippingStatus || undefined,
    items,
    productsTotal,
    addOnAmount,
    subtotal,
    deposit: Number(draft.deposit) || 0,
    shippingFee:
      draft.shippingFee === '' || draft.shippingFee === undefined
        ? 30000
        : Number(draft.shippingFee) || 0,
    actualShippingFee: Number(draft.actualShippingFee) || 0,
    incidentalAmount: Number(draft.incidentalAmount) || 0,
    codAmount: draft.codAmount === '' ? undefined : Number(draft.codAmount) || 0,
    paidAmount: Number(draft.deposit) || 0,
    shippingTrackingCode: draft.shippingTrackingCode.trim(),
    shippingProvider: draft.shippingProvider.trim(),
    monthEndChecked: Boolean(draft.monthEndChecked),
    source: 'admin',
    withQr: false,
  }
}

function applyMoneyFields(draft, row, map, { primary = true } = {}) {
  if (primary) {
    const productsTotal = parseMoney(cell(row, map, 'productsTotal'))
    if (productsTotal !== '') draft.productsTotal = productsTotal

    const addOn = parseMoney(cell(row, map, 'addOnAmount'))
    if (addOn !== '') draft.addOnAmount = addOn

    const orderTotal = parseMoney(cell(row, map, 'orderTotal'))
    if (orderTotal !== '') draft.orderTotalHint = orderTotal

    const deposit = parseMoney(cell(row, map, 'deposit'))
    if (deposit !== '') draft.deposit = deposit

    const shippingFee = parseMoney(cell(row, map, 'shippingFee'))
    if (shippingFee !== '') draft.shippingFee = shippingFee

    const actualShippingFee = parseMoney(cell(row, map, 'actualShippingFee'))
    if (actualShippingFee !== '') draft.actualShippingFee = actualShippingFee

    const incidental = parseMoney(cell(row, map, 'incidentalAmount'))
    if (incidental !== '') draft.incidentalAmount = incidental

    const cod = parseMoney(cell(row, map, 'codAmount'))
    if (cod !== '') draft.codAmount = cod

    const paymentNote = String(cell(row, map, 'paymentNote') || '').trim()
    if (paymentNote && map.paymentNote !== map.note) {
      draft.paymentNote = paymentNote
    }

    const note = String(cell(row, map, 'note') || '').trim()
    if (note) draft.note = note

    const tracking = normalizeTrackingCode(cell(row, map, 'shippingTrackingCode'))
    if (tracking) draft.shippingTrackingCode = tracking

    const provider = String(cell(row, map, 'shippingProvider') || '').trim()
    if (provider) draft.shippingProvider = provider

    if (map.monthEndChecked !== undefined) {
      draft.monthEndChecked = isChecked(cell(row, map, 'monthEndChecked'))
    }
  }
}

function toUint8Array(input) {
  if (input instanceof Uint8Array) return input
  if (input instanceof ArrayBuffer) return new Uint8Array(input)
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer?.(input)) {
    return new Uint8Array(input)
  }
  return new Uint8Array(input)
}

/** Google CSV is UTF-8; SheetJS binary read turns it into mojibake (NgÃ y…). */
function decodeCsvText(bytes) {
  let start = 0
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    start = 3
  }
  const slice = start ? bytes.subarray(start) : bytes
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder('utf-8').decode(slice)
  }
  return Buffer.from(slice).toString('utf8')
}

function looksLikeMojibake(text) {
  return /Ã.|Â.|Ä.|Å.|Æ.|á»|áº/.test(text)
}

function readWorkbook(input, filename = '') {
  const isCsv = /\.(csv|tsv|txt)$/i.test(filename)
  const readOpts = { cellDates: false, raw: false }

  if (typeof input === 'string') {
    return XLSX.read(input, { ...readOpts, type: 'string' })
  }

  const bytes = toUint8Array(input)

  if (isCsv) {
    const text = decodeCsvText(bytes)
    return XLSX.read(text, { ...readOpts, type: 'string' })
  }

  // Some browsers/tools save CSV without extension or with wrong mime — detect text
  const asLatinPreview = Array.from(bytes.slice(0, 200))
    .map((b) => String.fromCharCode(b))
    .join('')
  if (
    /STT[,;\t]/i.test(asLatinPreview) ||
    looksLikeMojibake(asLatinPreview) ||
    /^[\uFEFF]?STT/i.test(decodeCsvText(bytes).slice(0, 40))
  ) {
    const text = decodeCsvText(bytes)
    if (/STT/i.test(text.slice(0, 80)) || looksLikeMojibake(text.slice(0, 120))) {
      // Prefer UTF-8 string parse when it looks like CSV
      if (/STT/i.test(text.slice(0, 80))) {
        return XLSX.read(text, { ...readOpts, type: 'string' })
      }
    }
  }

  return XLSX.read(bytes, { ...readOpts, type: 'array' })
}

function parseSheetRows(rows, { sheetName = '', filename = '' } = {}) {
  const headerInfo = findHeaderRow(rows)
  if (!headerInfo) {
    return {
      orders: [],
      errors: [],
      skipped: true,
      meta: { sheetName, filename },
    }
  }

  const { index: headerIndex, map } = headerInfo
  const drafts = []
  let current = null
  const warnings = []

  for (let i = headerIndex + 1; i < rows.length; i += 1) {
    const row = rows[i] || []
    if (!row.some((cellValue) => String(cellValue || '').trim())) continue

    // Skip price-list footer rows (only product name + price, no customer)
    const looksLikePriceList =
      rowHasProduct(row, map) &&
      !rowHasCustomer(row, map) &&
      !String(cell(row, map, 'customerPhone') || '').trim() &&
      !String(cell(row, map, 'deliveryAddress') || '').trim() &&
      !String(cell(row, map, 'stt') || '').trim() &&
      !current

    if (looksLikePriceList) continue

    const stt = String(cell(row, map, 'stt') || '').trim()
    const hasCustomer = rowHasCustomer(row, map)
    const hasPhone = String(cell(row, map, 'customerPhone') || '').trim().length > 0
    const hasAddress = String(cell(row, map, 'deliveryAddress') || '').trim().length > 0
    // Một số dòng SP nối tiếp vẫn ghi STT nhưng không có tên KH
    const sttStartsOrder =
      Boolean(stt && /^\d+$/.test(stt)) && (hasCustomer || hasPhone || hasAddress || !current)
    const isNewOrder = hasCustomer || sttStartsOrder
    const item = makeItem(row, map, {
      allowOrderTotalFallback: Boolean(isNewOrder && map.productsTotal === undefined),
    })

    if (isNewOrder) {
      if (current) {
        const finalized = finalizeDraft(current)
        if (finalized) {
          finalized.sheetName = sheetName
          drafts.push(finalized)
        } else warnings.push(`Bỏ dòng STT ${current.stt || '?'} (${sheetName}): thiếu tên KH.`)
      }
      current = emptyDraft(stt || String(drafts.length + 1))
      current.customerName = String(cell(row, map, 'customerName') || '').trim()
      current.customerPhone = parsePhone(cell(row, map, 'customerPhone'))
      current.deliveryAddress = String(cell(row, map, 'deliveryAddress') || '').trim()
      current.orderDate = parseSheetDate(cell(row, map, 'orderDate'))
      current.deliveryDate = parseSheetDate(cell(row, map, 'deliveryDate'))
      const shipRaw = cell(row, map, 'shipDate') || cell(row, map, 'deliveryTimeSlot')
      current.shipDate = parseSheetDate(shipRaw)
      current.deliveryTimeSlot = current.shipDate || String(shipRaw || '').trim()
      current.invoiceCode = String(cell(row, map, 'invoiceCode') || '').trim()
      current.status = parseStatusKey(cell(row, map, 'status'), ORDER_STATUS_IMPORT)
      current.shippingStatus = parseStatusKey(
        cell(row, map, 'shippingStatus'),
        SHIPPING_STATUS_IMPORT,
      )
      applyMoneyFields(current, row, map, { primary: true })
      if (item) current.items.push(item)
      continue
    }

    // Continuation product line for current order
    if (current && item) {
      current.items.push(item)
      applyMoneyFields(current, row, map, { primary: false })
      continue
    }
  }

  if (current) {
    const finalized = finalizeDraft(current)
    if (finalized) {
      finalized.sheetName = sheetName
      drafts.push(finalized)
    } else warnings.push(`Bỏ dòng STT ${current.stt || '?'} (${sheetName}): thiếu tên KH.`)
  }

  return {
    orders: drafts,
    errors: warnings,
    skipped: false,
    meta: {
      filename,
      sheetName,
      headerRow: headerIndex + 1,
      columnMap: map,
      orderCount: drafts.length,
    },
  }
}

/**
 * @param {ArrayBuffer|Uint8Array|string} input
 * @param {string} [filename]
 */
export function parseOrderSheetFile(input, filename = '') {
  const workbook = readWorkbook(input, filename)
  if (!workbook.SheetNames?.length) {
    return { orders: [], errors: ['File không có sheet nào.'] }
  }

  const allOrders = []
  const allErrors = []
  const sheetMetas = []

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: '',
      raw: false,
      blankrows: false,
    })
    const parsed = parseSheetRows(rows, { sheetName, filename })
    if (parsed.skipped || !parsed.orders.length) continue
    allOrders.push(...parsed.orders)
    allErrors.push(...parsed.errors)
    sheetMetas.push(parsed.meta)
  }

  if (!allOrders.length) {
    return {
      orders: [],
      errors: [
        'Không nhận ra tiêu đề cột. Dùng file xuất từ app (Ngày đặt, Ngày cần, Thời gian ship, Note sản phẩm, Note đơn, Mã hóa đơn), Excel .xlsx hoặc CSV UTF-8.',
      ],
    }
  }

  return {
    orders: allOrders,
    errors: allErrors,
    meta: {
      filename,
      sheetName: sheetMetas.map((s) => s.sheetName).join(', '),
      sheets: sheetMetas,
      headerRow: sheetMetas[0]?.headerRow,
      columnMap: sheetMetas[0]?.columnMap,
    },
  }
}

export async function parseOrderSheetFromFile(file) {
  const buffer = await file.arrayBuffer()
  return parseOrderSheetFile(buffer, file.name || '')
}
