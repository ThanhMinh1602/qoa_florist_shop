/**
 * Công thức tiền đơn theo sổ ĐƠN HÀNG QOA.
 * - Tổng SP = sum(đơn giá × SL)
 * - Tổng đơn = Tổng SP + Thêm theo y/c
 * - Chênh ship = Ship báo khách − Ship thực tế (chỉ hiển thị)
 * - Cọc net = Cọc − Phát sinh
 * - COD = Tổng đơn + Ship báo khách − Cọc
 * - Thu về app = COD − Ship thực tế
 */
export function calcOrderMoney({
  productsTotal = 0,
  addOnAmount = 0,
  deposit = 0,
  shippingFee = 0,
  actualShippingFee = 0,
  incidentalAmount = 0,
  codOverride,
} = {}) {
  const products = Math.max(0, Number(productsTotal) || 0)
  const addOn = Math.max(0, Number(addOnAmount) || 0)
  const orderTotal = products + addOn
  const dep = Math.max(0, Number(deposit) || 0)
  const shipQuoted = Math.max(0, Number(shippingFee) || 0)
  const shipActual = Math.max(0, Number(actualShippingFee) || 0)
  const incidental = Math.max(0, Number(incidentalAmount) || 0)

  const shipDiff = shipQuoted - shipActual
  const netDeposit = dep - incidental
  const autoCod = Math.max(0, orderTotal + shipQuoted - dep)
  const hasOverride = codOverride !== '' && codOverride !== undefined && codOverride !== null
  const codAmount = hasOverride ? Math.max(0, Number(codOverride) || 0) : autoCod
  const appReceive = codAmount - shipActual

  return {
    productsTotal: products,
    addOnAmount: addOn,
    orderTotal,
    deposit: dep,
    shippingFee: shipQuoted,
    actualShippingFee: shipActual,
    incidentalAmount: incidental,
    shipDiff,
    netDeposit,
    autoCod,
    codAmount,
    appReceive,
  }
}
