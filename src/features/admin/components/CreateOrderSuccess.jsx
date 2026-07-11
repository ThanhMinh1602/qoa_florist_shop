import { Link } from 'react-router-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'
import RequestQrPanel from './RequestQrPanel'
import { getInvoiceCode } from '../../../utils/invoiceCode'

function CreateOrderSuccess({ request, onCreateAnother, compact = false }) {
  const hasQr = Boolean(request?.cardId)

  return (
    <div
      className={[
        'rounded-2xl border border-emerald-100 bg-white shadow-sm shadow-emerald-50',
        compact ? 'p-4' : 'p-6',
      ].join(' ')}
    >
      <div className="text-center">
        <MaterialIcon name="check_circle" className="text-4xl text-emerald-500" filled />
        <h3 className="mt-3 text-xl font-semibold text-slate-900">Đã lên đơn thành công</h3>

        <p className="mt-2 text-sm text-slate-500">
          Mã hóa đơn{' '}
          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-sm font-bold tracking-wide text-slate-800">
            {getInvoiceCode(request)}
          </span>
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Khách: <span className="font-medium text-slate-700">{request.customerName}</span>
          {request.customerPhone ? ` · ${request.customerPhone}` : ''}
        </p>

        <p className="mt-2">
          <span
            className={[
              'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1',
              hasQr
                ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                : 'bg-slate-100 text-slate-600 ring-slate-200',
            ].join(' ')}
          >
            <MaterialIcon
              name={hasQr ? 'qr_code_2' : 'local_shipping'}
              className="text-[0.95rem]"
            />
            {hasQr ? 'Giao + QR' : 'Chỉ giao hoa'}
          </span>
        </p>
      </div>

      {hasQr ? (
        <div className="mt-5">
          <RequestQrPanel request={request} />
        </div>
      ) : (
        <p className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          Đơn này không kèm thiệp QR.
        </p>
      )}

      <div className={['mt-5 grid gap-2', compact ? 'grid-cols-1' : 'sm:grid-cols-2'].join(' ')}>
        <Link
          to={`/admin/manage?highlight=${request.id}`}
          className="rounded-xl border border-rose-200 bg-white px-4 py-3 text-center text-sm font-medium text-rose-700 transition hover:bg-rose-50"
        >
          Xem trong Đơn hàng
        </Link>
        <button
          type="button"
          onClick={onCreateAnother}
          className="rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
        >
          Lên đơn khác
        </button>
      </div>
    </div>
  )
}

export default CreateOrderSuccess
