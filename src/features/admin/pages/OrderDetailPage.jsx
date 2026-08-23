import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  fetchCustomRequestByIdApi,
  updateCustomRequestApi,
  updateCustomRequestStatusApi,
} from '../../../api/notificationsApi'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { ORDER_STATUS_LABELS } from '../../../constants/orderStatus'
import { SHIPPING_STATUS_LABELS } from '../../../constants/customRequestDefaults'
import { useDialog } from '../../../context/DialogContext'
import { formatTimeAgo } from '../../../utils/formatTimeAgo'
import { getInvoiceCode } from '../../../utils/invoiceCode'
import { formatMoney } from '../../../utils/money'
import OrderDetailContent from '../components/OrderDetailContent'

function OrderDetailPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { alert } = useDialog()
  const contentRef = useRef(null)

  const editFromQuery = searchParams.get('edit') === '1'
  const [isEditing, setIsEditing] = useState(editFromQuery)
  const [request, setRequest] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (editFromQuery) setIsEditing(true)
  }, [editFromQuery, orderId])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setIsLoading(true)
      setLoadError('')
      try {
        const result = await fetchCustomRequestByIdApi(orderId)
        if (cancelled) return
        const data = result.data
        if (!data) throw new Error('Không tìm thấy đơn.')
        setRequest(data)
      } catch (err) {
        if (!cancelled) setLoadError(err.message || 'Không tải được đơn.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [orderId])

  function clearEditQuery() {
    if (!searchParams.has('edit')) return
    const next = new URLSearchParams(searchParams)
    next.delete('edit')
    setSearchParams(next, { replace: true })
  }

  function enterEdit() {
    setIsEditing(true)
    const next = new URLSearchParams(searchParams)
    next.set('edit', '1')
    setSearchParams(next, { replace: true })
  }

  function exitEdit() {
    setIsEditing(false)
    clearEditQuery()
  }

  function handleCancel() {
    contentRef.current?.revert()
    exitEdit()
  }

  async function handleSave() {
    if (!contentRef.current?.save) return
    setIsSaving(true)
    try {
      const updated = await contentRef.current.save()
      if (updated) exitEdit()
    } finally {
      setIsSaving(false)
    }
  }

  async function handleStatusChange(id, status) {
    setUpdatingId(id)
    try {
      const result = await updateCustomRequestStatusApi(id, status)
      setRequest(result.data)
    } catch (err) {
      await alert({
        title: 'Không thể cập nhật',
        message: err.message || 'Không thể cập nhật trạng thái.',
        variant: 'error',
      })
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleShippingStatusChange(id, shippingStatus) {
    setUpdatingId(id)
    try {
      const result = await updateCustomRequestApi(id, { shippingStatus })
      setRequest(result.data)
    } catch (err) {
      await alert({
        title: 'Không thể cập nhật',
        message: err.message || 'Không thể cập nhật trạng thái giao hàng.',
        variant: 'error',
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const status = request
    ? ORDER_STATUS_LABELS[request.status] ?? ORDER_STATUS_LABELS.pending
    : null
  const shippingKey = request?.shippingStatus || 'pending'

  const headerActions = isEditing ? (
    <>
      <button
        type="button"
        onClick={handleCancel}
        disabled={isSaving}
        className="btn-glass !px-3 !py-2 text-xs sm:text-sm"
      >
        Hủy
      </button>
      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={isSaving}
        className="btn-primary !px-3 !py-2 text-xs sm:text-sm disabled:opacity-60"
      >
        {isSaving ? 'Đang lưu...' : 'Lưu'}
      </button>
    </>
  ) : (
    <button type="button" onClick={enterEdit} className="btn-primary !px-3 !py-2 text-xs sm:text-sm">
      Sửa
    </button>
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col p-2 pb-[calc(var(--admin-bottom-nav-offset)+1rem)] sm:p-3 lg:p-4 lg:pb-4">
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-outline-variant/15 bg-white shadow-[0_8px_30px_rgba(74,48,32,0.06)]">
          <header className="shrink-0 border-b border-outline-variant/15 px-4 py-3 sm:px-5 sm:py-3.5 lg:px-6 lg:py-4">
            <Link
              to="/admin/manage"
              className="mb-1.5 inline-flex items-center gap-1 text-xs font-medium text-on-surface-variant transition hover:text-primary"
            >
              <MaterialIcon name="arrow_back" className="text-base" />
              Đơn hàng
            </Link>

            {isLoading ? (
              <p className="text-sm text-on-surface-variant">Đang tải đơn…</p>
            ) : loadError || !request ? (
              <div>
                <p className="text-sm text-red-600">{loadError || 'Không tìm thấy đơn.'}</p>
                <button
                  type="button"
                  onClick={() => navigate('/admin/manage')}
                  className="mt-2 text-sm font-semibold text-primary"
                >
                  Về danh sách
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-xs font-bold tracking-wide text-on-surface-variant">
                    {getInvoiceCode(request)}
                  </p>
                  <h2 className="mt-1 truncate font-display text-lg leading-tight text-primary sm:text-xl lg:text-2xl">
                    {request.customerName || '—'}
                  </h2>
                  <p className="mt-1 text-xs text-on-surface-variant sm:text-sm">
                    {formatTimeAgo(request.createdAt)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${status.className}`}
                    >
                      {status.label}
                    </span>
                    <span className="rounded-full bg-surface-container px-2.5 py-0.5 text-xs font-medium text-on-surface ring-1 ring-slate-200">
                      {SHIPPING_STATUS_LABELS[shippingKey] || 'Chưa giao'}
                    </span>
                    <span className="rounded-full bg-surface-container px-2.5 py-0.5 text-xs font-medium text-on-surface ring-1 ring-slate-200">
                      {formatMoney(request.subtotal)}
                    </span>
                    {request.monthEndChecked ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                        Đã check cuối tháng
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">{headerActions}</div>
              </div>
            )}
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 lg:p-6">
            {!isLoading && request ? (
              <OrderDetailContent
                ref={contentRef}
                request={request}
                isEditing={isEditing}
                onStatusChange={handleStatusChange}
                onShippingStatusChange={handleShippingStatusChange}
                onUpdated={setRequest}
                isUpdating={updatingId === request.id}
              />
            ) : null}
          </div>
        </section>
      </div>
    </div>
  )
}

export default OrderDetailPage
