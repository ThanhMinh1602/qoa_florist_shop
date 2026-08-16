export function getInvoiceCode(request) {
  if (!request || typeof request !== 'object') return ''

  const stored = String(request.invoiceCode || '').trim()
  if (stored) return stored.toUpperCase()

  const id = String(request.id || '')
    .replace(/-/g, '')
    .toUpperCase()
  return id.slice(0, 8)
}
