export function stockConfirmationMessage(shortages = [], action = 'tạo đơn') {
  const lines = shortages.map((item) =>
    `• ${item.productName}: còn ${item.stock}, đơn cần ${item.requested}, sau đơn còn ${item.remaining}`,
  )
  return `Một số sản phẩm sẽ bị âm kho sau khi ${action}:\n${lines.join('\n')}\n\nBạn có chắc muốn tiếp tục và bổ sung hàng sau không?`
}
