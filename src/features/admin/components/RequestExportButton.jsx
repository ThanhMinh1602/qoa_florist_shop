import { useRef, useState } from 'react'
import { exportElementToPdf } from '../../../utils/exportRequestPdf'
import { getInvoiceCode } from '../../../utils/invoiceCode'
import RequestPrintSheet from './RequestPrintSheet'

function RequestExportButton({ request }) {
  const printRef = useRef(null)
  const [isExporting, setIsExporting] = useState(false)

  async function handleExport() {
    setIsExporting(true)

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 150))
      await exportElementToPdf(printRef.current, `qoa-vc-${getInvoiceCode(request)}.pdf`)
    } catch (err) {
      window.alert(err.message || 'Không thể xuất PDF.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <RequestPrintSheet ref={printRef} request={request} />
      <button
        type="button"
        onClick={handleExport}
        disabled={isExporting}
        className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isExporting ? 'Đang xuất...' : '📄 Xuất hóa đơn VC'}
      </button>
    </>
  )
}

export default RequestExportButton
