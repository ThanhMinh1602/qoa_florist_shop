import { Link } from 'react-router-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { getInvoiceCode } from '../../../utils/invoiceCode'

function CreateOrderSuccess({ request, onCreateAnother, compact = false }) {
  return (
    <div
      className={[
        'rounded-2xl border border-emerald-100 bg-surface-container-lowest shadow-sm shadow-emerald-50',
        compact ? 'p-4' : 'p-6',
      ].join(' ')}
    >
      <div className="text-center">
        <MaterialIcon name="check_circle" className="text-4xl text-emerald-500" filled />
        <h3 className="mt-3 text-xl font-semibold text-on-surface">Đã lên đơn thành công</h3>

        <p className="mt-2 text-sm text-on-surface-variant">
          Mã hóa đơn{' '}
          <span className="rounded-md bg-surface-container px-2 py-0.5 font-mono text-sm font-bold tracking-wide text-on-surface">
            {getInvoiceCode(request)}
          </span>
        </p>
        <p className="mt-1 text-sm text-on-surface-variant">
          Khách: <span className="font-medium text-on-surface">{request.customerName}</span>
          {request.customerPhone ? ` · ${request.customerPhone}` : ''}
        </p>
      </div>

      <div className={['mt-5 grid gap-2', compact ? 'grid-cols-1' : 'sm:grid-cols-2'].join(' ')}>
        <Link
          to={`/admin/manage?highlight=${request.id}`}
          className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-center text-sm font-medium text-primary transition hover:bg-surface-container-low"
        >
          Xem trong Đơn hàng
        </Link>
        <button
          type="button"
          onClick={onCreateAnother}
          className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-container"
        >
          Lên đơn khác
        </button>
      </div>
    </div>
  )
}

export default CreateOrderSuccess
