export function getInvoiceCode(request) {
  if (request.invoiceCode) {
    return request.invoiceCode.toUpperCase()
  }

  return request.id.replace(/-/g, '').slice(0, 8).toUpperCase()
}
